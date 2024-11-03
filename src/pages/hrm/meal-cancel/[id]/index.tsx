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
import { DropdownDepartment } from '@/services/swr/dropdown.swr';
import DetailModal from '../modal/DetailModal';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { useProfile } from '@/services/swr/profile.swr';
import { MealCancelDetails } from '@/services/swr/meal-cancel.swr';
import { AddMealCancelDetails, CreateMealCancel, DeleteMealCancelDetail, EditMealCancel, GetMealCancel, MealCancelApprove } from '@/services/apis/meal-cancel.api';
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
import SwitchBtn from '@/pages/warehouse-process/switchBtn';
import { handleReturnFlowApprove } from '@/utils/commons';
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
    const [openAssigned, setOpenAssigned] = useState(false);
    const [submitType, setSubmitType] = useState('');
    const [sign, setSign] = useState(false);
    const [signStatus, setSignStatus] = useState<any>();
    // get data
    const { data: MealCancelDetail, pagination, mutate, isLoading } = MealCancelDetails({ ...query });
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });
    const { data: profile } = useProfile();
    const [loading, setLoading] = useState(false);
    const [loadingState, setLoadingState] = useState({
        isContinueApproval: false,
        isApprove: false,
        isReject: false,
        isSubmit: false,
        isContinueInitial: false
    })
    const TYPE_OF_REPORT = [
        {
            value: 'staff',
            label: t('staff')
        },
        {
            value: 'guest',
            label: t('guest')
        }
    ]
    const TYPE_OF_MEAL = [
        {
            value: 'breakfast',
            label: t('breakfast')
        },
        {
            value: 'lunch',
            label: t('lunch')
        },
        {
            value: 'dinner',
            label: t('dinner')
        },
        {
            value: 'fullDay',
            label: t('fullDay')
        }
    ]
    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("meal_cancel.pdf", `/meal-cancel/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_meal_cancel')}` : (data ? t('update_meal_cancel') : t('add_meal_cancel'))));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(MealCancelDetail?.data);
        }
    }, [MealCancelDetail?.data, router]);

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
        GetMealCancel({ id: router.query.id })
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
            position: data ? data?.createdBy?.position?.name : userData?.data?.position?.name,
            personReport: data?.createdBy ? data?.createdBy.fullName : JSON.parse(localStorage.getItem('profile') || '').fullName,
            requestDate: data ? data?.createdAt : new Date(),
            currentApprover: data?.currentApprover ? data?.currentApprover.fullName : '',
            startDay: data?.startDay ? data?.startDay : '',
            endDay: data?.endDay ? data?.endDay : '',
            note: data?.note ? data?.note : '',
            meal: data?.meal ? data?.meal.map((item: any) => {
                return returnMealOption(item)
            }) : ''
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, router]);

    const returnMealOption = (data: any) => {
        switch (data) {
            case 1:
                return {
                    value: 0,
                    label: 'Buổi sáng'
                }
            case 2:
                return {
                    value: 0,
                    label: 'Buổi trưa'
                }
            case 3:
                return {
                    value: 0,
                    label: 'Buổi chiều'
                }
            default:
                return {
                    value: 0,
                    label: 'Cả ngày'
                }
        }
    }

    const SubmittedForm = Yup.object().shape({
        departmentId: new Yup.ObjectSchema().required(`${t('please_fill_department')}`),
    });

    const handleEdit = (data: any) => {
        setDataDetail(data);
        setOpenModal(true);
    };

    const handleDelete = ({ id, annunciator }: any) => {
        // if (listDataDetail?.length === 1) {
        //     showMessage(`${t('list_detail_can_not_be_empty')}`, 'error');
        //     return;
        // }
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
                title: `${t('delete_annunciator')}`,
                text: `${t('delete')} ${annunciator?.name}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    if (Number(router.query.id)) {
                        DeleteMealCancelDetail({ id: router.query.id, detailId: id })
                            .then(() => {
                                mutate();
                                showMessage(`${t('delete_annunciator_success')}`, 'success');
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
        router.push(`/hrm/meal-cancel`);
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };

    const handleMealCancel = (param: any) => {
        const query: any = {
            startDay: param.startDay,
            endDay: param.endDay,
            note: param.note,
            meal: param.meal.map((item: any) => item.value),
        };

        if (data) {
            EditMealCancel({ id: data?.id, ...query })
                .then((res) => {
                    showMessage(`${t('edit_success')}`, 'success');
                    handleCancel();
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        } else {
            CreateMealCancel(query)
                .then((res) => {
                    setCreatedId(res.data.id);
                    // handleDetail(res.data.id);
                    if (router.query.id === 'create' && send === true) {
                        showMessage(`${t('save_success')}`, 'success');
                        setId(res.data.createdById);
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
        AddMealCancelDetails({
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
        MealCancelApprove({ id: router.query.id, sign: 3 }).then(() => {
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
                text: `${t('approve')} ${t('meal_cancel')}`,
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        const lang = localStorage.getItem('i18nextLng');
        let urlString
        switch (lang) {
            case "vi":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/meal_cancel/meal_cancel_vi.xlsx`;
                break;
            case "la":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/meal_cancel/meal_cancel_la.xlsx`;
                break;
            case "en":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/meal_cancel/meal_cancel_en.xlsx`;
                break;
            default:
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/meal_cancel/meal_cancel_vi.xlsx`;
                break;
        }
        const link = document.createElement('a');
        link.href = urlString;
        link.setAttribute('download', 'meal_cancel.xlsx');
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
                        numberOfBreakfast: item[2],
                        numberOfLunches: item[3],
                        numberOfDinners: item[4],
                        daysIssued: item[5],
                    });
                }
            });
            setListDataDetail((prev) => ([...prev, ...jsonData]));
        };
        reader.readAsArrayBuffer(file);
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

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
                    <Link href="/hrm/meal-cancel" className="text-primary hover:underline">
                        <span>{t('meal_cancel')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_meal_cancel') : t('add_meal_cancel'))}
                        {
                            disable && t('detail_meal_cancel')
                        }
                    </span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">
                    {!disable && (data ? t('update_meal_cancel') : t('add_meal_cancel'))}
                    {disable && t('detail_meal_cancel')}
                </h1>
                <div className="flex" style={{ alignItems: 'center' }}>
                    {/* {data?.status !== 'DRAFT' &&
                        data?.status !== 'REJECTED' &&
                        data?.status !== 'APPROVED' &&
                        (data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') &&
                        userData?.data?.id === data?.currentApprover?.id &&
                        disable &&
                        Number(data?.createdById) !== userData?.data?.id && (
                            <RBACWrapper permissionKey={['riceCoupon:update']} type={'AND'}>
                                <div onClick={() => setOpenAssigned(true)} style={{ marginRight: '-10px' }}>
                                    <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('assigned')}</button>
                                </div>
                            </RBACWrapper>
                        )}
                    {disable && data?.status === 'APPROVED' && (
                        <RBACWrapper permissionKey={['riceCoupon:exportTextDraft']} type={'AND'}>
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
                            <Link href={`/hrm/meal-cancel/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                                <button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('edit')}</button>
                            </Link>
                        )} */}
                    <Link href={`/hrm/meal-cancel`}>
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
                            {t('meal_cancel_infomation')}
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
                                        handleMealCancel(values);
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
                                                        <label htmlFor="startDay" className='label'>
                                                            {t('startDate')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            name='startDay'
                                                            disabled={disable}
                                                            options={{
                                                                enableTime: false,
                                                                dateFormat: "d-m-Y",
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                minDate: disable ? "" : Number(moment().format('HH')) >= Number(moment(values?.startDay).format('HH')) ? "" : Number(moment().format('HH')) >= 10 ? tomorrow : new Date,
                                                            }}
                                                            value={dayjs(values?.startDay).format('DD-MM-YYYY')}
                                                            className="form-input calender-input"
                                                            onChange={e => {
                                                                setFieldValue('startDay', e[0])
                                                            }}
                                                        />
                                                        {submitCount ? errors.startDay ? <div className="mt-1 text-danger"> {`${errors.startDay}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="endDay" className='label'>
                                                            {t('endDate')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            name='endDay'
                                                            disabled={disable}
                                                            options={{
                                                                enableTime: false,
                                                                dateFormat: "d-m-Y",
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                minDate: disable ? "" : Number(moment().format('HH')) >= Number(moment(values?.endDay).format('HH')) ? "" : Number(moment().format('HH')) >= 10 ? tomorrow : new Date,
                                                            }}
                                                            value={dayjs(values?.endDay).format('DD-MM-YYYY')}
                                                            className="form-input calender-input"
                                                            onChange={e => setFieldValue('endDay', e[0])}
                                                        />
                                                        {submitCount ? errors.endDay ? <div className="mt-1 text-danger"> {`${errors.endDay}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="flex gap-5">
                                                    <div className='w-1/2'>
                                                        <label htmlFor="note" className='label'>
                                                            {t('Bữa ăn')}
                                                        </label>
                                                        <Select
                                                            id='meal'
                                                            name='meal'
                                                            options={[
                                                                {
                                                                    label: 'Cả ngày',
                                                                    value: 0
                                                                },
                                                                {
                                                                    label: 'Buổi sáng',
                                                                    value: 1
                                                                },
                                                                {
                                                                    label: 'Buổi trưa',
                                                                    value: 2
                                                                },
                                                                {
                                                                    label: 'Buổi chiều',
                                                                    value: 3
                                                                }
                                                            ]}
                                                            isDisabled={disable}
                                                            maxMenuHeight={160}
                                                            value={values?.meal}
                                                            isMulti
                                                            onChange={e => {
                                                                setFieldValue('meal', e)
                                                            }}
                                                        />
                                                    </div>
                                                    <div className='w-1/2'>
                                                        <label htmlFor="note" className='label'>
                                                            {t('note')}
                                                        </label>
                                                        <Field autoComplete="off" disabled={disable} as='textarea' name="note" id="note" className="form-input" />
                                                    </div>

                                                </div>
                                            </div>
                                            {/* {<RenturnError errors={errors} submitCount={submitCount} />} */}
                                        </Form>
                                    )}
                                </Formik>
                            </AnimateHeight>
                        </div>
                    </div>
                    {
                        (router?.query?.id === "create" || (router?.query?.id !== "create" && data)) &&
                        <ApprovalModal
                            openModal={openModalApproval}
                            setOpenModal={setOpenModalApproval}
                            handleData={handleData}
                            data={data}
                            handleCancel={handleCancel}
                            id={id}
                            departmentId={data?.createdBy?.department?.id ?? userData?.data?.department?.id}
                            createdId={createdId}
                            submitType={submitType}
                            sign={sign}
                        />
                    }
                    <RejectModal openModal={openModalReject} setOpenModal={setOpenModalReject} handleCancel={handleCancel} />
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
                </div>
                <SwitchBtn
                    entity={'meal-cancel'}
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
            <Modal open={openAssigned} id={router.query.id} handleData={handleData} setOpen={setOpenAssigned}></Modal>
        </div>
    );
};
export default DetailPage;
