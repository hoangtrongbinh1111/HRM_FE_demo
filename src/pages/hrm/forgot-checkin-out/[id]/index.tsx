import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
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
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { ForgotCheckinoutApprove, CreateForgotCheckinout, GetForgotCheckinout, EditForgotCheckinout } from '@/services/apis/forgot-checkin-out.api';
import { useProfile } from '@/services/swr/profile.swr';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import { LIST_STATUS } from '@/utils/constants';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { IRootState } from '@/store';
// dayjs.extend(utc)
// dayjs.tz.setDefault('Asia/Ho_Chi_Minh')
import Modal from './modal';
import { getConfig } from '@/services/apis/config-approve.api';
import SwitchBtn from '@/pages/hrm/leave-application/switchBtn';

interface Props {
    [key: string]: any;
}
const DetailPage = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [disable, setDisable] = useState<any>(false);
    const [dataDetail, setDataDetail] = useState<any>();
    const [listDataDetail, setListDataDetail] = useState<any>();
    const [openModal, setOpenModal] = useState(false);
    const [openModalApproval, setOpenModalApproval] = useState(false);
    const [openModalReject, setOpenModalReject] = useState(false);
    const [query, setQuery] = useState<any>({});
    const [active, setActive] = useState<any>([1, 2, 3]);
    const [initialValue, setInitialValue] = useState<any>();
    const [warehouseId, setWarehouseId] = useState<any>();
    const [data, setData] = useState<any>();
    const [open, setOpen] = useState<any>(false);
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');
    const [page, setPage] = useState(1);
    const formRef = useRef<any>();
    const [send, SetSend] = useState<any>(false);
    const { data: userData } = useProfile();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [isLoading, setIsLoading] = useState(true);
    const [createdId, setCreatedId] = useState();
    const [openAssigned, setOpenAssigned] = useState(false);
    const [sign, setSign] = useState(false);
    const [signStatus, setSignStatus] = useState<any>();
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_forgot_checkin_out')}` : (data ? t('update_forgot_checkin_out') : t('add_forgot_checkin_out'))));
    });

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

    useEffect(() => {
        const departmentId = router.query.id === 'create' ? userData?.data?.department?.id : data?.createdBy?.department?.id;
        const fromPositionId = userData?.data?.position.id;
        const startPositionId = router.query.id === 'create' ? userData?.data?.position.id : data?.createdBy?.position.id;
        if (departmentId && fromPositionId && startPositionId) {
            getConfig({
                entity: 'forgot-checkin-out',
                departmentId: departmentId,
                fromPosition: fromPositionId,
                startPosition: startPositionId
            }).then((res) => {
                setSignStatus(res?.data[0]);
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, "error");
            })
        }
    }, [data?.createdBy?.position, userData?.data?.department?.id, userData?.data?.position.id, router, data?.department?.id, userData, data])

    const handleData = () => {
        if (Number(router.query.id)) {
            GetForgotCheckinout({ id: router.query.id }).then((res) => {
                setData(res.data);
                setIsLoading(false);
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
    }

    useEffect(() => {
        setInitialValue({
            name: data ? data?.createdBy?.fullName : userData?.data?.fullName,
            position: data ? data?.createdBy?.position?.name : userData?.data?.position?.name,
            department: data ? data?.createdBy?.department?.name : userData?.data?.department?.name,
            requestDate: data ? data?.createdAt : new Date(),
            startTime: data ? moment(data?.startTime, 'HH:mm:ss').format('HH:mm:ss') : "",
            endTime: data ? moment(data?.endTime, 'HH:mm:ss').format('HH:mm:ss') : "",
            reason: data?.reason ?? "",
            currentApprover: data?.approvalHistory?.find((his: any) => his.status === "APPROVED")?.approver?.fullName ?? data?.currentApprover?.fullName,
            registrationDay: data ? data?.registrationDay : "",
            // (data?.status !== 'DRAFT' && data?.status !== 'IN_PROGRESS') ? data?.currentApprover?.fullName : data?.approvalHistory[1]?.approver?.fullName
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, router]);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string(),
        position: Yup.string(),
        department: Yup.string(),
        requestDate: Yup.string().required(`${t('please_choose_submit_day')}`),
        registrationDay: Yup.date().required(`${t('please_choose_registration_day')}`),
        startTime: Yup.string()
            .required(`${t('please_choose_from_day')}`),
        endTime: Yup.string()
            .required(`${t('please_choose_end_day')}`)
            .test("is-greater", `${t('endtime_must_after_starttime')}`, function (value) {
                const { startTime, endTime } = this.parent;
                const startTimeMoment = moment(startTime, 'HH:mm:ss');
                const endTimeMoment = moment(endTime, 'HH:mm:ss');
                return endTimeMoment.isSameOrAfter(startTimeMoment);
            }),
        reason: Yup.string().required(`${t('please_fill_reason')}`)
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
            render: ({ action, sign }: any) => <span>{action === 'FORWARD' || action === 'SUBMIT' ? (sign === 2 ? 'Ký và Trình lên' : 'Ký nháy và Trình lên') : action === 'REJECT' ? 'Từ chối' : 'Phê duyệt'}</span>,
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

    const handleCancel = () => {
        router.push(`/hrm/forgot-checkin-out?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`)
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    }

    const handleForgotCheckinOut = (param: any) => {
        const dataSubmit: any = {
            reason: param?.reason,
            startTime: param?.startTime,
            endTime: param?.endTime,
            registrationDay: dayjs(param?.registrationDay).format('YYYY-MM-DD')
        };
        if (data) {
            EditForgotCheckinout({ id: data?.id, ...dataSubmit }).then(res => {
                showMessage(`${t('update_letter_success')}`, 'success');
                router.push(`/hrm/forgot-checkin-out?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`)
            }).catch(err => {
                showMessage(`${t('update_letter_error')}`, 'error');
            });
        } else {
            CreateForgotCheckinout(dataSubmit).then(res => {
                setCreatedId(res.data.id);
                handleDetail(res.data.id);
            }).catch(err => {
                showMessage(`${t('add_letter_error')}`, 'error');
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
        if (router.query.id !== "create") {
            setOpenModalApproval(true);
        } else {
            handleSubmit();
            SetSend(true);
        }
    };

    const Approve = () => {
        ForgotCheckinoutApprove({ id: router.query.id, sign: 3 }).then(() => {
            handleCancel();
            showMessage(`${t('approve_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
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
                text: `${t('approve')} ${t('forgot_checkin_out')}`,
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
                    <Link href="/hrm/forgot-checkin-out" className="text-primary hover:underline">
                        <span>{t('forgot_checkin_out')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_forgot_checkin_out') : t('add_forgot_checkin_out'))}
                        {
                            disable && t('detail_forgot_checkin_out')
                        }
                    </span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>
                    {!disable && (data ? t('update_forgot_checkin_out') : t('add_forgot_checkin_out'))}
                    {
                        disable && t('detail_forgot_checkin_out')
                    }
                </h1>
                <div className='flex' style={{ alignItems: "center" }}>
                    {(disable && (data?.status === LIST_STATUS.DRAFT || (userData?.data?.id === data?.currentApproverId && data?.status !== LIST_STATUS.APPROVED && data?.status !== LIST_STATUS.REJECTED)) &&
                        <div onClick={() => setOpenAssigned(true)} style={{ marginRight: '-10px' }}>
                            <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                        </div>
                    )}
                    {
                        disable && (data?.status === LIST_STATUS.DRAFT || (userData?.data?.id === data?.currentApproverId && data?.status !== LIST_STATUS.APPROVED && data?.status !== LIST_STATUS.REJECTED)) &&
                        <Link href={`/hrm/forgot-checkin-out/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                            <button className="edit-page-btn btn btn-primary ltr:ml-4 rtl:mr-4 h-9">
                                {t('edit')}
                            </button>
                        </Link>
                    }
                    <Link href={`/hrm/forgot-checkin-out?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`}>
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
                            className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                            onClick={() => handleActive(1)}
                        >
                            {t('forgot_checkin_out_info')}
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
                                        handleForgotCheckinOut(values);
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
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="startTime" className='label'>
                                                        {' '}
                                                        {t('register_from_date')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off"
                                                        name="startTime"
                                                        render={({ field }: any) => (
                                                            <Flatpickr
                                                                // data-enable-time
                                                                options={{
                                                                    enableTime: true,
                                                                    noCalendar: true,
                                                                    dateFormat: "H:i",
                                                                    time_24hr: true,
                                                                    locale: {
                                                                        ...chosenLocale,
                                                                    },
                                                                }}
                                                                disabled={disable}
                                                                value={moment(values?.startTime, 'HH:mm:ss').format('HH:mm:ss')}
                                                                onChange={(e: any) => {
                                                                    setFieldValue('startTime', moment(e[0]).format('HH:mm:ss'))
                                                                }}
                                                                className="form-input calender-input"
                                                                placeholder={`${t('choose_register_start_date')}`}
                                                            />
                                                        )}
                                                    />
                                                    {submitCount ? errors.startTime ? <div className="mt-1 text-danger"> {`${errors.startTime}`} </div> : null : ''}
                                                    {submitCount ? dayjs(values?.startTime).isAfter(values.startTime) ? <div className="mt-1 text-danger"> {`${t('starttime_must_before_endtime')}`} </div> : null : ""}
                                                </div>

                                            </div>
                                            <div className='flex justify-between gap-5'>
                                                <div className="w-1/2">
                                                    <label htmlFor="endTime" className='label'>
                                                        {' '}
                                                        {t('register_end_date')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field
                                                        autoComplete="off"
                                                        name="endTime"
                                                        render={({ field }: any) => (
                                                            <Flatpickr
                                                                // disabled={disable} data-enable-time
                                                                options={{
                                                                    enableTime: true,
                                                                    noCalendar: true,
                                                                    dateFormat: "H:i",
                                                                    time_24hr: true,
                                                                    locale: {
                                                                        ...chosenLocale,
                                                                    },
                                                                }}
                                                                disabled={disable}
                                                                value={moment(values?.endTime, 'HH:mm:ss').format('HH:mm:ss')}
                                                                onChange={(e: any) => {
                                                                    setFieldValue('endTime', moment(e[0]).format('HH:mm:ss'))
                                                                }}
                                                                className="form-input calender-input"
                                                                placeholder={`${t('choose_register_end_date')}`}
                                                            />
                                                        )}
                                                    />
                                                    {submitCount ? errors.endTime ? <div className="mt-1 text-danger"> {`${errors.endTime}`} </div> : null : ''}
                                                    {submitCount ? dayjs(values?.startTime).isAfter(values.startTime) ? <div className="mt-1 text-danger"> {`${t('endtime_must_after_starttime')}`} </div> : null : ""}
                                                </div>
                                                <div className="w-1/2">
                                                    <label htmlFor="reason" className='label'>
                                                        {' '}
                                                        {t('reason')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" as="textarea" name="reason" id="reason" disabled={disable}
                                                        placeholder={`${t('fill_reason')}`} className="form-input" />
                                                    {submitCount ? errors.reason ? <div className="mt-1 text-danger"> {`${errors.reason}`} </div> : null : ''}
                                                </div>

                                            </div>
                                            {
                                                router?.query?.id !== "create" && data?.status !== "DRAFT" &&
                                                <div>
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
                                                </div>
                                            }
                                            {/* {data?.approvalHistory?.find((e: any) => e.status === 'REJECTED')?.comment && <div className='flex justify-between gap-5'>
                                                <div className="flex-1">
                                                    <label htmlFor="comment" className='label'>
                                                        {' '}
                                                        {t('reject_reason')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field disabled={true} autoComplete="off" as="textarea" value={data?.approvalHistory?.find((e: any) => e.status === 'REJECTED')?.comment ?? ""}
                                                        placeholder={`${t('fill_reason')}`} className="form-input" />

                                                </div>
                                            </div>} */}

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
                                className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                onClick={() => handleActive(2)}
                            >
                                {t('approve_history')}
                                <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
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
                                {t('Applicant')} {'->'} {t('Department Head/Deputy')}
                            </strong>
                        </p>
                    </div>
                    {/* <div style={{ display: 'flex', marginTop: '10px' }}>
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
                    </div> */}
                    <SwitchBtn
                        entity={'forgot-checkin-out'}
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
                                <button data-testId="submit-btn" type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmit()}>
                                    {router.query.id !== "create" ? t('update') : t('save_daf')}
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
                                                                {t('continue_approval')}
                                                            </button>
                                                        }
                                                    </>
                                                    <>
                                                        {
                                                            item.name === "INITIAL" &&
                                                            <button data-testId="submit-approval-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleSubmitApproval(item.id)}>
                                                                {t('continue_initial')}
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
                                    //disable &&
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
                                                                >
                                                                    {t('approve')}
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
            </div >
            {
                (router?.query?.id === "create" || (router?.query?.id !== "create" && data)) && <ApprovalModal
                    openModal={openModalApproval}
                    setOpenModal={setOpenModalApproval}
                    handleData={handleData}
                    data={data}
                    handleCancel={handleCancel}
                    id={id}
                    departmentId={data?.createdBy?.department?.id ?? userData?.data?.id}
                    createdId={createdId}
                    sign={sign}
                />
            }
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
