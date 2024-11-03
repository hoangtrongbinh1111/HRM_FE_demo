import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { AddConfirmPortalDetails, CreateConfirmPortal, DeleteConfirmPortalDetail, EditConfirmPortal, GetConfirmPortal, ConfirmPortalApprove, EditConfirmPortalDetail } from '@/services/apis/confirm-portal.api';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { ConfirmPortalDetails } from '@/services/swr/confirm-portal.swr';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import IconPlus from '@/components/Icon/IconPlus';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import AnimateHeight from 'react-animate-height';
import Link from 'next/link';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Select, { components } from 'react-select';
import IconBack from '@/components/Icon/IconBack';
import { DropdownDepartment, DropdownUsers, DropdownWarehouses } from '@/services/swr/dropdown.swr';
import DetailModal from '../modal/DetailModal';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { useProfile } from '@/services/swr/profile.swr';
import { formatNumber, handleReturnFlowApprove, moneyToNumber, moneyToText } from '@/utils/commons';
import dayjs from 'dayjs';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import { LIST_STATUS } from '@/utils/constants';
import { Loader } from '@mantine/core';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import Modal from './modal';
import ExcelJS from "exceljs";
import IconNewDownload3 from '@/components/Icon/IconNewDownload3';
import IconImportFile2 from '@/components/Icon/IconImportFile2';
import { Upload } from '@/services/apis/upload.api';
import IconX from '@/components/Icon/IconX';
import SwitchBtn from '@/pages/warehouse-process/switchBtn';

interface Props {
    [key: string]: any;
}

