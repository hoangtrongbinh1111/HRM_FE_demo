import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { readExcelFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import { WarehousingBillDetail, WarehousingBillListRequest } from '@/services/swr/warehousing-bill.swr';
import { CheckWarehousingBillDetail, CreateWarehousingBill, DeleteWarehousingBill, EditWarehousingBill, GetWarehousingBill, WarehousingBillAddDetails, WarehousingBillApprove, WarehousingBillDeleteDetail, WarehousingBillFinish } from '@/services/apis/warehousing-bill.api';
import { Field, Form, Formik } from 'formik';
import AnimateHeight from 'react-animate-height';
import Select from 'react-select';
import * as Yup from 'yup';
import { DropdownProposals, DropdownRepair, DropdownWarehouses } from '@/services/swr/dropdown.swr';
import IconBackward from '@/components/Icon/IconBackward';
import Link from 'next/link';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import { GetProposal } from '@/services/apis/proposal.api';
import { GetRepair } from '@/services/apis/repair.api';
import { GetOrder } from '@/services/apis/order.api';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import moment from 'moment';
import IconPlus from '@/components/Icon/IconPlus';
import DetailModal from '../modal/DetailModal';
import Swal from 'sweetalert2';
import TallyModal from '../../TallyModal';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import IconImportFile from '@/components/Icon/IconImportFile';
import { GetProductByCode } from '@/services/apis/product.api';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import { IRootState } from '@/store';
import { useProfile } from '@/services/swr/profile.swr';
import SwitchBtn from '@/pages/warehouse-process/switchBtn';
import IconChecks from '@/components/Icon/IconChecks';
import IconCircleCheck from '@/components/Icon/IconCircleCheck';

interface Props {
    [key: string]: any;
}

const ExportPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [disable, setDisable] = useState<any>(false);
    const [warehouseId, SetWarehouseId] = useState<any>();
    const [data, setData] = useState<any>();
    const [dataDetail, setDataDetail] = useState<any>();
    const [listDataDetail, setListDataDetail] = useState<any>([]);
    const [openModal, setOpenModal] = useState(false);
    const [openModalTally, setOpenModalTally] = useState(false);
    const [openModalReturn, setOpenModalReturn] = useState(false);
    const [query, setQuery] = useState<any>();
    const formRef = useRef<any>();
    const [send, SetSend] = useState<any>(false);
    const [openModalApproval, setOpenModalApproval] = useState(false);
    const [openModalReject, setOpenModalReject] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [sign, setSign] = useState();
    const [btnRule, setBtnRule] = useState(false);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const { data: userData } = useProfile();
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

    const handleTally = (record: any, type: number) => {
        if (type === 0) {
            CheckWarehousingBillDetail({ id: router.query.id, detailId: record?.id, quantity: record.proposalQuantity }).then(() => {
                showMessage(`${t('edit_success')}`, 'success');
                handleData();
                mutate()
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            setOpenModalTally(true);
            setDataDetail(record);
        }
    }

    const handleReturn = () => {
        setOpenModalReturn(true);
        setData(undefined);
    }


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

    const handleChangePage = (page: number, pageSize: number) => {
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: page,
                    perPage: pageSize,
                },
            },
            undefined,
            { shallow: true },
        );
        return pageSize;
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
            render: ({ returnQuantity, actualQuantity }: any) => (<>{data?.exportStatus ? (actualQuantity || 0) - (returnQuantity || 0) : ''}</>),
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
                            data?.status === "IN_PROGRESS" && disable &&
                            <RBACWrapper permissionKey={['warehousingBillExport:tally']} type={'AND'}>
                                {
                                    data?.proposal?.createdBy.id === userData?.data.id &&
                                    !data?.exportStatus &&
                                    data?.approvalHistory?.filter((item: any) => item?.approverId === userData?.data.id).length <= 0 &&
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
                )
            }
        },
    ]

    const handleCancel = () => {
        router.push("/warehouse-process/warehousing-bill/export")
    };

    const handleChangeComplete = () => {
        WarehousingBillFinish({ id: router.query.id }).then(() => {
            // handleCancel();
            mutate();
            showMessage(`${t('update_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const [initialValue, setInitialValue] = useState<any>();
    const [pageProposal, setPageProposal] = useState(1);
    const [pageWarehouse, setPageWarehouse] = useState(1);
    const [dataProposalDropdown, setDataProposalDropdown] = useState<any>([]);
    const [dataWarehouseDropdown, setDataWarehouseDropdown] = useState<any>([]);
    const [active, setActive] = useState<any>([1, 2]);

    const [pageRepair, setPageRepair] = useState<any>(1);
    const [dataRepairDropdown, setDataRepairDropdown] = useState<any>([]);
    const [entity, setEntity] = useState<any>("");
    const [searchProposal, setSearchProposal] = useState<any>();
    const [searchRepair, setSearchRepair] = useState<any>();
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');

    const SubmittedForm = Yup.object().shape({
        // name: Yup.string().required(`${t('please_fill_name')}`),
        // type: new Yup.ObjectSchema().required(`${t('please_fill_type')}`),
        // proposalId: new Yup.ObjectSchema().required(`${t('please_fill_proposal')}`),
        warehouseId: new Yup.ObjectSchema().required(`${t('please_fill_warehouse')}`),
    });

    const { data: proposals, pagination: proposalPagination, isLoading: proposalLoading } = DropdownProposals({ sortBy: 'id.desc', page: pageProposal, type: "SUPPLY", isCreatedBill: true, status: "APPROVED", search: searchProposal, warehouseId: warehouseId });
    const { data: warehouses, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({ page: pageWarehouse });
    const { data: listRequest } = WarehousingBillListRequest({ id: router.query.proposalId });
    const { data: dropdownRepair, pagination: repairPagination, isLoading: repairLoading } = DropdownRepair({ sortBy: 'id.desc', page: pageRepair, isCreatedBill: true, search: searchRepair })

    useEffect(() => {
        if (router.query.proposalId) {
            setData(listRequest?.data[0]);
            getValueDetail({ type: listRequest?.data[0].entity, value: router.query.proposalId });
        }
    }, [listRequest, router.query.proposalId])

    const handleWarehousing = (param: any) => {
        const query: any = {
            warehouseId: Number(param.warehouseId.value),
            type: "EXPORT",
            note: param.note,
            // name: param.name
        };
        if (param.proposalId) {
            query.proposalId = Number(param.proposalId.value)
        }
        if (param.repairRequestId) {
            query.repairRequestId = Number(param.repairRequestId.value)
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
            if (router.query.id === 'create' && send === true) {
                setId(id);
                setOpenModalApproval(true);
            } else {
                handleCancel();
            }
            // handleCancel();
        }).catch((err) => {
            DeleteWarehousingBill({ id })
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }
    const [reason, setReason] = useState();
    useEffect(() => {
        setInitialValue({
            proposalId: data ? {
                value: `${data?.proposal?.id || data.id}`,
                label: `${data?.proposal?.name || data?.name}`
            } : "",
            repairRequestId: data ? {
                value: `${data?.repairRequest?.id || data.id}`,
                label: `${data?.repairRequest?.name || data?.name}`
            } : "",
            warehouseId: data?.warehouse ? {
                value: `${data?.warehouse?.id}`,
                label: `${data?.warehouse?.name}`
            } : "",
            note: data?.note !== undefined ? `${data?.note}` : "",
            reason: data?.reason !== undefined ? `${data?.reason?.name}` : "",
            name: router.query.proposalId ? "" : data?.name ? `${data?.name}` : "",
            createdBy: data?.proposal || data?.repairRequest ? (data?.proposal?.createdBy?.fullName || data?.repairRequest?.createdBy.fullName) : "",
            personRequest: data?.createdBy ? data?.createdBy?.fullName : JSON.parse(localStorage.getItem('profile') || "").fullName
        })
        setEntity(data?.repairRequest ? "repairRequest" : "")
        setReason(data?.reason?.name ? data?.reason?.name : undefined)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

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
        if (proposalPagination?.page === undefined) return;
        if (proposalPagination?.page === 1) {
            setDataProposalDropdown(proposals?.data)
        } else {
            setDataProposalDropdown([...dataProposalDropdown, ...proposals?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proposalPagination])

    useEffect(() => {
        if (warehousePagination?.page === undefined) return;
        if (warehousePagination?.page === 1) {
            setDataWarehouseDropdown(warehouses?.data)
        } else {
            setDataWarehouseDropdown([...dataWarehouseDropdown, ...warehouses?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [warehousePagination]);

    const handleMenuScrollToBottomProposal = () => {
        setTimeout(() => {
            setPageProposal(proposalPagination?.page + 1);
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

    useEffect(() => {
        if (repairPagination?.page === undefined) return;
        if (repairPagination?.page === 1) {
            setDataRepairDropdown(dropdownRepair?.data)
        } else {
            setDataRepairDropdown([...dataRepairDropdown, ...dropdownRepair?.data])
        }
    }, [dataRepairDropdown, dropdownRepair, repairPagination]);

    const handleMenuScrollToBottomRepair = () => {
        setTimeout(() => {
            setPageRepair(repairPagination?.page + 1);
        }, 1000);
    }

    const getValueDetail = (param: any) => {
        switch (param.type) {
            case "proposal":
                GetProposal({ id: param.value }).then((res) => {
                    setListDataDetail(
                        res.data.details.map((item: any) => {
                            if (!item.proposalQuantity) {
                                item.proposalQuantity = item.quantity
                            }
                            return item;
                        })
                    );
                    param.setFieldValue("createdBy", res.data.createdBy.fullName)
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
                break;
            case "repairRequest":
                GetRepair({ id: param.value }).then((res) => {
                    setListDataDetail(
                        res.data.details.map((item: any) => {
                            if (!item.proposalQuantity) {
                                item.proposalQuantity = item?.quantity
                            }
                            return item;
                        })
                    );
                    param.setFieldValue("createdBy", res.data.createdBy.fullName)
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
                break;
            default:
                GetOrder({ id: param.value }).then((res) => {
                    setListDataDetail(res.data.details);
                    param.setFieldValue("createdBy", res.data.createdBy.fullName)
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
                break;
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
                    <h1 className='page-title'>{t('warehousing_bill_export_text')}</h1>
                    <Link href="/warehouse-process/warehousing-bill/export">
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
                                {t('warehousing_bill_export_info')}
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
                                                                        onChange={e => setFieldValue("estimatedDeliveryDate", moment(e[0]).format("DD/MM/YYYY hh:mm"))}
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
                                                        {/* <div className="w-1/2">
                                                            <label htmlFor="type" className='label'> < span style={{ color: 'red' }}>* </span>{t('type_proposal')}</label >
                                                            <Select
                                                                id='type'
                                                                name='type'
                                                                options={warehousingBill}
                                                                maxMenuHeight={160}
                                                                value={values?.type}
                                                                onChange={e => {
                                                                    if (e.value === "EXPORT") {
                                                                        setEntity("repairRequest");
                                                                    } else if (e.value === "EXPORT1") {
                                                                        setEntity("proposal");
                                                                    } else {
                                                                        setEntity("");
                                                                    }
                                                                    setFieldValue('type', e)
                                                                }}
                                                                isDisabled={disable}
                                                            />
                                                            {submitCount && errors.type ? (
                                                                <div className="text-danger mt-1"> {`${errors.type}`} </div>
                                                            ) : null}
                                                        </div> */}
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
                                                                    setEntity(e.label === "Gara" ? "repairRequest" : '');
                                                                    SetWarehouseId(e.value)
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
                                                                        value={values?.repairRequestId}
                                                                        onInputChange={e => setSearchRepair(e)}
                                                                        onChange={e => {
                                                                            setFieldValue('repairRequestId', e);
                                                                            getValueDetail({ value: e?.value, type: "repairRequest", setFieldValue });
                                                                        }}
                                                                        isDisabled={disable}
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
                                                                        options={dataProposalDropdown}
                                                                        onMenuOpen={() => setPageProposal(1)}
                                                                        onMenuScrollToBottom={handleMenuScrollToBottomProposal}
                                                                        isLoading={proposalLoading}
                                                                        maxMenuHeight={160}
                                                                        value={values?.proposalId}
                                                                        onInputChange={e => setSearchProposal(e)}
                                                                        onChange={e => {
                                                                            setFieldValue('proposalId', e)
                                                                            getValueDetail({ value: e?.value, type: "proposal", setFieldValue });
                                                                        }}
                                                                        isDisabled={disable || (warehouseId ? false : true)}
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
                                                            className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.note ? (
                                                            <div className="text-danger mt-1"> {`${errors.note}`} </div>
                                                        ) : null}
                                                    </div>
                                                    {
                                                        reason &&
                                                        <div className="mt-5">
                                                            <label htmlFor="reason" className='label'> {t('reason_return')}</label >
                                                            <Field autoComplete="off"
                                                                name="reason"
                                                                as="textarea"
                                                                id="reason"
                                                                placeholder={`${t('enter_note')}`}
                                                                className={"form-input bg-[#f2f2f2]"}
                                                                disabled={true}
                                                            />
                                                            {submitCount && errors.reason ? (
                                                                <div className="text-danger mt-1"> {`${errors.reason}`} </div>
                                                            ) : null}
                                                        </div>
                                                    }
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
                                        <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                                            <div className="flex items-center flex-wrap">
                                                {
                                                    !disable &&
                                                    <>
                                                        <button type="button" onClick={(e) => setOpenModal(true)} className="btn btn-primary btn-sm m-1 custom-button" >
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
                                    {t('Applicant')} {'->'} {t('receiver')} {'->'} {t('stocker')} {'->'} {t('accounting_manager')} {'->'} {t('Director')}
                                </strong>
                            </p>
                        </div>
                        <SwitchBtn
                            entity={'warehousingBillExport'}
                            handleCancel={handleCancel}
                            handleSubmit={handleSubmit}
                            handleSubmitApproval={handleSubmitApproval}
                            handleReject={handleReject}
                            handleApprove={handleApprove}
                            handleFinish={handleChangeComplete}
                            handleReturn={handleReturn}
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
                </div >
            </div >
        </>
    );
};
export default ExportPage;
