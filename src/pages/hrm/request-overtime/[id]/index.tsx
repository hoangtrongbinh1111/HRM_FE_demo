import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { AddRequestOvertimeDetails, CreateRequestOvertime, DeleteRequestOvertimeDetail, EditRequestOvertime, GetRequestOvertime, RequestOvertimeApprove } from '@/services/apis/request-overtime.api';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { RequestOvertimeDetails } from '@/services/swr/request-overtime.swr';
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
import IconBack from '@/components/Icon/IconBack';
import { DropdownDepartment, DropdownWarehouses } from '@/services/swr/dropdown.swr';
import DetailModal from '../modal/DetailModal';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
// import '@styles/react/libs/flatpickr/flatpickr.scss'
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { useProfile } from '@/services/swr/profile.swr';
import dayjs from 'dayjs';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import { TimekeepingTypes } from '@/services/swr/timekeeping-type.swr';
import { IRootState } from '@/store';
import { Loader } from '@mantine/core';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import Modal from './modal';
import ExcelJS from "exceljs";
import IconNewDownload3 from '@/components/Icon/IconNewDownload3';
import IconImportFile2 from '@/components/Icon/IconImportFile2';
import { getConfig } from '@/services/apis/config-approve.api';
import SwitchBtn from '@/pages/hrm/leave-application/switchBtn';

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
    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [send, SetSend] = useState<any>(false);
    const [createdId, setCreatedId] = useState();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    // get data
    const { data: RequestOvertimeDetail, pagination, mutate, isLoading } = RequestOvertimeDetails({ ...query });
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });
    const [loading, setLoading] = useState(false);
    const [openAssigned, setOpenAssigned] = useState(false);
    const [submitType, setSubmitType] = useState('');
    const [sign, setSign] = useState(false);
    const [signStatus, setSignStatus] = useState<any>();
    const { data: userData } = useProfile();
    const [loadingState, setLoadingState] = useState({
        isContinueApproval: false,
        isApprove: false,
        isReject: false,
        isSubmit: false,
        isContinueInitial: false
    })
    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("request_overtime.pdf", `/request-overtime/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
    }
    const { data: timekeepingType,
    } = TimekeepingTypes({ sortBy: "id.DESC", page: 1, perPage: 10 });
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_request_overtime')}` : (data ? t('update_request_overtime') : t('add_request_overtime'))));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(RequestOvertimeDetail?.data);
        }
    }, [RequestOvertimeDetail?.data, router]);

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

    useEffect(() => {
        const departmentId = router.query.id === 'create' ? userData?.data?.department?.id : data?.createdBy?.department?.id;
        const fromPositionId = userData?.data?.position?.id;
        const startPositionId = router.query.id === 'create' ? userData?.data?.position?.id : data?.createdBy?.position?.id;
        if (departmentId && fromPositionId && startPositionId) {
            getConfig({
                entity: 'request-overtime',
                departmentId: departmentId,
                fromPosition: fromPositionId,
                startPosition: startPositionId
            }).then((res) => {
                setSignStatus(res?.data[0]);
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, "error");
            })
        }
    }, [data?.createdBy?.position, userData?.data?.department?.id, userData?.data?.position?.id, router, data?.department?.id, userData, data])

    const handleData = () => {
        GetRequestOvertime({ id: router.query.id })
            .then((res) => {
                setData(res.data);
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
            reason: data ? data?.reason : "",
            currentApprover: data?.approvalHistory?.find((his: any) => his.status === "APPROVED")?.approver?.fullName ?? data?.currentApprover?.fullName,
            registrationDay: data ? data?.registrationDay : "",
            code: data ? data?.createdBy?.code : userData?.data?.code,
        });
    }, [data, router]);

    const SubmittedForm = Yup.object().shape({
        reason: Yup.string().required(`${t('please_fill_reason')}`),
        registrationDay: Yup.date().required(`${t('please_choose_registration_day')}`),
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
                        DeleteRequestOvertimeDetail({ id: router.query.id, detailId: id })
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
    const countDifferentTime = (startTime: any, endTime: any) => {
        const time1 = moment(startTime, 'HH:mm');
        const time2 = moment(endTime, 'HH:mm');

        const diff = moment.duration(time2.diff(time1));
        const hours = diff.asHours();

        const roundedHours = Math.round(hours * 100) / 100;

        return roundedHours;
    }
    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        // { accessor: 'name', title: `${t('name')}`, sortable: false },
        // { accessor: 'code', title: `${t('code')}`, sortable: false },
        {
            accessor: 'staffName',
            title: `${t('name')}`,
            sortable: false,
            render: (records: any) => <span>{records?.staffName ?? records?.staff?.fullName ?? records?.staffId}</span>

        },
        {
            accessor: '',
            title: `${t('startDay')}`,
            sortable: false,
            render: (records: any) => <span>{moment(records?.startTime, 'HH:mm:ss').format('HH:mm')}</span>
        },
        {
            accessor: '',
            title: `${t('endDay')}`,
            sortable: false,
            render: (records: any) => <span>{moment(records?.endTime, 'HH:mm:ss').format('HH:mm')}</span>
        },
        // {
        //     accessor: '',
        //     title: `${t('timekeeping_type')}`,
        //     sortable: false,
        //     render: (records: any) => <span>{timekeepingType?.data?.find((item: any) => item.id === records?.timekeepingTypeId)?.description ?? ""}</span>
        // },
        {
            accessor: 'overtime_duration',
            title: `${t('overtime_duration')}`,
            render: (records: any) => <span>{countDifferentTime(records?.startTime, records?.endTime)}</span>,
            sortable: false
        },
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
    const columnHistorys = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            render: ({ action, sign }: any) => <span>{action === 'FORWARD' || action === 'SUBMIT' ? (sign === 2 ? 'Ký và Trình lên' : 'Ký nháy và Trình lên') : action === 'REJECT' ? 'Từ chối' : 'Phê duyệt'}</span>,
            sortable: false
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
        router.push(`/hrm/request-overtime?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`);
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };
    // console.log(userData?.data?.department?.id)

    const handleRequestOvertime = (param: any) => {
        if (router.query.id === 'create' && send === true) {
            setLoadingState({ ...loadingState, isContinueApproval: true });
        } else {
            setLoadingState({ ...loadingState, isSubmit: true });
        }
        const query: any = {
            reason: param?.reason,
            // requestDate: dayjs(param.requestDate).format("YYYY-MM-DD"),
            departmentId: props?.data ? props.data.departmentId : userData?.data?.department?.id,
            registrationDay: dayjs(param?.registrationDay).format('YYYY-MM-DD')
        };
        if (data) {
            EditRequestOvertime({ id: data?.id, ...query })
                .then((res) => {
                    showMessage(`${t('edit_success')}`, 'success');
                    handleCancel();
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                }).finally(() => {
                    setLoadingState(prevState => ({ ...prevState, isSubmit: false, isContinueApproval: false }));
                });
        } else {
            if (listDataDetail?.length === undefined || listDataDetail?.length === 0) {
                showMessage(`${t('please_fill_full_information')}`, 'error');
                handleActive(2);
            } else {
                CreateRequestOvertime(query)
                    .then((res) => {
                        setCreatedId(res.data.id);
                        handleDetail(res.data.id);
                    })
                    .catch((err) => {
                        showMessage(`${err?.response?.data?.message[0].error}`, 'error');
                    }).finally(() => {
                        setLoadingState(prevState => ({ ...prevState, isSubmit: false, isContinueApproval: false }));
                    });
            }
        }
    };

    const handleDetail = (id: any) => {
        AddRequestOvertimeDetails({
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

    const handleSubmitApproval = (id: any) => {
        setSign(id);
        setSubmitType('APPROVE');
        if (router.query.id !== 'create') {
            setOpenModalApproval(true);
        } else {
            handleSubmit();
            SetSend(true);
        }
    };

    const Approve = () => {
        setLoadingState({
            ...loadingState,
            isApprove: true
        });
        RequestOvertimeApprove({ id: router.query.id, sign: 3 })
            .then(() => {
                handleCancel();
                showMessage(`${t('approve_success')}`, 'success');
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            }).finally(() => {
                setLoadingState({
                    ...loadingState,
                    isApprove: false
                });
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
                text: `${t('approve')} ${t('request_overtime')}`,
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
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/request_overtime/request_overtime_vi.xlsx`;
                break;
            case "la":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/request_overtime/request_overtime_la.xlsx`;
                break;
            case "en":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/request_overtime/request_overtime_en.xlsx`;
                break;
            default:
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/request_overtime/request_overtime_vi.xlsx`;
                break;
        }
        const link = document.createElement('a');
        link.href = urlString;
        link.setAttribute('download', 'request_overtime.xlsx');
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
                        staffId: item[1],
                        // spendingDay: item[1],
                        startTime: item[2],
                        endTime: item[3],
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
                    <Link href="/hrm/request-overtime" className="text-primary hover:underline">
                        <span>{t('request_overtime')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_request_overtime') : t('add_request_overtime'))}
                        {
                            disable && t('detail_request_overtime')
                        }
                    </span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>
                    {!disable && (data ? t('update_request_overtime') : t('add_request_overtime'))}
                    {
                        disable && t('detail_request_overtime')
                    }
                </h1>
                <div className='flex' style={{ alignItems: "center" }}>
                    {(data?.status !== "DRAFT" && data?.status !== "REJECTED" && data?.status !== "APPROVED") && ((data?.status === "PENDING" || data?.status === "IN_PROGRESS") && userData?.data?.id === data?.currentApprover?.id) &&
                        disable && Number(data?.createdById) !== userData?.data?.id && (
                            // <RBACWrapper permissionKey={['requestOvertime:update']} type={'AND'}>
                            <div onClick={() => setOpenAssigned(true)} >
                                <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                            </div>
                            // </RBACWrapper>
                        )}
                    {disable && data?.status === 'APPROVED' && (
                        <RBACWrapper permissionKey={['requestOvertime:exportTextDraft']} type={'AND'}>
                            <button type="button" className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4" onClick={() => handleExportFile(data?.id)} disabled={loading}>
                                {
                                    loading ? <Loader size="sm" color="#fff" className="rtl:ml-2" /> : <IconNewDownload2 className="ltr:mr-2 rtl:ml-2" />
                                }
                                <span>{t('export_file')}</span>
                            </button>
                        </RBACWrapper>
                    )}
                    {
                        disable && data?.status === "DRAFT" &&
                        <Link href={`/hrm/request-overtime/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                            <button className="edit-page-btn btn btn-primary ltr:ml-4 rtl:mr-4 h-9">
                                {t('edit')}
                            </button>
                        </Link>
                    }
                    <Link href={`/hrm/request-overtime?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`}>
                        <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                            <IconBack />
                            <span>
                                {t('back')}
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="mb-5">
                <div className="font-semibold">
                    <div className="rounded">
                        <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(1)}>
                            {t('request_overtime_information')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`mb-2 ${active.includes(1) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                <Formik
                                    initialValues={initialValue}
                                    validationSchema={SubmittedForm}
                                    onSubmit={(values) => {
                                        handleRequestOvertime(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5">
                                            <div className="p-4">
                                                <div className='flex justify-between gap-5 mb-5 mt-5'>
                                                    <div className="w-1/2">
                                                        <label htmlFor="name" className='label'>
                                                            {' '}
                                                            {t('name_staff')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="name" id="name" className="form-input">
                                                        </Field>
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="position" className='label'>
                                                            {' '}
                                                            {t('duty')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="position" id="position" className="form-input">
                                                        </Field>
                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5 mb-5 mt-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="department" className='label'>
                                                            {' '}
                                                            {t('work_department')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="department" id="department" className="form-input" />
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="code" className='label'> {t('code')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field
                                                            autoComplete="off"
                                                            name="code"
                                                            type="text"
                                                            id="code"
                                                            placeholder={`${t('fill_code')}`}
                                                            className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                            disabled
                                                        />
                                                        {submitCount && errors.code ? (
                                                            <div className="text-danger mt-1"> {`${errors.code}`} </div>
                                                        ) : null}
                                                    </div>

                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="requestDate" className='label'>
                                                            {' '}
                                                            {t('submitday')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            name='requestDate'
                                                            disabled
                                                            options={{
                                                                enableTime: false,
                                                                dateFormat: "d-m-Y",
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                            }}
                                                            value={dayjs(values?.requestDate).format('DD-MM-YYYY')}
                                                            className="form-input calender-input"
                                                            placeholder={`${t('choose_submit_day')}`}
                                                        />
                                                        {submitCount ? errors.requestDate ? <div className="mt-1 text-danger"> {`${errors.requestDate}`} </div> : null : ''}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="registrationDay" className='label'>
                                                            {' '}
                                                            {t('registration_day')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            name='registrationDay'
                                                            disabled={disable}
                                                            options={{
                                                                enableTime: false,
                                                                dateFormat: "d-m-Y",
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                            }}
                                                            value={dayjs(values?.registrationDay).format('DD-MM-YYYY')}
                                                            onChange={(e: any) => {
                                                                setFieldValue('registrationDay', e[0])
                                                            }}
                                                            className="form-input calender-input"
                                                            placeholder={`${t('choose_submit_day')}`}
                                                        />
                                                        {submitCount ? errors.registrationDay ? <div className="mt-1 text-danger"> {`${errors.registrationDay}`} </div> : null : ''}
                                                    </div>

                                                </div>
                                                <div>
                                                    <div className="flex-1">
                                                        <label htmlFor="type" className='label'> {t('reason')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field
                                                            autoComplete="off"
                                                            name="reason"
                                                            as="textarea"
                                                            id="reason"
                                                            placeholder={`${t('fill_reason')}`}
                                                            className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.reason ? (
                                                            <div className="text-danger mt-1"> {`${errors.reason}`} </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                {router.query.id !== 'create' && data?.status !== 'APPROVED' && data?.status !== 'DRAFT' && (
                                                    <div className="mt-5">
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
                                                        <div className="w-1/2">

                                                        </div>
                                                    </div>
                                                )}
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
                                            </>}
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
                                    requestOvertimeDetailMutate={mutate}
                                    timekeepingType={timekeepingType?.data}
                                    departmentId={data?.createdBy?.department?.id ? data?.createdBy?.department?.id : userData?.data?.department?.id}
                                />
                                {
                                    (router?.query?.id === "create" || (router?.query?.id !== "create" && data)) && <ApprovalModal
                                        openModal={openModalApproval}
                                        setOpenModal={setOpenModalApproval} handleData={handleData}
                                        data={data}
                                        handleCancel={handleCancel} id={id}
                                        departmentId={data?.createdBy?.department?.id ?? userData?.data?.department?.id}
                                        createdId={createdId}
                                        submitType={submitType}
                                        sign={sign}
                                    />
                                }
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
                    )} {router?.query.id !== 'create' && (
                        <div className="mt-5 rounded">
                            <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(4)}>
                                {t('related_tasks')}
                                <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
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
                    )}
                    <div style={{ display: 'flex', marginTop: '10px' }}>
                        <p style={{ marginRight: '10px' }}>
                            <strong>{t('Order of signing')}:</strong>
                        </p>
                        <p>
                            <strong>
                                {t('Applicant')} {'->'} {t('Department Head/Deputy')} {'->'} {t('Head/Deputy of HR & Admin Department')} {'->'} {t('Permanent Deputy Director')}
                            </strong>
                        </p>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px', fontStyle: "italic" }}>
                        <p style={{ marginRight: '10px' }}>
                            <strong>* {t('Note')}:</strong>
                        </p>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px', fontStyle: "italic" }}>
                        <p>
                            {`1. ${t('Plant Department')}: ${t('Plant Department Note 2')}`}
                        </p>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px', fontStyle: "italic" }}>
                        <p>
                            {`2. ${t('Operations Department')}: ${t('Operations Department Note 2')}`}
                        </p>
                    </div>
                    <SwitchBtn
                        entity={'request-overtime'}
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
                    {/* <div className="flex items-center justify-end ltr:text-right rtl:text-left mt-4">
                        {
                            !disable && <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                {t('cancel_form')}
                            </button>
                        }
                        {
                            (((data?.status === 'DRAFT' || data?.status === 'REJECTED') && data?.createdBy?.id === id) || (router.query.id === "create") || (userData?.data?.id === data?.currentApproverId && data?.status !== "APPROVED")) && !disable &&
                            <>
                                <button
                                    data-testId="submit-btn"
                                    type="button"
                                    className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button"
                                    disabled={loadingState?.isSubmit}
                                    onClick={() => handleSubmit()}>
                                    {loadingState?.isSubmit ? <Loader size="sm" /> : (router.query.id !== 'create' ? t('update') : t('save_daf'))}
                                </button>
                            </>
                        }
                        {
                            data?.status !== "DRAFT" &&
                                data?.currentApprover?.id !== userData?.data?.id ?
                                <></> :
                                <>
                                    {data?.status !== 'DRAFT' &&
                                        data?.status !== 'REJECTED' &&
                                        data?.status !== 'APPROVED' &&
                                        (data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') &&
                                        userData?.data?.id === data?.currentApprover?.id &&
                                        Number(data?.createdById) !== userData?.data?.id && (
                                            <>
                                                <button type="button" className="btn btn-danger cancel-button w-28 ltr:ml-4" onClick={() => handleReject()}>
                                                    {t('reject')}
                                                </button>
                                            </>
                                        )}
                                </>
                        }
                        {(router.query.id === 'create' ||
                            (data?.status === 'DRAFT' && data?.createdById === userData?.data?.id) ||
                            ((data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') && userData?.data?.id === data?.currentApprover?.id)) &&
                            high !== 'true' && (
                                <>
                                    {
                                        signStatus?.sign?.map((item: any) => {
                                            return (
                                                <>
                                                    <>

                                                        {
                                                            item.name === "SIGN" &&
                                                            <button data-testId="submit-approval-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleSubmitApproval(item.id)}>
                                                                {loadingState?.isContinueApproval ? <Loader size="sm" /> : t('continue_approval')}
                                                            </button>
                                                        }
                                                    </>
                                                    <>
                                                        {
                                                            item.name === "INITIAL" &&
                                                            <button data-testId="submit-approval-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleSubmitApproval(item.id)}>
                                                                {loadingState?.isContinueApproval ? <Loader size="sm" /> : t('continue_initial')}
                                                            </button>
                                                        }
                                                    </>
                                                </>
                                            )
                                        })
                                    }
                                </>
                            )
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
                                    Number(data?.createdById) !== userData?.data?.id && (
                                        <>
                                            {
                                                signStatus?.sign?.map((item: any) => {
                                                    return (
                                                        <>
                                                            {
                                                                item.name === "APPROVED" &&
                                                                <button
                                                                    data-testId="submit-approve-btn"
                                                                    type="button"
                                                                    className="btn btn-primary add-button ltr:ml-4 rtl:mr-4"
                                                                    onClick={() => handleApprove()}
                                                                    disabled={loadingState?.isApprove}
                                                                >
                                                                    {loadingState?.isApprove ? <Loader size="sm" /> : t('approve')}
                                                                </button>
                                                            }
                                                        </>
                                                    )
                                                })
                                            }
                                        </>
                                    )}
                            </>
                        )}
                    </div> */}
                </div>
            </div>
            <Modal open={openAssigned} id={router.query.id} handleData={handleData} setOpen={setOpenAssigned}></Modal>
        </div>
    );
};
export default DetailPage;
