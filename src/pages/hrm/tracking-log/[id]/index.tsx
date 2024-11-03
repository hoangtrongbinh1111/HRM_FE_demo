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
import IconBack from '@/components/Icon/IconBack';
import DetailModal from '../modal/DetailModal';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
import { TrackingLogDetails } from '@/services/swr/tracking-log.swr';
import { AddTrackingLogDetails, CreateTrackingLog, DeleteTrackingLogDetail, EditTrackingLog, GetTrackingLog, TrackingLogApprove } from '@/services/apis/tracking-log.api';
import dayjs from 'dayjs';
import { useProfile } from '@/services/swr/profile.swr';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { Loader } from '@mantine/core';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import Modal from './modal';
import ExcelJS from "exceljs";
import IconNewDownload3 from '@/components/Icon/IconNewDownload3';
import IconImportFile2 from '@/components/Icon/IconImportFile2';

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
    const [listDataDetail, setListDataDetail] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [query, setQuery] = useState<any>({});
    const [active, setActive] = useState<any>([1, 2]);
    const [initialValue, setInitialValue] = useState<any>();
    const [data, setData] = useState<any>();
    const [open, setOpen] = useState<any>(false);
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');
    const [send, SetSend] = useState<any>(false);
    const formRef = useRef<any>();
    const { data: userData } = useProfile();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [createdId, setCreatedId] = useState();
    // get data
    const { data: TrackingLogDetail, pagination, mutate, isLoading } = TrackingLogDetails({ ...query });
    const [loading, setLoading] = useState(false);
    const [openAssigned, setOpenAssigned] = useState(false);
    const { data: profile } = useProfile();

    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("tracking_log.pdf", `/tracking-log/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_tracking_log')}` : (data ? t('update_tracking_log') : t('add_tracking_log'))));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(TrackingLogDetail?.data);
        }
    }, [TrackingLogDetail?.data, router]);

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
        GetTrackingLog({ id: router.query.id })
            .then((res) => {
                setData(res.data);
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
    };

    useEffect(() => {
        setInitialValue({
            department: data ? data?.createdBy?.department?.name : userData?.data?.department?.name,
            time: data ? data?.createdAt : new Date(),
            personDuty: data?.createdBy ? data?.createdBy.fullName : JSON.parse(localStorage.getItem('profile') || '').fullName,
            currentApprover: data?.currentApprover ? data?.currentApprover.fullName : '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, router]);

    const SubmittedForm = Yup.object().shape({
        time: Yup.string().required(`${t('please_fill_time_tracking_log')}`),
    });

    const handleEdit = (data: any) => {
        setDataDetail(data);
        setOpenModal(true);
    };

    const handleDelete = ({ id, staff }: any) => {
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
                title: `${t('delete_tracking_log_detail')}`,
                text: `${t('delete')} ${staff?.fullName}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    if (Number(router.query.id)) {
                        DeleteTrackingLogDetail({ id: router.query.id, detailId: id })
                            .then(() => {
                                mutate();
                                showMessage(`${t('delete_tracking_log_detail_success')}`, 'success');
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

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'fullName',
            title: `${t('name_staff')}`,
            render: (records: any) => <span>{records?.staff?.fullName ?? records?.staffId}</span>,
            sortable: false,
        },
        {
            accessor: 'department',
            title: `${t('department')}`,
            render: ({ staff }: any) => <span>{staff?.department?.name}</span>,
            sortable: false,
        },
        {
            accessor: 'enterTime',
            title: `${t('enter_time')}`,
            render: (records: any) => <span>{moment(records?.enterTime, 'HH:mm:ss').format('HH:mm')}</span>, sortable: false
        },
        // { accessor: 'price', title: 'Giá', sortable: false },
        {
            accessor: 'exitTime',
            title: `${t('exit_time')}`,
            render: (records: any) => <span>{moment(records?.exitTime, 'HH:mm:ss').format('HH:mm')}</span>, sortable: false
        },
        {
            accessor: 'content',
            title: `${t('exit_content')}`,
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
                            <div className="w-[auto]">

                                <button type="button" className="button-edit" onClick={() => handleEdit(records)}>
                                    <IconNewEdit /> <span>{`${t('edit')}`}</span>
                                </button>
                            </div>
                            <div className="w-[auto]">
                                <button type="button" className="button-delete" onClick={() => handleDelete(records)}>
                                    <IconNewTrash /> <span>{`${t('delete')}`}</span>
                                </button>
                            </div>
                        </>
                    )
                    }
                </div >
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

    const handleCancel = () => {
        router.push(`/hrm/tracking-log?page=${router?.query?.page}&perPage=${router?.query?.perPage}`);
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };

    const handleTrackingLog = (param: any) => {
        const query: any = {};
        if (data) {
            EditTrackingLog({ id: data?.id, ...query })
                .then((res) => {
                    showMessage(`${t('edit_success')}`, 'success');
                    handleCancel();
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        } else {
            if (listDataDetail?.length === undefined || listDataDetail?.length === 0) {
                showMessage(`${t('please_add_tracking_detail')}`, 'error');
                handleActive(2);
            } else {
                CreateTrackingLog(query)
                    .then((res) => {
                        setCreatedId(res.data.id);
                        handleDetail(res.data.id);
                    })
                    .catch((err) => {
                        showMessage(`${err?.response?.data?.message[0].error}`, 'error');
                    });
            }
        }
    };

    const handleDetail = (id: any) => {
        AddTrackingLogDetails({
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

    const Approve = () => {
        if (listDataDetail?.length === undefined || listDataDetail?.length === 0) {
            showMessage(`${t('please_add_tracking_detail')}`, 'error');
            handleActive(2);
        } else {
            TrackingLogApprove({ id: router.query.id })
                .then(() => {
                    handleCancel();
                    showMessage(`${t('approve_success')}`, 'success');
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        }
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
                text: `${t('approve')} ${t('tracking_log')}`,
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        const lang = localStorage.getItem('i18nextLng');
        let urlString
        switch (lang) {
            case "vi":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/tracking_log/tracking_log_vi.xlsx`;
                break;
            case "la":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/tracking_log/tracking_log_la.xlsx`;
                break;
            case "en":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/tracking_log/tracking_log_en.xlsx`;
                break;
            default:
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/tracking_log/tracking_log_vi.xlsx`;
                break;
        }
        const link = document.createElement('a');
        link.href = urlString;
        link.setAttribute('download', 'tracking_log.xlsx');
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
                        enterTime: item[2],
                        exitTime: item[3],
                        content: item[4],
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
                    <Link href="/hrm/tracking-log" className="text-primary hover:underline">
                        <span>{t('tracking_log')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_tracking_log') : t('add_tracking_log'))}
                        {
                            disable && t('detail_tracking_log')
                        }
                    </span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">
                    {!disable && (data ? t('update_tracking_log') : t('add_tracking_log'))}
                    {
                        disable && t('detail_tracking_log')
                    }                </h1>
                <div className='flex' style={{ alignItems: "center" }}>
                    {disable && (
                        // <RBACWrapper permissionKey={['trackingLog:update']} type={'AND'}>
                            <div onClick={() => setOpenAssigned(true)} style={{ marginRight: '-10px' }}>
                                <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                            </div>
                        // </RBACWrapper>
                    )}
                    {disable && (
                        <RBACWrapper permissionKey={['trackingLog:exportTextDraft']} type={'AND'}>
                            <button type="button" className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4" onClick={() => handleExportFile(data?.id)} disabled={loading}>
                                {
                                    loading ? <Loader size="sm" color="#fff" className="rtl:ml-2" /> : <IconNewDownload2 className="ltr:mr-2 rtl:ml-2" />
                                }
                                <span>{t('export_file')}</span>
                            </button>
                        </RBACWrapper>
                    )}
                    {
                        disable && <Link href={`/hrm/tracking-log/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>

                            <button className="edit-page-btn btn btn-primary ltr:ml-4 rtl:mr-4 h-9">
                                {t('edit')}
                            </button>
                        </Link>
                    }
                    <Link href={`/hrm/tracking-log?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
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
                            {t('tracking_log_infomation')}
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
                                        handleTrackingLog(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5">
                                            <div className="p-4">
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="personDuty" className="label">
                                                            {' '}
                                                            {t('person_duty')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="personDuty"
                                                            type="text"
                                                            id="personDuty"
                                                            placeholder={`${t('enter_code')}`}
                                                            className={true ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={true}
                                                        />
                                                        {submitCount && errors.personDuty ? <div className="mt-1 text-danger"> {`${errors.personDuty}`} </div> : null}
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="department" className="label">
                                                            {' '}
                                                            {t('work_department')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="department" id="department" className="form-input" />
                                                    </div>
                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="time" className="label">
                                                            {' '}
                                                            {t('time')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="time"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    data-enable-time
                                                                    options={{
                                                                        locale: {
                                                                            ...chosenLocale,
                                                                        },
                                                                        enableTime: true,
                                                                        dateFormat: 'm/Y',
                                                                    }}
                                                                    value={field.value}
                                                                    className={true ? 'calender-input form-input bg-[#f2f2f2]' : 'calender-input form-input'}
                                                                    disabled={true}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount && errors.time ? <div className="mt-1 text-danger"> {`${errors.time}`} </div> : null}
                                                    </div>
                                                    <div className="w-1/2">
                                                    </div>
                                                </div>
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
                            {t('tracking_list')}
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
                                                    {t('add_tracking_detail')}
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
                                    trackingLogDetailMutate={mutate}
                                />
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
                    )}{router?.query.id !== 'create' && (
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
                            {' '}
                            {t('On-duty person')}
                        </p>
                    </div>

                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                        {
                            (router.query.id === "create") && (
                                <>
                                    <button data-testId="submit-btn" type="submit" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleSubmit()}>
                                        {t('save_daf')}
                                    </button>
                                </>
                            )
                        }
                        {data?.status !== 'DRAFT' && data?.currentApprover?.id !== id ? (
                            <></>
                        ) : (
                            <>
                                {data?.status !== 'DRAFT' && data?.status !== 'REJECTED' && data?.status !== 'APPROVED' && disable && open && Number(data?.createdById) !== id && (
                                    <>
                                        <button data-testId="submit-approve-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleApprove()}>
                                            {t('approve')}
                                        </button>
                                    </>
                                )}
                                {high !== 'true' && data?.status !== 'REJECTED' && open && disable && (
                                    <button data-testId="submit-approval-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleApprove()}>
                                        {t('approve')}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Modal open={openAssigned} id={router.query.id} handleData={handleData} setOpen={setOpenAssigned}></Modal>
        </div>
    );
};
export default DetailPage;
