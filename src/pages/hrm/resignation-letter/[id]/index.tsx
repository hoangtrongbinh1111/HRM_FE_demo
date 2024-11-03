import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
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
import { ResignationLetterApprove, CreateResignationLetter, GetResignationLetter, EditResignationLetter } from '@/services/apis/resignation-letter.api';
import { useProfile } from '@/services/swr/profile.swr';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { LIST_STATUS } from '@/utils/constants';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { Loader } from '@mantine/core';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
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
    const formRef = useRef<any>();
    const [send, SetSend] = useState<any>(false);
    const { data: userData } = useProfile();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [isLoading, setIsLoading] = useState(true);
    const [createdId, setCreatedId] = useState();
    const [loading, setLoading] = useState(false);
    const [openAssigned, setOpenAssigned] = useState(false);
    const [sign, setSign] = useState(false);
    const [signStatus, setSignStatus] = useState<any>();
    const [loadingState, setLoadingState] = useState({
        isContinueApproval: false,
        isApprove: false,
        isReject: false,
        isSubmit: false,
        isContinueInitial: false
    })
    const [submitType, setSubmitType] = useState('');
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_resignation_letter')}` : (data ? t('update_resignation_letter') : t('add_resignation_letter'))));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            handleData();
            setQuery({ id: router.query.id, ...router.query });
        }
        if (router.query.id === 'create') {
            setIsLoading(false);
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
        const fromPositionId = userData?.data?.position.id;
        const startPositionId = router.query.id === 'create' ? userData?.data?.position.id : data?.createdBy?.position.id;
        if (departmentId && fromPositionId && startPositionId) {
            getConfig({
                entity: 'resignation-letter',
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
            GetResignationLetter({ id: router?.query.id })
                .then((res) => {
                    setData(res.data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        }
    };
    const RenturnError = (param: any) => {
        if (Object.keys(param?.errors || {}).length > 0 && param?.submitCount > 0) {
            showMessage(`${t('please_add_infomation')}`, 'error');
        }
        return <></>;
    };
    useEffect(() => {
        setInitialValue({
            name: data?.createdBy ? data?.createdBy.fullName : userData?.data?.fullName,
            position: data?.createdBy ? data?.createdBy?.position?.name : userData?.data?.position?.name,
            birthDay: data?.createdBy ? new Date(data?.createdBy?.birthDay) : new Date(userData?.data?.birthDay),
            department: data?.createdBy ? data?.createdBy?.department?.name : userData?.data?.department?.name,
            dateOfJoin: data?.dateOfJoin ? data?.dateOfJoin : new Date(userData?.data?.dateOfJoin),
            requestDate: data?.createdAt ? data?.createdAt : new Date(),
            resignationDay: data?.resignationDay ? data?.resignationDay : "",
            reason: data?.reason ?? '',
            currentApprover: data?.currentApprover ? data?.currentApprover.fullName : '',
        });
    }, [data, router]);

    const SubmittedForm = Yup.object().shape({
        resignationDay: Yup.date().required(`${t('please_choose_resignation_day')}`),
        dateOfJoin: Yup.date().required(`${t('please_choose_date_of_join')}`),
        reason: Yup.string().required(`${t('please_fill_reason')}`),
    });

    const handleCancel = () => {
        router.push(`/hrm/resignation-letter?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`);
    };
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

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };

    const handleResignationLetter = (param: any) => {
        if (router.query.id === 'create' && send === true) {
            setLoadingState({ ...loadingState, isContinueApproval: true });
        } else {
            setLoadingState({ ...loadingState, isSubmit: true });
        }
        const dataSubmit: any = {
            dateOfJoin: moment(param?.dateOfJoin).format('YYYY-MM-DD'),
            resignationDay: moment(param?.resignationDay).format('YYYY-MM-DD'),
            reason: param?.reason,
        };
        if (data) {
            EditResignationLetter({ id: data?.id, ...dataSubmit })
                .then((res) => {
                    showMessage(`${t('update_letter_success')}`, 'success');
                    router.push(`/hrm/resignation-letter?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`);
                })
                .catch((err) => {
                    showMessage(`${t('update_letter_error')}`, 'error');
                }).finally(() => {
                    setLoadingState(prevState => ({ ...prevState, isSubmit: false, isContinueApproval: false }));
                });
        } else {
            CreateResignationLetter(dataSubmit)
                .then((res) => {
                    setCreatedId(res.data.id);
                    handleDetail(res.data.id);
                })
                .catch((err) => {
                    showMessage(`${t('save_draf_error')}`, 'error');
                }).finally(() => {
                    setLoadingState(prevState => ({ ...prevState, isSubmit: false, isContinueApproval: false }));
                });
        }
    };

    const handleDetail = (id: any) => {
        if (router.query.id === 'create' && send === true) {
            showMessage(`${t('save_success')}`, 'success');
            setId(id);
            setOpenModalApproval(true);
        } else {
            showMessage(`${t('save_draf_success')}`, 'success');
            handleCancel();
        }
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
        ResignationLetterApprove({ id: router.query.id, sign: 3 })
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
                text: `${t('approve')} ${t('resignation_letter')}`,
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
            formRef.current.handleSubmit()
        }
    };
    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("resignation_letter.pdf", `/resignation-letter/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
    }
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
                    <Link href="/hrm/resignation-letter" className="text-primary hover:underline">
                        <span>{t('resignation_letter')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_resignation_letter') : t('add_resignation_letter'))}
                        {
                            disable && t('detail_resignation_letter')
                        }
                    </span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>
                    {!disable && (data ? t('update_resignation_letter') : t('add_resignation_letter'))}
                    {
                        disable && t('detail_resignation_letter')
                    }
                </h1>
                <div className='flex' style={{ alignItems: "center" }}>
                    {(data?.status !== "DRAFT" && data?.status !== "REJECTED" && data?.status !== "APPROVED") && ((data?.status === "PENDING" || data?.status === "IN_PROGRESS") && userData?.data?.id === data?.currentApprover?.id) &&
                        disable && Number(data?.createdById) !== userData?.data?.id && (
                            <div onClick={() => setOpenAssigned(true)} style={{ marginRight: '-10px' }}>
                                <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                            </div>
                        )}
                    {disable && data?.status === 'APPROVED' && (
                        <RBACWrapper permissionKey={['paymentRequestList:exportTextDraft']} type={'AND'}>
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
                        <Link href={`/hrm/resignation-letter/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                            <button className="edit-page-btn btn btn-primary ltr:ml-4 rtl:mr-4 h-9">
                                {t('edit')}
                            </button>
                        </Link>
                    }
                    <Link href={`/hrm/resignation-letter?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`}>
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
                            {t('resignation_letter_information')}
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
                                        handleResignationLetter(values);
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
                                                        <Field
                                                            autoComplete="off"
                                                            name="name"
                                                            type="text"
                                                            id="name"
                                                            placeholder={`${t('enter_code')}`}
                                                            className={true ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={true}
                                                        />
                                                        {submitCount && errors.name ? <div className="mt-1 text-danger"> {`${errors.name}`} </div> : null}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="birthDay" className="label">
                                                            {' '}
                                                            {t('date_of_birth')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="birthDay"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    data-enable-time
                                                                    options={{
                                                                        enableTime: true,
                                                                        dateFormat: 'd/m/Y',
                                                                        locale: {
                                                                            ...chosenLocale,
                                                                        },
                                                                    }}
                                                                    placeholder={`${t('choose_resignation_date')}`}
                                                                    value={field.value}
                                                                    className={true ? 'calender-input form-input bg-[#f2f2f2]' : 'calender-input form-input'}
                                                                    disabled={true}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount && errors.birthDay ? <div className="mt-1 text-danger"> {`${errors.birthDay}`} </div> : null}
                                                    </div>
                                                </div>
                                                <div className="mt-5 flex justify-between gap-5">
                                                    <div className=" w-1/2">
                                                        <label htmlFor="position" className="label">
                                                            {' '}
                                                            {t('duty')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="position"
                                                            type="text"
                                                            id="position"
                                                            className={true ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={true}
                                                        />
                                                        {submitCount && errors.department ? <div className="mt-1 text-danger"> {`${errors.department}`} </div> : null}
                                                    </div>
                                                    <div className=" w-1/2">
                                                        <label htmlFor="department" className="label">
                                                            {' '}
                                                            {t('work_department')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="department"
                                                            type="text"
                                                            id="department"
                                                            className={true ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={true}
                                                        />
                                                        {submitCount && errors.department ? <div className="mt-1 text-danger"> {`${errors.department}`} </div> : null}
                                                    </div>
                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="dateOfJoin" className="label">
                                                            {' '}
                                                            {t('date_of_join')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            disabled={disable}
                                                            autoComplete="off"
                                                            name="dateOfJoin"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    // data-enable-time
                                                                    options={{
                                                                        // enableTime: true,
                                                                        dateFormat: 'd-m-Y',
                                                                        locale: {
                                                                            ...chosenLocale,
                                                                        },
                                                                    }}
                                                                    value={dayjs(values?.dateOfJoin).format('DD-MM-YYYY')}
                                                                    // value={field.value}
                                                                    className={disable ? 'calender-input form-input bg-[#f2f2f2]' : 'calender-input form-input'}
                                                                    disabled={disable}
                                                                    onChange={(e: any) => {
                                                                        setFieldValue('dateOfJoin', e[0])
                                                                    }}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount && errors.dateOfJoin ? <div className="mt-1 text-danger"> {`${errors.dateOfJoin}`} </div> : null}
                                                    </div>
                                                    {/* <div className="w-1/2">
                                                        <label htmlFor="requestDate" className="label">
                                                            {' '}
                                                            {t('date_of_out')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            disabled={disable}
                                                            autoComplete="off"
                                                            name="requestDate"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    data-enable-time
                                                                    options={{
                                                                        // enableTime: true,
                                                                        dateFormat: 'd/m/Y',
                                                                    }}
                                                                    value={dayjs(values?.requestDate).format('DD-MM-YYYY')}
                                                                    className={disable ? 'calender-input form-input bg-[#f2f2f2]' : 'calender-input form-input'}
                                                                    disabled={disable}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount && errors.requestDate ? <div className="mt-1 text-danger"> {`${errors.requestDate}`} </div> : null}
                                                    </div> */}
                                                    <div className="w-1/2">
                                                        <label htmlFor="resignationDay" className="label">
                                                            {' '}
                                                            {t('resignation_day')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            disabled={disable}
                                                            autoComplete="off"
                                                            name="resignationDay"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    // data-enable-time
                                                                    options={{
                                                                        enableTime: false,
                                                                        dateFormat: 'd-m-Y',
                                                                        locale: {
                                                                            ...chosenLocale,
                                                                        },
                                                                    }}
                                                                    value={dayjs(values?.resignationDay).format('DD-MM-YYYY')}
                                                                    onChange={(e) => {
                                                                        if (e.length > 0) {
                                                                            setFieldValue('resignationDay', e[0]);
                                                                        }
                                                                    }}
                                                                    placeholder={`${t('please_choose_resignation_day')}`}
                                                                    className={disable ? 'calender-input form-input bg-[#f2f2f2]' : 'calender-input form-input'}
                                                                    disabled={disable}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount && errors.resignationDay ? <div className="mt-1 text-danger"> {`${errors.resignationDay}`} </div> : null}
                                                    </div>
                                                </div>
                                                {/* <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="resignationDay" className="label">
                                                            {' '}
                                                            {t('resignation_day')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            disabled={disable}
                                                            autoComplete="off"
                                                            name="resignationDay"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    // data-enable-time
                                                                    options={{
                                                                        enableTime: false,
                                                                        dateFormat: 'd/m/Y',
                                                                    }}
                                                                    onChange={(e) => {
                                                                        if (e.length > 0) {
                                                                            setFieldValue('resignationDay', e[0]);
                                                                        }
                                                                    }}
                                                                    value={field.value}
                                                                    className={disable ? 'calender-input form-input bg-[#f2f2f2]' : 'calender-input form-input'}
                                                                    disabled={disable}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount && errors.resignationDay ? <div className="mt-1 text-danger"> {`${errors.resignationDay}`} </div> : null}
                                                    </div>
                                                    <div className="w-1/2">
                                                    </div>
                                                </div> */}
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="flex-1">
                                                        <label htmlFor="reason" className="label">
                                                            {' '}
                                                            {t('reason')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            as="textarea"
                                                            name="reason"
                                                            type="text"
                                                            id="reason"
                                                            placeholder={`${t('fill_reason')}`}
                                                            className={disable ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.reason ? <div className="mt-1 text-danger"> {`${errors.reason}`} </div> : null}
                                                    </div>
                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    {router.query.id !== 'create' && data?.status !== 'APPROVED' && data?.status !== 'DRAFT' && (
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
                                                    )}
                                                </div>
                                            </div>
                                            {<RenturnError errors={errors} submitCount={submitCount} />}
                                        </Form>
                                    )}
                                </Formik>
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
                                    <RejectModal openModal={openModalReject} setOpenModal={setOpenModalReject} handleCancel={handleCancel} />
                                </AnimateHeight>
                            </div>
                        </div>
                    )}
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
                        entity={'resignation-letter'}
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
                                        //disable &&
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
            {
                (router?.query?.id === "create" || (router?.query?.id !== "create" && data)) && <ApprovalModal
                    openModal={openModalApproval}
                    setOpenModal={setOpenModalApproval}
                    handleData={handleData}
                    data={data}
                    handleCancel={handleCancel}
                    id={id}
                    departmentId={data?.createdBy?.department?.id ? data?.createdBy?.department?.id : userData?.data?.department?.id}
                    createdId={createdId}
                    sign={sign}
                />
            }
            <RejectModal openModal={openModalReject} setOpenModal={setOpenModalReject} handleCancel={handleCancel} />
        </div>
    );
};
export default DetailPage;
