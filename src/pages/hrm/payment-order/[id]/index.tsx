import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { downloadFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { ProposalDetails } from '@/services/swr/proposal.swr';
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
import { PaymentOrderApprove, CreatePaymentOrder, GetPaymentOrder, EditPaymentOrder } from '@/services/apis/payment-order.api';
import { useProfile } from '@/services/swr/profile.swr';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { formatNumber, formatTime, moneyToNumber, moneyToText } from '@/utils/commons';
import { LIST_STATUS, MONEY } from '@/utils/constants';
import { Upload } from '@/services/apis/upload.api';
import IconX from '@/components/Icon/IconX';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { Loader } from '@mantine/core';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { IRootState } from '@/store';
import Modal from './modal';
interface Props {
    [key: string]: any;
}
const DetailPage = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);

    const [openAssigned, setOpenAssigned] = useState(false);
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
    const [page, setPage] = useState(1);
    const formRef = useRef<any>();
    const [send, SetSend] = useState<any>(false);
    const { data: userData } = useProfile();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [isLoading, setIsLoading] = useState(true);
    const fileRef = useRef<any>();
    const [path, setPath] = useState<any>([]);
    const [dataPath, setDataPath] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [createdId, setCreatedId] = useState();
    useEffect(() => {
        const listPath = path?.filter((item: any) => item !== undefined) ?? []
        setPath([...listPath, dataPath]);        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataPath]);

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

    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_payment_order')}` : (data ? t('update_payment_order') : t('add_payment_order'))));
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
        if (Number(router.query.id)) {
            GetPaymentOrder({ id: router.query.id })
                .then((res) => {
                    setData(res.data);
                    setIsLoading(false);
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        }
    };

    useEffect(() => {
        setInitialValue({
            name: data ? data?.createdBy?.fullName : userData?.data?.fullName,
            position: data ? data?.createdBy?.position?.name : userData?.data?.position?.name,
            department: data ? data?.createdBy?.department?.name : userData?.data?.department?.name,
            requestDate: data ? data?.createdAt : new Date(),
            moneyNumber: data?.moneyNumber ? formatNumber(data?.moneyNumber) : '',
            moneyWord: data ? data?.moneyWord : '',
            content: data ? data?.content : '',
            currentApprover: data?.approvalHistory?.find((his: any) => his.status === 'APPROVED')?.approver?.fullName ?? data?.currentApprover?.fullName,
            moneyUnit: data ? MONEY?.find((e: any) => e.value === data?.moneyUnit) : MONEY[0]
        });
        setPath(data?.attachments);

    }, [data, router]);

    const SubmittedForm = Yup.object().shape({
        moneyNumber: Yup.string()
            .matches(/^[\d,]+$/, `${t('please_fill_valid_number')}`)
            .required(`${t('please_fill_money_number')}`),
        // moneyUnit: Yup.string(),
        content: Yup.string().required(`${t('please_fill_content_payment')}`),
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
        router.push(`/hrm/payment-order?page=${router?.query?.page}&perPage=${router?.query?.perPage}`);
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };

    const handlePaymentOrder = (param: any) => {
        const dataSubmit: any = {
            moneyNumber: moneyToNumber(param.moneyNumber),
            content: param?.content,
            moneyUnit: param.moneyUnit?.value
        }
        if (path) {
            dataSubmit.attachmentIds = path?.map((item: any) => { return (item.id) })
        }
        if (data) {
            EditPaymentOrder({ id: data?.id, ...dataSubmit }).then(res => {
                showMessage(`${t('update_letter_success')}`, 'success');
                router.push(`/hrm/payment-order?page=${router?.query?.page}&perPage=${router?.query?.perPage}`)
            }).catch(err => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            CreatePaymentOrder(dataSubmit).then(res => {
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
        PaymentOrderApprove({ id: router.query.id })
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
                text: `${t('approve')} ${t('payment_order')}`,
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

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: Number(router.query.id) && disable ? 'rgb(235 235 235) !important' : 'white !important',
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            borderColor: Number(router.query.id) && 'rgb(224 230 237 / var(1))',
        }),
    };

    useEffect(() => {
        if (data?.approvalHistory.find((item: any) => Number(item.approverId) === Number(id))) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [data, id]);
    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("payment_order.pdf", `/payment-order/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
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
                    <Link href="/hrm/payment-order" className="text-primary hover:underline">
                        <span>{t('payment_order')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_payment_order') : t('add_payment_order'))}
                        {
                            disable && t('detail_payment_order')
                        }
                    </span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">
                    {!disable && (data ? t('update_payment_order') : t('add_payment_order'))}
                    {disable && t('detail_payment_order')}
                </h1>
                <div className="flex" style={{ alignItems: 'center' }}>
                    {(data?.status !== "DRAFT" && data?.status !== "REJECTED" && data?.status !== "APPROVED") && ((data?.status === "PENDING" || data?.status === "IN_PROGRESS") && userData?.data?.id === data?.currentApprover?.id) &&
                        disable && Number(data?.createdById) !== userData?.data?.id && (
                            <RBACWrapper permissionKey={['paymentOrder:update']} type={'AND'}>
                                <div onClick={() => setOpenAssigned(true)} style={{ marginRight: '-10px' }}>
                                    <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                                </div>
                            </RBACWrapper>
                        )}
                    {disable && data?.status === 'APPROVED' && (
                        <RBACWrapper permissionKey={['paymentOrder:exportTextDraft']} type={'AND'}>
                            <button type="button" className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4" onClick={() => handleExportFile(data?.id)} disabled={loading}>
                                {
                                    loading ? <Loader size="sm" color="#fff" className="rtl:ml-2" /> : <IconNewDownload2 className="ltr:mr-2 rtl:ml-2" />
                                }
                                <span>{t('export_file')}</span>
                            </button>
                        </RBACWrapper>
                    )}
                    {
                        disable && (data?.status === LIST_STATUS.DRAFT || (userData?.data?.id === data?.currentApproverId && data?.status !== LIST_STATUS.APPROVED && data?.status !== LIST_STATUS.REJECTED)) && (
                            <Link href={`/hrm/payment-order/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                                <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('edit')}</button>
                            </Link>
                        )}
                    <Link href={`/hrm/payment-order?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
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
                            {t('payment_order_info')}
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
                                        handlePaymentOrder(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5 p-4">
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
                                                    <Field autoComplete="off" disabled type="text" name="position" id="position" className="form-input"></Field>
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
                                            <div className="flex justify-between gap-5">
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="type" className="label">
                                                        {' '}
                                                        {t('money_number')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <div className="flex">
                                                        <Field
                                                            autoComplete="off"
                                                            name="moneyNumber"
                                                            type="text"
                                                            id="moneyNumber"
                                                            placeholder={`${t('fill_money_number')}`}
                                                            className="form-input ltr:rounded-r-none rtl:rounded-l-none"
                                                            value={formatNumber(moneyToNumber(values?.moneyNumber))}
                                                            disabled={disable}
                                                        />
                                                        <div className="flex items-center justify-center font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0">
                                                            <label className={`relative mb-0 h-4 w-24 ${Number(router.query.id) && 'cursor-pointer'}`}>
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
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {submitCount && errors.moneyNumber ? <div className="mt-1 text-danger"> {`${errors.moneyNumber}`} </div> : null}
                                                </div>
                                                <div className="mb-5 w-1/2">
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
                                                        value={moneyToText(moneyToNumber(values?.moneyNumber), values?.moneyUnit?.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between gap-5">
                                                <div className="mb-5 flex-1">
                                                    <label htmlFor="content" className="label">
                                                        {' '}
                                                        {t('about_expense')} <span style={{ color: 'red' }}>* </span>
                                                    </label>

                                                    <Field
                                                        autoComplete="off"
                                                        name="content"
                                                        as="textarea"
                                                        id="content"
                                                        placeholder={`${t('fill_content')}`}
                                                        className="form-input"
                                                        disabled={disable}

                                                    />
                                                    {submitCount ? errors.content ? <div className="mt-1 text-danger"> {`${errors.content}`} </div> : null : ''}
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
                                {t('Applicant')} {'->'} {t('Department Head/Deputy')} {'->'} {t('Chief Accountant')} {'->'} {t('Director')}
                            </strong>
                        </p>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px' }}>
                        <p style={{ fontStyle: "italic" }}>{t('Note: For employees of the Finance and Accounting Department')}</p>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px', fontStyle: "italic" }}>
                        <p style={{ marginRight: '10px' }}>
                            {t('Order of signing')}:
                        </p>
                        <p>
                            {' '}
                            {t('Applicant')} {'->'} {t('Head/Deputy Head of Finance and Accounting Department')} {'->'} {t('Director')}
                        </p>
                    </div>
                    <div className="flex flex items-center justify-end ltr:text-right rtl:text-left mt-4">
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
                                    {
                                        (data?.status !== "DRAFT" && data?.status !== "REJECTED" && data?.status !== "APPROVED") && ((data?.status === "PENDING" || data?.status === "IN_PROGRESS") && userData?.data?.id === data?.currentApprover?.id) &&
                                        disable && Number(data?.createdById) !== userData?.data?.id &&
                                        <>
                                            <button type="button" className="btn btn-danger cancel-button w-28 ltr:ml-4" onClick={() => handleReject()}>
                                                {t('reject')}
                                            </button>
                                            <button data-testId="submit-approve-btn" type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleApprove()}>
                                                {t('approve')}
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
                                {t('continue_approval')}
                            </button>
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
