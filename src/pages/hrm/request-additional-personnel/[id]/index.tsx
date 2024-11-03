import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
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
import { DropdownDepartment } from '@/services/swr/dropdown.swr';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { useProfile } from '@/services/swr/profile.swr';
import { CreateRequestAdditionalPersonnel, EditRequestAdditionalPersonnel, GetRequestAdditionalPersonnel, RequestAdditionalPersonnelApprove } from '@/services/apis/request-additional-personnel.api';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import { LIST_STATUS } from '@/utils/constants';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { Loader } from '@mantine/core';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import dayjs from "dayjs";
import Modal from './modal';
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
    const [data, setData] = useState<any>();
    const [open, setOpen] = useState<any>(false);
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');
    const [page, setPage] = useState(1);
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const formRef = useRef<any>();
    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [send, SetSend] = useState<any>(false);
    const [departmentId, setDepartmentId] = useState<any>();
    const [createdId, setCreatedId] = useState();
    const { data: userData } = useProfile();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [isLoading, setIsLoading] = useState(true);
    const [openAssigned, setOpenAssigned] = useState(false);

    // get data
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });
    const { data: profile } = useProfile();
    const [loading, setLoading] = useState(false);

    // const handleExportFile = (id: any) => {
    //     setLoading(true)
    //     downloadFile("rice_coupon.pdf", `/request-additional-personnel/${id}/export-text-draft`).finally(() => {
    //         setLoading(false)
    //     })
    // }
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_request_additional_personnel')}` : (data ? t('update_request_additional_personnel') : t('add_request_additional_personnel'))));
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

    const handleData = () => {
        GetRequestAdditionalPersonnel({ id: router.query.id })
            .then((res) => {
                setData(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
    };

    useEffect(() => {
        setInitialValue({
            name: data ? data?.createdBy?.fullName : userData?.data?.fullName,
            position_cre: data ? data?.createdBy?.position?.name : userData?.data?.position?.name,
            department: data ? data?.createdBy?.department?.name : userData?.data?.department?.name,
            requestDate: data ? data?.createdAt : new Date(),
            departmentId: data?.department
                ? {
                    value: `${data?.department?.id}`,
                    label: `${data?.department?.name}`,
                }
                : profile?.data?.department
                    ? {
                        value: `${profile?.data?.department?.id}`,
                        label: `${profile?.data?.department?.name}`,
                    }
                    : '',
            personReport: data?.createdBy ? data?.createdBy.fullName : JSON.parse(localStorage.getItem('profile') || '').fullName,
            timeRequest: data?.createdAt ? new Date(data?.createdAt) : "",
            currentApprover: data?.approvalHistory?.find((his: any) => his.status === 'APPROVED')?.approver?.fullName ?? data?.currentApprover?.fullName,
            title: data?.title ? data?.title : "",
            position: data?.position ? data?.position : "",
            description: data?.description ? data?.description : "",
            quantity: data?.quantity ? data?.quantity : 0
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, router]);

    const SubmittedForm = Yup.object().shape({
        departmentId: new Yup.ObjectSchema().required(`${t('please_fill_department')}`),
        title: Yup.string().required(`${t('please_fill_title')}`),
        position: Yup.string().required(`${t('please_fill_vacant_position')}`),
        description: Yup.string(),
        quantity: Yup.number().typeError(`${t('please_fill_quantity')}`),
    });

    const columnHistorys = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'action',
            title: `${t('action_type')}`,
            render: ({ action }: any) => <span>{action === 'FORWARD' || action === 'SUBMIT' ? 'Trình ký' : action === 'REJECT' ? 'Từ chối' : 'Duyệt'}</span>,
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
    const handleCancel = () => {
        router.push(`/hrm/request-additional-personnel?page=${router?.query?.page}&perPage=${router?.query?.perPage}`);
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
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
    const handleRequestAdditionalPersonnel = (param: any) => {
        const query: any = {
            departmentId: Number(param?.departmentId?.value),
            title: param?.title,
            position: param?.position,
            description: param?.description,
            quantity: param?.quantity,
        };

        if (data) {
            EditRequestAdditionalPersonnel({ id: data?.id, ...query })
                .then((res) => {
                    showMessage(`${t('edit_success')}`, 'success');
                    handleCancel();
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        } else {

            CreateRequestAdditionalPersonnel(query)
                .then((res) => {
                    setCreatedId(res.data.id);
                    handleDetail(res.data.id);

                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message[0].error}`, 'error');
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

    const handleSubmitApproval = () => {
        if (router.query.id !== 'create') {
            setOpenModalApproval(true);
        } else {
            handleSubmit();
            SetSend(true);
        }
    };

    const Approve = () => {
        RequestAdditionalPersonnelApprove({ id: router.query.id })
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
                text: `${t('approve')} ${t('requestAdditionalPersonnel')}`,
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
                    <Link href="/hrm/request-additional-personnel" className="text-primary hover:underline">
                        <span>{t('request_additional_personnel')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_request_additional_personnel') : t('add_request_additional_personnel'))}
                        {
                            disable && t('detail_request_additional_personnel')
                        }
                    </span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">
                    {!disable && (data ? t('update_request_additional_personnel') : t('add_request_additional_personnel'))}
                    {disable && t('detail_request_additional_personnel')}
                </h1>
                <div className="flex" style={{ alignItems: 'center' }}>
                    {data?.status !== 'DRAFT' &&
                        data?.status !== 'REJECTED' &&
                        data?.status !== 'APPROVED' &&
                        (data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') &&
                        userData?.data?.id === data?.currentApprover?.id &&
                        disable &&
                        Number(data?.createdById) !== userData?.data?.id && (
                            // <RBACWrapper permissionKey={['requestAdditionalPersonnel:update']} type={'AND'}>
                                <div onClick={() => setOpenAssigned(true)} style={{ marginRight: '-10px' }}>
                                    <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                                </div>
                            // </RBACWrapper>
                        )}
                    {/* {disable && data?.status === 'APPROVED' && (
                        <RBACWrapper permissionKey={['requestAdditionalPersonnel:exportTextDraft']} type={'AND'}>
                            <button type="button" className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4" onClick={() => handleExportFile(data?.id)} disabled={loading}>
                                {
                                    loading ? <Loader size="sm" color="#fff" className="rtl:ml-2" /> : <IconNewDownload2 className="ltr:mr-2 rtl:ml-2" />
                                }
                                <span>{t('export_file')}</span>
                            </button>
                        </RBACWrapper>
                    )} */}
                    {
                        disable && (data?.status === LIST_STATUS.DRAFT || (userData?.data?.id === data?.currentApproverId && data?.status !== LIST_STATUS.APPROVED && data?.status !== LIST_STATUS.REJECTED)) && (
                            <Link href={`/hrm/request-additional-personnel/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                                <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('edit')}</button>
                            </Link>
                        )}
                    <Link href={`/hrm/request-additional-personnel?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`}>
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
                            {t('info_request_additional_personnel')}
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
                                        handleRequestAdditionalPersonnel(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5">
                                            <div className="p-4">
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
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
                                                        <Field autoComplete="off" disabled type="text" name="position_cre" id="position_cre" className="form-input"></Field>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
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
                                                <div className="mb-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="title" className="label">
                                                            {' '}
                                                            {t('title')} <span style={{ color: 'red' }}>* </span>
                                                        </label>

                                                        <Field
                                                            autoComplete="off"
                                                            name="title"
                                                            type="text"
                                                            id="title"
                                                            placeholder={`${t('fill_title')}`}
                                                            className="form-input"
                                                            disabled={disable}

                                                        />
                                                        {submitCount ? errors.title ? <div className="mt-1 text-danger"> {`${errors.title}`} </div> : null : ''}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="departmentId" className="label">
                                                            {' '}
                                                            {t('Request Department')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Select
                                                            id="departmentId"
                                                            name="departmentId"
                                                            options={dataDepartment}
                                                            maxMenuHeight={160}
                                                            value={values?.departmentId}
                                                            onMenuOpen={() => setPage(1)}
                                                            onMenuScrollToBottom={handleMenuScrollToBottom}
                                                            isLoading={isLoadingDepartment}
                                                            onInputChange={(e) => setSearchDepartment(e)}
                                                            placeholder={t('choose_department')}
                                                            onChange={(e) => {
                                                                setDepartmentId(e.value);
                                                                setFieldValue('departmentId', e);
                                                            }}
                                                            isDisabled={!isNaN(Number(router.query.id))}
                                                        />
                                                        {submitCount && errors.departmentId ? <div className="mt-1 text-danger"> {`${errors.departmentId}`} </div> : null}
                                                    </div>
                                                </div>
                                                <div className="mb-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="quantity" className="label">
                                                            {' '}
                                                            {t('number of vacancies')} <span style={{ color: 'red' }}>* </span>
                                                        </label>

                                                        <Field
                                                            autoComplete="off"
                                                            name="quantity"
                                                            type="number"
                                                            id="quantity"
                                                            placeholder={`${t('fill_quantity')}`}
                                                            className="form-input"
                                                            disabled={disable}

                                                        />
                                                        {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.quantity}`} </div> : null : ''}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="position" className="label">
                                                            {' '}
                                                            {t('vacant position')} <span style={{ color: 'red' }}>* </span>
                                                        </label>

                                                        <Field
                                                            autoComplete="off"
                                                            name="position"
                                                            type="input"
                                                            id="position"
                                                            placeholder={`${t('fill vacant positions')}`}
                                                            className="form-input"
                                                            disabled={disable}

                                                        />
                                                        {submitCount ? errors.position ? <div className="mt-1 text-danger"> {`${errors.position}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="mb-5 flex justify-between gap-5">
                                                    <div className="flex-1">
                                                        <label htmlFor="description" className="label">
                                                            {' '}
                                                            {t('description')}
                                                        </label>

                                                        <Field
                                                            autoComplete="off"
                                                            name="description"
                                                            as="textarea"
                                                            id="description"
                                                            placeholder={`${t('fill_description')}`}
                                                            className="form-input"
                                                            disabled={disable}

                                                        />
                                                        {submitCount ? errors.description ? <div className="mt-1 text-danger"> {`${errors.description}`} </div> : null : ''}
                                                    </div>
                                                </div>

                                                <div className="mb-5 flex justify-between gap-5">
                                                    {router.query.id !== 'create' && data?.status !== 'APPROVED' && data?.status !== 'DRAFT' ? (
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
                                                    ) : (
                                                        <div className="w-1/2"></div>
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
                                </AnimateHeight>
                            </div>
                        </div>
                    )}
                    {router?.query.id !== 'create' && (
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
                            <strong>{t('Order of Approval')}:</strong>
                        </p>
                        <p>
                            {' '}
                            {t('Reporter')} {'->'} {t('Head of department')} {'->'} {t('Administration and Organization Department')} {'->'} {t('Director')}
                        </p>
                    </div>
                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
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
                    </div>
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
