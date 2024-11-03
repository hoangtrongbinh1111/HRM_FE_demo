import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadFile, readExcelFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { AddOrderDetails, CreateOrder, DeleteOrder, DeleteOrderDetail, EditOrder, GetOrder, OrderApprove } from '@/services/apis/order.api';
import { OrderDetails } from '@/services/swr/order.swr';
import Link from 'next/link';
import IconBackward from '@/components/Icon/IconBackward';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import { Formik, Form, Field } from 'formik';
import AnimateHeight from 'react-animate-height';
import moment from 'moment';
import * as Yup from 'yup';
import { DropdownProposals, DropdownRepair, DropdownWarehouses } from '@/services/swr/dropdown.swr';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { GetProposalDetail } from '@/services/apis/proposal.api';
import DetailModal from '../modal/DetailModal';
import IconPlus from '@/components/Icon/IconPlus';
import { GetRepairDetail } from '@/services/apis/repair.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { formatNumber, moneyToNumber, removeVietnameseTones } from '@/utils/commons';
import PdfCard from '../print';
import IconImportFile from '@/components/Icon/IconImportFile';
import { Upload } from '@/services/apis/upload.api';
import { GetProductByCode } from '@/services/apis/product.api';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import { IRootState } from '@/store';
import SwitchBtn from '../../switchBtn';

interface Props {
    [key: string]: any;
}

const DetailPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [data, setData] = useState<any>();
    const [disable, setDisable] = useState<any>(false);
    const [dataDetail, setDataDetail] = useState<any>();
    const [openModal, setOpenModal] = useState(false);
    const formRef = useRef<any>();
    const [query, setQuery] = useState<any>();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataProposalDropdown, setDataProposalDropdown] = useState<any>([]);
    const [active, setActive] = useState<any>([1, 2]);
    const [pageProposal, setPageProposal] = useState(1);
    const [listDataDetail, setListDataDetail] = useState<any>();
    const [dataRepairDropdown, setDataRepairDropdown] = useState<any>([]);
    const [pageRepair, setPageRepair] = useState<any>(1);
    const [entity, setEntity] = useState<any>("");
    const [searchP, setSearchP] = useState<any>();
    const [searchR, setSearchR] = useState<any>();
    const [warehouseId, setWarehouseId] = useState<any>();
    const [open, setOpen] = useState<any>(false);
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');
    const [openModalApproval, setOpenModalApproval] = useState(false);
    const [send, SetSend] = useState<any>(false);
    const [openModalReject, setOpenModalReject] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [btnRule, setBtnRule] = useState(false);
    const [idUpload, setIdUpload] = useState<any>();
    const [sign, setSign] = useState(false);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required(`${t('please_fill_name')}`),
        // code: Yup.string().required(`${t('please_fill_code')}`),
        // estimatedDeliveryDate: Yup.string().required(`${t('please_fill_date')}`),
    });

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    // get data
    const { data: orderDetails, pagination, mutate, isLoading } = OrderDetails({ ...query, perPage: 0 });
    const { data: proposals, pagination: proposalPagiantion, isLoading: proposalLoading } = DropdownProposals({ page: pageProposal, search: searchP, isCreatedOrder: true, status: "APPROVED", sortBy: "id.DESC" });
    const { data: warehouses, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({});
    const { data: dropdownRepair, pagination: repairPagination, isLoading: repairLoading } = DropdownRepair({ page: pageRepair, search: searchR, isCreatedOrder: true, status: "APPROVED", sortBy: "id.DESC" })

    useEffect(() => {
        dispatch(setPageTitle(`${t('Order')}`));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(orderDetails?.data);
        }
    }, [orderDetails?.data, router]);

    useEffect(() => {
        if (Number(router.query.id)) {
            handleData();
            setQuery({ id: router.query.id, ...router.query })
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
            name: data?.name ? `${data?.name}` : "",
            proposalIds: data ? data?.proposals?.map((item: any) => {
                return (
                    {
                        label: item.name,
                        value: item.id
                    }
                )
            }) : "",
            code: data?.code ? `${data?.code}` : "",
            estimatedDeliveryDate: data?.estimatedDeliveryDate ? moment(`${data?.estimatedDeliveryDate}`).format("YYYY-MM-DD") : "",
            note: data?.note ? `${data?.note}` : "",
            personRequest: data?.createdBy ? `${data?.createdBy.fullName}` : JSON.parse(localStorage.getItem('profile') || "").fullName,
            warehouseId: data ? {
                value: `${data?.warehouse?.id}`,
                label: `${data?.warehouse?.name}`,
            } : '',
            timeRequest: data?.createdAt ? moment(data?.createdAt).format("DD/MM/YYYY hh:mm") : moment().format("DD/MM/YYYY hh:mm"),
            currentApprover: data?.currentApprover ? data?.currentApprover.fullName : "",
        })
        setEntity(data?.warehouse?.name === "Gara" ? "repairRequest" : "proposal");
        setWarehouseId(data?.warehouse?.id)
    }, [data]);

    const handleData = () => {
        GetOrder({ id: router.query.id }).then((res) => {
            setData(res.data);
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleEdit = (data: any) => {
        setOpenModal(true);
        setDataDetail(data);
    };

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
                    title: `${t('delete')}`,
                    html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${product?.name} ?`,
                    padding: '2em',
                    showCancelButton: true,
                    cancelButtonText: `${t('cancel')}`,
                    confirmButtonText: `${t('confirm')}`,
                    reverseButtons: true,
                })
                .then((result) => {
                    if (result.value) {
                        DeleteOrderDetail({ id: router.query.id, itemId: id }).then(() => {
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

    const handleSearchP = (param: any) => {
        setSearchP(param)
    }

    const handleSearchR = (param: any) => {
        setSearchR(param)
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
            render: ({ product, replacementPart, name }: any) => <span>{product?.name || replacementPart?.name || name}</span>,
            sortable: false
        },
        { accessor: 'quantity', title: `${t('quantity')}`, sortable: false },
        {
            accessor: 'price',
            title: `${t('price')}`,
            render: ({ price }: any) => <span>{formatNumber(moneyToNumber(String(price)))}</span>,
            sortable: false
        },
        {
            accessor: 'total',
            title: `${t('total')}`,
            render: ({ total }: any) => <span>{formatNumber(moneyToNumber(String(total)))}</span>,
            sortable: false
        },
        { accessor: 'note', title: `${t('notes')}`, sortable: false },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="flex items-center w-max mx-auto gap-2">
                    {
                        (data?.status !== 'APPROVED' || data?.status === 'DRAFT' || router.query.id === 'create') &&
                        <>
                            <button className='bg-[#9CD3EB] flex justify-between gap-1 p-1 rounded' type="button" onClick={() => handleEdit(records)}>
                                <IconPencil /> <span>{`${t('edit')}`}</span>
                            </button>
                            <button className='bg-[#E43940] flex justify-between gap-1 p-1 rounded text-[#F5F5F5]' type="button" onClick={() => handleDelete(records)}>
                                <IconTrashLines />  <span>{`${t('delete')}`}</span>
                            </button>
                        </>
                    }
                </div>
            ),
        },
    ];

    const handleReturnFlowApprove = (action: any, sign: number) => {
        switch (action) {
            case "FORWARD":
            case "SUBMIT":
                return sign === 2 ? `${t('continue_approval')}` : `${t('continue_initial')}`;
            case "REJECT":
                return `${t('reject')}`
            case "APPROVE":
                return `${t('approve')}`
            case "SUBMIT_RETURN":
                return sign === 2 ? `${t('continue_approval_return')}` : `${t('continue_initial_return')}`;
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
    ];


    const handleCancel = () => {
        router.push("/warehouse-process/order")
    };

    const handleOrder = (param: any) => {
        // const request: any = [];
        // if (param.warehouseId.label === "Gara") {
        //     param.repairRequestId.map((item: any) => request.push({ type: "repairRequest", id: item.value }))
        // } else {
        //     param.proposalIds.map((item: any) => request.push({ type: "proposal", id: item.value }))
        // }
        const query: any = {
            name: param.name,
            // requests: request,
            type: "PURCHASE",
            // code: param.code,
            // estimatedDeliveryDate: moment(param.estimatedDeliveryDate).format('YYYY-MM-DD HH:mm:ss'),
            // provider: param.provider,
            note: param.note,
            warehouseId: Number(param.warehouseId.value)
        };
        if (data) {
            EditOrder({ id: data.id, ...query }).then(() => {
                showMessage(`${t('edit_success')}`, 'success');
                handleCancel();
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            CreateOrder(query).then((res) => {
                if (listDataDetail.length > 0) {
                    handleDetail(res.data.id);
                } else {
                    if (router.query.id === 'create' && send === true) {
                        setId(res.data.id);
                        setOpenModalApproval(true);
                    } else {
                        handleCancel();
                    }
                }
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message[0].error}`, 'error');
            });
        }
    }

    const handleDetail = (id: any) => {
        AddOrderDetails({
            id: id,
            details: listDataDetail.map((item: any, index: number) => {
                return {
                    ...item,
                    id: index
                }
            })
        }).then(() => {
            showMessage(`${t('create_success')}`, 'success');
            if (router.query.id === 'create' && send === true) {
                setId(id);
                setOpenModalApproval(true);
            } else {
                handleCancel();
            }
        }).catch((err) => {
            DeleteOrder({ id })
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    }

    useEffect(() => {
        if (proposalPagiantion?.page === undefined) return;
        if (proposalPagiantion?.page === 1) {
            setDataProposalDropdown(proposals?.data)
        } else {
            setDataProposalDropdown([...dataProposalDropdown, ...proposals?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proposalPagiantion])

    const handleMenuScrollToBottomProposal = () => {
        setTimeout(() => {
            setPageProposal(proposalPagiantion?.page + 1);
        }, 1000);
    }

    const [idProposal, setIdProposal] = useState<any>();
    const [idRepair, setIdRepair] = useState<any>();
    const [statusProposal, setStatusProposal] = useState<any>(false);
    const [statusRepair, setStatusRepair] = useState<any>(false);

    const getValueDetail = (param: any) => {
        if (param.value?.length <= 0) {
            setListDataDetail([]);
        } else {
            switch (param.type) {
                case "repairRequest":
                    setIdRepair(param?.value);
                    break;
                default:
                    setIdProposal(param?.value);
                    break;
            }
        }
    }

    useEffect(() => {
        let a: any = [];
        idRepair?.map((item: any) => {
            const found = listDataDetail?.find((index: any) => index.repairRequestId === item)
            if (found) {
                listDataDetail.map((index: any) => {
                    if (index.repairRequestId === item) a.push(index)
                })
                setListDataDetail(a);
                setStatusRepair(true);
            } else {
                GetRepairDetail({ id: item }).then((res) => {
                    if (listDataDetail?.length > 0) {
                        setListDataDetail([...listDataDetail, ...res.data]);
                    } else {
                        setListDataDetail(res.data);
                    }
                    setStatusRepair(true);
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idRepair])

    useEffect(() => {
        let ans: any = listDataDetail?.reduce((agg: any, curr: any) => {
            let found = agg.find((x: any) => x.replacementPartId === curr.replacementPartId);
            if (found) {
                found.quantity = found.quantity + curr.quantity
                found.note = (found?.note || curr?.note) && found?.note + "," + curr?.note
            }
            else {
                agg.push({
                    ...curr,
                    quantity: curr.quantity
                });
            }
            return agg;
        }, []);
        setListDataDetail(ans);
        setStatusRepair(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusRepair]);

    useEffect(() => {
        let a: any = [];
        idProposal?.map((item: any) => {
            const found = listDataDetail?.find((index: any) => index.proposalId === item)
            if (found) {
                listDataDetail.filter((index: any) => {
                    if (index.proposalId === item) a.push(index)
                })
                setListDataDetail(a);
                setStatusProposal(true);
            } else {
                GetProposalDetail({ id: item }).then((res) => {
                    if (listDataDetail?.length > 0) {
                        setListDataDetail([...listDataDetail, ...res.data]);
                    } else {
                        setListDataDetail(res.data);
                    }
                    setStatusProposal(true);
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idProposal])

    useEffect(() => {
        let ans: any = listDataDetail?.reduce((agg: any, curr: any) => {
            let found = agg.find((x: any) => x.productId === curr.productId);
            if (found) {
                found.quantity = found.quantity + curr.quantity
                found.note = found.note + "," + curr.note
            }
            else {
                agg.push({
                    ...curr,
                    quantity: curr.quantity
                });
            }
            return agg;
        }, []);
        setListDataDetail(ans);
        setStatusProposal(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusProposal]);

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

    const handleReject = () => {
        setOpenModalReject(true);
    }

    const Approve = () => {
        OrderApprove({ id: router.query.id }).then(() => {
            showMessage(`${t('approve_success')}`, 'success');
            handleCancel();
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    useEffect(() => {
        if (repairPagination?.page === undefined) return;
        if (repairPagination?.page === 1) {
            setDataRepairDropdown(dropdownRepair?.data)
        } else {
            setDataRepairDropdown([...dataRepairDropdown, ...dropdownRepair?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repairPagination]);

    const handleMenuScrollToBottomRepair = () => {
        setTimeout(() => {
            setPageRepair(repairPagination?.page + 1);
        }, 1000);
    }

    useEffect(() => {
        if (data?.approvalHistory.find((item: any) => Number(item.approverId) === Number(id))) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [data, id]);

    const [department, setDepartment] = useState<any>();

    useEffect(() => {
        if (data?.createdBy) {
            setDepartment(data?.createdBy.department?.name === "Phòng tổ chức hành chính" ? "PTCHC" : '')
        } else {
            setDepartment(JSON.parse(localStorage.getItem('profile') || '').department?.code)
        }
    }, [data?.createdBy, router]);

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
            prop: 'quantity',
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
    // const [listDataImport, setListDataImport] = useState<>();
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
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_order_en.xlsx`, '_blank');
                break;
            case 'la':
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_order_lo.xlsx`, '_blank');
                break;
            default:
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_order_vi.xlsx`, '_blank');
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
                    <h1 className='page-title'>{t('order')}</h1>
                    {/* {
                        typeof window !== "undefined" && data?.status === "APPROVED" &&
                        <PdfCard product={listDataDetail} data={data} />
                    } */}
                    <Link href="/warehouse-process/order">
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
                                {t('order_infomation')}
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
                                            handleOrder(values);
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
                                                            <Field
                                                                autoComplete="off"
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
                                                            <Field
                                                                autoComplete="off"
                                                                name="timeRequest"
                                                                render={({ field }: any) => (
                                                                    <Flatpickr
                                                                        data-enable-time
                                                                        options={{
                                                                            enableTime: true,
                                                                            dateFormat: "d/m/Y  | H:i",
                                                                        }}
                                                                        value={field.value}
                                                                        className={true ? "form-input bg-[#f2f2f2] calender-input" : "form-input calender-input"}
                                                                        disabled={true}
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='mt-5'>
                                                        <label htmlFor="name" className='label'> {t('name_order')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field
                                                            autoComplete="off"
                                                            name="name"
                                                            type="text"
                                                            id="name"
                                                            placeholder={`${t('enter_name')}`}
                                                            className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.name ? (
                                                            <div className="text-danger mt-1"> {`${errors.name}`} </div>
                                                        ) : null}
                                                        {/* <div className="w-1/2">
                                                            <label htmlFor="code" className='label'> {t('code_order')} < span style={{ color: 'red' }}>* </span></label >
                                                            <Field
                                                                autoComplete="off"
                                                                name="code"
                                                                type="text"
                                                                id="code"
                                                                placeholder={`${t('enter_code')}`}
                                                                className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                disabled={disable}
                                                            />
                                                            {submitCount && errors.code ? (
                                                                <div className="text-danger mt-1"> {`${errors.code}`} </div>
                                                            ) : null}
                                                        </div> */}
                                                    </div>
                                                    {/* <div className='flex justify-between gap-5 mt-5 mb-5'>
                                                        <div className="w-1/2">
                                                            <label htmlFor="warehouseId" className='label'>< span style={{ color: 'red' }}>* </span> {t('warehouse')}</label >
                                                            <Select
                                                                id='warehouseId'
                                                                name='warehouseId'
                                                                options={warehouses?.data}
                                                                isLoading={warehouseLoading}
                                                                maxMenuHeight={160}
                                                                value={values?.warehouseId}
                                                                onChange={e => {
                                                                    setFieldValue('warehouseId', e)
                                                                    setFieldValue('repairRequestId', "")
                                                                    setFieldValue('proposalIds', "")
                                                                    setListDataDetail([])
                                                                    setEntity(e.label === "Gara" ? "repairRequest" : '');
                                                                    setWarehouseId(e.value);
                                                                }}
                                                                isDisabled={disable}
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
                                                                        options={dataRepairDropdown}
                                                                        onMenuOpen={() => setPageRepair(1)}
                                                                        onMenuScrollToBottom={handleMenuScrollToBottomRepair}
                                                                        isLoading={repairLoading}
                                                                        maxMenuHeight={160}
                                                                        onInputChange={(e) => handleSearchR(e)}
                                                                        value={values?.repairRequestId}
                                                                        isMulti
                                                                        onChange={e => {
                                                                            setFieldValue('repairRequestId', e);
                                                                            getValueDetail({ value: e.map((item: any) => { return item.value }), type: "repairRequest" });

                                                                        }}
                                                                        isDisabled={disable}
                                                                    />
                                                                    {submitCount && errors.repairRequestId ? (
                                                                        <div className="text-danger mt-1"> {`${errors.repairRequestId}`} </div>
                                                                    ) : null}
                                                                </div> :
                                                                <div className="w-1/2">
                                                                    <label htmlFor="proposalIds" className='label'> {t('choose_proposal')} < span style={{ color: 'red' }}>* </span></label >
                                                                    <Select
                                                                        isDisabled={disable}
                                                                        id='proposalIds'
                                                                        name='proposalIds'
                                                                        options={dataProposalDropdown}
                                                                        onMenuOpen={() => { setPageProposal(1) }}
                                                                        onMenuScrollToBottom={handleMenuScrollToBottomProposal}
                                                                        isLoading={proposalLoading}
                                                                        onInputChange={(e) => handleSearchP(e)}
                                                                        maxMenuHeight={160}
                                                                        value={values?.proposalIds}
                                                                        isMulti
                                                                        onChange={e => {
                                                                            setFieldValue('proposalIds', e)
                                                                            getValueDetail({ value: e.map((item: any) => { return item.value }), type: "proposal" });
                                                                        }}
                                                                    />
                                                                    {submitCount && errors.proposalIds ? (
                                                                        <div className="text-danger mt-1"> {`${errors.proposalIds}`} </div>
                                                                    ) : null}
                                                                </div>
                                                        }
                                                    </div> */}
                                                    <div className='flex justify-between gap-5 mt-5'>
                                                        {/* <div className="w-1/2">
                                                            <label htmlFor="estimatedDeliveryDate" className='label'> {t('estimated_delivery_date')} < span style={{ color: 'red' }}>* </span></label >
                                                            <Field
                                                                autoComplete="off"
                                                                name="estimatedDeliveryDate"
                                                                id="estimatedDeliveryDate"
                                                                render={({ field }: any) => (
                                                                    <Flatpickr
                                                                        data-testId='date'
                                                                        data-enable-time
                                                                        placeholder={`${t('DD/MM/YYYY HH:mm')}`}
                                                                        options={{
                                                                            enableTime: true,
                                                                            dateFormat: 'd/m/Y H:i'
                                                                        }}
                                                                        value={field?.value}
                                                                        onChange={e => setFieldValue("estimatedDeliveryDate", moment(e[0]).format("YYYY-MM-DD hh:mm"))}
                                                                        className={disable ? "form-input bg-[#f2f2f2] calender-input" : "form-input calender-input"}
                                                                        disabled={disable}
                                                                    />
                                                                )}
                                                            />
                                                            {submitCount && errors.estimatedDeliveryDate ? (
                                                                <div className="text-danger mt-1"> {`${errors.estimatedDeliveryDate}`} </div>
                                                            ) : null}
                                                        </div> */}
                                                        <div className="w-1/2">
                                                            <label htmlFor="warehouseId" className='label'>< span style={{ color: 'red' }}>* </span> {t('warehouse')}</label >
                                                            <Select
                                                                id='warehouseId'
                                                                name='warehouseId'
                                                                options={warehouses?.data}
                                                                isLoading={warehouseLoading}
                                                                maxMenuHeight={160}
                                                                value={values?.warehouseId}
                                                                onChange={e => {
                                                                    setFieldValue('warehouseId', e)
                                                                    setFieldValue('repairRequestId', "")
                                                                    setFieldValue('proposalIds', "")
                                                                    setListDataDetail([])
                                                                    setEntity(e.label === "Gara" ? "repairRequest" : '');
                                                                    setWarehouseId(e.value);
                                                                }}
                                                                isDisabled={disable}
                                                            />
                                                            {submitCount && errors.warehouseId ? (
                                                                <div className="text-danger mt-1"> {`${errors.warehouseId}`} </div>
                                                            ) : null}
                                                        </div>
                                                        {
                                                            router.query.id !== 'create' &&
                                                            data?.status !== "APPROVED" &&
                                                            data?.status !== "DRAFT" &&
                                                            <div className="w-1/2">
                                                                <label htmlFor="currentApprover" className='label'> {t('wait_approver')} < span style={{ color: 'red' }}>* </span></label >
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
                                                        }
                                                    </div>
                                                    <div className='mt-5'>
                                                        <label htmlFor="note" className='label'> {t('note')}</label >
                                                        <Field
                                                            autoComplete="off"
                                                            id="note"
                                                            as="textarea"
                                                            rows="2"
                                                            name="note"
                                                            className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.note ? (
                                                            <div className="text-danger mt-1"> {`${errors.note}`} </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                {/* {
                                                    <RenturnError errors={errors} submitCount={submitCount} />
                                                } */}
                                            </Form>
                                        )
                                        }
                                    </Formik>
                                </AnimateHeight>
                            </div>
                        </div>
                        <div className="rounded">
                            <button
                                type="button"
                                className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                onClick={() => handleActive(2)}
                            >
                                {t('product_list')}
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
                                                        <button data-testId='modal-order-btn' type="button" onClick={e => { setOpenModal(true); setDataDetail(undefined); }} className="btn btn-primary btn-sm m-1 custom-button" >
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
                                        orderDetailMutate={mutate}
                                        warehouseId={warehouseId}
                                    />
                                    <ApprovalModal
                                        entity={`order${warehouseId === 7 ? '-tchc' : ''}`}
                                        btnRule={btnRule}
                                        openModal={openModalApproval}
                                        setOpenModal={setOpenModalApproval}
                                        handleData={handleData}
                                        data={data}
                                        handleCancel={handleCancel}
                                        id={id}
                                        sign={sign}
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
                                    onClick={() => handleActive(3)}
                                >
                                    {t('history_approve')}
                                    <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(3) ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </div>
                                </button>
                                <div className={`${active.includes(3) ? 'custom-content-accordion' : ''}`}>
                                    <AnimateHeight duration={300} height={active.includes(3) ? 'auto' : 0}>
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
                        <SwitchBtn
                            entity={`order${warehouseId === 7 ? '-tchc' : ''}`}
                            handleCancel={handleCancel}
                            handleSubmit={handleSubmit}
                            handleSubmitApproval={handleSubmitApproval}
                            handleReject={handleReject}
                            handleApprove={handleApprove}
                            setSign={setSign}
                            rbac={['proposal:create', 'proposal:update']}
                            typeRbac={'OR'}
                            disable={disable}
                            data={data}
                            id={id}
                        />
                    </div>
                </div >
            </div >
        </>
    );
};
export default DetailPage;
