import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import {
    AddRequestAdvancePaymentDetails,
    CreateRequestAdvancePayment,
    DeleteRequestAdvancePaymentDetail,
    EditRequestAdvancePayment,
    EditRequestAdvancePaymentDetail,
    GetRequestAdvancePayment,
    RequestAdvancePaymentApprove,
} from '@/services/apis/request-advance-payment.api';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { RequestAdvancePaymentDetails } from '@/services/swr/request-advance-payment.swr';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import IconPlus from '@/components/Icon/IconPlus';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import AnimateHeight from 'react-animate-height';
import Link from 'next/link';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Select, { components } from 'react-select';
import IconBack from '@/components/Icon/IconBack';
import { DropdownDepartment, DropdownWarehouses } from '@/services/swr/dropdown.swr';
import DetailModal from '../modal/DetailModal';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { useProfile } from '@/services/swr/profile.swr';
import { formatNumber, moneyToNumber, moneyToText } from '@/utils/commons';
import dayjs from 'dayjs';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import { Upload } from '@/services/apis/upload.api';
import { LIST_STATUS, MONEY } from '@/utils/constants';
import IconX from '@/components/Icon/IconX';
import { Loader } from '@mantine/core';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import Modal from './modal';
import ExcelJS from "exceljs";
import IconImportFile2 from '@/components/Icon/IconImportFile2';
import IconNewDownload3 from '@/components/Icon/IconNewDownload3';
import SwitchBtn from '@/pages/warehouse-process/switchBtn';

interface Props {
    [key: string]: any;
}

