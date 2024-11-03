import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { readExcelFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import { WarehousingBillDetail } from '@/services/swr/warehousing-bill.swr';
import { Field, Form, Formik } from 'formik';
import AnimateHeight from 'react-animate-height';
import Select from 'react-select';
import * as Yup from 'yup';
import IconBackward from '@/components/Icon/IconBackward';
import Link from 'next/link';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import moment from 'moment';
import Swal from 'sweetalert2';
import TallyModal from '../../TallyModal';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { useProfile } from '@/services/swr/profile.swr';
import SwitchBtn from '@/pages/warehouse-process/switchBtn';
import IconCircleCheck from '@/components/Icon/IconCircleCheck';
import { CreateWarehousingBillReturn, EditWarehousingBillReturn, GetWarehousingBillReturn, GetWarehousingBillReturnByCode, TallyReturn, WarehousingBillApproveReturn, WarehousingBillFinishReturn } from '@/services/apis/warehousing-bill-return.api';
import { DropdownWarehouses, WarehousingBill } from '@/services/swr/dropdown.swr';

interface Props {
    [key: string]: any;
}

const ExportPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [disable, setDisable] = useState<any>(false);
    const [data, setData] = useState<any>();
    const [dataDetail, setDataDetail] = useState<any>();
    const [listDataDetail, setListDataDetail] = useState<any>([]);
    const [openModalTally, setOpenModalTally] = useState(false);
    const [query, setQuery] = useState<any>();
    const [queryWarehousingBill, setQueryWarehousingBill] = useState<any>();
    const formRef = useRef<any>();
    const [openModalApproval, setOpenModalApproval] = useState(false);
    const [openModalReject, setOpenModalReject] = useState(false);
    const [sign, setSign] = useState();
    const [btnRule, setBtnRule] = useState(false);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const { data: userData } = useProfile();
    const [initialValue, setInitialValue] = useState<any>();
    const [initialReturn, setInitialReturn] = useState<any>({
        warehouseId: '',
        code: '',
        reason: ''
    });
    const [active, setActive] = useState<any>([1, 2]);
    const [entity, setEntity] = useState<any>("");
    const [id, setId] = useState<any>(0);
    const [dataWarehousingBill, setDataWarehousingBill] = useState<any>([]);
    const [pageWb, setPageWb] = useState(1);
    const [searchWb, setSearchWb] = useState<any>();
    const [dataWarehouseDropdown, setDataWarehouseDropdown] = useState<any>([]);
    const [pageWarehouse, setPageWarehouse] = useState(1);
    const [warehouseId, SetWarehouseId] = useState<any>();


    const SubmittedForm = Yup.object().shape({
        code: new Yup.ObjectSchema().required(`${t('please_fill_code')}`),
        reasonReturn: Yup.string().required(`${t('please_fill_reason')}`),
    });

    const { data: warehousingBillDetail, pagination, mutate, isLoading } = WarehousingBillDetail({ ...query, perPage: 0 });
    const { data: warehousingBill, pagination: warehousingBillPn, isLoading: warehousingBillLd } = WarehousingBill({ ...queryWarehousingBill, page: pageWb, status: "COMPLETED", search: searchWb, warehouseId: warehouseId });
    const { data: warehouses, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({ page: pageWarehouse });

    useEffect(() => {
        setListDataDetail(warehousingBillDetail?.data || []);
    }, [warehousingBillDetail?.data]);

    useEffect(() => {
        dispatch(setPageTitle(`${t('proposal')}`));
    });

    const handleTally = (record: any, type: number) => {
        record.warehousingBilId = data?.warehouseBillId || data?.id;
        if (type === 0) {
            TallyReturn({ id: record.warehousingBilId, detailId: record?.id, quantity: record.proposalQuantity }).then(() => {
                showMessage(`${t('edit_success')}`, 'success');
                mutate();
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            setOpenModalTally(true);
            setDataDetail(record);
        }
    }

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'name',
            title: `${t('name_product')}`,
            render: ({ product, replacementPart }: any) => <span>{product?.name || replacementPart?.name}</span>,
            sortable: false
        },
        {
            accessor: 'code',
            title: `${t('code_product')}`,
            render: ({ product }: any) => <span>{product?.code}</span>,
            sortable: false
        },
        {
            accessor: 'unit',
            title: `${t('dvt')}`,
            render: ({ product }: any) => <span>{product?.unit?.name}</span>,
            sortable: false
        },
        {
            accessor: 'quantity',
            title: `${t('quantity_request')}`,
            render: (records: any) => (<>{records.quantity || records.proposalQuantity}</>),
            sortable: false
        },
        {
            accessor: 'actualQuantity',
            title: `${t('output_quantity')}`,
            render: ({ actualQuantity, product }: any) => (<>{actualQuantity}</>),
            sortable: false
        },
        {
            accessor: 'requestReturnQuantity',
            title: `${t('quantity_request_return')}`,
            render: ({ requestReturnQuantity, product }: any) => (<>{requestReturnQuantity}</>),
            sortable: false
        },
        {
            accessor: 'returnQuantity',
            title: `${t('quantity_return')}`,
            render: ({ returnQuantity, product }: any) => (<>{returnQuantity}</>),
            sortable: false
        },
        {
            accessor: 'actual_usage',
            title: `${t('actual_usage')}`,
            render: ({ returnQuantity, actualQuantity }: any) => (<>{(actualQuantity || 0) - (returnQuantity || 0)}</>),
            sortable: false
        },
        { accessor: 'note', title: `${t('notes')}`, sortable: false },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => {
                return (
                    <div className="flex items-center w-max mx-auto gap-2">
                        {
                            (disable && (data?.status === "IN_PROGRESS" || data?.status === "PENDING") &&
                                (userData?.data?.position?.name.includes('Thủ kho')) &&
                                data?.warehousingBill.exportStatus !== 'IMPORT_RETURN' &&
                                data?.currentApproverId === userData?.data?.id &&
                                data?.approvalHistory?.filter((item: any) => item?.approverId === userData?.data.id).length <= 0 || router.query.id === "create") &&
                            <RBACWrapper permissionKey={['warehousingBillExport:tally']} type={'AND'}>
                                {
                                    <div className="w-[auto] flex gap-2">
                                        <button data-testId="btn-tally" type="button" className='tally-confirm' onClick={() => handleTally(records, 0)}>
                                            <IconCircleCheck />
                                            <span>
                                                {/* {t('tally')} */}
                                            </span>
                                        </button>
                                        <button data-testId="btn-tally" type="button" className='tally-edit' onClick={() => handleTally(records, 1)}>
                                            <IconNewEdit />
                                            <span>
                                                {/* {t('tally')} */}
                                            </span>
                                        </button>
                                    </div>
                                }
                            </RBACWrapper>
                        }
                    </div>
                )
            }
        },
    ]

    const handleCancel = () => {
        router.push("/warehouse-process/warehousing-bill/return")
    };

    const handleChangeComplete = () => {
        WarehousingBillFinishReturn({ id: data?.warehouseBillId }).then(() => {
            // handleCancel();
            mutate();
            handleData(null);
            showMessage(`${t('update_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleWarehousing = (param: any) => {
        if (!param.reasonReturn) {
            showMessage("warning", `${t('please_fill_reason')}`);
        }
        const query: any = {
            code: Number(param.code.value),
            warehouseId: Number(param.warehouseId.value),
            reason: param.reasonReturn,
        };

        if (Number(router.query.id)) {
            EditWarehousingBillReturn({ id: router.query?.id, ...query }).then(() => {
                showMessage(`${t('edit_success')}`, 'success');
                setOpenModalApproval(true);
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            CreateWarehousingBillReturn(query).then((res) => {
                showMessage(`${t('create_success')}`, 'success');
                setId(res.data.warehouseBillId)
                setOpenModalApproval(true);
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
    }


    useEffect(() => {
        setInitialValue({
            proposalId: data?.warehousingBill?.proposal ? {
                value: `${data?.warehousingBill?.proposal?.id || data.id}`,
                label: `${data?.warehousingBill?.proposal?.name || data?.name}`
            } : data?.proposal ? {
                value: `${data?.proposal?.id || data.id}`,
                label: `${data?.proposal?.name || data?.name}`
            } : "",
            repairRequestId: data?.warehousingBill?.repairRequest ? {
                value: `${data?.warehousingBill?.repairRequest?.id || data.id}`,
                label: `${data?.warehousingBill?.repairRequest?.name || data?.name}`
            } : data?.repairRequest ? {
                value: `${data?.repairRequest?.id || data.id}`,
                label: `${data?.repairRequest?.name || data?.name}`
            } : "",
            warehouseId: data?.warehousingBill?.warehouse ? {
                value: `${data?.warehousingBill?.warehouse?.id}`,
                label: `${data?.warehousingBill?.warehouse?.name}`
            } : data?.warehouse ? {
                value: `${data?.warehouse?.id}`,
                label: `${data?.warehouse?.name}`
            } : "",
            note: data?.warehousingBill?.note ? `${data?.warehousingBill?.note}` : data?.note ? data?.note : '',
            name: router.query.proposalId ? "" : data?.name ? `${data?.name}` : "",
            createdBy: data?.warehousingBill?.proposal || data?.proposal || data?.repairRequest || data?.warehousingBill?.repairRequest ? (data?.warehousingBill?.proposal?.createdBy?.fullName || data?.warehousingBill?.repairRequest?.createdBy.fullName || data?.proposal?.createdBy?.fullName || data?.repairRequest?.createdBy.fullName) : "",
            personRequest: data?.warehousingBill?.createdBy ? data?.warehousingBill?.createdBy?.fullName : data?.createdBy?.fullName ? data?.createdBy?.fullName : '',
            createdAt: data?.createdAt ? data?.createdAt : ''
        })
        if (router.query.id !== 'create') {
            setInitialReturn({
                warehouseId: data?.warehousingBill?.warehouse ? {
                    value: `${data?.warehousingBill?.warehouse?.id}`,
                    label: `${data?.warehousingBill?.warehouse?.name}`
                } : "",
                reasonReturn: data?.reasonReturn ? `${data?.reasonReturn}` : "",
                code: data ? {
                    value: `${data?.warehouseBillId}`,
                    label: `${data?.warehouseBillCode}`
                } : "",
            })
            SetWarehouseId(data?.warehousingBill?.warehouse ? data?.warehousingBill?.warehouse.id : warehouseId);
        }
        setEntity(data?.repairRequest ? "repairRequest" : "")
        setId(data?.warehouseBillId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        if (Number(router.query.id)) {
            handleData(null);
        }
        setDisable(router.query.status === "true" ? true : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    useEffect(() => {
        if (data?.warehouseBillId) {
            setQuery({ id: data?.warehouseBillId })
        }
    }, [data?.warehouseBillId])
    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    }

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit()
        }
    }

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
        }
    };

    const handleData = (id: any) => {
        if (id) {
            GetWarehousingBillReturnByCode({ id: id }).then((res) => {
                setData(res.data);
                // setListDataDetail(res.data?.details);
                setQuery({ id: res?.data?.id })
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            GetWarehousingBillReturn({ id: router.query.id }).then((res) => {
                setData(res.data);
                mutate()
                // setListDataDetail(res.data?.warehousingBill?.details);
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
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
                html: `<span class='confirm-span'>${t('confirm_approve')}</span> ${data?.warehouseBillCode} ?`,
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

    const Approve = () => {
        WarehousingBillApproveReturn({ id: data?.warehouseBillId }).then(() => {
            showMessage(`${t('update_success')}`, 'success');
            handleCancel();
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleReject = () => {
        setOpenModalReject(true);
    }

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
            title: `${t('action')}`,
            render: ({ action, sign }: any) => <span>{handleReturnFlowApprove(action, sign)}</span>,
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
            title: `${t('exe_day')}`,
            render: ({ submittedAt }: any) => <span>{moment(submittedAt).format("DD/MM/YYYY hh:mm:ss")}</span>,
            sortable: false
        },
        { accessor: 'comment', title: `${t('description')}`, sortable: false },
    ]

    useEffect(() => {
        if (warehousingBillPn?.page === undefined) return;
        if (warehousingBillPn?.page === 1) {
            setDataWarehousingBill(warehousingBill?.data)
        } else {
            setDataWarehousingBill([...dataWarehousingBill, ...warehousingBill?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [warehousingBillPn]);

    const handleMenuScrollToBottomWb = () => {
        setTimeout(() => {
            setPageWb(warehousingBillPn?.page + 1);
        }, 1000);
    }

    const handleMenuScrollToBottomWarehouse = () => {
        setTimeout(() => {
            setPageWarehouse(warehousePagination?.page + 1);
        }, 1000);
    }

    useEffect(() => {
        if (warehousePagination?.page === undefined) return;
        if (warehousePagination?.page === 1) {
            setDataWarehouseDropdown(warehouses?.data)
        } else {
            setDataWarehouseDropdown([...dataWarehouseDropdown, ...warehouses?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [warehousePagination]);


    return (
        <>
            <div>
                {isLoading && (
                    <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                        <IconLoading />
                    </div>
                )}
                <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                    <h1 className='page-title'>{t('warehousing_bill_return')}</h1>
                    <Link href="/warehouse-process/warehousing-bill/return">
                        <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                            <IconBackward />
                            <span>
                                {t('back')}
                            </span>
                        </div>
                    </Link>
                </div>
                <div className='mb-5'>
                    <Formik
                        initialValues={initialReturn}
                        validationSchema={SubmittedForm}
                        onSubmit={values => {
                            handleWarehousing(values);
                        }}
                        enableReinitialize
                        innerRef={formRef}
                    >

                        {({ errors, values, submitCount, setFieldValue }) => (
                            <Form className="space-y-5" >
                                <div>
                                    <div className='flex justify-between gap-5 mt-5 mb-5'>
                                        <div className="w-1/2">
                                            <label htmlFor="warehouseId" className='label'>< span style={{ color: 'red' }}>* </span> {t('warehouse')}</label >
                                            <Select
                                                id='warehouseId'
                                                name='warehouseId'
                                                options={dataWarehouseDropdown}
                                                onMenuOpen={() => setPageWarehouse(1)}
                                                onMenuScrollToBottom={handleMenuScrollToBottomWarehouse}
                                                isLoading={warehouseLoading}
                                                maxMenuHeight={160}
                                                value={values?.warehouseId}
                                                onChange={e => {
                                                    setFieldValue('warehouseId', e)
                                                    setFieldValue('code', '')
                                                    // setEntity(e.label === "Gara" ? "repairRequest" : '');
                                                    if (e.label === "Gara") {
                                                        setQueryWarehousingBill({ repairRequestId: 1 })
                                                    } else {
                                                        setQueryWarehousingBill({ proposalId: 1 })
                                                    }
                                                    SetWarehouseId(e.value)
                                                    setData('');
                                                }}
                                                isDisabled={disable}
                                            />
                                            {submitCount && errors.warehouseId ? (
                                                <div className="text-danger mt-1"> {`${errors.warehouseId}`} </div>
                                            ) : null}
                                        </div>
                                        {
                                            warehouseId &&
                                            <div className="w-1/2">
                                                <label htmlFor="code" className='label'> {t('warehousing_bill')} < span style={{ color: 'red' }}>* </span></label >
                                                <Select
                                                    id='code'
                                                    name='code'
                                                    options={dataWarehousingBill}
                                                    onMenuOpen={() => setPageWb(1)}
                                                    onMenuScrollToBottom={handleMenuScrollToBottomWb}
                                                    isLoading={warehousingBillLd}
                                                    maxMenuHeight={160}
                                                    value={values?.code}
                                                    onInputChange={e => setSearchWb(e)}
                                                    onChange={e => {
                                                        setFieldValue('code', e)
                                                        handleData(e.value);
                                                    }}
                                                    isDisabled={disable}
                                                />
                                                {submitCount && errors.code ? (
                                                    <div className="text-danger mt-1"> {`${errors.code}`} </div>
                                                ) : null}
                                            </div>
                                        }
                                    </div>
                                    {
                                        data &&
                                        <div className="">
                                            <label htmlFor="reasonReturn" className='label'> {t('reason_return')} < span style={{ color: 'red' }}>* </span></label >
                                            <Field autoComplete="off"
                                                name="reasonReturn"
                                                type="text"
                                                id="reasonReturn"
                                                className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                disabled={disable}
                                            />
                                            {submitCount && errors.reasonReturn ? (
                                                <div className="text-danger mt-1"> {`${errors.reasonReturn}`} </div>
                                            ) : null}
                                        </div>
                                    }
                                </div>
                            </Form>
                        )}
                    </Formik >
                </div>
                <div className="mb-5">
                    {
                        data &&
                        <div className="font-semibold">
                            <div className="rounded">
                                <button
                                    type="button"
                                    className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                    onClick={() => handleActive(1)}
                                >
                                    {t('warehousing_bill_export_info')}
                                    <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </div>
                                </button>
                                <div className={`mb-2 ${active.includes(1) ? 'custom-content-accordion' : ''}`}>
                                    <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                        <Formik
                                            initialValues={initialValue}
                                            validationSchema={{}}
                                            onSubmit={values => { }}
                                            enableReinitialize
                                        >

                                            {({ errors, values, submitCount, setFieldValue }) => (
                                                <Form className="space-y-5" >
                                                    <div className='p-4'>
                                                        <div className='flex justify-between gap-5 mt-5 mb-5'>
                                                            <div className="w-1/2">
                                                                <label htmlFor="personRequest" className='label'> {t('person_request')} < span style={{ color: 'red' }}>* </span></label >
                                                                <Field autoComplete="off"
                                                                    name="personRequest"
                                                                    type="text"
                                                                    id="personRequest"
                                                                    placeholder={`${t('enter_code')}`}
                                                                    className={true ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                    disabled={true}
                                                                />
                                                                {submitCount && errors.personRequest ? (
                                                                    <div className="text-danger mt-1"> {`${errors.personRequest}`} </div>
                                                                ) : null}
                                                            </div>
                                                            <div className="w-1/2">
                                                                <label htmlFor="createdAt" className='label'> {t('time_request')} < span style={{ color: 'red' }}>* </span></label >
                                                                <Field autoComplete="off"
                                                                    name="createdAt"
                                                                    render={({ field }: any) => (
                                                                        <Flatpickr
                                                                            data-enable-time
                                                                            options={{
                                                                                enableTime: true,
                                                                                dateFormat: 'd/m/Y H:i'
                                                                            }}
                                                                            value={moment(values?.createdAt).format("DD/MM/YYYY hh:mm")}
                                                                            className={true ? "form-input bg-[#f2f2f2] calender-input" : "form-input calender-input"}
                                                                            disabled={true}
                                                                        />
                                                                    )}
                                                                />
                                                                {submitCount && errors.estimatedDeliveryDate ? (
                                                                    <div className="text-danger mt-1"> {`${errors.estimatedDeliveryDate}`} </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                        <div className='flex justify-between gap-5 mt-5'>
                                                            <div className="w-1/2">
                                                                <label htmlFor="warehouseId" className='label'>< span style={{ color: 'red' }}>* </span> {t('warehouse')}</label >
                                                                <Select
                                                                    id='warehouseId'
                                                                    name='warehouseId'
                                                                    value={values?.warehouseId}
                                                                    isDisabled={true}
                                                                />
                                                                {submitCount && errors.warehouseId ? (
                                                                    <div className="text-danger mt-1"> {`${errors.warehouseId}`} </div>
                                                                ) : null}
                                                            </div>
                                                            {
                                                                entity === "repairRequest" ?
                                                                    <div className="w-1/2">
                                                                        <label htmlFor="repairRequestId" className='label'> {t('repair_request')} < span style={{ color: 'red' }}>* </span></label >
                                                                        <Select
                                                                            id='repairRequestId'
                                                                            name='repairRequestId'
                                                                            maxMenuHeight={160}
                                                                            value={values?.repairRequestId}
                                                                            isDisabled={true}
                                                                        />
                                                                        {submitCount && errors.repairRequestId ? (
                                                                            <div className="text-danger mt-1"> {`${errors.repairRequestId}`} </div>
                                                                        ) : null}
                                                                    </div> :
                                                                    <div className="w-1/2">
                                                                        <label htmlFor="proposalId" className='label'> {t('proposal_product')} < span style={{ color: 'red' }}>* </span></label >
                                                                        <Select
                                                                            id='proposalId'
                                                                            name='proposalId'
                                                                            maxMenuHeight={160}
                                                                            value={values?.proposalId}
                                                                            isDisabled={true}
                                                                        />
                                                                        {submitCount && errors.proposalId ? (
                                                                            <div className="text-danger mt-1"> {`${errors.proposalId}`} </div>
                                                                        ) : null}
                                                                    </div>
                                                            }
                                                        </div>
                                                        <div className='flex justify-between gap-5 mt-5 mb-5'>
                                                            <div className="w-1/2">
                                                                <label htmlFor="createdBy" className='label'>< span style={{ color: 'red' }}>* </span> {t('proposal_by')}</label >
                                                                <Field autoComplete="off"
                                                                    name="createdBy"
                                                                    id="createdBy"
                                                                    type="text"
                                                                    className={true ? "form-input bg-[#f2f2f2] text-[#797979]" : "form-input"}
                                                                    disabled={true}
                                                                />
                                                                {submitCount && errors.createdBy ? (
                                                                    <div className="text-danger mt-1"> {`${errors.createdBy}`} </div>
                                                                ) : null}
                                                            </div>
                                                            <div className='w-1/2'></div>
                                                        </div>
                                                        <div className="mt-5">
                                                            <label htmlFor="note" className='label'> {t('notes')}</label >
                                                            <Field autoComplete="off"
                                                                name="note"
                                                                as="textarea"
                                                                id="note"
                                                                placeholder={`${t('enter_note')}`}
                                                                className={true ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                disabled={true}
                                                            />
                                                            {submitCount && errors.note ? (
                                                                <div className="text-danger mt-1"> {`${errors.note}`} </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </Form>
                                            )
                                            }
                                        </Formik >
                                    </AnimateHeight>
                                </div>
                            </div>
                            <div className="rounded">
                                <button
                                    type="button"
                                    className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                    onClick={() => handleActive(2)}
                                >
                                    {t('warehousing_detail')}
                                    <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(2) ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </div>
                                </button>
                                <div className={`${active.includes(2) ? 'custom-content-accordion' : ''}`}>
                                    <AnimateHeight duration={300} height={active.includes(2) ? 'auto' : 0}>
                                        <div className='p-4'>
                                            <div className="datatables">
                                                <DataTable
                                                    highlightOnHover
                                                    className="whitespace-nowrap table-hover custom_table"
                                                    records={listDataDetail}
                                                    columns={columns}
                                                    sortStatus={sortStatus}
                                                    onSortStatusChange={setSortStatus}
                                                    minHeight={200}
                                                />
                                            </div>
                                        </div>
                                        <TallyModal
                                            openModal={openModalTally}
                                            setOpenModal={setOpenModalTally}
                                            data={dataDetail}
                                            setData={setDataDetail}
                                            orderDetailMutate={mutate}
                                            status={data?.status}
                                        />
                                        <ApprovalModal
                                            openModal={openModalApproval}
                                            setOpenModal={setOpenModalApproval}
                                            handleData={handleData}
                                            data={data}
                                            handleCancel={handleCancel}
                                            id={id}
                                            sign={sign}
                                            btnRule={btnRule}
                                        />
                                        <RejectModal
                                            openModal={openModalReject}
                                            setOpenModal={setOpenModalReject}
                                            handleCancel={handleCancel}
                                            id={id}
                                        />
                                    </AnimateHeight>
                                </div>
                            </div>
                            {
                                router.query.id !== 'create' &&
                                <div className="rounded mt-5">
                                    <button
                                        type="button"
                                        className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                        onClick={() => handleActive(4)}
                                    >
                                        {t('history_approve')}
                                        <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(4) ? 'rotate-180' : ''}`}>
                                            <IconCaretDown />
                                        </div>
                                    </button>
                                    <div className={`${active.includes(4) ? 'custom-content-accordion' : ''}`}>
                                        <AnimateHeight duration={300} height={active.includes(4) ? 'auto' : 0}>
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
                            {/* <div style={{ display: 'flex', marginTop: '30px' }}>
                            <p style={{ marginRight: '10px' }}>
                                <strong>{t('Order of signing')}:</strong>
                            </p>
                            <p>
                                <strong>
                                    {t('Applicant')} {'->'} {t('receiver')} {'->'} {t('stocker')} {'->'} {t('accounting_manager')} {'->'} {t('Director')}
                                </strong>
                            </p>
                        </div> */}
                            <SwitchBtn
                                entity={'warehousingBillExportReturn'}
                                handleCancel={handleCancel}
                                handleSubmit={handleSubmit}
                                handleSubmitApproval={handleSubmitApproval}
                                handleReject={handleReject}
                                handleApprove={handleApprove}
                                handleFinish={handleChangeComplete}
                                setSign={setSign}
                                rbac={['warehousingBillExport:create', 'warehousingBillExport:update']}
                                typeRbac={'OR'}
                                rbacFinish={['warehousingBillExport:finish']}
                                typeRbacFinish={'AND'}
                                disable={disable}
                                data={data}
                                id={id}
                            />
                        </div>
                    }
                </div >
            </div >
        </>
    );
};
export default ExportPage;
