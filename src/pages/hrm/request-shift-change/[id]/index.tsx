import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import AnimateHeight from 'react-animate-height';
import Link from 'next/link';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Select, { components } from 'react-select';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { RequestShiftChangeApprove, CreateRequestShiftChange, GetRequestShiftChange, EditRequestShiftChange } from '@/services/apis/request-shift-change.api';
import { useProfile } from '@/services/swr/profile.swr';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import { LIST_STATUS } from '@/utils/constants';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { IRootState } from '@/store';
import { Loader } from '@mantine/core';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
// dayjs.extend(utc)
// dayjs.tz.setDefault('Asia/Ho_Chi_Minh')
import Modal from './modal';
import IconBack from '@/components/Icon/IconBack';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import { useDebounce } from 'use-debounce';
import { Shifts } from '@/services/swr/shift.swr';
import { getShiftByUser } from '@/services/apis/shift.api';
import { loadMore, loadMoreShift } from '@/utils/commons';
import { DropdownShift } from '@/services/swr/dropdown.swr';
import { getConfig } from '@/services/apis/config-approve.api';
import SwitchBtn from '@/pages/hrm/leave-application/switchBtn';

interface Props {
    [key: string]: any;
}

const DetailPage = ({ ...props }: Props) => {
    const [openAssigned, setOpenAssigned] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [disable, setDisable] = useState<any>(false);
    const [dataDetail, setDataDetail] = useState<any>();
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
    const formRef = useRef<any>();
    const [send, SetSend] = useState<any>(false);
    const { data: userData } = useProfile();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [isLoading, setIsLoading] = useState(true);
    const [createdId, setCreatedId] = useState();
    const [loading, setLoading] = useState(false);
    const [loadingShiftByUser, setLoadingShiftByUser] = useState(false);
    const [loadingState, setLoadingState] = useState({
        isContinueApproval: false,
        isApprove: false,
        isReject: false,
        isSubmit: false
    })
    const [dataShift, setDataShift] = useState<any>([]);
    const [pageShift, setSizeShift] = useState<any>();
    const [debouncedPage] = useDebounce(pageShift, 500);
    const [queryShift, setQueryShift] = useState<any>();
    const [debouncedQuery] = useDebounce(queryShift, 500);
    const [loadShift, setLoadShift] = useState(false);
    const [sign, setSign] = useState(false);
    const flatpickrRef = useRef<any>(null);
    const [submitType, setSubmitType] = useState('');

    const { data: shiftData, pagination: paginationShift, isLoading: isLoadingShift } = DropdownShift({ page: debouncedPage, perPage: 30, search: debouncedQuery?.search });
    const [listShiftUser, setListShiftUser] = useState<any>();
    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("request_shift_change.pdf", `/request-shift-change/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_request_shift_change')}` : (data ? t('update_request_shift_change') : t('add_request_shift_change'))));
    });

    useEffect(() => {
        if (userData?.data?.department?.id !== undefined && userData?.data.position.id !== undefined) {
            getConfig({
                entity: 'request-shift-change',
                departmentId: userData?.data?.department?.id,
                fromPosition: userData?.data.position.id,
                startPosition: router.query.id === 'create' ? userData?.data.position.id : data?.createdBy.position.id || 48
            }).then((res) => {
                setSign(res?.data[0]?.sign === 0 ? false : true);
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, "error");
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.createdBy.position]);

    const getShifts = (date: string) => {
        setLoadingShiftByUser(true)
        getShiftByUser({
            date: date,
            page: 1,
            perPage: 20
        }).then(res => {
            setListShiftUser(res?.data)
        }).catch(err => {
            console.log(err);
        }).finally(() => {
            setLoadingShiftByUser(false);
        });
    }
    useEffect(() => {
        if (Number(router.query.id)) {
            handleData();
            setQuery({ id: router.query.id, ...router.query })
        }
        if (router.query.id === "create") {
            setIsLoading(false);
        }
        if (typeof window !== 'undefined') {
            setId(Number(localStorage.getItem("idUser")));
            setIsHigh(localStorage.getItem('isHighestPosition'));
        }

        setDisable(router.query.status === "true" ? true : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router])

    const handleData = () => {
        if (Number(router.query.id)) {
            GetRequestShiftChange({ id: router.query.id }).then((res) => {
                setData(res.data);
                setIsLoading(false);
                const startDate = res?.data?.startDate;
                const endDate = res?.data?.endDate;
                if (flatpickrRef?.current) {
                    flatpickrRef.current?.flatpickr?.setDate([dayjs(startDate, 'YYYY-MM-DD').format('DD-MM-YYYY'), dayjs(endDate, 'YYYY-MM-DD').format('DD-MM-YYYY')]);
                }
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
    }
    const handleSearchShift = (param: any) => {
        setQueryShift({ search: param });
    };
    useEffect(() => {
        loadMoreShift(shiftData, dataShift, paginationShift, setDataShift, 'value', 'label', setLoadShift);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationShift, debouncedPage, debouncedQuery]);

    const handleOnScrollBottom = () => {
        setLoadShift(true);
        setTimeout(() => {
            setSizeShift(paginationShift?.page + 1);
        }, 1000);
    };
    useEffect(() => {
        setInitialValue({
            name: data ? data?.createdBy?.fullName : userData?.data?.fullName,
            position: data ? data?.createdBy?.position?.name : userData?.data?.position?.name,
            department: data ? data?.createdBy?.department?.name : userData?.data?.department?.name,
            requestDate: data ? data?.createdAt : new Date(),
            startDate: data ? data?.startDate : "",
            endDate: data ? data?.endDate : "",
            reason: data?.reason ?? "",
            currentApprover: data?.approvalHistory?.find((his: any) => his.status === "APPROVED")?.approver?.fullName ?? data?.currentApprover?.fullName,
            shiftIds: data ? data?.shifts?.map((item: any) => {
                const startTime = moment(item.startTime, "HH:mm:ss").format('HH:mm')
                const endTime = moment(item.endTime, "HH:mm:ss").format('HH:mm')
                return {
                    value: item.id,
                    label: `${item.name} (${startTime} : ${endTime})`,
                }
            }) : [],
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, router]);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string(),
        position: Yup.string(),
        department: Yup.string(),
        requestDate: Yup.string().required(`${t('please_choose_submit_day')}`),
        startDate: Yup.date().required(`${t('please_choose_date_shift_change_from')}`),
        endDate: Yup.date().required(`${t('please_choose_date_shift_change')}`),
        reason: Yup.string().required(`${t('please_choose_date_shift_change_to')}`),
        shiftIds: Yup.array().required(`${t('please_fill_shift_new_id')}`)
    });

    const handleEdit = (data: any) => {
        setDataDetail(data);
        setOpenModal(true);
    };
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
            render: ({ action, sign }: any) => {
                return <span>{action === 'FORWARD' || action === 'SUBMIT' ? (sign ? 'Trình ký' : 'Ký nháy') : action === 'REJECT' ? 'Từ chối' : 'Duyệt'}</span>
            },
            sortable: false
        },
        {
            accessor: 'approver',
            title: `${t('executor')}`,
            render: ({ approver }: any) => <span>{approver?.fullName}</span>,
            sortable: false
        },
        {
            accessor: 'submittedAt',
            title: `${t('exe_time')}`,
            render: ({ submittedAt }: any) => <span>{moment(submittedAt).format("HH:mm DD/MM/YYYY")}</span>,
            sortable: false
        },
        { accessor: 'comment', title: `${t('description')}`, sortable: false },
    ]
    const columnUpdates = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'name',
            title: `${t('name')}`,
            render: (records: any) => <span>{records?.updater?.fullName}</span>,
            sortable: false
        },
        {
            accessor: 'createdAt',
            title: `${t('time')}`,
            render: ({ createdAt }: any) => <span>{dayjs(createdAt).format("HH:mm DD/MM/YYYY")}</span>,
            sortable: false
        },
        // {
        //     accessor: 'department',
        //     title: `${t('department')}`,
        //     render: ({ name }: any) => <span>{name}</span>,
        //     sortable: false
        // },
        { accessor: 'comment', title: `${t('description')}`, sortable: false },
    ]
    const handleCancel = () => {
        router.push(`/hrm/request-shift-change?page=${router?.query?.page}&perPage=${router?.query?.perPage}`)
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    }

    const handleRequestShiftChange = (param: any) => {
        if (router.query.id === 'create' && send === true) {
            setLoadingState({ ...loadingState, isContinueApproval: true });
        } else {
            setLoadingState({ ...loadingState, isSubmit: true });
        }
        const dataSubmit: any = {
            reason: param?.reason,
            startDate: dayjs(param?.startDate).format('YYYY-MM-DD'),
            endDate: dayjs(param?.endDate).format('YYYY-MM-DD'),
            shiftIds: param?.shiftIds?.map((item: any) => item.value)
        };
        if (data) {
            EditRequestShiftChange({ id: data?.id, ...dataSubmit }).then(res => {
                showMessage(`${t('update_letter_success')}`, 'success');
                router.push(`/hrm/request-shift-change?page=${router?.query?.page}&perPage=${router?.query?.perPage}`)
            }).catch(err => {
                showMessage(`${t('update_letter_error')}`, 'error');
            }).finally(() => {
                setLoadingState(prevState => ({ ...prevState, isSubmit: false, isContinueApproval: false }));
            });
        } else {
            CreateRequestShiftChange(dataSubmit).then(res => {
                setCreatedId(res.data.id);
                handleDetail(res.data.id);
            }).catch(err => {
                showMessage(`${t('save_draf_error')}`, 'error');
            }).finally(() => {
                setLoadingState(prevState => ({ ...prevState, isSubmit: false, isContinueApproval: false }));
            });
        }
    }

    const handleDetail = (id: any) => {
        if (router.query.id === 'create' && send === true) {
            showMessage(`${t('save_success')}`, 'success');
            setId(id);
            setOpenModalApproval(true);
        } else {
            showMessage(`${t('save_draf_success')}`, 'success');
            handleCancel();
        }
    }

    const RenturnError = (param: any) => {
        if (Object.keys(param?.errors || {}).length > 0 && param?.submitCount > 0) {
            showMessage(`${t('please_add_infomation')}`, 'error');
        }
        return <></>;
    }

    const handleSubmitApproval = (id: any) => {
        setSign(id);
        setSubmitType('APPROVE');
        if (router.query.id !== "create") {
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
        RequestShiftChangeApprove({ id: router.query.id }).then(() => {
            handleCancel();
            showMessage(`${t('approve_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        }).finally(() => {
            setLoadingState({
                ...loadingState,
                isApprove: false
            });
        });;
    }
    const handleApprove = () => {
        const swalDeletes = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary testid-confirm-btn',
                cancelButton: 'btn btn-outline-danger ltr:mr-3 rtl:ml-3',
                popup: 'confirm-popup confirm-delete',
            },
            imageUrl: '/assets/images/delete_popup.png',
            buttonsStyling: false,
        });
        swalDeletes
            .fire({
                // icon: 'question',
                title: `${t('approve')}`,
                text: `${t('approve')} ${t('request_shift_change')}`,
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
    }

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit()
        }
    };

    useEffect(() => {
        if (data?.approvalHistory.find((item: any) => Number(item.approverId) === Number(id))) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [data, id]);
    return (
        <div>
            {isLoading && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
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
                    <Link href="/hrm/request-shift-change" className="text-primary hover:underline">
                        <span>{t('request_shift_change')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_request_shift_change') : t('add_request_shift_change'))}
                        {
                            disable && t('detail_request_shift_change')
                        }
                    </span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>
                    {!disable && (data ? t('update_request_shift_change') : t('add_request_shift_change'))}
                    {
                        disable && t('detail_request_shift_change')
                    }
                </h1>
                <div className='flex' style={{ alignItems: "center" }}>
                    {(data?.status !== "DRAFT" && data?.status !== "REJECTED" && data?.status !== "APPROVED") && ((data?.status === "PENDING" || data?.status === "IN_PROGRESS") && userData?.data?.id === data?.currentApprover?.id) &&
                        disable && Number(data?.createdById) !== userData?.data?.id && (
                            <div onClick={() => setOpenAssigned(true)}>
                                <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                            </div>
                        )}
                    {disable && data?.status === 'APPROVED' && (
                        <RBACWrapper permissionKey={['requestShiftChange:exportTextDraft']} type={'AND'}>
                            <button type="button" className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4" onClick={() => handleExportFile(data?.id)} disabled={loading}>
                                {
                                    loading ? <Loader size="sm" color="#fff" className="rtl:ml-2" /> : <IconNewDownload2 className="ltr:mr-2 rtl:ml-2" />
                                }
                                <span>{t('export_file')}</span>
                            </button>
                        </RBACWrapper>
                    )}
                    {
                        disable && (data?.status === LIST_STATUS.DRAFT || (userData?.data?.id === data?.currentApproverId && data?.status !== LIST_STATUS.APPROVED && data?.status !== LIST_STATUS.REJECTED)) &&
                        // <RBACWrapper
                        //     permissionKey={[
                        //         'requestShiftChange:update'
                        //     ]}
                        //     type={'AND'}>
                        <Link href={`/hrm/request-shift-change/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                            <button className="edit-page-btn btn btn-primary ltr:ml-4 rtl:mr-4 h-9">
                                {t('edit')}
                            </button>
                        </Link>
                        // </RBACWrapper>
                    }
                    <Link href={`/hrm/request-shift-change?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
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
                        <button
                            type="button"
                            className={`flex w-full items-center p-4 text-white-dark dark: bg-[#1b2e4b] custom-accordion uppercase`}
                            onClick={() => handleActive(1)}
                        >
                            {t('request_shift_change_info')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`mb-2 ${active.includes(1) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                <Formik
                                    initialValues={initialValue}
                                    validationSchema={SubmittedForm}
                                    onSubmit={values => {
                                        handleRequestShiftChange(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5 p-4" >
                                            <div className='flex justify-between gap-5'>
                                                <div className="mb-5 w-1/2">
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
                                            <div className='flex justify-between gap-5'>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="department" className='label'>
                                                        {' '}
                                                        {t('work_department')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" disabled type="text" name="department" id="department" className="form-input" />
                                                </div>
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
                                            </div>
                                            <div className='flex justify-between gap-5'>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="startDate" className='label'>
                                                        {' '}
                                                        {t('date_shift_change_from')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off"
                                                        name="startDate"
                                                        render={({ field }: any) => (
                                                            <Flatpickr
                                                                ref={flatpickrRef}
                                                                // data-enable-time
                                                                options={{
                                                                    // enableTime: true,
                                                                    dateFormat: "d-m-Y",
                                                                    time_24hr: false,
                                                                    locale: {
                                                                        ...chosenLocale,
                                                                    },
                                                                    mode: "range"
                                                                }}
                                                                disabled={disable}
                                                                // value={dayjs(values?.startDate).format('DD-MM-YYYY')}
                                                                onChange={(e: any) => {
                                                                    if (e?.length === 2) {
                                                                        setFieldValue('startDate', e[0]);
                                                                        setFieldValue('endDate', e[1]);
                                                                        flatpickrRef.current?.flatpickr?.setDate([dayjs(e[0]).format('DD-MM-YYYY'), dayjs(e[1]).format('DD-MM-YYYY')]);
                                                                    }
                                                                }}
                                                                className="form-input calender-input"
                                                                placeholder={`${t('choose_date_shift_change_from')}`}
                                                            />
                                                        )}
                                                    />

                                                    {submitCount ? errors.startDate ? <div className="mt-1 text-danger"> {`${errors.startDate}`} </div> : null : ''}
                                                    {submitCount ? errors.endDate ? <div className="mt-1 text-danger"> {`${errors.endDate}`} </div> : null : ''}
                                                </div>
                                                {/* <div className="mb-5 w-1/2">
                                                    <label htmlFor="endDate" className='label'>
                                                        {' '}
                                                        {t('date_shift_change_to')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off"
                                                        name="endDate"
                                                        render={({ field }: any) => (
                                                            <Flatpickr
                                                                // data-enable-time
                                                                options={{
                                                                    // enableTime: true,
                                                                    dateFormat: "d-m-Y",
                                                                    time_24hr: false,
                                                                    locale: {
                                                                        ...chosenLocale,
                                                                    },
                                                                    // mode: "range"
                                                                }}
                                                                disabled={disable}
                                                                value={dayjs(values?.endDate).format('DD-MM-YYYY')}
                                                                onChange={(e: any) => {
                                                                    setFieldValue('endDate', e[0]);
                                                                }}
                                                                className="form-input calender-input"
                                                                placeholder={`${t('choose_date_shift_change_to')}`}
                                                            />
                                                        )}
                                                    />

                                                    {submitCount ? errors.endDate ? <div className="mt-1 text-danger"> {`${errors.endDate}`} </div> : null : ''}
                                                </div> */}
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="shiftIds" className="label" style={{ cursor: 'pointer' }}>
                                                        {' '}
                                                        {t('new_shift')}
                                                        <span style={{ color: 'red' }}> * </span>
                                                    </label>
                                                    <Select
                                                        isDisabled={disable}
                                                        id="shiftIds"
                                                        name="shiftIds"
                                                        placeholder={t('choose_new_shift')}
                                                        onInputChange={(e) => handleSearchShift(e)}
                                                        options={dataShift}
                                                        isLoading={loadShift}
                                                        onMenuOpen={() => setSizeShift(1)}
                                                        onMenuScrollToBottom={() => handleOnScrollBottom()}
                                                        maxMenuHeight={160}
                                                        closeMenuOnSelect={false}
                                                        value={values?.shiftIds}
                                                        isMulti
                                                        onChange={(e) => {
                                                            if (e?.length > 0) {
                                                                setFieldValue('shiftIds', e);
                                                            }
                                                        }}
                                                    />
                                                    {submitCount ? errors.shiftIds ? <div className="mt-1 text-danger"> {`${errors.shiftIds}`} </div> : null : ''}
                                                </div>
                                            </div>
                                            <div className='flex justify-between gap-5'>
                                                <div className="mb-5 flex-1">
                                                    <label htmlFor="reason" className='label'>
                                                        {' '}
                                                        {t('reason_shift_change')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" as="textarea" name="reason" id="reason" disabled={disable}
                                                        placeholder={`${t('fill_reason')}`} className="form-input" />
                                                    {submitCount ? errors.reason ? <div className="mt-1 text-danger"> {`${errors.reason}`} </div> : null : ''}
                                                </div>
                                            </div>
                                            {
                                                router?.query?.id !== "create" && data?.status !== "DRAFT" &&
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 flex-1">
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
                                                    <div className="mb-5 flex-1">
                                                    </div>
                                                </div>

                                            }
                                            {data?.approvalHistory?.find((e: any) => e.status === 'REJECTED')?.comment && <div className='flex justify-between gap-5'>
                                                <div className="flex-1">
                                                    <label htmlFor="comment" className='label'>
                                                        {' '}
                                                        {t('reject_reason')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field disabled={true} autoComplete="off" as="textarea" value={data?.approvalHistory?.find((e: any) => e.status === 'REJECTED')?.comment ?? ""}
                                                        placeholder={`${t('fill_reason')}`} className="form-input" />

                                                </div>
                                            </div>}

                                        </Form>
                                    )}
                                </Formik >
                            </AnimateHeight>
                        </div>
                    </div>
                    {
                        router?.query.id !== "create" &&
                        <div className="rounded mt-5">
                            <button
                                type="button"
                                className={`flex w-full items-center p-4 text-white-dark dark: bg-[#1b2e4b] custom-accordion uppercase`}
                                onClick={() => handleActive(2)}
                            >
                                {t('approve_history')}
                                <div className={`ltr:ml-auto rtl:mr-auto  ${active.includes(1) ? 'rotate-180' : ''}`}>
                                    <IconCaretDown />
                                </div>
                            </button>
                            <div className={`${active.includes(2) ? 'custom-content-accordion' : ''}`}>
                                <AnimateHeight duration={300} height={active.includes(2) ? 'auto' : 0}>
                                    <div className='p-4'>
                                        <div className="flex md:items-center justify-between md:flex-row flex-col mb-4 gap-5">
                                            <div className="flex items-center flex-wrap"></div>
                                        </div>
                                        <div className="datatables">
                                            <DataTable
                                                highlightOnHover
                                                className="whitespace-nowrap table-hover"
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
                    }
                    {/* {
                        router?.query.id !== "create" &&
                        <div className="rounded mt-5">
                            <button
                                type="button"
                                className={`flex w-full items-center p-4 text-white-dark dark: bg-[#1b2e4b] custom-accordion uppercase`}
                                onClick={() => handleActive(3)}
                            >
                                    {t('update_history')}
                                <div className={`ltr:ml-auto rtl:mr-auto  ${active.includes(1) ? 'rotate-180' : ''}`}>
                                    <IconCaretDown />
                                </div>
                            </button>
                            <div className={`${active.includes(3) ? 'custom-content-accordion' : ''}`}>
                                <AnimateHeight duration={300} height={active.includes(2) ? 'auto' : 0}>
                                    <div className='p-4'>
                                        <div className="flex md:items-center justify-between md:flex-row flex-col mb-4 gap-5">
                                            <div className="flex items-center flex-wrap"></div>
                                        </div>
                                        <div className="datatables">
                                            <DataTable
                                                highlightOnHover
                                                className="whitespace-nowrap table-hover"
                                                records={data?.approvalLog}
                                                columns={columnUpdates}
                                                sortStatus={sortStatus}
                                                onSortStatusChange={setSortStatus}
                                                minHeight={200}
                                            />
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </div>
                        </div>
                    } */}
                    {router?.query.id !== 'create' && (
                        <div className="mt-5 rounded">
                            <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(3)}>
                                {t('related_tasks')}
                                <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
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
                                {t('Applicant')} {'->'} {t('Department Head/Deputy')} {'->'} {t('Head/Deputy of HR & Admin Department')} {'->'} {t('Director')}
                            </strong>
                        </p>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px' }}>
                        <p style={{ fontStyle: "italic" }}>{t('Note: For employees of the HR & Admin Department')}</p>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px', fontStyle: "italic" }}>
                        <p style={{ marginRight: '10px' }}>
                            {t('Order of signing')}:
                        </p>
                        <p>
                            {' '}
                            {t('Applicant')} {'->'} {t('Head/Deputy of HR & Admin Department')} {'->'} {t('Director')}
                        </p>
                    </div>
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
                                sign &&
                                <>
                                    {
                                        (data?.status !== "DRAFT" && data?.status !== "REJECTED" && data?.status !== "APPROVED") && ((data?.status === "PENDING" || data?.status === "IN_PROGRESS") && userData?.data?.id === data?.currentApprover?.id) &&
                                        disable && Number(data?.createdById) !== userData?.data?.id &&
                                        <>
                                            <button type="button" className="btn btn-danger cancel-button w-28 ltr:ml-4" onClick={() => handleReject()}>
                                                {t('reject')}
                                            </button>
                                            <button
                                                data-testId="submit-approve-btn"
                                                type="button"
                                                className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button"
                                                disabled={loadingState?.isApprove}
                                                onClick={() => handleApprove()}>
                                                {loadingState?.isApprove ? <Loader size="sm" /> : t('approve')}
                                            </button>
                                        </>
                                    }
                                </>
                        }
                        {
                            // mới tạo đơn
                            // trạng thái nháp và người tạo đơn
                            // trạng thái pending hoặc in_progress mà có id bằng người phê duyệt
                            (router.query.id === "create" || (data?.status === "DRAFT" && data?.createdById === userData?.data?.id) || ((data?.status === "PENDING" || data?.status === "IN_PROGRESS") && userData?.data?.id === data?.currentApprover?.id)) && high !== "true" &&
                            <button data-testId="submit-approval-btn" type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmitApproval()}>
                                {loadingState?.isContinueApproval ? <Loader size="sm" /> : sign ? t('continue_approval') : t('continue_initial')}
                            </button>
                        }
                    </div> */}
                    <SwitchBtn
                        entity={'request-shift-change'}
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
            </div >
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
            />
            <RejectModal
                openModal={openModalReject}
                setOpenModal={setOpenModalReject}
                handleCancel={handleCancel}
            />

            <Modal open={openAssigned} id={router.query.id} handleData={handleData} setOpen={setOpenAssigned}></Modal>
        </div >
    );
};
export default DetailPage;