const DetailPage = ({ ...props }: Props) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [disable, setDisable] = useState<any>(false);
    const [dataDetail, setDataDetail] = useState<any>();
    const [listDataDetail, setListDataDetail] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [openModalApproval, setOpenModalApproval] = useState(false);
    const [openModalReject, setOpenModalReject] = useState(false);
    const [query, setQuery] = useState<any>({});
    const [active, setActive] = useState<any>([1, 2, 3]);
    const [initialValue, setInitialValue] = useState<any>();
    const [data, setData] = useState<any>();
    const [open, setOpen] = useState<any>(false);
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');
    const [page, setPage] = useState(1);
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const formRef = useRef<any>();
    const fileRef = useRef<any>();
    const [moneyType, setMoneyType] = useState<string>('vnd');
    const [loading, setLoading] = useState(false);
    const [createdId, setCreatedId] = useState();
    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [send, SetSend] = useState<any>(false);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const { data: userData } = useProfile();
    // get data
    const { data: RequestAdvancePaymentDetail, pagination, mutate, isLoading } = RequestAdvancePaymentDetails({ ...query });
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });
    const [path, setPath] = useState<any>([]);
    const [dataPath, setDataPath] = useState<any>();
    const [changeFile, setChangeFile] = useState<any>(false);
    const [filesSubmit, setFilesSubmit] = useState<any>([]);
    const [openAssigned, setOpenAssigned] = useState(false);

    useEffect(() => {
        const listPath = path?.filter((item: any) => item !== undefined) ?? []
        setPath([...listPath, dataPath]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataPath]);

    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_request_advance_payment')}` : (data ? t('update_request_advance_payment') : t('add_request_advance_payment'))));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(RequestAdvancePaymentDetail?.data);
        }
    }, [RequestAdvancePaymentDetail?.data, router]);

    useEffect(() => {
        if (Number(router.query.id)) {
            handleData();
            setQuery({ id: router.query.id, ...router.query });
        }
        if (typeof window !== 'undefined') {
            setId(Number(localStorage.getItem('idUser')));
            setIsHigh(localStorage.getItem('isHighestPosition'));
        }

        setDisable(router.query.status === 'true' ? true : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);
    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("request_advance_payment.pdf", `/request-advance-payment/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
    }
    const handleData = () => {
        GetRequestAdvancePayment({ id: router.query.id })
            .then((res) => {
                setData(res.data);
                setMoneyType(res.data?.moneyUnit);
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
    };

    useEffect(() => {
        setInitialValue({
            name: data ? data?.createdBy?.fullName : userData?.data?.fullName,
            position: data ? data?.createdBy?.position?.name : userData?.data?.position?.name,
            department: data ? data?.createdBy?.department?.name : userData?.data?.department?.name,
            requestDate: data ? data?.createdAt : new Date(),
            moneyTotal: listDataDetail?.length > 0 ? listDataDetail.reduce((partialSum, a) => String(Number(partialSum || 0) + Number(a.moneyTotal || 0)), 0) : data ? `${data?.moneyTotal}` : 0,
            currentApprover: data?.approvalHistory?.find((his: any) => his.status === 'APPROVED')?.approver?.fullName ?? data?.currentApprover?.fullName,
            moneyUnit: data ? MONEY?.find((e: any) => e.value === data?.moneyUnit) : MONEY[0]

        });
        setPath(data?.attachments);
    }, [data, router, userData, listDataDetail]);

    const SubmittedForm = Yup.object().shape({
        moneyTotal: Yup.string()
            .matches(/^[\d,]+$/, `${t('please_fill_valid_number')}`)
            .required(`${t('please_fill_money_number')}`),
    });

    const handleEdit = (data: any) => {
        setDataDetail(data);
        setOpenModal(true);
    };

    const handleDelete = ({ id, product }: any) => {
        if (listDataDetail?.length === 1) {
            showMessage(`${t('list_detail_can_not_be_empty')}`, 'error');
            return
        }
        const swalDeletes = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary',
                cancelButton: 'btn btn-danger ltr:mr-3 rtl:ml-3',
                popup: 'confirm-popup confirm-delete',
            },
            imageUrl: '/assets/images/delete_popup.png',
            buttonsStyling: false,
        });
        swalDeletes
            .fire({
                title: `${t('delete_detail_letter')}`,
                // text: `${t('delete')} ${product?.name}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    if (Number(router.query.id)) {
                        DeleteRequestAdvancePaymentDetail({ id: router.query.id, detailId: id })
                            .then(() => {
                                mutate();
                                showMessage(`${t('delete_detail_letter_success')}`, 'success');
                            })
                            .catch((err) => {
                                showMessage(`${err?.response?.data?.message}`, 'error');
                            });
                    } else {
                        setListDataDetail(listDataDetail?.filter((item: any) => item.id !== id));
                    }
                }
            });
    };

    const handleSearch = (param: any) => {
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                search: param,
            },
        });
    };

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: Number(router.query.id) ? 'rgb(235 235 235) !important' : 'white !important',
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            borderColor: Number(router.query.id) && 'rgb(224 230 237 / var(1))',
        }),
    };

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        { accessor: 'content', title: `${t('content')}`, sortable: false },
        { accessor: 'quantity', title: `${t('quantity')}`, sortable: false },
        { accessor: 'unit', title: `${t('unit')}`, sortable: false },
        {
            accessor: 'unitPrice',
            title: `${t('unitPrice')}`,
            sortable: false,
            render: (records: any) => <span>{formatNumber(records?.unitPrice)}</span>,
        },
        {
            accessor: 'moneyTotal',
            title: `${t('moneyTotal')}`,
            sortable: false,
            render: (records: any) => <span>{formatNumber(records?.moneyTotal)}</span>,
        },
        // {
        //     accessor: 'spendingDay',
        //     title: `${t('spending_day')}`,
        //     render: (records: any) => <span>{dayjs(dayjs(records?.spendingDay, 'YYYY-MM-DD')).format('DD-MM-YYYY')}</span>,
        //     sortable: false,
        // },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="mx-auto flex w-max items-center gap-2">
                    {!disable && (data?.status === 'DRAFT' || router.query.id === 'create') && (
                        <>
                            <button className="button-detail" type="button" onClick={() => handleEdit(records)}>
                                <IconNewEdit /> <span>{`${t('edit')}`}</span>
                            </button>
                            <button className="button-delete" type="button" onClick={() => handleDelete(records)}>
                                <IconNewTrash /> <span>{`${t('delete')}`}</span>
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];
    const columnTask = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'creator',
            title: `${t('creator_task')}`,
            sortable: false,
            render: (records: any) => {
                return <span>{records?.createdBy?.fullName}</span>;
            },
        },
        {
            accessor: 'name',
            title: `${t('name_task')}`,
            sortable: false,
            render: (records: any) => {
                return <span onClick={() => handleDetail(records)}>{records?.name}</span>;
            },
        },
        // {
        //     accessor: 'department',
        //     title: `${t('department')}`,
        //     render: (records: any) => {
        //         return <span>{records?.assignee?.department?.name}</span>
        //     }
        // },
        {
            accessor: 'executor',
            title: `${t('executor_task')}`,
            sortable: false,
            render: (records: any) => {
                return <span>{records?.assignee?.fullName}</span>;
            },
        },
        {
            accessor: 'dueDate',
            title: `${t('deadline_task')}`,
            sortable: false,
            render: (records: any, index: any) => (records?.dueDate ? <span>{`${dayjs(records?.dueDate).format('DD/MM/YYYY')}`}</span> : <></>),
        },
        {
            accessor: 'status',
            title: `${t('status')}`,
            render: (records: any, index: any) => (
                <span>{records?.status === 'UNFINISHED' ? `${t('Unfinished_task')}` : records?.status === 'DOING' ? `${t('Doing_task')}` : `${t('finsished_task')}`}</span>
            ),
        },
        {
            accessor: 'progress',
            title: `${t('%_task')}`,
            sortable: false,
            render: (records: any, index: any) => (records?.progress ? <span>{records?.progress}%</span> : <>0%</>),
        },
    ];

    const handleReturnFlowApprove = (action: any, sign: number) => {
        switch (action) {
            case "FORWARD":
            case "SUBMIT":
                return sign === 2 ? `${t('continue_approval')}` :
                    sign === 5 ? `${t('forward')}` :
                        sign === 6 ? `${t('continue')}` :
                            `${t('continue_initial')}`;
            case "REJECT":
                return `${t('reject')}`
            case "APPROVE":
                return `${t('approve')}`
            default:
                return `${t('approve')}`
        }
    }

    const columnHistorys = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'action',
            title: `${t('action_type')}`,
            render: ({ action, sign }: any) => <span>{handleReturnFlowApprove(action, sign)}</span>,
            sortable: false,
        },
        {
            accessor: 'approver',
            title: `${t('executor')}`,
            render: ({ approver }: any) => <span>{approver?.fullName}</span>,
            sortable: false,
        },
        {
            accessor: 'submittedAt',
            title: `${t('exe_time')}`,
            render: ({ submittedAt }: any) => <span>{moment(submittedAt).format("HH:mm DD/MM/YYYY")}</span>,
            sortable: false,
        },
        { accessor: 'comment', title: `${t('description')}`, sortable: false },
    ];

    const handleCancel = () => {
        router.push(`/hrm/request-advance-payment?page=${router?.query?.page}&perPage=${router?.query?.perPage}`);
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };

    const handleRequestAdvancePayment = (param: any) => {
        const query: any = {
            moneyTotal: moneyToNumber(param.moneyTotal),
            moneyUnit: param.moneyUnit.value,
        };
        if (path) {
            query.attachmentIds = path?.map((item: any) => { return (item.id) })
        }
        if (data) {
            EditRequestAdvancePayment({ id: data?.id, ...query })
                .then((res) => {
                    showMessage(`${t('edit_success')}`, 'success');
                    listDataDetail?.map((item: any, index: number) => {
                        handleEditDetail(item)
                        if (index + 1 === listDataDetail.length) {
                            handleCancel();
                        }
                    })
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        } else {
            if (listDataDetail?.length === undefined || listDataDetail?.length === 0) {
                showMessage(`${t('please_fill_full_information')}`, 'error');
                handleActive(2);
            } else {
                CreateRequestAdvancePayment(query)
                    .then((res) => {
                        setCreatedId(res.data.id);
                        handleDetail(res.data.id);
                    })
                    .catch((err) => {
                        showMessage(`${err?.response?.data?.message[0].error}`, 'error');
                    });
            }
        }
        setChangeFile(false);
    };

    const handleEditDetail = (records: any) => {
        EditRequestAdvancePaymentDetail({ ...records, id: router.query.id, detailId: records.id })
            .then(() => {
                mutate();
                showMessage(`${t('edit_success')}`, 'success');
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            })
    }

    const handleDetail = (id: any) => {
        AddRequestAdvancePaymentDetails({
            id: id,
            details: listDataDetail.map((item: any) => {
                const { id, ...rest } = item;
                return rest;
            }),
        })
            .then(() => {
                if (router.query.id === 'create' && send === true) {
                    showMessage(`${t('save_success')}`, 'success');
                    setId(id);
                    setOpenModalApproval(true);
                } else {
                    showMessage(`${t('save_draf_success')}`, 'success');
                    handleCancel();
                }
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
    };

    const RenturnError = (param: any) => {
        if (Object.keys(param?.errors || {}).length > 0 && param?.submitCount > 0) {
            showMessage(`${t('please_add_infomation')}`, 'error');
        }
        return <></>;
    };

    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data);
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationDepartment]);

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(paginationDepartment?.page + 1);
        }, 1000);
    };
    const [sign, setSign] = useState<any>();
    const [btnRule, setBtnRule] = useState(false);

    const handleSubmitApproval = (id: any) => {
        if (id === 1) {
            setBtnRule(true)
        } else {
            setBtnRule(false)
        }
        setSign(id);
        if (router.query.id !== 'create') {
            setOpenModalApproval(true);
        } else {
            handleSubmit();
            SetSend(true);
        }
    };

    const Approve = () => {
        RequestAdvancePaymentApprove({ id: router.query.id })
            .then(() => {
                handleCancel();
                showMessage(`${t('approve_success')}`, 'success');
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
    };

    const handleApprove = () => {
        const swalDeletes = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary testid-confirm-btn',
                cancelButton: 'btn btn-danger ltr:mr-3 rtl:ml-3',
                popup: 'confirm-popup confirm-delete',
            },
            imageUrl: '/assets/images/delete_popup.png',
            buttonsStyling: false,
        });
        swalDeletes
            .fire({
                title: `${t('approve')}`,
                text: `${t('approve')} ${t('request_advance_payment')}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    Approve();
                }
            });
    };

    const handleReject = () => {
        setOpenModalReject(true);
    };

    const [forward, setForward] = useState(false);


    const handleForward = (id: any) => {
        setForward(true);
        setOpenModalApproval(true);
        setSign(id);
    };

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit();
        }
    };

    useEffect(() => {
        if (data?.approvalHistory.find((item: any) => Number(item.approverId) === Number(id))) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [data, id]);
    // original code
    // const handleChange = async (event: any) => {
    //     const files = Array.from(event.target.files);

    //     const uploadPromises = await Object.keys(event.target.files).map((item: any) => {
    //         const formData = new FormData();
    //         formData.append('file', event.target.files[item]);
    //         formData.append('fileName', event.target.files[item].name);
    //         Upload(formData)
    //             .then((res) => {
    //                 setDataPath({ id: res.data.id, path: res.data.path, name: res?.data?.name });
    //                 return { id: res.data.id, path: res.data.path, name: res.data.name };
    //             }).catch((err) => {
    //                 console.log(err?.response?.data)

    //                 showMessage(`${err?.response?.data?.message}`, 'error');
    //             });
    //     })
    //     const newFiles = await Promise.all(uploadPromises);
    //     const validNewFiles = newFiles.filter(file => file !== null);

    //     setPath((prevPath: any) => {
    //         if (!Array.isArray(prevPath)) {
    //             return validNewFiles;
    //         }
    //         return [...prevPath, ...validNewFiles];
    //     });

    //     // Update the file input value
    //     const dataTransfer = new DataTransfer();
    //     [...fileRef.current.files].forEach((file: any) => dataTransfer.items.add(file));
    //     fileRef.current.files = dataTransfer.files;
    // }
    const handleChange = async (event: any) => {
        setLoading(true);
        const files = Array.from(event.target.files);

        // Tạo mảng các promises để tải lên các tệp
        const uploadPromises = files.map((file: any) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);

            // Trả về promise của việc tải lên
            return Upload(formData)
                .then((res) => {
                    return { id: res.data.id, path: res.data.path, name: res.data.name };
                })
                .catch((err) => {
                    const input = err?.response?.data?.message;

                    // Tách chuỗi tại " or MIME type"
                    const parts = input.split(" or MIME type");

                    // Sử dụng biểu thức chính quy để tìm chuỗi bắt đầu bằng dấu chấm và theo sau là các ký tự chữ cái
                    const fileType = parts[0].match(/\.\w+$/)[0];

                    if (fileType) {
                        showMessage(`${t('unsupported type file', { fileType: fileType })}`, 'error');
                    } else {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    }
                    return null; // Trả về null nếu có lỗi
                });
        });

        // Sử dụng Promise.allSettled để xử lý tất cả các promises
        try {
            // Sử dụng Promise.allSettled để xử lý tất cả các promises
            const results = await Promise.allSettled(uploadPromises);

            // Lọc các kết quả để chỉ lấy các tệp tải lên thành công
            const validNewFiles = results
                .filter((result): result is PromiseFulfilledResult<{ id: any; path: any; name: any }> => result.status === 'fulfilled' && result.value !== null)
                .map(result => result.value);

            // Cập nhật state với các đường dẫn tệp mới
            setPath((prevPath: any) => {
                if (!Array.isArray(prevPath)) {
                    return validNewFiles;
                }
                return [...prevPath, ...validNewFiles];
            });

            // Cập nhật giá trị của input file
            const dataTransfer = new DataTransfer();
            files.forEach((file: any) => dataTransfer.items.add(file));
            fileRef.current.files = dataTransfer.files;
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            // Kết thúc quá trình tải lên, đặt loading thành false
            setLoading(false);
        }
    }

    const handleDeleteFile = (index: any) => {
        const newPath = path.filter((i: any) => i !== path[index]);
        setPath(newPath);
        if (fileRef?.current) {
            const dataTransfer = new DataTransfer();
            Array.from(fileRef?.current?.files)
                .filter((i: any) => i !== fileRef?.current?.files[index])
                .forEach((file: any) => dataTransfer.items.add(file));
            fileRef.current.files = dataTransfer.files;
        }
    }
    const handleDownloadTemplate = () => {
        const lang = localStorage.getItem('i18nextLng');
        let urlString
        switch (lang) {
            case "vi":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/request_advance_payment/request_advance_payment_vi.xlsx`;
                break;
            case "la":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/request_advance_payment/request_advance_payment_la.xlsx`;
                break;
            case "en":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/request_advance_payment/request_advance_payment_en.xlsx`;
                break;
            default:
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/request_advance_payment/request_advance_payment_vi.xlsx`;
                break;
        }
        const link = document.createElement('a');
        link.href = urlString;
        link.setAttribute('download', 'request_advance_payment.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target?.result;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer as ArrayBuffer);

            const worksheet = workbook.worksheets[0];
            const jsonData: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 3) {
                    const rowValues = row.values as any[];
                    const item = rowValues.slice(1);
                    jsonData.push({
                        id: item[0],
                        content: item[1],
                        // spendingDay: item[1],
                        quantity: item[2],
                        unit: item[3],
                        unitPrice: item[4],
                        moneyTotal: item[5]?.result ?? item[5]
                    });
                }
            });
            setListDataDetail((prev) => ([...prev, ...jsonData]));
        };
        reader.readAsArrayBuffer(file);
    };
    return (
        <div>
            {isLoading && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )}
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <Link href="/hrm/request-advance-payment" className="text-primary hover:underline">
                        <span>{t('request_advance_payment')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_request_advance_payment') : t('add_request_advance_payment'))}
                        {
                            disable && t('detail_request_advance_payment')
                        }
                    </span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">
                    {!disable && (data ? t('update_request_advance_payment') : t('add_request_advance_payment'))}
                    {disable && t('detail_request_advance_payment')}
                </h1>
                <div className="flex" style={{ alignItems: 'center' }}>
                    {/* {data?.status !== 'DRAFT' &&
                        data?.status !== 'REJECTED' &&
                        data?.status !== 'APPROVED' &&
                        (data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') &&
                        userData?.data?.id === data?.currentApprover?.id &&
                        disable &&
                        Number(data?.createdById) !== userData?.data?.id && (
                            <RBACWrapper permissionKey={['requestAdvancePayment:update']} type={'AND'}>
                                <div onClick={() => setOpenAssigned(true)} style={{ marginRight: '-10px' }}>
                                    <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                                </div>
                            </RBACWrapper>
                        )} */}
                    {disable && data?.status === 'APPROVED' && (
                        <RBACWrapper permissionKey={['requestAdvancePayment:exportTextDraft']} type={'AND'}>
                            <button type="button" className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4" onClick={() => handleExportFile(data?.id)} disabled={loading}>
                                {
                                    loading ? <Loader size="sm" color="#fff" className="rtl:ml-2" /> : <IconNewDownload2 className="ltr:mr-2 rtl:ml-2" />
                                }
                                <span>{t('export_file')}</span>
                            </button>
                        </RBACWrapper>
                    )}
                    {/* {
                        disable && (data?.status === LIST_STATUS.DRAFT || (userData?.data?.id === data?.currentApproverId && data?.status !== LIST_STATUS.APPROVED && data?.status !== LIST_STATUS.REJECTED)) && (
                            <Link href={`/hrm/request-advance-payment/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                                <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('edit')}</button>
                            </Link>
                        )} */}
                    <Link href={`/hrm/request-advance-payment`}>
                        <div className="btn btn-primary btn-sm back-button m-1 h-9">
                            <IconBack />
                            <span>{t('back')}</span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="mb-5">
                <div className="font-semibold">
                    <div className="rounded">
                        <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(1)}>
                            {t('request_advance_payment_infomation')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`mb-2 ${active.includes(1) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                <Formik
                                    initialValues={initialValue}
                                    validationSchema={SubmittedForm}
                                    onSubmit={(values: any) => {
                                        handleRequestAdvancePayment(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5">
                                            <div className="p-4">
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="name" className="label">
                                                            {' '}
                                                            {t('name_staff')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="name" id="name" className="form-input"></Field>
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="position" className="label">
                                                            {' '}
                                                            {t('duty')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="position" id="position" className="form-input"></Field>
                                                    </div>
                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="department" className="label">
                                                            {' '}
                                                            {t('work_department')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="department" id="department" className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="requestDate" className="label">
                                                            {' '}
                                                            {t('submitday')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            name="requestDate"
                                                            disabled
                                                            options={{
                                                                enableTime: false,
                                                                dateFormat: 'd-m-Y',
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                            }}
                                                            value={dayjs(values?.requestDate).format('DD-MM-YYYY')}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('choose_submit_day')}`}
                                                        />
                                                        {submitCount ? errors.requestDate ? <div className="mt-1 text-danger"> {`${errors.requestDate}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="type" className="label">
                                                            {' '}
                                                            {t('money_number')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <div className="flex">
                                                            <Field
                                                                autoComplete="off"
                                                                name="moneyTotal"
                                                                type="text"
                                                                id="moneyTotal"
                                                                placeholder={`${t('enter_money_number')}`}
                                                                className={`${disable ? 'form-input bg-[#f2f2f2]' : 'form-input'} ltr:rounded-r-none rtl:rounded-l-none`}
                                                                disabled
                                                                value={formatNumber(moneyToNumber(values?.moneyTotal))}
                                                            />
                                                            <div className="flex items-center justify-center font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0">
                                                                <label className={`relative mb-0 h-4 w-24 ${!Number(router.query.id) && 'cursor-pointer'}`}>
                                                                    <Select
                                                                        id="moneyUnit"
                                                                        name="moneyUnit"
                                                                        options={MONEY}
                                                                        value={values?.moneyUnit}
                                                                        isDisabled={disable}
                                                                        styles={customStyles}
                                                                        className="absolute -top-[11px]"
                                                                        onChange={(e) => {
                                                                            setFieldValue('moneyUnit', e);
                                                                            setMoneyType(e?.value)
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        {submitCount && errors.moneyTotal ? <div className="mt-1 text-danger"> {`${errors.moneyTotal}`} </div> : null}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="moneyWord" className="label">
                                                            {' '}
                                                            {t('money_text')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="moneyWord"
                                                            type="text"
                                                            id="moneyWord"
                                                            placeholder={`${t('fill_money_number')}`}
                                                            className={true ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={true}
                                                            value={moneyToText(moneyToNumber(values?.moneyTotal), values?.moneyUnit?.value)}
                                                        />
                                                    </div>
                                                </div>
                                                {
                                                    router?.query?.id !== "create" && data?.status !== "DRAFT" &&
                                                    <div className="mb-5 mt-5 flex justify-between gap-5">
                                                        <div className="w-1/2">
                                                            <label htmlFor="currentApprover" className="label">
                                                                {
                                                                    data?.status === 'REJECTED' && t('rejecter')
                                                                }
                                                                {
                                                                    (data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') && t('pending_current_approver')
                                                                }
                                                                {
                                                                    data?.status === "APPROVED" && t('approver')
                                                                }
                                                                <span style={{ color: 'red' }}> *
                                                                </span>
                                                            </label>
                                                            <Field autoComplete="off"
                                                                name="currentApprover"
                                                                type="text"
                                                                id="currentApprover"
                                                                className={true ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                disabled={true}
                                                            />
                                                            {submitCount && errors.currentApprover ? (
                                                                <div className="text-danger mt-1"> {`${errors.currentApprover}`} </div>
                                                            ) : null}
                                                        </div>
                                                        <div className="w-1/2">
                                                        </div>
                                                    </div>
                                                }
                                                <div className='mt-5'>
                                                    <label htmlFor="attachmentIds" className='label'> {t('attached_file')} </label >
                                                    <Field
                                                        innerRef={fileRef}
                                                        autoComplete="off"
                                                        name="attachmentIds"
                                                        type="file"
                                                        id="attachmentIds"
                                                        className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                        disabled={disable}
                                                        multiple
                                                        onChange={(e: any) => handleChange(e)}
                                                    // onClick={() => setChangeFile(true)}
                                                    />
                                                    {submitCount && errors.attachmentIds ? (
                                                        <div className="text-danger mt-1"> {`${errors.attachmentIds}`} </div>
                                                    ) : null}
                                                </div>
                                                {
                                                    loading && <div className="" style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
                                                        <IconLoading />
                                                    </div>
                                                }
                                                {
                                                    path?.length > 0 &&
                                                    <div className="grid mt-2 gap-4 p-2 border rounded">
                                                        <p>{t('List of file upload paths')}</p>
                                                        {
                                                            path?.map((item: any, index: number) => {
                                                                return (
                                                                    <>
                                                                        {
                                                                            item?.path &&
                                                                            <div className='flex gap-4'>
                                                                                <Link href={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} target="_blank" className='ml-5 d-block' style={{ color: 'blue' }}>{item?.name}</Link>
                                                                                <button disabled={disable} type='button' onClick={() => handleDeleteFile(index)} className="btn-outline-dark"><IconX /></button>
                                                                            </div>
                                                                        }
                                                                    </>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                }
                                            </div>
                                            {<RenturnError errors={errors} submitCount={submitCount} />}
                                        </Form>
                                    )}
                                </Formik>
                            </AnimateHeight>
                        </div>
                    </div>
                    <div className="rounded">
                        <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(2)}>
                            {t('detail')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(2) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`${active.includes(2) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(2) ? 'auto' : 0}>
                                <div className="p-4">
                                    <div className="mb-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                        <div className="flex flex-wrap items-center">
                                            {!disable && <>
                                                <button
                                                    data-testId="modal-proposal-btn"
                                                    type="button"
                                                    onClick={(e) => {
                                                        setOpenModal(true);
                                                        setDataDetail(undefined);
                                                    }}
                                                    className="btn btn-primary btn-sm custom-button m-1"
                                                >
                                                    <IconPlus className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                                                    {t('add_detail')}
                                                </button>
                                                <button
                                                    data-testId="modal-proposal-btn"
                                                    type="button"
                                                    onClick={(e) => handleDownloadTemplate()}
                                                    className="btn btn-primary btn-sm custom-button m-1"
                                                >
                                                    <IconNewDownload3 className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                                                    <span style={{ marginLeft: "0.2rem" }}>{t('download_template')}</span>
                                                </button>
                                                <input
                                                    autoComplete="off" type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    style={{ display: "none" }}
                                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                />
                                                <button type="button" className="btn btn-primary btn-sm custom-button m-1" onClick={() => fileInputRef.current?.click()}>
                                                    <IconImportFile2 />
                                                    <span style={{ marginLeft: "0.2rem" }}>{t('import_file')}</span>
                                                </button>
                                            </>
                                            }
                                        </div>

                                        {/* <input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} onChange={(e) => handleSearch(e.target.value)} /> */}
                                    </div>
                                    <div className="datatables">
                                        <DataTable
                                            highlightOnHover
                                            className="table-hover whitespace-nowrap"
                                            records={listDataDetail}
                                            columns={columns}
                                            sortStatus={sortStatus}
                                            onSortStatusChange={setSortStatus}
                                            minHeight={200}
                                        />
                                    </div>
                                </div>
                                <DetailModal
                                    openModal={openModal}
                                    setOpenModal={setOpenModal}
                                    data={dataDetail}
                                    setData={setDataDetail}
                                    listData={listDataDetail}
                                    setListData={setListDataDetail}
                                    requestAdvancePaymentDetailMutate={mutate}
                                    moneyType={moneyType}
                                />
                                <ApprovalModal
                                    openModal={openModalApproval}
                                    setOpenModal={setOpenModalApproval}
                                    handleData={handleData}
                                    data={data}
                                    handleCancel={handleCancel}
                                    id={id}
                                    // departmentId={data?.createdBy?.department?.id ?? userData?.data?.department?.id}
                                    createdId={createdId}
                                    sign={sign}
                                    btnRule={btnRule}
                                    forward={forward}
                                />
                                <RejectModal openModal={openModalReject} setOpenModal={setOpenModalReject} handleCancel={handleCancel} />
                            </AnimateHeight>
                        </div>
                    </div>
                    {router.query.id !== 'create' && (
                        <div className="mt-5 rounded">
                            <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(3)}>
                                {t('history_approve')}
                                <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(3) ? 'rotate-180' : ''}`}>
                                    <IconCaretDown />
                                </div>
                            </button>
                            <div className={`${active.includes(3) ? 'custom-content-accordion' : ''}`}>
                                <AnimateHeight duration={300} height={active.includes(3) ? 'auto' : 0}>
                                    <div className="p-4">
                                        <div className="mb-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                            <div className="flex flex-wrap items-center"></div>
                                        </div>
                                        <div className="datatables">
                                            <DataTable
                                                highlightOnHover
                                                className="table-hover whitespace-nowrap"
                                                records={data?.approvalHistory}
                                                columns={columnHistorys}
                                                sortStatus={sortStatus}
                                                onSortStatusChange={setSortStatus}
                                                minHeight={200}
                                            />
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </div>
                        </div>
                    )}
                    {/* {router?.query.id !== 'create' && (
                        <div className="mt-5 rounded">
                            <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(4)}>
                                {t('related_tasks')}
                                <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(4) ? 'rotate-180' : ''}`}>
                                    <IconCaretDown />
                                </div>
                            </button>
                            <div className={`${active.includes(4) ? 'custom-content-accordion' : ''}`}>
                                <AnimateHeight duration={300} height={active.includes(4) ? 'auto' : 0}>
                                    <div className="p-4">
                                        <div className="mb-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                            <div className="flex flex-wrap items-center"></div>
                                        </div>
                                        <div className="datatables">
                                            <DataTable
                                                highlightOnHover
                                                className="table-hover whitespace-nowrap"
                                                records={data?.task}
                                                columns={columnTask}
                                                sortStatus={sortStatus}
                                                onSortStatusChange={setSortStatus}
                                                minHeight={200}
                                            />
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </div>
                        </div>
                    )} */}
                    {/* <div style={{ display: 'flex', marginTop: '10px' }}>
                        <p style={{ marginRight: '10px' }}>
                            <strong>{t('Order of signing')}:</strong>
                        </p>
                        <p>
                            <strong>
                                {t('Applicant')} {'->'} {t('Department Head/Deputy')} {'->'} {t('Chief Accountant')} {'->'} {t('Director')}
                            </strong>
                        </p>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px' }}>
                        <p style={{ fontStyle: "italic" }}>{t('Note: For employees of the Finance and Accounting Department')}</p>
                    </div> */}
                    {/* <div style={{ display: 'flex', marginTop: '10px', fontStyle: "italic" }}>
                        <p style={{ marginRight: '10px' }}>
                            {t('Order of signing')}:
                        </p>
                        <p>
                            {' '}
                            {t('Applicant')} {'->'} {t('Head/Deputy Head of Finance and Accounting Department')} {'->'} {t('Director')}
                        </p>
                    </div> */}
                    {/* <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                        {
                            !disable && <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                {t('cancel_form')}
                            </button>
                        }
                        {
                            (((data?.status === 'DRAFT' || data?.status === 'REJECTED') && data?.createdBy?.id === id) || (router.query.id === "create") || (userData?.data?.id === data?.currentApproverId && data?.status !== "APPROVED")) && !disable &&
                            <>
                                <button data-testId="submit-btn" type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmit()}>
                                    {router.query.id !== "create" ? t('update') : t('save_daf')}
                                </button>
                            </>
                        }
                        {data?.status !== 'DRAFT' && data?.currentApprover?.id !== userData?.data?.id ? (
                            <></>
                        ) : (
                            <>
                                {data?.status !== 'DRAFT' &&
                                    data?.status !== 'REJECTED' &&
                                    data?.status !== 'APPROVED' &&
                                    (data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') &&
                                    userData?.data?.id === data?.currentApprover?.id &&
                                    disable &&
                                    Number(data?.createdById) !== userData?.data?.id && (
                                        <>
                                            <button type="button" className="btn btn-danger cancel-button w-28 ltr:ml-4" onClick={() => handleReject()}>
                                                {t('reject')}
                                            </button>
                                            <button data-testId="submit-approve-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleApprove()}>
                                                {t('approve')}
                                            </button>
                                        </>
                                    )}
                            </>
                        )}
                        {
                            // mới tạo đơn
                            // trạng thái nháp và người tạo đơn
                            // trạng thái pending hoặc in_progress mà có id bằng người phê duyệt
                            (router.query.id === 'create' ||
                                (data?.status === 'DRAFT' && data?.createdById === userData?.data?.id) ||
                                ((data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') && userData?.data?.id === data?.currentApprover?.id)) &&
                            high !== 'true' && (
                                <button data-testId="submit-approval-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleSubmitApproval()}>
                                    {t('continue_approval')}
                                </button>
                            )
                        }
                    </div> */}
                    <SwitchBtn
                        entity={'request-advance-payment'}
                        handleCancel={handleCancel}
                        handleSubmit={handleSubmit}
                        handleSubmitApproval={handleSubmitApproval}
                        handleReject={handleReject}
                        handleApprove={handleApprove}
                        handleForward={handleForward}
                        setSign={setSign}
                        disable={disable}
                        data={data}
                        id={id}
                    />
                </div>
            </div>
            <Modal open={openAssigned} id={router.query.id} handleData={handleData} setOpen={setOpenAssigned}></Modal>
        </div>
    );
};
export default DetailPage;
