/* eslint-disable @next/next/no-img-element */
import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { readExcelFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPencil from '@/components/Icon/IconPencil';
import IconPlus from '@/components/Icon/IconPlus';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import HandleDetailModal from '../modal/DetailModal';
import { StocktakeDetail } from '@/services/swr/stocktake.swr';
import { AddStocktakeDetailAuto, AddStocktakeDetails, CreateStocktake, DeleteStocktake, DeleteStocktakeDetail, EditStocktake, GetStocktake, StocktakeApprove, StocktakeCancel, StocktakeFinish, StocktakeStart } from '@/services/apis/stocktake.api';
import TallyModal from '../modal/TallyModal';
import { Field, Form, Formik } from 'formik';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Link from 'next/link';
import IconBackward from '@/components/Icon/IconBackward';
import * as Yup from 'yup';
import Select, { components } from 'react-select';
import { DropdownUsers, DropdownWarehouses } from '@/services/swr/dropdown.swr';
import moment from 'moment';
import { GetProduct, GetProductByCode } from '@/services/apis/product.api';
import IconListCheck from '@/components/Icon/IconListCheck';
import { Upload } from '@/services/apis/upload.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import IconX from '@/components/Icon/IconX';
import ImageModal from '../modal/ImageModal';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { IRootState } from '@/store';
import IconImportFile from '@/components/Icon/IconImportFile';
import IconNewDownload from '@/components/Icon/IconNewDownload';
interface Props {
    [key: string]: any;
}

const DetailPage = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [data, setData] = useState<any>();
    const [disable, setDisable] = useState<any>(false);
    const [dataTally, setDataTally] = useState<any>();
    const [openModal, setOpenModal] = useState(false);
    const [openModalTally, setOpenModalTally] = useState(false);
    const [initialValue, setInitialValue] = useState<any>();
    const [active, setActive] = useState<any>([1, 2]);
    const [query, setQuery] = useState<any>();
    const [dataWarehouseDropdown, setDataWarehouseDropdown] = useState<any>([]);
    const [dataUserDropdown, setDataUserDropdown] = useState<any>([]);
    const [pageUser, setPageUser] = useState(1);
    const [pageWarehouse, setPageWarehouse] = useState(1);
    const [listDataDetail, setListDataDetail] = useState<any>();
    const [dataDetail, setDataDetail] = useState<any>();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [warehouseId, setWarehouseId] = useState<any>();
    const fileRef = useRef<any>();
    const [open, setOpen] = useState<any>(false);
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');
    const [openModalApproval, setOpenModalApproval] = useState(false);
    const [path, setPath] = useState<any>([]);
    const [dataPath, setDataPath] = useState<any>();
    const [openModalReject, setOpenModalReject] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required(`${t('please_fill_name')}`),
        participants: new Yup.ArraySchema().required(`${t('please_fill_proposal')}`),
        warehouseId: new Yup.ObjectSchema().required(`${t('please_fill_warehouse')}`),
        startDate: Yup.string().required(`${t('please_fill_date')}`),
        endDate: Yup.string().required(`${t('please_fill_date')}`)

    });

    // get data
    const { data: stocktakeDetails, pagination, mutate, isLoading } = StocktakeDetail({ ...query });
    const { data: users, pagination: paginationUser, isLoading: userLoading } = DropdownUsers({ page: pageUser });
    const { data: warehouses, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({ page: pageWarehouse });

    useEffect(() => {
        dispatch(setPageTitle(`${t('Stocktake')}`));
    });
    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(stocktakeDetails?.data);
        }
    }, [stocktakeDetails?.data, router]);

    useEffect(() => {
        if (Number(router.query.id)) {
            setQuery({ id: router.query.id, ...router.query });
            handleData();
        }
        if (typeof window !== 'undefined') {
            setId(Number(localStorage.getItem("idUser")));
            setIsHigh(localStorage.getItem('isHighestPosition'));
        }
        setDisable(router.query.status === "true" ? true : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

    const handleEdit = (data: any) => {
        setOpenModal(true);
        setDataDetail(data);
    };

    const handleDelete = ({ id, product }: any) => {
        if (router.query.id === 'create') {
            setListDataDetail(
                listDataDetail.filter((item: any) => item.productId !== id)
            );
        } else {
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
                        DeleteStocktakeDetail({ id: router.query.id, itemId: id }).then(() => {
                            mutate();
                            showMessage(`${t('delete_product_success')}`, 'success');
                        }).catch((err) => {
                            showMessage(`${err?.response?.data?.message}`, 'error');
                        });
                    }
                });
        }
    };

    const handleOpenTally = (value: any) => {
        setOpenModalTally(true);
        setDataTally(value);
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
            render: ({ product, name }: any) => <span>{product?.name || name}</span>,
            sortable: false
        },
        {
            accessor: 'name',
            title: `${t('dvt')}`,
            render: ({ product, unit }: any) => <span>{product?.unit.name || unit?.name}</span>,
            sortable: false
        },
        { accessor: 'countedQuantity', title: `${t('quantity_counted')}`, sortable: false },
        { accessor: 'openingQuantity', title: `${t('opening_quantity')}`, sortable: false },
        { accessor: 'quantityDifference', title: `${t('amount_of_difference')}`, sortable: false },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => (
                <>
                    {
                        !disable &&
                        <div className="flex items-center w-max mx-auto gap-2">
                            {
                                (data?.status === "DRAFT" || router.query.id === "create") &&
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
                    }
                    {
                        data?.status === "STOCKTAKING" &&
                        <RBACWrapper permissionKey={['stocktake:tally']} type={'AND'}>
                            <button className='bg-[#C5E7AF] flex justify-between gap-1 p-1 rounded' type="button" onClick={() => handleOpenTally(records)}>
                                <IconListCheck />  <span>{`${t('tally')}`}</span>
                            </button>
                        </RBACWrapper>
                    }
                </>
            ),
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
    ];

    const handleCancel = () => {
        router.push('/warehouse-process/stocktake');
    };

    const handleChangeComplete = (id: any) => {
        StocktakeStart({ id: id }).then(() => {
            showMessage(`${t('update_success')}`, 'success');
            handleCancel();
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleAutoAdd = () => {
        AddStocktakeDetailAuto({ id: router.query.id }).then(() => {
            showMessage(`${t('update_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleFinish = () => {
        StocktakeFinish({ id: router.query.id }).then(() => {
            router.push('/warehouse-process/stocktake');
            showMessage(`${t('update_success')}`, 'success');
        }).catch((err) => {
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
        if (paginationUser?.page === undefined) return;
        if (paginationUser?.page === 1) {
            setDataUserDropdown(users?.data)
        } else {
            setDataUserDropdown([...dataUserDropdown, ...users?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationUser])

    useEffect(() => {
        if (warehousePagination?.page === undefined) return;
        if (warehousePagination?.page === 1) {
            setDataWarehouseDropdown(warehouses?.data)
        } else {
            setDataWarehouseDropdown([...dataWarehouseDropdown, ...warehouses?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [warehousePagination])

    const handleMenuScrollToBottomUser = () => {
        setTimeout(() => {
            setPageUser(paginationUser?.page + 1);
        }, 1000);
    }

    const handleMenuScrollToBottomWarehouse = () => {
        setTimeout(() => {
            setPageWarehouse(warehousePagination?.page + 1);
        }, 1000);
    }

    const handleStocktake = (param: any) => {
        const query: any = {
            name: param.name,
            warehouseId: Number(param.warehouseId.value),
            description: param.description,
            startDate: moment(param.startDate).format("YYYY-MM-DD hh:mm:ss"),
            endDate: moment(param.endDate).format("YYYY-MM-DD hh:mm:ss"),
            participants: param.participants.map((item: any) => { return (item.value) }),
        };
        if (dataPath) {
            query.attachmentIds = path.map((item: any) => { return (item.id) })
        }
        if (data) {
            EditStocktake({ id: router.query?.id, ...query }).then(() => {
                handleChangeComplete(router.query?.id);
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            if (listDataDetail?.length === undefined || listDataDetail?.length === 0) {
                showMessage(`${t('please_add_product')}`, 'error');
                handleActive(2);
            } else {
                CreateStocktake(query).then((res) => {
                    handleDetail(res.data.id);
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message[0].error}`, 'error');
                });
            }
        }
    }

    useEffect(() => {
        setInitialValue({
            name: data ? `${data?.name}` : "",
            participants: data ? data?.participants.map((item: any) => {
                return (
                    {
                        label: item.fullName,
                        value: item.id
                    }
                )
            }) : "",
            warehouseId: data ? {
                value: `${data?.warehouse.id}`,
                label: `${data?.warehouse.name}`
            } : "",
            description: data ? `${data?.description}` : "",
            startDate: data ? moment(`${data?.startDate}`).format("YYYY-MM-DD hh:mm") : "",
            currentApprover: data?.currentApprover ? data?.currentApprover.fullName : "",
            endDate: data ? moment(`${data?.endDate}`).format("YYYY-MM-DD hh:mm") : ""
        })
        if (data?.warehouse?.length > 0) {
            setWarehouseId(data?.warehouse?.id)
        }
        setPath(
            data?.attachments.map((item: any) => {
                return {
                    id: item.id,
                    name: item.name,
                    type: (getExtension(item.path) === "pdf" || getExtension(item.path) === "doc" || getExtension(item.path) === "docx")
                        ? "DOCUMENT" : "",
                    path: item.path
                }
            })
        );
    }, [data]);

    const handleDetail = async (id: any) => {
        AddStocktakeDetails({
            id: id,
            details: listDataDetail.map((item: any, index: number) => {
                return {
                    ...item,
                    id: index
                }
            })
        }).then(() => {
            showMessage(`${t('create_success')}`, 'success');
            handleChangeComplete(id);
        }).catch((err) => {
            DeleteStocktake({ id })
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    };

    const handleStocktakeCancel = () => {
        StocktakeCancel({ id: router.query.id }).then(() => {
            mutate();
            showMessage(`${t('update_success')}`, 'success');
            handleCancel();
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const Approve = () => {
        StocktakeApprove({ id: router.query.id }).then(() => {
            mutate();
            showMessage(`${t('update_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleData = () => {
        GetStocktake({ id: router.query.id }).then((res) => {
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
                    handleCancel();
                }
            });
    };

    const handleReject = () => {
        setOpenModalReject(true);
    }

    useEffect(() => {
        setPath([...path.filter((item: any) => item !== undefined), dataPath]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataPath]);
    const handleChange = async (event: any) => {
        await Object.keys(event.target.files).map((item: any) => {
            const formData = new FormData();
            formData.append('file', event.target.files[item]);
            formData.append('fileName', event.target.files[item].name);
            Upload(formData)
                .then((res) => {
                    setDataPath({ id: res.data.id, path: res.data.path, type: res.data.type });
                    return
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        })
    }

    const handleSubmitApproval = () => {
        setOpenModalApproval(true);
    };

    useEffect(() => {
        if (data?.approvalHistory.find((item: any) => Number(item.approverId) === Number(id))) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [data, id]);

    const handlePath = (id: any) => {
        setPath([...path.filter((item: any) => item.id !== id)]);
    }

    const [imageModal, setImageModal] = useState(false);
    const [image, setImage] = useState();
    const handleImage = (path: any) => {
        setImageModal(true);
        setImage(path);
    }

    const getExtension = (path: any) => {
        var basename = path.split(/[\\/]/).pop(),
            pos = basename.lastIndexOf(".");
        if (basename === "" || pos < 1)
            return "";
        return basename.slice(pos + 1);
    }

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
            prop: 'openingQuantity',
            type: Number,
        },
        d: {
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

    const handleExportFile = () => {
        switch (themeConfig.locale) {
            case 'en':
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_stocktake_en.xlsx`, '_blank');
                break;
            case 'la':
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_stocktake_lo.xlsx`, '_blank');
                break;
            default:
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_stocktake_vi.xlsx`, '_blank');
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
                    <h1 className='page-title'>{t('stocktake')}</h1>
                    <Link href="/warehouse-process/stocktake">
                        <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                            <IconBackward />
                            <span>
                                {t('back')}
                            </span>
                        </div>
                    </Link>
                </div>
                <div className="mb-5">
                    <Formik
                        initialValues={initialValue}
                        validationSchema={SubmittedForm}
                        onSubmit={values => {
                            handleStocktake(values);
                        }}
                        enableReinitialize
                    >

                        {({ errors, values, submitCount, setFieldValue }) => (
                            <Form className="space-y-5" >
                                <div className="font-semibold">
                                    <div className="rounded">
                                        <button
                                            type="button"
                                            className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                            onClick={() => handleActive(1)}
                                        >
                                            {t('stocktake_info')}
                                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                                <IconCaretDown />
                                            </div>
                                        </button>
                                        <div className={`mb-2 ${active.includes(1) ? 'custom-content-accordion' : ''}`}>
                                            <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                                <div className='p-4'>
                                                    <div className='flex justify-between gap-5'>
                                                        <div className="w-1/2">
                                                            <label htmlFor="name" className='label'> {t('name')} < span style={{ color: 'red' }}>* </span></label >
                                                            <Field autoComplete="off"
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
                                                        </div>
                                                        <div className="w-1/2">
                                                            <label htmlFor="warehouseId" className='label'> {t('warehouse')} < span style={{ color: 'red' }}>* </span></label >
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
                                                                    setWarehouseId(e.value);
                                                                }}
                                                                isDisabled={disable}
                                                            />
                                                            {submitCount && errors.warehouseId ? (
                                                                <div className="text-danger mt-1"> {`${errors.warehouseId}`} </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <div className='flex justify-between gap-5 mt-5'>
                                                        <div className="w-1/2">
                                                            <label htmlFor="startDate" className='label'> {t('start_date')} < span style={{ color: 'red' }}>* </span></label >
                                                            <Field autoComplete="off"
                                                                name="startDate"
                                                                render={({ field }: any) =>
                                                                    <Flatpickr
                                                                        data-enable-time
                                                                        placeholder={`${t('DD/MM/YYYY HH:mm')}`}
                                                                        options={{
                                                                            enableTime: true,
                                                                            dateFormat: 'd/m/Y H:i',
                                                                            locale: {
                                                                                ...chosenLocale,
                                                                            }
                                                                        }}
                                                                        value={moment(field?.value).format("DD/MM/YYYY hh:mm")}
                                                                        onChange={e => setFieldValue("startDate", moment(e[0]).format("YYYY-MM-DD hh:mm"))}
                                                                        className={disable ? "form-input bg-[#f2f2f2] calender-input" : "form-input calender-input"}
                                                                        disabled={disable}
                                                                    />
                                                                }
                                                            />
                                                            {submitCount && errors.startDate ? (
                                                                <div className="text-danger mt-1"> {`${errors.startDate}`} </div>
                                                            ) : null}
                                                        </div>
                                                        <div className="w-1/2">
                                                            <label htmlFor="endDate" className='label'> {t('end_date')} < span style={{ color: 'red' }}>* </span></label >
                                                            <Field autoComplete="off"
                                                                name="endDate"
                                                                render={({ field }: any) => (
                                                                    <Flatpickr
                                                                        data-enable-time
                                                                        placeholder={`${t('DD/MM/YYYY HH:mm')}`}
                                                                        options={{
                                                                            enableTime: true,
                                                                            dateFormat: 'd/m/Y H:i',
                                                                            locale: {
                                                                                ...chosenLocale,
                                                                            }
                                                                        }}
                                                                        value={moment(field?.value).format("DD/MM/YYYY hh:mm")}
                                                                        onChange={e => setFieldValue("endDate", moment(e[0]).format("YYYY-MM-DD hh:mm"))}
                                                                        className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                        disabled={disable}
                                                                    />
                                                                )}
                                                            />
                                                            {submitCount && errors.endDate ? (
                                                                <div className="text-danger mt-1"> {`${errors.endDate}`} </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <div className='flex justify-between gap-5 mt-5'>
                                                        <div className="w-1/2">
                                                            <label htmlFor="participants" className='label'> {t('participant')} < span style={{ color: 'red' }}>* </span></label >
                                                            <Select
                                                                id='participants'
                                                                name='participants'
                                                                options={dataUserDropdown}
                                                                maxMenuHeight={160}
                                                                onMenuOpen={() => setPageUser(1)}
                                                                onMenuScrollToBottom={handleMenuScrollToBottomUser}
                                                                isLoading={userLoading}
                                                                isMulti
                                                                value={values?.participants}
                                                                onChange={e => {
                                                                    setFieldValue('participants', e)
                                                                }}
                                                                isDisabled={disable}
                                                            />
                                                            {submitCount && errors.participants ? (
                                                                <div className="text-danger mt-1"> {`${errors.participants}`} </div>
                                                            ) : null}
                                                        </div>
                                                        <div className="w-1/2">
                                                            <label htmlFor="description" className='label'> {t('description')}</label >
                                                            <Field autoComplete="off"
                                                                name="description"
                                                                as="textarea"
                                                                id="description"
                                                                placeholder={`${t('enter_description')}`}
                                                                className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                disabled={disable}
                                                            />
                                                            {submitCount && errors.description ? (
                                                                <div className="text-danger mt-1"> {`${errors.description}`} </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    {
                                                        router.query.id !== 'create' &&
                                                        data?.status !== 'STOCKTAKING' &&
                                                        data?.status !== 'FINISHED' &&
                                                        data?.status !== "APPROVED" &&
                                                        data?.status !== "DRAFT" &&
                                                        <div className='mt-5'>
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
                                                            <div className="w-1/2"></div>
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
                                                    <div className="grid grid-cols-3 mt-2 gap-4 p-10 border rounded">
                                                        {
                                                            path.map((item: any) => {
                                                                return (
                                                                    <>
                                                                        {
                                                                            item?.path &&
                                                                            <div className="border p-2 rounded">
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handlePath(item.id)}
                                                                                    className="float-end border-2 rounded-full mb-2"
                                                                                >
                                                                                    <IconX />
                                                                                </button>
                                                                                {
                                                                                    item.type === "DOCUMENT" ?
                                                                                        <iframe style={{ width: "100%" }} src={`https://docs.google.com/gview?url=${process.env.NEXT_PUBLIC_BE_URL}${item?.path}&embedded=true`}></iframe>
                                                                                        :
                                                                                        <img className='object-cover' onClick={(e) => handleImage(process.env.NEXT_PUBLIC_BE_URL + item?.path)} key={item} src={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} alt="img" />
                                                                                }
                                                                            </div>
                                                                        }
                                                                    </>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            </AnimateHeight>
                                        </div>
                                    </div>
                                    <div className="rounded">
                                        <button
                                            type="button"
                                            className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                            onClick={() => handleActive(2)}
                                        >
                                            {t('stocktake_detail')}
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
                                                                    {/* <button type="button" onClick={(e) => handleAutoAdd()} className="btn btn-primary btn-sm m-1 custom-button" >
                                                                        <IconArchive className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                                                        {t('auto_add')}
                                                                    </button> */}
                                                                </>
                                                            }
                                                        </div>

                                                        {/* <input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} onChange={(e) => handleSearch(e.target.value)} /> */}
                                                    </div>
                                                    <div className="datatables">
                                                        <DataTable
                                                            highlightOnHover
                                                            className="whitespace-nowrap table-hover"
                                                            records={listDataDetail}
                                                            columns={columns}
                                                            sortStatus={sortStatus}
                                                            onSortStatusChange={setSortStatus}
                                                            minHeight={200}
                                                        />
                                                    </div>
                                                </div>
                                                <HandleDetailModal
                                                    openModal={openModal}
                                                    setOpenModal={setOpenModal}
                                                    data={dataDetail}
                                                    setData={setDataDetail}
                                                    listData={listDataDetail}
                                                    setListData={setListDataDetail}
                                                    warehouseId={warehouseId}
                                                />
                                                <TallyModal
                                                    openModal={openModalTally}
                                                    setOpenModal={setOpenModalTally}
                                                    data={dataTally}
                                                    setData={setDataTally}
                                                    stocktakeDetailMutate={mutate}
                                                />
                                                <ApprovalModal
                                                    openModal={openModalApproval}
                                                    setOpenModal={setOpenModalApproval}
                                                    handleData={handleData}
                                                    data={data}
                                                    handleCancel={handleCancel}
                                                    id={id}
                                                />
                                                <RejectModal
                                                    openModal={openModalReject}
                                                    setOpenModal={setOpenModalReject}
                                                    handleCancel={handleCancel}
                                                />
                                                <ImageModal
                                                    image={image}
                                                    imageModal={imageModal}
                                                    setImageModal={setImageModal}
                                                />
                                            </AnimateHeight>
                                        </div>
                                    </div>
                                    {
                                        router.query.id !== 'create' &&
                                        data?.status !== 'STOCKTAKING' &&
                                        data?.status !== 'FINISHED' &&
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
                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                        {
                                            !disable &&
                                            <>

                                                {
                                                    router.query?.status === "DRAFT" &&
                                                    <RBACWrapper permissionKey={['stocktake:create', 'stocktake:update']} type={'OR'}>
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button">
                                                            {router.query.id !== "create" ? t('update') : t('add')}
                                                        </button>
                                                    </RBACWrapper>
                                                }
                                            </>
                                        }
                                        {
                                            router.query.type === "STOCKTAKING" &&
                                            <RBACWrapper permissionKey={['stocktake:finish']} type={'AND'}>
                                                <button type="button" className="btn btn-outline-danger cancel-button w-28" onClick={() => handleStocktakeCancel()}>
                                                    {t('cancel')}
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button w-32" onClick={() => handleFinish()}>
                                                    {t("finish")}
                                                </button>
                                            </RBACWrapper>
                                        }
                                        {/* {
                                        router.query.type === "FINISHED" &&
                                        <RBACWrapper permissionKey={['stocktake:approve', 'stocktake:reject']} type={'OR'}>
                                            <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                <button type="button" className="btn btn-outline-danger cancel-button w-28" onClick={() => handleStocktakeCancel()}>
                                                    {t('reject')}
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleApprove()}>
                                                    {t('approve')}
                                                </button>
                                            </div>
                                        </RBACWrapper>
                                    } */}
                                        {
                                            <>
                                                {
                                                    (data?.status !== "DRAFT" && data?.status !== "REJECTED" && data?.status !== "APPROVED") &&
                                                    disable && open && Number(data?.createdById) !== id &&
                                                    data?.status === "PENDING" &&
                                                    data?.currentApprover?.id !== data?.createdById &&
                                                    <>
                                                        <button type="button" className="btn btn-outline-danger cancel-button w-28" onClick={() => handleReject()}>
                                                            {t('reject')}
                                                        </button>
                                                        <button data-testId="submit-approve-btn" type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleApprove()}>
                                                            {t('approve')}
                                                        </button>
                                                    </>
                                                }
                                                {
                                                    high !== "true" &&
                                                    data?.status !== "REJECTED" && open &&
                                                    disable &&
                                                    (data?.status === "FINISHED" || data?.status === "PENDING") &&
                                                    // data?.currentApprover?.id !== id &&
                                                    <button data-testId="submit-approval-btn" type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmitApproval()}>
                                                        {data?.createdById && data?.status === "DRAFT" ? t('continue_approval') : t('continue_approval')}
                                                    </button>
                                                }
                                            </>
                                        }
                                    </div>
                                </div>
                            </Form>
                        )
                        }
                    </Formik >
                </div >
            </div >
        </>
    );
};
export default DetailPage;
