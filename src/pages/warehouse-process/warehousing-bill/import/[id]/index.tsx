import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { readExcelFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import { WarehousingBillDetail, WarehousingBillListRequest } from '@/services/swr/warehousing-bill.swr';
import { CreateWarehousingBill, DeleteWarehousingBill, EditWarehousingBill, GetWarehousingBill, WarehousingBillAddDetails, WarehousingBillApprove, WarehousingBillDeleteDetail, WarehousingBillFinish } from '@/services/apis/warehousing-bill.api';
import { Field, Form, Formik } from 'formik';
import AnimateHeight from 'react-animate-height';
import Select from 'react-select';
import * as Yup from 'yup';
import { DropdownOrder, DropdownWarehouses } from '@/services/swr/dropdown.swr';
import IconBackward from '@/components/Icon/IconBackward';
import Link from 'next/link';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import { GetOrder, GetOrderDetail } from '@/services/apis/order.api';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Swal from 'sweetalert2';
import DetailModal from '../modal/DetailModal';
import IconPlus from '@/components/Icon/IconPlus';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import TallyModal from '../../TallyModal';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import PrintBarcode from '@/pages/warehouse/product/modal/printBarcode';
import IconPrinter from '@/components/Icon/IconPrinter';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import IconImportFile from '@/components/Icon/IconImportFile';
import { GetProductByCode } from '@/services/apis/product.api';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import { IRootState } from '@/store';
import SwitchBtn from '@/pages/warehouse-process/switchBtn';
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
    const [openModal, setOpenModal] = useState(false);
    const [openBarcode, SetOpenBarcode] = useState(false);
    const [openModalTally, setOpenModalTally] = useState(false);
    const [query, setQuery] = useState<any>();
    const [warehouseId, SetWarehouseId] = useState<any>();
    const [send, SetSend] = useState<any>(false);
    const [openModalApproval, setOpenModalApproval] = useState(false);
    const [openModalReject, setOpenModalReject] = useState(false);
    const [open, setOpen] = useState<any>(false);
    const [id, setId] = useState<any>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [high, setIsHigh] = useState<any>('false');
    const [btnRule, setBtnRule] = useState(false);
    const [sign, setSign] = useState();

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    // get data
    const { data: warehousingBillDetail, pagination, mutate, isLoading } = WarehousingBillDetail({ ...query, perPage: 0 });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(warehousingBillDetail?.data);
        }
    }, [router.query.id, warehousingBillDetail?.data]);

    useEffect(() => {
        dispatch(setPageTitle(`${t('proposal')}`));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setQuery({ id: router.query.id, ...router.query })
        }
        setDisable(router.query.status === "true" ? true : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

    const handleEdit = (data: any) => {
        setOpenModal(true);
        setDataDetail(data);
    };

    const handleSearch = (param: any) => {
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    search: param
                },
            }
        );
    }

    const handleDelete = ({ id, product }: any) => {
        if (Number(router.query.id)) {
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
                    title: `${t('delete_order')}`,
                    html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${product?.name} ?`,
                    padding: '2em',
                    showCancelButton: true,
                    cancelButtonText: `${t('cancel')}`,
                    confirmButtonText: `${t('confirm')}`,
                    reverseButtons: true,
                })
                .then((result) => {
                    if (result.value) {
                        WarehousingBillDeleteDetail({ id: router.query.id, detailId: id }).then(() => {
                            mutate();
                            showMessage(`${t('delete_product_success')}`, 'success');
                        }).catch((err) => {
                            showMessage(`${err?.response?.data?.message}`, 'error');
                        });
                    }
                });
        } else {
            setListDataDetail(listDataDetail.filter((item: any) => item.id !== id))
        }
    };

    const handleTally = (data: any) => {
        setOpenModalTally(true);
        setDataDetail(data);
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
            render: ({ product }: any) => <span>{product?.name}</span>,
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
        { accessor: 'actualQuantity', title: `${t('quantity_curent')}`, sortable: false },
        { accessor: 'expirationDate', title: `${t('expired_date')}`, sortable: false },
        { accessor: 'note', title: `${t('notes')}`, sortable: false },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="flex items-center w-max mx-auto gap-2">
                    {
                        data?.status === "PENDING" && disable &&
                        <RBACWrapper permissionKey={['warehousingBillImport:tally']} type={'AND'}>
                            <div className="w-[auto]">
                                <button data-testId="btn-tally" type="button" className='button-edit' onClick={() => handleTally(records)}>
                                    <IconNewEdit /><span>
                                        {t('tally')}
                                    </span>
                                </button>
                            </div>
                        </RBACWrapper>
                    }
                    {
                        !disable &&
                        <>
                            <div className="w-[auto]">
                                <button type="button" className='button-edit' onClick={() => handleEdit(records)}>
                                    <IconNewEdit /><span>
                                        {t('edit')}
                                    </span>
                                </button>
                            </div>
                            <div className="w-[auto]">
                                <button type="button" className='button-delete' onClick={() => handleDelete(records)}>
                                    <IconNewTrash />
                                    <span>
                                        {t('delete')}
                                    </span>
                                </button>
                            </div>
                        </>
                    }
                </div>
            ),
        },
    ]
    const handleCancel = () => {
        router.push("/warehouse-process/warehousing-bill/import")
    };

    const handleChangeComplete = () => {
        WarehousingBillFinish({ id: router.query.id }).then(() => {
            router.push("/warehouse-process/warehousing-bill/import")
            showMessage(`${t('update_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const [initialValue, setInitialValue] = useState<any>();
    const [pageOder, setPageOrder] = useState(1);
    const [pageWarehouse, setPageWarehouse] = useState(1);
    const [dataOrderDropdown, setDataOrderDropdown] = useState<any>([]);
    const [dataWarehouseDropdown, setDataWarehouseDropdown] = useState<any>([]);
    const [active, setActive] = useState<any>([1, 2]);
    const formRef = useRef<any>();
    const [searchOrder, setSearchOrder] = useState<any>();

    const SubmittedForm = Yup.object().shape({
        // name: Yup.string().required(`${t('please_fill_name')}`),
        // type: new Yup.ObjectSchema().required(`${t('please_fill_type')}`),
        // proposalId: new Yup.ObjectSchema().required(`${t('please_fill_proposal')}`),
        warehouseId: new Yup.ObjectSchema().required(`${t('please_fill_warehouse')}`),
    });

    const { data: orders, pagination: orderPagination, isLoading: orderLoading } = DropdownOrder({ page: pageOder, isCreatedBill: true, search: searchOrder });
    const { data: warehouses, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({ page: pageWarehouse });
    const { data: listRequest } = WarehousingBillListRequest({ id: router.query.proposalId });

    useEffect(() => {
        if (router.query.proposalId) {
            setData(listRequest?.data[0]);
            getValueDetail({ type: listRequest?.data[0].entity, value: router.query.proposalId });
        }
    }, [listRequest, router.query.proposalId])

    const handleWarehousing = (param: any) => {
        const query: any = {
            warehouseId: Number(param.warehouseId.value),
            type: "IMPORT",
            note: param.note,
            // name: param.name
        };

        if (param.orderId) {
            query.orderId = Number(param.orderId.value)
        }

        if (data) {
            EditWarehousingBill({ id: router.query?.id, ...query }).then(() => {
                showMessage(`${t('edit_success')}`, 'success');
                handleCancel();
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            CreateWarehousingBill(query).then((res) => {
                showMessage(`${t('create_success')}`, 'success');
                handleDetail(res.data.id)
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
    }
    const handleDetail = (id: any) => {
        WarehousingBillAddDetails({
            id: id,
            details: listDataDetail.map((item: any, index: number) => {
                return {
                    ...item,
                    id: index
                }
            })
        }).then(() => {
            // handleChangeComplete({ id: id });
            // handleCancel();
            if (router.query.id === 'create' && send === true) {
                setId(id);
                setOpenModalApproval(true);
            } else {
                handleCancel();
            }
        }).catch((err) => {
            DeleteWarehousingBill({ id })
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    useEffect(() => {
        if (Number(router.query.id)) {
            setQuery({ id: router.query.id, ...router.query })
            handleData();
        }
        if (typeof window !== 'undefined') {
            setId(Number(localStorage.getItem("idUser")));
            setIsHigh(localStorage.getItem('isHighestPosition'));
        }
        setDisable(router.query.status === "true" ? true : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    useEffect(() => {
        setInitialValue({
            orderId: data ? {
                value: `${data?.order?.id || data.id}`,
                label: `${data?.order?.name || data.name}`
            } : "",
            warehouseId: data?.warehouse ? {
                value: `${data?.warehouse?.id}`,
                label: `${data?.warehouse?.name}`
            } : "",
            note: data?.note ? `${data?.note}` : "",
            name: router.query.proposalId ? "" : data?.name ? `${data?.name}` : "",
            createdBy: data?.proposal || data?.repairRequest ? (data?.proposal?.createdBy?.fullName || data?.repairRequest?.createdBy.fullName) : "",
            personRequest: data?.createdBy ? data?.createdBy?.fullName : JSON.parse(localStorage.getItem('profile') || "").fullName
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    useEffect(() => {
        if (orderPagination?.page === undefined) return;
        if (orderPagination?.page === 1) {
            setDataOrderDropdown(orders?.data)
        } else {
            setDataOrderDropdown([...dataOrderDropdown, ...orders?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderPagination])

    useEffect(() => {
        if (warehousePagination?.page === undefined) return;
        if (warehousePagination?.page === 1) {
            setDataWarehouseDropdown(warehouses?.data)
        } else {
            setDataWarehouseDropdown([...dataWarehouseDropdown, ...warehouses?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [warehousePagination]);

    useEffect(() => {
        if (Number(router.query.id)) {
            getData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query.id]);

    const getData = () => {
        GetWarehousingBill({ id: router.query.id }).then((res) => {
            setData(res.data);
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleMenuScrollToBottomOrder = () => {
        setTimeout(() => {
            setPageOrder(orderPagination?.page + 1);
        }, 1000);
    }

    const handleMenuScrollToBottomWarehouse = () => {
        setTimeout(() => {
            setPageWarehouse(warehousePagination?.page + 1);
        }, 1000);
    }

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    }

    const getValueDetail = (param: any) => {
        GetOrderDetail({ id: param.value }).then((res) => {
            setListDataDetail(
                res.data.map((item: any) => {
                    if (!item.proposalQuantity) {
                        item.proposalQuantity = item.quantity
                    }
                    return item;
                })
            );
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
        GetOrder({ id: param.value }).then((res) => {
            param.setFieldValue("createdBy", res.data.createdBy.fullName)
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit()
        }
    }

    const handleSubmitApproval = () => {
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

    const handleData = () => {
        GetWarehousingBill({ id: router.query.id }).then((res) => {
            setData(res.data);
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
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
                html: `<span class='confirm-span'>${t('confirm_approve')}</span> ${data?.name} ?`,
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
        WarehousingBillApprove({ id: router.query.id }).then(() => {
            showMessage(`${t('update_success')}`, 'success');
            handleCancel();
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleReject = () => {
        setOpenModalReject(true);
    }

    useEffect(() => {
        if (data?.approvalHistory.find((item: any) => Number(item.approverId) === Number(id))) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [data, id]);

    const columnHistorys = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            render: ({ action }: any) => <span>{action === "FORWARD" || action === "SUBMIT" ? `${t('continue_approval')}` : action === "REJECT" ? `${t('reject')}` : `${t('approve')}`}</span>,
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

    const schema = {
        a: {
            prop: 'name',
            type: String,
        },
        b: {
            prop: 'code',
            type: String,
        },
        c: {
            prop: 'proposalQuantity',
            type: Number,
        },
        d: {
            prop: 'price',
            type: Number,
        },
        e: {
            prop: 'currency',
            type: String,
        },
        f: {
            prop: 'note',
            type: String,
        },
    };

    const getIdProduct = async (code: string) => {
        const data = await GetProductByCode(code);
        return data?.data.id;
    }

    const handleFile = async (e: any) => {
        const formData = new FormData();
        formData.append('file', e.target.files[0])
        const file = e.target.files[0];
        const data = await file.arrayBuffer();
        const fileData = await readExcelFile(data, schema, 0, 2);
        const dataDetails: any = fileData?.map(async (item: any, index: number) => {
            return {
                id: index,
                productId: await getIdProduct(item.code),
                total: item.quantity * item.price,
                ...item
            }
        });
        const processed = await Promise.all(dataDetails).then(val => {
            return val;
        });

        setListDataDetail(
            listDataDetail ? [
                ...listDataDetail,
                ...processed
            ] : processed
        );
        // Upload(formData)
        //     .then((res) => {
        //         setIdUpload(res.data.id);
        //         return
        //     }).catch((err) => {
        //         showMessage(`${err?.response?.data?.message}`, 'error');
        //     });
    }

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    const handleExportFile = () => {
        switch (themeConfig.locale) {
            case 'en':
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_warehousing_bill_en.xlsx`, '_blank');
                break;
            case 'la':
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_warehousing_bill_lo.xlsx`, '_blank');
                break;
            default:
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_warehousing_bill_vi.xlsx`, '_blank');
                break;
        }
    };

    return (
        <>
            <div>
                {isLoading && (
                    <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                        <IconLoading />
                    </div>
                )}
                <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                    <h1 className='page-title'>{t('warehousing_bill_import_text')}</h1>
                    <Link href="/warehouse-process/warehousing-bill/import">
                        <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                            <IconBackward />
                            <span>
                                {t('back')}
                            </span>
                        </div>
                    </Link>
                </div>
                <div className="mb-5">
                    <div className="font-semibold">
                        <div className="rounded">
                            <button
                                type="button"
                                className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                onClick={() => handleActive(1)}
                            >
                                {t('warehousing_bill_import_info')}
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
                                            handleWarehousing(values);
                                        }}
                                        enableReinitialize
                                        innerRef={formRef}
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
                                                            <label htmlFor="timeRequest" className='label'> {t('time_request')} < span style={{ color: 'red' }}>* </span></label >
                                                            <Field autoComplete="off"
                                                                name="timeRequest"
                                                                render={({ field }: any) => (
                                                                    <Flatpickr
                                                                        data-enable-time
                                                                        options={{
                                                                            enableTime: true,
                                                                            dateFormat: 'd/m/Y H:i'
                                                                        }}
                                                                        value={moment().format("DD/MM/YYYY hh:mm")}
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
                                                                options={dataWarehouseDropdown}
                                                                onMenuOpen={() => setPageWarehouse(1)}
                                                                onMenuScrollToBottom={handleMenuScrollToBottomWarehouse}
                                                                isLoading={warehouseLoading}
                                                                maxMenuHeight={160}
                                                                value={values?.warehouseId}
                                                                onChange={e => {
                                                                    setFieldValue('warehouseId', e)
                                                                    SetWarehouseId(e.value)
                                                                }}
                                                                isDisabled={disable}
                                                            />
                                                            {submitCount && errors.warehouseId ? (
                                                                <div className="text-danger mt-1"> {`${errors.warehouseId}`} </div>
                                                            ) : null}
                                                        </div>
                                                        <div className="w-1/2">
                                                            <label htmlFor="orderId" className='label'> {t('order')}</label >
                                                            <Select
                                                                id='orderId'
                                                                name='orderId'
                                                                options={dataOrderDropdown}
                                                                onMenuOpen={() => setPageOrder(1)}
                                                                onMenuScrollToBottom={handleMenuScrollToBottomOrder}
                                                                isLoading={orderLoading}
                                                                maxMenuHeight={160}
                                                                value={values?.orderId}
                                                                onInputChange={e => setSearchOrder(e)}
                                                                onChange={e => {
                                                                    setFieldValue('orderId', e)
                                                                    getValueDetail({ value: e?.value, setFieldValue });
                                                                }}
                                                                isDisabled={disable || (warehouseId ? false : true)}
                                                            />
                                                            {submitCount && errors.orderId ? (
                                                                <div className="text-danger mt-1"> {`${errors.orderId}`} </div>
                                                            ) : null}
                                                        </div>
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
                                                            id="description"
                                                            placeholder={`${t('enter_note')}`}
                                                            className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.note ? (
                                                            <div className="text-danger mt-1"> {`${errors.note}`} </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </Form>
                                        )}
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
                                        <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                                            <div className="flex items-center flex-wrap">
                                                {
                                                    !disable &&
                                                    <>
                                                        <button data-testId='modal-import-btn' type="button" onClick={(e) => setOpenModal(true)} className="btn btn-primary btn-sm m-1 custom-button" >
                                                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                                            {t('add_product_list')}
                                                        </button>
                                                        <input onChange={e => handleFile(e)} autoComplete="off" type="file" ref={fileInputRef} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style={{ display: "none" }} />
                                                        <button type="button" className="btn btn-primary btn-sm m-1 custom-button" onClick={() => fileInputRef.current?.click()}>
                                                            <span className='mr-3'>
                                                                <IconImportFile className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                                            </span>
                                                            {t("import_file")}
                                                        </button>
                                                        <button type="button" className="btn btn-primary btn-sm m-1 custom-button" onClick={() => handleExportFile()}>
                                                            <span className='mr-3'>
                                                                <IconNewDownload size={15} className="w-5 h-5 ltr:mr-2 rtl:ml-2" color='#fff' />
                                                            </span>
                                                            {t("export_file")}
                                                        </button>
                                                    </>
                                                }
                                                <button data-testId='modal-import-btn' type="button" onClick={(e) => SetOpenBarcode(true)} className="btn btn-primary btn-sm m-1 custom-button" >
                                                    <IconPrinter className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                                    {t('print_barcode')}
                                                </button>
                                            </div>

                                            {/* <input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} onChange={(e) => handleSearch(e.target.value)} /> */}
                                        </div>
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
                                    <DetailModal
                                        openModal={openModal}
                                        setOpenModal={setOpenModal}
                                        data={dataDetail}
                                        setData={setDataDetail}
                                        orderDetailMutate={mutate}
                                        listData={listDataDetail}
                                        setListData={setListDataDetail}
                                        warehouseId={warehouseId}
                                    />
                                    <TallyModal
                                        openModal={openModalTally}
                                        setOpenModal={setOpenModalTally}
                                        data={dataDetail}
                                        setData={setDataDetail}
                                        orderDetailMutate={mutate}
                                    />
                                    <PrintBarcode
                                        openModal={openBarcode}
                                        setOpenModal={SetOpenBarcode}
                                        data={listDataDetail}
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
                        <div style={{ display: 'flex', marginTop: '30px' }}>
                            <p style={{ marginRight: '10px' }}>
                                <strong>{t('Order of signing')}:</strong>
                            </p>
                            <p>
                                <strong>
                                    {t('Applicant')} {'->'} {t('deliver')} {'->'} {t('stocker')} {'->'} {t('accounting_manager')}
                                </strong>
                            </p>
                        </div>
                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                            {/* {
                                !disable &&
                                <RBACWrapper permissionKey={['warehousingBillImport:create', 'warehousingBillImport:update']} type={'OR'}>
                                    <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                        {t('cancel')}
                                    </button>
                                    <button data-testId='submit-btn' type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmit()}>
                                        {router.query.id !== "create" ? t('update') : t('save')}
                                    </button>
                                </RBACWrapper>
                            } */}
                            {/* {
                                data?.status === "PENDING" && router.query.status === "true" &&
                                <RBACWrapper permissionKey={['warehousingBillImport:finish']} type={'AND'}>
                                    <button data-testId='submit-btn' type="button" onClick={e => handleChangeComplete()} className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button">
                                        {t('complete')}
                                    </button>
                                </RBACWrapper>
                            } */}
                            <SwitchBtn
                                entity={'warehousingBillImport'}
                                handleCancel={handleCancel}
                                handleSubmit={handleSubmit}
                                handleSubmitApproval={handleSubmitApproval}
                                handleReject={handleReject}
                                handleApprove={handleApprove}
                                handleFinish={handleChangeComplete}
                                setSign={setSign}
                                rbac={['warehousingBillImport:create', 'warehousingBillImport:update']}
                                typeRbac={'OR'}
                                rbacFinish={['warehousingBillImport:finish']}
                                typeRbacFinish={'AND'}
                                disable={disable}
                                data={data}
                                id={id}
                            />
                        </div>
                    </div>

                </div >
            </div >
        </>
    );
};
export default ExportPage;
