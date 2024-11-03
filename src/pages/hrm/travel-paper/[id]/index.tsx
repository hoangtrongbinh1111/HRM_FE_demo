import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { AddTravelPaperDetails, CreateTravelPaper, DeleteTravelPaperDetail, EditTravelPaper, GetTravelPaper, TravelPaperApprove } from '@/services/apis/travel-paper.api';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { TravelPaperDetails } from '@/services/swr/travel-paper.swr';
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
import { DropdownDepartment, DropdownWarehouses } from '@/services/swr/dropdown.swr';
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
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
import { Loader } from '@mantine/core';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import Modal from './modal';
import ExcelJS from "exceljs"
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
    const [warehouseId, setWarehouseId] = useState<any>();
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
    const { data: userData } = useProfile();

    const [openAssigned, setOpenAssigned] = useState(false);
    // get data
    // const { data: TravelPaperDetail, pagination, mutate, isLoading } = TravelPaperDetails({ ...query });
    const { data: warehouseDropdown, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({ page: 1 });
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });
    const [loading, setLoading] = useState(false);

    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("travel_paper.pdf", `/travel-paper/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_travel_paper')}` : (data ? t('update_travel_paper') : t('add_travel_paper'))));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setQuery({ id: router.query.id, ...router.query });
            handleData();
        }
        if (typeof window !== 'undefined') {
            setId(Number(localStorage.getItem('idUser')));
            setIsHigh(localStorage.getItem('isHighestPosition'));
        }

        setDisable(router.query.status === 'true' ? true : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const handleData = () => {
        GetTravelPaper({ id: router.query.id })
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
            startDay: data ? data?.startDay : "",
            endDay: data ? data?.endDay : "",
            reason: data?.reason ?? '',
            currentApprover: data?.approvalHistory?.find((his: any) => his.status === 'APPROVED')?.approver?.fullName ?? data?.currentApprover?.fullName,
            address: data?.address ?? '',
            passportNumber: data ? data?.createdBy?.passportNumber : userData?.data?.passportNumber,
            countDay: 0,
        });
    }, [data, userData]);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string(),
        position: Yup.string(),
        department: Yup.string(),
        requestDate: Yup.string().required(`${t('please_choose_submit_day')}`),
        startDay: Yup.date().required(`${t('please_choose_from_day')}`),
        endDay: Yup.date()
            .required(`${t('please_choose_end_day')}`)
            .when('startDay', (startDay, schema) => {
                return startDay && schema.min(startDay, `${t('endtime_must_after_starttime')}`);
            }),
        reason: Yup.string().required(`${t('please_fill_reason')}`),
        address: Yup.string().required(`${t('please_fill_address')}`),
    });
    const handleEdit = (data: any) => {
        setDataDetail(data);
        setOpenModal(true);
    };

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
        router.push(`/hrm/travel-paper`);
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };
    const handleTravelPaper = (param: any) => {
        const query: any = {
            reason: param?.reason,
            startDay: dayjs(param.startDay).format('YYYY-MM-DD'),
            endDay: dayjs(param.endDay).format('YYYY-MM-DD'),
            departmentId: props?.data ? props.data.departmentId : userData?.department?.id,
            address: param.address,
        };

        if (data) {
            EditTravelPaper({ id: data?.id, ...query })
                .then((res) => {
                    showMessage(`${t('edit_success')}`, 'success');
                    handleCancel();
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        } else {
            CreateTravelPaper(query)
                .then((res) => {
                    setCreatedId(res.data.id);
                    // handleDetail(res.data.id);
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

    // const RenturnError = (param: any) => {
    //     if (Object.keys(param?.errors || {}).length > 0 && param?.submitCount > 0) {
    //         showMessage(`${t('please_add_infomation')}`, 'error');
    //     }
    //     return <></>;
    // };

    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data);
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationDepartment]);


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
        TravelPaperApprove({ id: router.query.id })
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
                text: `${t('approve')} ${t('travel_paper')}`,
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

    const handleCloseApproval = () => {
        setOpenModalApproval(false);
    };
    const CalculateDaysDifference = (startDay: any, endDay: any) => {
        const momentStartDay = moment(startDay, 'YYYY-MM-DD').startOf('day');
        const momentEndDay = moment(endDay, 'YYYY-MM-DD').startOf('day');
        const daysDifference = momentEndDay.diff(momentStartDay, 'days') + 1;
        return daysDifference;
    };
    const handleDownloadTemplate = () => {
        const lang = localStorage.getItem('i18nextLng');
        let urlString
        switch (lang) {
            case "vi":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/travel_paper/travel_paper_vi.xlsx`;
                break;
            case "la":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/travel_paper/travel_paper_la.xlsx`;
                break;
            case "en":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/travel_paper/travel_paper_en.xlsx`;
                break;
            default:
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/travel_paper/travel_paper_vi.xlsx`;
                break;
        }
        const link = document.createElement('a');
        link.href = urlString;
        link.setAttribute('download', 'travel_paper.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div>
            {isLoadingDepartment && (
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
                    <Link href="/hrm/travel-paper" className="text-primary hover:underline">
                        <span>{t('travel_paper')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_travel_paper') : t('add_travel_paper'))}
                        {
                            disable && t('detail_travel_paper')
                        }
                    </span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">
                    {!disable && (data ? t('update_travel_paper') : t('add_travel_paper'))}
                    {disable && t('detail_travel_paper')}
                </h1>
                <div className="flex" style={{ alignItems: 'center' }}>
                    {/* {data?.status !== 'DRAFT' &&
                        data?.status !== 'REJECTED' &&
                        data?.status !== 'APPROVED' &&
                        (data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') &&
                        userData?.data?.id === data?.currentApprover?.id &&
                        disable &&
                        Number(data?.createdById) !== userData?.data?.id && (
                            <RBACWrapper permissionKey={['travelPaper:update']} type={'AND'}>
                                <div onClick={() => setOpenAssigned(true)} style={{ marginRight: '-10px' }}>
                                    <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                                </div>
                            </RBACWrapper>
                        )}
                    {disable && data?.status === 'APPROVED' && (
                        <RBACWrapper permissionKey={['travelPaper:exportTextDraft']} type={'AND'}>
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
                            <Link href={`/hrm/travel-paper/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                                <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('edit')}</button>
                            </Link>
                        )} */}
                    <Link href={`/hrm/travel-paper`}>
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
                            {t('travel_paper_information')}
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
                                        handleTravelPaper(values);
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
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="passportNumber" className="label">
                                                            {' '}
                                                            {t('passportNumber')}
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            type="text"
                                                            name="passportNumber"
                                                            id="passportNumber"
                                                            disabled
                                                            placeholder={`${t('fill_passportNumber')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount ? errors.passportNumber ? <div className="mt-1 text-danger"> {`${errors.passportNumber}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="mb-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="requestDate" className="label">
                                                            {' '}
                                                            {t('submitday')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            name="requestDate"
                                                            disabled
                                                            options={{
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                enableTime: false,
                                                                dateFormat: 'd-m-Y',
                                                            }}
                                                            value={dayjs(values?.requestDate).format('DD-MM-YYYY')}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('choose_submit_day')}`}
                                                        />
                                                        {submitCount ? errors.requestDate ? <div className="mt-1 text-danger"> {`${errors.requestDate}`} </div> : null : ''}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="startDay" className="label">
                                                            {' '}
                                                            {t('register_from_date')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="startDay"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    // data-enable-time
                                                                    options={{
                                                                        locale: {
                                                                            ...chosenLocale,
                                                                        },
                                                                        // enableTime: true,
                                                                        dateFormat: 'd-m-Y',
                                                                        // time_24hr: true,
                                                                        minDate: disable ? "" : Number(moment().format('HH')) >= Number(moment(values?.startDay).format('HH')) ? "" : new Date,
                                                                    }}
                                                                    disabled={disable}
                                                                    value={dayjs(values?.startDay).format('DD-MM-YYYY')}
                                                                    onChange={(e: any) => {
                                                                        setFieldValue('startDay', e[0]);
                                                                    }}
                                                                    className="calender-input form-input"
                                                                    placeholder={`${t('choose_register_start_date')}`}
                                                                />
                                                            )}
                                                        />

                                                        {submitCount ? errors.startDay ? <div className="mt-1 text-danger"> {`${errors.startDay}`} </div> : null : ''}
                                                        {submitCount ? (
                                                            dayjs(values?.startDay).isAfter(values.startDay) ? (
                                                                <div className="mt-1 text-danger"> {`${t('starttime_must_before_endtime')}`} </div>
                                                            ) : null
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mb-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="endDay" className="label">
                                                            {' '}
                                                            {t('register_end_date')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="endDay"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    disabled={disable}
                                                                    // data-enable-time
                                                                    options={{
                                                                        locale: {
                                                                            ...chosenLocale,
                                                                        },
                                                                        // enableTime: true,
                                                                        dateFormat: 'd-m-Y',
                                                                        // time_24hr: true,
                                                                        minDate: disable ? "" : Number(moment().format('HH')) >= Number(moment(values?.endDay).format('HH')) ? "" : new Date,
                                                                    }}
                                                                    value={dayjs(values?.endDay).format('DD-MM-YYYY')}
                                                                    onChange={(e: any) => {
                                                                        setFieldValue('endDay', e[0]);
                                                                    }}
                                                                    className="calender-input form-input"
                                                                    placeholder={`${t('choose_register_end_date')}`}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount ? errors.endDay ? <div className="mt-1 text-danger"> {`${errors.endDay}`} </div> : null : ''}
                                                        {submitCount ? (
                                                            dayjs(values?.startDay).isAfter(values.startDay) ? (
                                                                <div className="mt-1 text-danger"> {`${t('endtime_must_after_starttime')}`} </div>
                                                            ) : null
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="countDay" className="label">
                                                            {' '}
                                                            {t('countDay')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            type="number"
                                                            name="countDay"
                                                            id="countDay"
                                                            value={CalculateDaysDifference(values?.startDay, values?.endDay)}
                                                            disabled={disable}
                                                            placeholder={`${t('fill_countDay')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount ? errors.countDay ? <div className="mt-1 text-danger"> {`${errors.countDay}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="mb-5 flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="reason" className="label">
                                                            {' '}
                                                            {t('reason')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            as="textarea"
                                                            name="reason"
                                                            id="reason"
                                                            disabled={disable}
                                                            placeholder={`${t('fill_reason')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount ? errors.reason ? <div className="mt-1 text-danger"> {`${errors.reason}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="address" className="label">
                                                            {' '}
                                                            {t('Sent on a business trip to')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            as="textarea"
                                                            name="address"
                                                            id="address"
                                                            disabled={disable}
                                                            placeholder={`${t('fill_address')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount ? errors.address ? <div className="mt-1 text-danger"> {`${errors.address}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                {router.query.id !== 'create' && data?.status !== 'APPROVED' && data?.status !== 'DRAFT' && (
                                                    <div className="mt-5">
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
                                            </div>
                                            {/* {<RenturnError errors={errors} submitCount={submitCount} />} */}
                                        </Form>
                                    )}
                                </Formik>
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
                        entity={'travel-paper'}
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