const DetailPage = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    const [have, setHave] = useState(false);
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');
    const [page, setPage] = useState(1);
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const formRef = useRef<any>();
    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [send, SetSend] = useState<any>(false);
    const [isSaveDraft, setIsSaveDraft] = useState<any>(false);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [createdId, setCreatedId] = useState();
    const [openAssigned, setOpenAssigned] = useState(false);
    // get data
    const { data: confirmPortalDetail, pagination, mutate, isLoading } = ConfirmPortalDetails({ ...query });
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });
    const { data: userData } = useProfile();
    const [loading, setLoading] = useState(false);

    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("confirm_portal.pdf", `/confirm-portal/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_confirm_portal')}` : (data ? t('update_confirm_portal') : t('add_confirm_portal'))));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(confirmPortalDetail?.data);
        }
    }, [confirmPortalDetail?.data, router]);

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

    const handleData = () => {
        if (Number(router.query.id)) {
            GetConfirmPortal({ id: router.query.id })
                .then((res) => {
                    setData(res.data);
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        }
    };

    useEffect(() => {
        setInitialValue({
            moneyNumber: data ? `${data?.moneyNumber}` : '',
            moneyWord: data ? `${data?.moneyWord}` : '',
            name: data ? data?.createdBy?.fullName : userData?.data?.fullName,
            position: data ? data?.createdBy?.position?.name : userData?.data?.position?.name,
            department: data ? data?.createdBy?.department?.name : userData?.data?.department?.name,
            requestDate: data ? data?.createdAt : new Date(),
            currentApprover: data?.approvalHistory?.find((his: any) => his.status === 'APPROVED')?.approver?.fullName ?? data?.currentApprover?.fullName,
            haveStuff: data?.haveStuff === true ? {
                value: true,
                label: 'Có'
            } : {
                value: false,
                label: 'Không'
            }
        });
        setPath(data?.attachments);
        setHave(data?.haveStuff ? data?.haveStuff : false);
    }, [data, router, userData]);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string(),
        position: Yup.string(),
        department: Yup.string(),
        requestDate: Yup.string(),
        moneyNumber: Yup.string()
            .matches(/^[\d,]+$/, 'please_fill_valid_number')
            .required(`${t('please_fill_money_number')}`),
        moneyWord: Yup.string(),
    });

    const handleEdit = (data: any) => {
        setDataDetail(data);
        setOpenModal(true);
    };

    const handleDelete = ({ id, product }: any) => {
        if (listDataDetail?.length === 1) {
            showMessage(`${t('list_detail_can_not_be_empty')}`, 'error');
            return;
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
                        DeleteConfirmPortalDetail({ id: router.query.id, detailId: id })
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
    const [pageUser, setPageUser] = useState<any>(1);
    const [searchUser, setSearchUser] = useState<any>();
    const [dataStaffDropdown, setDataStaffDropdown] = useState<any>([]);
    const { data: staffDropdown, pagination: staffPagination, isLoading: staffLoading } = DropdownUsers({
        page: pageUser,
        perPage: 10,
        departmentId: data?.createdBy?.department?.id ?? userData?.data?.department?.id,
        search: searchUser,
    });

    useEffect(() => {
        if (staffPagination?.page === undefined) return;
        if (staffPagination?.page === 1) {
            setDataStaffDropdown(staffDropdown?.data);
        } else {
            setDataStaffDropdown([...dataStaffDropdown, ...staffDropdown?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffPagination]);

    const handleOnScrollBottomHuman = () => {
        if (staffPagination?.page < staffPagination?.totalPages) {
            setPageUser(staffPagination?.page + 1);
        }
    };
    const handleDataRecord = (records: any, value: any, name: any) => {
        const data = listDataDetail.find((item) => item.id === records.id);
        setListDataDetail([
            {
                id: records.id,
                personName: name === 'personName' ? value : data?.personName,
                department: name === 'department' ? value : data?.department,
                vehicle: name === 'vehicle' ? value : data?.vehicle,
                comment: name === 'comment' ? value : data?.comment,
            },
            ...listDataDetail.filter((item) => item.id !== records.id),
        ]);
    };

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
            width: 50,
        },
        {
            accessor: 'name',
            title: `${t('name')}`,
            render: (records: any) => {
                return (
                    <input name="personName" disabled={disable} className='form-input' value={records?.personName} onChange={e => handleDataRecord(records, (e.target.value), e.target.name)} />

                )
            },
            width: 300,
            sortable: false,
        },
        {
            accessor: 'vehicle',
            title: `${t('department')}`,
            render: (records: any) => {
                return (
                    <input name="department" disabled={disable} className='form-input' value={records?.department} onChange={e => handleDataRecord(records, (e.target.value), e.target.name)} />
                )
            },
            sortable: false,
            width: 350,
        },
        {
            accessor: 'vehicle',
            title: `${t('vehicle')}`,
            sortable: false,
            render: (records: any) => {
                return (
                    <input name="vehicle" disabled={disable} className='form-input' value={records.vehicle} onChange={e => handleDataRecord(records, (e.target.value), e.target.name)} />
                )
            },
            width: 350,
        },
        {
            accessor: 'comment',
            title: `${t('comment')}`,
            render: (records: any) => {
                return (
                    <input name="comment" disabled={disable} className='form-input' value={records.comment} onChange={e => handleDataRecord(records, (e.target.value), e.target.name)} />
                )
            },
            width: 300,
            sortable: false
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="mx-auto flex w-max items-center gap-2">
                    {!disable && (
                        <>
                            {
                                router.query.id !== 'create' &&
                                < div className="w-[auto]">
                                    <button type="button" className="button-edit" onClick={() => {
                                        EditConfirmPortalDetail({ ...records, id: router.query.id, detailId: records?.id }).then(() => {
                                            mutate()
                                            showMessage(`${t('edit_success')}`, 'success');
                                        }).catch((err) => {
                                            showMessage(`${err?.response?.data?.message}`, 'error');
                                        })
                                    }}>
                                        <IconNewEdit />
                                        <span>{t('edit')}</span>
                                    </button>
                                </div>
                            }
                            <div className="w-[auto]">
                                <button type="button" className="button-delete" onClick={() => handleDelete(records)}>
                                    <IconNewTrash />
                                    <span>{t('delete')}</span>
                                </button>
                            </div>
                        </>
                    )
                    }
                </div >
            ),
        },
    ];

    const columnHistorys = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'action',
            title: `${t('action_type')}`,
            render: ({ action, sign }: any) => {
                return <span>{handleReturnFlowApprove(action, sign)}</span>
            },
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
            render: ({ submittedAt }: any) => <span>{moment(submittedAt).format('DD/MM/YYYY hh:mm:ss')}</span>,
            sortable: false,
        },
        { accessor: 'comment', title: `${t('description')}`, sortable: false },
    ];

    const handleCancel = () => {
        router.push(`/hrm/confirm-portal`);
    };
    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };
    const handleDetail = (id: any) => {
        AddConfirmPortalDetails({
            id: id,
            details: listDataDetail.map((item: any) => {
                return {
                    vehicle: item.vehicle,
                    comment: item.comment,
                    personName: item.personName,
                    department: item.department,
                };
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

    const [btnRule, setBtnRule] = useState(false);
    const [sign, setSign] = useState<any>();

    const handleSubmitApproval = (id: any) => {
        if (id === 1) {
            setBtnRule(true)
        } else {
            setBtnRule(false)
        }
        setSign(id);
        if (router.query.id !== "create") {
            setOpenModalApproval(true);
        } else {
            handleSubmit();
            SetSend(true);
        }
    };

    const Approve = () => {
        ConfirmPortalApprove({ id: router.query.id })
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
                text: `${t('approve')} ${t('confirmPortal')}`,
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
    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit();
        }
    };
    const handleConfirmPortal = (params: any) => {
        if (!listDataDetail.find(item => item.personName !== undefined)) {
            return showMessage(`${t('please_add_confirm_portal_detail')}`, 'error');
        }
        const query: any = {
            attachmentIds: path?.length > 0 ? path.map((item: any) => { return item.id }) : [],
            haveStuff: params.haveStuff ? params.haveStuff.value : false
        };
        if (data) {
            EditConfirmPortal({ id: data?.id, ...query })
                .then((res) => {
                    showMessage(`${t('edit_success')}`, 'success');
                    handleCancel();
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        } else {
            CreateConfirmPortal({ ...query })
                .then((res) => {
                    setCreatedId(res.data.id);
                    handleDetail(res.data.id);
                    // if (router.query.id === 'create' && send === true) {
                    //     showMessage(`${t('save_success')}`, 'success');
                    //     setId(res?.data?.createdById);
                    //     setOpenModalApproval(true);
                    // } else {
                    //     showMessage(`${t('save_draf_success')}`, 'success');
                    //     handleCancel();
                    // }
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message[0].error}`, 'error');
                });
        }
    };
    useEffect(() => {
        if (data?.approvalHistory.find((item: any) => Number(item.approverId) === Number(id))) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [data, id]);
    const handleDownloadTemplate = () => {
        const lang = localStorage.getItem('i18nextLng');
        let urlString
        switch (lang) {
            case "vi":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/confirm_portal/confirm_portal_vi.xlsx`;
                break;
            case "la":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/confirm_portal/confirm_portal_la.xlsx`;
                break;
            case "en":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/confirm_portal/confirm_portal_en.xlsx`;
                break;
            default:
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/confirm_portal/confirm_portal_vi.xlsx`;
                break;
        }
        const link = document.createElement('a');
        link.href = urlString;
        link.setAttribute('download', 'confirm_portal.xlsx');
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
                        staffId: props?.data?.staffId ?? userData?.data?.id,
                        id: item[0],
                        content: item[1],
                        comment: item[2],
                        vehicle: item[3]
                    });
                }
            });
            setListDataDetail((prev) => ([...prev, ...jsonData]));
        };
        reader.readAsArrayBuffer(file);
    };

    const fileRef = useRef<any>();
    const [path, setPath] = useState<any>([]);
    const [dataPath, setDataPath] = useState<any>();

    const handleChange = async (event: any) => {
        setLoading(true);
        const files = Array.from(event.target.files);

        const uploadPromises = files.map((file: any) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);

            return Upload(formData)
                .then((res) => {
                    return { id: res.data.id, path: res.data.path, name: res.data.name };
                })
                .catch((err) => {
                    const input = err?.response?.data?.message;

                    const parts = input.split(" or MIME type");

                    const fileType = parts[0].match(/\.\w+$/)[0];

                    if (fileType) {
                        showMessage(`${t('unsupported type file', { fileType: fileType })}`, 'error');
                    } else {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    }
                    return null; // Trả về null nếu có lỗi
                });
        });

        try {
            const results = await Promise.allSettled(uploadPromises);

            const validNewFiles = results
                .filter((result): result is PromiseFulfilledResult<{ id: any; path: any; name: any }> => result.status === 'fulfilled' && result.value !== null)
                .map(result => result.value);

            setPath((prevPath: any) => {
                if (!Array.isArray(prevPath)) {
                    return validNewFiles;
                }
                return [...prevPath, ...validNewFiles];
            });

            const dataTransfer = new DataTransfer();
            files.forEach((file: any) => dataTransfer.items.add(file));
            fileRef.current.files = dataTransfer.files;
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
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
                    <Link href="/hrm/confirm-portal" className="text-primary hover:underline">
                        <span>{t('confirm_portal')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_confirm_portal') : t('add_confirm_portal'))}
                        {
                            disable && t('detail_confirm_portal')
                        }
                    </span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">
                    {!disable && (data ? t('update_confirm_portal') : t('add_confirm_portal'))}
                    {disable && t('detail_confirm_portal')}
                </h1>
                <div className="flex" style={{ alignItems: 'center' }}>
                    {/* {data?.status !== 'DRAFT' &&
                        data?.status !== 'REJECTED' &&
                        data?.status !== 'APPROVED' &&
                        (data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') &&
                        userData?.data?.id === data?.currentApprover?.id &&
                        disable &&
                        Number(data?.createdById) !== userData?.data?.id && (
                            <RBACWrapper permissionKey={['confirmPortal:update']} type={'AND'}>
                                <div onClick={() => setOpenAssigned(true)} style={{ marginRight: '-10px' }}>
                                    <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                                </div>
                            </RBACWrapper>
                        )}
                    {disable && data?.status === 'APPROVED' && (
                        <RBACWrapper permissionKey={['confirmPortal:exportTextDraft']} type={'AND'}>
                            <button type="button" className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4" onClick={() => handleExportFile(data?.id)} disabled={loading}>
                                {
                                    loading ? <Loader size="sm" color="#fff" className="rtl:ml-2" /> : <IconNewDownload2 className="ltr:mr-2 rtl:ml-2" />
                                }
                                <span>{t('export_file')}</span>
                            </button>
                        </RBACWrapper>
                    )} */}
                    {/* {
                        disable && (data?.status === LIST_STATUS.DRAFT || (userData?.data?.id === data?.currentApproverId && data?.status !== LIST_STATUS.APPROVED && data?.status !== LIST_STATUS.REJECTED)) && (
                            <Link href={`/hrm/confirm-portal/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                                <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('edit')}</button>
                            </Link>
                        )} */}
                    <Link href={`/hrm/confirm-portal`}>
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
                            {t('confirm_portal_information')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`mb-2 ${active.includes(1) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                <Formik
                                    initialValues={initialValue}
                                    // validationSchema={SubmittedForm}
                                    onSubmit={(values) => {
                                        handleConfirmPortal(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5">
                                            <div className="p-4">
                                                <div className="mb-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="name" className="label">
                                                            {' '}
                                                            {t('name_staff')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="name" id="name" className="form-input"></Field>
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="position" className="label">
                                                            {' '}
                                                            {t('duty')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="position" id="position" className="form-input"></Field>
                                                    </div>
                                                </div>
                                                <div className="mb-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="department" className="label">
                                                            {' '}
                                                            {t('work_department')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="department" id="department" className="form-input" />
                                                    </div>
                                                    <div className="w-1/2">
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
                                                            }}
                                                            value={dayjs(values?.requestDate).format('DD-MM-YYYY')}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('choose_submit_day')}`}
                                                        />
                                                        {submitCount ? errors.requestDate ? <div className="mt-1 text-danger"> {`${errors.requestDate}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                {router?.query?.id !== 'create' && data?.status !== 'DRAFT' && (
                                                    <div className="mb-5 flex justify-between gap-5">
                                                        <div className="w-1/2">
                                                            <label htmlFor="currentApprover" className="label">
                                                                {data?.status === 'REJECTED' && t('rejecter')}
                                                                {(data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') && t('pending_current_approver')}
                                                                {data?.status === 'APPROVED' && t('approver')}
                                                                <span style={{ color: 'red' }}> *</span>
                                                            </label>
                                                            <Field
                                                                autoComplete="off"
                                                                name="currentApprover"
                                                                type="text"
                                                                id="currentApprover"
                                                                className={true ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                                disabled={true}
                                                            />
                                                            {submitCount && errors.currentApprover ? <div className="mt-1 text-danger"> {`${errors.currentApprover}`} </div> : null}
                                                        </div>
                                                        <div className="w-1/2"></div>
                                                    </div>
                                                )}
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="haveStuff" className='label'> {t('Đồ mang theo')} </label >
                                                    <Select
                                                        id="haveStuff"
                                                        name="haveStuff"
                                                        isDisabled={disable}
                                                        options={[{ value: true, label: 'Có' }, { value: false, label: 'Không' }]}
                                                        maxMenuHeight={160}
                                                        value={values?.haveStuff}
                                                        onChange={(e) => {
                                                            setFieldValue('haveStuff', e);
                                                            setHave(e.value);
                                                        }}
                                                    />
                                                    {submitCount && errors.haveStuff ? (
                                                        <div className="text-danger mt-1"> {`${errors.haveStuff}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5 gap-5">
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
                                                                                <Link
                                                                                    key={index}
                                                                                    title="xem chi tiết"
                                                                                    href={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`}
                                                                                    target="_blank" className='ml-5 d-block'
                                                                                    style={{ color: 'blue' }}
                                                                                >
                                                                                    {item?.name}
                                                                                </Link>
                                                                                <button disabled={disable} type='button' onClick={() => handleDeleteFile(index)} className="btn-outline-dark">
                                                                                    <IconX />
                                                                                </button>
                                                                            </div>
                                                                        }
                                                                    </>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                }
                                            </div>
                                            {/* {<RenturnError errors={errors} submitCount={submitCount} />} */}
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
                                                        // setOpenModal(true);
                                                        // setDataDetail(undefined);
                                                        setListDataDetail([...listDataDetail, { id: (listDataDetail[listDataDetail.length - 1]?.id || 0) + 1 }]);
                                                    }}
                                                    className="btn btn-primary btn-sm custom-button m-1"
                                                >
                                                    <IconPlus className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                                                    {t('add_detail')}
                                                </button>
                                                {/* <button
                                                    data-testId="modal-proposal-btn"
                                                    type="button"
                                                    onClick={(e) => handleDownloadTemplate()}
                                                    className="btn btn-primary btn-sm custom-button m-1"
                                                >
                                                    <IconNewDownload3 className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                                                    <span style={{ marginLeft: "0.2rem" }}>{t('download_template')}</span>
                                                </button> */}
                                                <input
                                                    autoComplete="off" type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    style={{ display: "none" }}
                                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                />
                                                {/* <button type="button" className="btn btn-primary btn-sm custom-button m-1" onClick={() => fileInputRef.current?.click()}>
                                                    <IconImportFile2 />
                                                    <span style={{ marginLeft: "0.2rem" }}>{t('import_file')}</span>
                                                </button> */}
                                            </>}
                                        </div>
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
                                    listData={listDataDetail?.sort((a, b) => a.id - b.id) || []}
                                    setListData={setListDataDetail}
                                    confirmPortalDetailMutate={mutate}
                                />
                                <ApprovalModal
                                    openModal={openModalApproval}
                                    setOpenModal={setOpenModalApproval}
                                    handleData={handleData}
                                    data={data}
                                    handleCancel={handleCancel}
                                    id={id}
                                    departmentId={data?.createdBy?.department?.id ?? userData?.data?.department?.id}
                                    createdId={createdId}
                                    sign={sign}
                                    btnRule={btnRule}
                                    have={have}
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
                    <SwitchBtn
                        entity={have ? 'confirm-portal-have' : 'confirm-portal'}
                        handleCancel={handleCancel}
                        handleSubmit={handleSubmit}
                        handleSubmitApproval={handleSubmitApproval}
                        handleReject={handleReject}
                        handleApprove={handleApprove}
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
