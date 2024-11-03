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
import dayjs from 'dayjs';
import IconPlus from '@/components/Icon/IconPlus';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import AnimateHeight from 'react-animate-height';
import Link from 'next/link';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Select, { components } from 'react-select';
import IconBack from '@/components/Icon/IconBack';
import { DropdownDepartment, DropdownGuestType } from '@/services/swr/dropdown.swr';
import DetailModal from '../modal/DetailModal';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { useProfile } from '@/services/swr/profile.swr';
import { GuestNoticeDetails } from '@/services/swr/guest-notice.swr';
import { AddGuestNoticeDetails, CreateGuestNotice, DeleteGuestNoticeDetail, EditGuestNotice, GetGuestNotice, GuestNoticeApprove } from '@/services/apis/guest-notice.api';
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
import Modal from './modal';
import ExcelJS from "exceljs";
import IconNewDownload3 from '@/components/Icon/IconNewDownload3';
import IconImportFile2 from '@/components/Icon/IconImportFile2';
import IconX from '@/components/Icon/IconX';
import { Upload } from '@/services/apis/upload.api';
import SwitchBtn from '@/pages/warehouse-process/switchBtn';
interface Props {
    [key: string]: any;
}



const DetailPage = ({ ...props }: Props) => {
    const fileRef = useRef<any>();
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
    const [dataGuestType, setDataGuestType] = useState<any>([]);
    const formRef = useRef<any>();
    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [send, SetSend] = useState<any>(false);
    const [departmentId, setDepartmentId] = useState<any>();
    const [createdId, setCreatedId] = useState();
    const { data: userData } = useProfile();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [openAssigned, setOpenAssigned] = useState(false);
    const [submitType, setSubmitType] = useState('');
    const [sign, setSign] = useState<any>();
    const [signStatus, setSignStatus] = useState<any>();
    // get data
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });
    const { data: dropdownGuestType, pagination: paginationGuestType, mutate: mutateGuestType, isLoading: isLoadingGuestType } = DropdownGuestType({ page: page });
    const { data: profile } = useProfile();
    const [loading, setLoading] = useState(false);

    const [loadingState, setLoadingState] = useState({
        isContinueApproval: false,
        isApprove: false,
        isReject: false,
        isSubmit: false,
        isContinueInitial: false
    })
    const [path, setPath] = useState<any>([]);
    const [dataPath, setDataPath] = useState<any>();

    // useEffect(() => {
    //     const listPath = path?.filter((item: any) => item !== undefined) ?? []
    //     setPath([...listPath, dataPath]);
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [dataPath]);

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

    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("guest_notice.pdf", `/guest-notice/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_guest_notice')}` : (data ? t('update_guest_notice') : t('add_guest_notice'))));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            handleData();
            setQuery({ id: router.query.id, ...router.query });
        }
        if (typeof window !== 'undefined') {
            // setId(Number(localStorage.getItem('idUser')));
            setIsHigh(localStorage.getItem('isHighestPosition'));
        }

        setDisable(router.query.status === 'true' ? true : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const handleData = () => {
        GetGuestNotice({ id: router.query.id })
            .then((res) => {
                setData(res.data);
                setPath(res.data.attachments)
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
    };

    useEffect(() => {
        setInitialValue({
            department: data ? data?.createdBy?.department?.name : userData?.data?.department?.name,
            position: data ? data?.createdBy?.position?.name : userData?.data?.position?.name,
            personReport: data?.createdBy ? data?.createdBy.fullName : JSON.parse(localStorage.getItem('profile') || '').fullName,
            requestDate: data ? data?.createdAt : new Date(),
            guestName: data?.guestName ? data?.guestName : "",
            guestTypeId: data?.guestType ? {
                value: data?.guestType.id,
                label: data?.guestType.name,
            } : "",
            startDate: data?.startDate ? data?.startDate : '',
            endDate: data?.endDate ? data?.endDate : '',
            content: data?.content ? data?.content : '',
            quantity: data?.quantity ? data?.quantity : '',
            guestHouse: data?.guestHouse !== null && data?.guestHouse !== undefined ? data?.guestHouse === true ? {
                value: true,
                label: 'Có',
            } : {
                value: false,
                label: 'Không',
            } : '',
            requestShuttle: data?.requestShuttle !== null && data?.requestShuttle !== undefined ? data?.requestShuttle === true ? {
                value: true,
                label: 'Có',
            } : {
                value: false,
                label: 'Không',
            } : '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, router]);

    const SubmittedForm = Yup.object().shape({});


    const handleReturnFlowApprove = (action: any, sign: number) => {
        switch (action) {
            case "FORWARD":
            case "SUBMIT":
            case "SUBMIT_RETURN":
            case "FORWARD_RETURN":
                return sign === 2 ? `${t('continue_approval')}` : `${t('continue_initial')}`;
            case "REJECT":
                return `${t('reject')}`
            case "APPROVE":
                return `${t('approve')}`
            case "REJECT_RETURN":
                return `${t('reject_return')}`
            case "APPROVE_RETURN":
                return `${t('approve_return')}`
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
        router.push(`/hrm/guest-notice`);
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };

    const handleGuestNotice = (param: any) => {
        const query: any = {
            ...param,
            guestTypeId: Number(param?.guestTypeId?.value),
            guestHouse: param?.guestHouse?.value,
            requestShuttle: param?.requestShuttle?.value,
            attachmentIds: path.length > 0 ? path.map((item: any) => { return item.id }) : []
        };

        if (data) {
            EditGuestNotice({ id: data?.id, ...query })
                .then((res) => {
                    showMessage(`${t('edit_success')}`, 'success');
                    handleCancel();
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        } else {
            CreateGuestNotice(query)
                .then((res) => {
                    setCreatedId(res.data.id);
                    if (router.query.id === 'create' && send === true) {
                        showMessage(`${t('save_success')}`, 'success');
                        setId(res?.data?.createdById);
                        setOpenModalApproval(true);
                    } else {
                        showMessage(`${t('save_draf_success')}`, 'success');
                        handleCancel();
                    }
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message[0].error}`, 'error');
                });
        }
    };

    const handleDetail = (id: any) => {
        AddGuestNoticeDetails({
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

    useEffect(() => {
        if (paginationGuestType?.page === undefined) return;
        if (paginationGuestType?.page === 1) {
            setDataGuestType(dropdownGuestType?.data);
        } else {
            setDataGuestType([...dataGuestType, ...dropdownGuestType?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationGuestType]);

    const handleMenuScrollToBottomGuest = () => {
        setTimeout(() => {
            setPage(paginationGuestType?.page + 1);
        }, 1000);
    };

    const [btnRule, setBtnRule] = useState(false);

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
        setLoadingState({
            ...loadingState,
            isApprove: true
        });
        GuestNoticeApprove({ id: router.query.id, sign: 3 }).then(() => {
            handleCancel();
            showMessage(`${t('approve_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        }).finally(() => {
            setLoadingState({
                ...loadingState,
                isApprove: false
            });
        });
    }

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
                text: `${t('approve')} ${t('guest_notice')}`,
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
            {isLoadingGuestType && (
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
                    <Link href="/hrm/guest-notice" className="text-primary hover:underline">
                        <span>{t('guest_notice')}</span>
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_guest_notice') : t('add_guest_notice'))}
                        {
                            disable && t('detail_guest_notice')
                        }
                    </span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">
                    {!disable && (data ? t('update_guest_notice') : t('add_guest_notice'))}
                    {disable && t('detail_guest_notice')}
                </h1>
                <div className="flex" style={{ alignItems: 'center' }}>
                    <Link href={`/hrm/guest-notice`}>
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
                            {t('guest_notice_infomation')}
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
                                        handleGuestNotice(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5">
                                            <div className="p-4">
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="personReport" className="label">
                                                            {' '}
                                                            {t('person_report')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="personReport"
                                                            type="text"
                                                            id="personReport"
                                                            placeholder={`${t('enter_code')}`}
                                                            className={true ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={true}
                                                        />
                                                        {submitCount && errors.personReport ? <div className="mt-1 text-danger"> {`${errors.personReport}`} </div> : null}
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
                                                            {t('work_department')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="department" id="department" className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="requestDate" className='label'>
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
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="guestName" className="label">
                                                            {t('guestName')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="guestName"
                                                            type="text"
                                                            id="guestName"
                                                            className={disable ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.guestName ? <div className="mt-1 text-danger"> {`${errors.guestName}`} </div> : null}
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="guestTypeId" className='label'>
                                                            {t('typeOfGuest')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Select
                                                            id="guestTypeId"
                                                            name="guestTypeId"
                                                            isDisabled={disable}
                                                            options={dataGuestType}
                                                            maxMenuHeight={160}
                                                            value={values?.guestTypeId}
                                                            onMenuOpen={() => setPage(1)}
                                                            onMenuScrollToBottom={handleMenuScrollToBottomGuest}
                                                            isLoading={isLoadingGuestType}
                                                            placeholder={t('choose_department')}
                                                            onChange={(e) => {
                                                                setFieldValue('guestTypeId', e);
                                                            }}
                                                        />
                                                        {submitCount && errors.guestTypeId ? <div className="mt-1 text-danger"> {`${errors.guestTypeId}`} </div> : null}
                                                    </div>
                                                </div>
                                                <div className="mt-5 flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="startDate" className="label">
                                                            {t('startDate')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            name="startDate"
                                                            disabled={disable}
                                                            options={{
                                                                enableTime: false,
                                                                dateFormat: 'd-m-Y',
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                minDate: disable ? "" : Number(moment().format('HH')) >= Number(moment(values?.startDate).format('HH')) ? "" : new Date,
                                                            }}
                                                            value={dayjs(values?.startDate).format('DD-MM-YYYY')}
                                                            className="calender-input form-input"
                                                            onChange={e => setFieldValue('startDate', e[0])}
                                                        />
                                                        {submitCount ? errors.startDate ? <div className="mt-1 text-danger"> {`${errors.startDate}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="endDate" className="label">
                                                            {t('endDate')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            name="endDate"
                                                            disabled={disable}
                                                            options={{
                                                                enableTime: false,
                                                                dateFormat: 'd-m-Y',
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                minDate: disable ? "" : Number(moment().format('HH')) >= Number(moment(values?.endDate).format('HH')) ? "" : new Date,
                                                            }}
                                                            value={dayjs(values?.endDate).format('DD-MM-YYYY')}
                                                            className="calender-input form-input"
                                                            onChange={e => setFieldValue('endDate', e[0])}
                                                        />
                                                        {submitCount ? errors.endDate ? <div className="mt-1 text-danger"> {`${errors.endDate}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="guestHouse" className="label">
                                                            {t('Nhà ở')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Select
                                                            id="guestHouse"
                                                            name="guestHouse"
                                                            isDisabled={disable}
                                                            options={[{ value: true, label: t('Có') }, { value: false, label: t('không') }]}
                                                            maxMenuHeight={160}
                                                            value={values?.guestHouse}
                                                            onChange={(e) => {
                                                                setFieldValue('guestHouse', e);
                                                            }}
                                                        />
                                                        {submitCount && errors.guestHouse ? <div className="mt-1 text-danger"> {`${errors.guestHouse}`} </div> : null}
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="requestShuttle" className='label'>
                                                            {t('Xe đưa đón')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Select
                                                            id="requestShuttle"
                                                            name="requestShuttle"
                                                            isDisabled={disable}
                                                            options={[{ value: true, label: t('Có') }, { value: false, label: t('không') }]}
                                                            maxMenuHeight={160}
                                                            value={values?.requestShuttle}
                                                            onChange={(e) => {
                                                                setFieldValue('requestShuttle', e);
                                                            }}
                                                        />
                                                        {submitCount && errors.requestShuttle ? <div className="mt-1 text-danger"> {`${errors.requestShuttle}`} </div> : null}
                                                    </div>
                                                </div>
                                                <div className="mt-5 flex justify-between gap-5">
                                                    <div className=" w-1/2">
                                                        <label htmlFor="quantity" className="label">
                                                            {t('quantity')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="quantity"
                                                            type="number"
                                                            id="quantity"
                                                            className={disable ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.quantity ? <div className="mt-1 text-danger"> {`${errors.quantity}`} </div> : null}
                                                    </div>
                                                    <div className=" w-1/2">
                                                        <label htmlFor="content" className="label">
                                                            {t('content')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="content"
                                                            as='textarea'
                                                            id="content"
                                                            className={disable ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.content ? <div className="mt-1 text-danger"> {`${errors.content}`} </div> : null}

                                                    </div>
                                                </div>
                                                {/* <div className="mb-5 w-1/2">
                                                    <label htmlFor="guestTypeId" className='label'>
                                                        {t('Chọn bếp')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Select
                                                        id="guestTypeId"
                                                        name="guestTypeId"
                                                        options={dataDepartment}
                                                        maxMenuHeight={160}
                                                        value={values?.guestTypeId}
                                                        onMenuOpen={() => setPage(1)}
                                                        onMenuScrollToBottom={handleMenuScrollToBottom}
                                                        isLoading={isLoadingDepartment}
                                                        placeholder={t('choose_department')}
                                                        onInputChange={(e) => setSearchDepartment(e)}
                                                        onChange={(e) => {
                                                            setDepartmentId(e.value);
                                                            setFieldValue('guestTypeId', e);
                                                        }}
                                                    // isDisabled={!isNaN(Number(router.query.id))}
                                                    />
                                                    {submitCount && errors.guestTypeId ? <div className="mt-1 text-danger"> {`${errors.guestTypeId}`} </div> : null}
                                                </div> */}
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
                                                                                <Link
                                                                                    key={index}
                                                                                    title="xem chi tiết"
                                                                                    href={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} target="_blank" className='ml-5 d-block' style={{ color: 'blue' }}>{item?.name}</Link>
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
                    <ApprovalModal
                        openModal={openModalApproval}
                        setOpenModal={setOpenModalApproval}
                        handleData={handleData}
                        data={data}
                        handleCancel={handleCancel}
                        id={createdId}
                        sign={sign}
                        btnRule={btnRule}
                    />
                    <RejectModal
                        openModal={openModalReject}
                        setOpenModal={setOpenModalReject}
                        handleCancel={handleCancel}
                    />
                    {/* <div style={{ display: 'flex', marginTop: '10px' }}>
                        <p style={{ marginRight: '10px' }}>
                            <strong>{t('Order of signing')}:</strong>
                        </p>
                        <p>
                            <strong>
                                {t('Applicant')} {'->'} {t('Department Head/Deputy')}
                            </strong>
                        </p>
                    </div> */}
                    <SwitchBtn
                        entity={'guest-notice'}
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
