/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/jsx-no-comment-textnodes */
import { useEffect, useState, useRef } from 'react';
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
import { RepairDetails, RepairHistory } from '@/services/swr/repair.swr';
import { AddRepairDetails, CreateRepair, DeleteRepair, DeleteRepairDetail, EditRepair, GetRepair, RepairApprove, RepairReject } from '@/services/apis/repair.api';
import { Field, Form, Formik } from 'formik';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import Link from 'next/link';
import { DropdownUsers } from '@/services/swr/dropdown.swr';
import * as Yup from 'yup';
import Select from 'react-select';
import IconBack from '@/components/Icon/IconBack';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import moment from 'moment';
import DetailModal from '../modal/DetailModal';
import IconNewEye from '@/components/Icon/IconNewEye';
import { PAGE_SIZES } from '@/utils/constants';
import HistoryModal from '../modal/HistoryModal';
import { Upload } from '@/services/apis/upload.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import IconX from '@/components/Icon/IconX';
import ImageModal from '../modal/ImageModal';
import IconImportFile from '@/components/Icon/IconImportFile';
import { GetProductByCode } from '@/services/apis/product.api';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import { IRootState } from '@/store';

interface Props {
    [key: string]: any;
}

const DetailPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [disable, setDisable] = useState<any>(false);
    const [data, setData] = useState<any>();
    const [idH, setIdH] = useState<any>();
    const [dataDetail, setDataDetail] = useState<any>();
    const [openModal, setOpenModal] = useState(false);
    const [openModalH, setOpenModalH] = useState(false);
    const [query, setQuery] = useState<any>();
    const [queryH, setQueryH] = useState<any>();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataUserDropdown, setDataUserDropdown] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [active, setActive] = useState<any>([1, 2]);
    const [listDataDetail, setListDataDetail] = useState<any>();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const formRef = useRef<any>();
    const fileRef = useRef<any>();
    const [searchUser, setSearchUser] = useState<any>();
    const [open, setOpen] = useState<any>(false);
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');
    const [openModalApproval, setOpenModalApproval] = useState(false);
    const [send, SetSend] = useState<any>(false);
    const [openModalReject, setOpenModalReject] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // get data
    const { data: repairDetails, pagination, mutate, isLoading } = RepairDetails({ ...query, perPage: 0 });
    const { data: users, pagination: paginationUser, isLoading: userLoading } = DropdownUsers({ page: page, search: searchUser });
    const { data: history, pagination: paginationHistory, isLoading: historyLoading } = RepairHistory({ id: data?.vehicleId || 0, ...queryH });


    const SubmittedForm = Yup.object().shape({
        vehicleRegistrationNumber: Yup.string().required(`${t('please_fill_name')}`),
        repairById: new Yup.ObjectSchema().required(`${t('please_fill_proposal')}`),
    });

    useEffect(() => {
        dispatch(setPageTitle(`${t('access control')}`));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(repairDetails?.data);
        }
    }, [repairDetails?.data, router])

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

    const handleEdit = (data: any) => {
        setOpenModal(true);
        setDataDetail(data);
    };

    const handleDelete = ({ id, replacementPart }: any) => {
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
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${replacementPart?.name} ?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    if (Number(router.query.id)) {
                        DeleteRepairDetail({ id: router.query.id, detailId: id }).then(() => {
                            mutate();
                            showMessage(`${t('delete_product_success')}`, 'success');
                        }).catch((err) => {
                            showMessage(`${err?.response?.data?.message}`, 'error');
                        });
                    } else {
                        setListDataDetail(listDataDetail?.filter((item: any) => item.id !== id));
                    }
                }
            });
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

    const handleChangePage = (page: number, pageSize: number) => {
        setQueryH({ page: page, perPage: pageSize })
        return pageSize;
    };

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'replacementPart',
            title: `${t('name_product')}`,
            render: ({ replacementPart, name }: any) => <span>{replacementPart?.name || name}</span>,
            sortable: false
        },
        { accessor: 'quantity', title: `${t('quantity')}`, sortable: false },
        { accessor: 'brokenPart', title: `${t('broken_part')}`, sortable: false },
        { accessor: 'description', title: `${t('notes')}`, sortable: false },
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
    ]

    const columnsHistory = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(pagination?.page - 1) * pagination?.perPage + index + 1}</span>,
        },
        { accessor: 'name', title: `${t('name_of_repair_ticket')}`, sortable: false },
        {
            accessor: 'vehicle',
            title: `${t('vehicle_registration_number')}`,
            render: ({ vehicle }: any) => <span>{vehicle?.registrationNumber}</span>,
        },
        {
            accessor: 'repairBy',
            title: `${t('person_in_charge')}`,
            render: ({ repairBy }: any) => <span>{repairBy?.fullName}</span>,
        },
        // { accessor: 'description', title: 'Ghi chú', sortable: false },
        {
            accessor: 'status',
            title: `${t('status')}`,
            render: ({ status }: any) => <span>{status === "COMPLETED" ? "Đã duyệt" : "Chưa duyệt"}</span>,
            sortable: false
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: '10%',
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="flex justify-center gap-2">
                    <div className="w-[auto]">
                        <button type='button' className='button-detail' onClick={e => { setOpenModalH(true); setIdH(records.id) }}>
                            <IconNewEye /> <span>{t('detail')}</span>
                        </button>
                    </div>
                </div >
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
    ]

    const handleCancel = () => {
        router.push("/warehouse-process/repair");
    };

    useEffect(() => {
        setInitialValue({
            vehicleRegistrationNumber: data ? `${data?.vehicle?.registrationNumber}` : "",
            repairById: data ? {
                value: `${data?.repairBy?.id}`,
                label: `${data?.repairBy?.fullName}`
            } : "",
            description: data ? `${data?.description}` : "",
            damageLevel: data ? `${data?.damageLevel}` : "",
            personRequest: data?.createdBy ? data?.createdBy.fullName : JSON.parse(localStorage.getItem('profile') || "").fullName,
            timeRequest: data?.createdAt ? moment(data?.createdAt).format("DD/MM/YYYY hh:mm") : moment().format("DD/MM/YYYY hh:mm"),
            customerName: data ? `${data?.customerName}` : "",
            currentApprover: data?.currentApprover ? data?.currentApprover.fullName : "",
        })
        setPath(data?.images);
    }, [data]);

    useEffect(() => {
        if (paginationUser?.page === undefined) return;
        if (paginationUser?.page === 1) {
            setDataUserDropdown(users?.data)
        } else {
            setDataUserDropdown([...dataUserDropdown, ...users?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationUser])

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(paginationUser?.page + 1);
        }, 1000);
    }

    const handleRepair = (param: any) => {
        const query: any = {
            vehicleRegistrationNumber: param.vehicleRegistrationNumber,
            repairById: Number(param.repairById.value),
            description: param.description,
            damageLevel: param.damageLevel,
            customerName: param.customerName,
        };
        if (dataPath) {
            query.imageIds = path.map((item: any) => { return (item.id) })
        }
        if (data) {
            EditRepair({ id: router.query?.id, ...query }).then((res) => {
                showMessage(`${t('edit_success')}`, 'success');
                handleCancel();
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            CreateRepair(query).then((res) => {
                handleDetail(res.data.id)
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message[0].error}`, 'error');
            });
        }
    }

    const handleDetail = (id: any) => {
        if (listDataDetail?.length > 0) {
            AddRepairDetails({
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
                DeleteRepair({ id })
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            if (router.query.id === 'create' && send === true) {
                setId(id);
                setOpenModalApproval(true);
            } else {
                handleCancel();
            }
        }
    }

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    }

    const RenturnError = (param: any) => {
        if (Object.keys(param?.errors || {}).length > 0 && param?.submitCount > 0) {
            showMessage(`${t('please_add_infomation')}`, 'error');
        }
        return <></>;
    }

    const handleData = () => {
        GetRepair({ id: router.query.id }).then((res) => {
            setData(res.data);
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleSubmitApproval = () => {
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
        RepairApprove({ id: router.query.id }).then(() => {
            showMessage(`${t('update_success')}`, 'success');
            handleCancel();
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit()
        }
    }

    const [path, setPath] = useState<any>([]);
    const [dataPath, setDataPath] = useState<any>();
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
                    setDataPath({ id: res.data.id, path: res.data.path });
                    return
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        })
    }

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

    const [department, setDepartment] = useState<any>();
    useEffect(() => {
        if (data?.createdBy) {
            setDepartment(data?.createdBy.department.name === "Phòng tổ chức hành chính" ? "PTCHC" : '')
        } else {
            setDepartment(JSON.parse(localStorage.getItem('profile') || '').department?.code)
        }
    }, [data?.createdBy, router]);

    const schema = {
        a: {
            prop: 'brokenPart',
            type: String,
        },
        b: {
            prop: 'description',
            type: String,
        },
        c: {
            prop: 'name',
            type: String,
        },
        d: {
            prop: 'code',
            type: Number,
        },
        e: {
            prop: 'quantity',
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
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_repair_en.xlsx`, '_blank');
                break;
            case 'la':
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_repair_lo.xlsx`, '_blank');
                break;
            default:
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_repair_vi.xlsx`, '_blank');
                break;
        }
    };

    return (
        <div>
            {isLoading && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{t('repair')}</h1>
                <Link href="/warehouse-process/repair">
                    <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                        <IconBack />
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
                            {t('repair_infomation')}
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
                                        handleRepair(values);
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
                                                        {submitCount && errors.estimatedDeliveryDate ? (
                                                            <div className="text-danger mt-1"> {`${errors.estimatedDeliveryDate}`} </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5 mt-5'>
                                                    <div className="w-1/2">
                                                        <label htmlFor="repairById" className='label' > {t('repair_by_id')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Select
                                                            id='repairById'
                                                            name='repairById'
                                                            options={dataUserDropdown}
                                                            maxMenuHeight={160}
                                                            value={values?.repairById}
                                                            onMenuOpen={() => setPage(1)}
                                                            onMenuScrollToBottom={handleMenuScrollToBottom}
                                                            isLoading={userLoading}
                                                            onInputChange={e => setSearchUser(e)}
                                                            onChange={e => {
                                                                setFieldValue('repairById', e)
                                                            }}
                                                            isDisabled={disable}
                                                        />
                                                        {submitCount && errors.repairById ? (
                                                            <div className="text-danger mt-1"> {`${errors.repairById}`} </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="type" className='label'> {t('vehicle_registration_number')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field
                                                            autoComplete="off"
                                                            name="vehicleRegistrationNumber"
                                                            type="text"
                                                            id="vehicleRegistrationNumber"
                                                            placeholder={`${t('enter_type')}`}
                                                            className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.vehicleRegistrationNumber ? (
                                                            <div className="text-danger mt-1"> {`${errors.vehicleRegistrationNumber}`} </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5 mt-5'>
                                                    <div className="w-1/2">
                                                        <label htmlFor="customerName" className='label'> {t('name_customer')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field
                                                            autoComplete="off"
                                                            name="customerName"
                                                            type="text"
                                                            id="customerName"
                                                            placeholder={`${t('enter_name_customer')}`}
                                                            className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                            disabled={disable}
                                                        />
                                                        {submitCount && errors.customerName ? (
                                                            <div className="text-danger mt-1"> {`${errors.customerName}`} </div>
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
                                                    <label htmlFor="description" className='label'> {t('description')}</label >
                                                    <Field
                                                        autoComplete="off"
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
                                                <div className='mt-5'>
                                                    <label htmlFor="damageLevel" className='label'> {t('damage_level')} </label >
                                                    <Field
                                                        autoComplete="off"
                                                        name="damageLevel"
                                                        as="textarea"
                                                        id="damageLevel"
                                                        className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                        disabled={disable}
                                                        placeholder={`${t('enter_damage_level')}`}
                                                    />
                                                    {submitCount && errors.damageLevel ? (
                                                        <div className="text-danger mt-1"> {`${errors.damageLevel}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className='mt-5'>
                                                    <label htmlFor="imageIds" className='label'> {t('attached_image')} </label >
                                                    <Field
                                                        innerRef={fileRef}
                                                        autoComplete="off"
                                                        name="imageIds"
                                                        type="file"
                                                        id="imageIds"
                                                        className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                        disabled={disable}
                                                        multiple
                                                        accept="image/*"
                                                        onChange={(e: any) => handleChange(e)}
                                                    />
                                                    {submitCount && errors.imageIds ? (
                                                        <div className="text-danger mt-1"> {`${errors.imageIds}`} </div>
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
                                                                            <img className='object-cover' onClick={(e) => handleImage(process.env.NEXT_PUBLIC_BE_URL + item?.path)} key={item} src={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} alt="img" />
                                                                        </div>
                                                                    }
                                                                </>
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </div>
                                            {
                                                <RenturnError errors={errors} submitCount={submitCount} />
                                            }
                                        </Form>
                                    )}
                                </Formik >
                            </AnimateHeight>
                        </div>
                    </div>
                    <div className="rounded mb-2">
                        <button
                            type="button"
                            className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                            onClick={() => handleActive(2)}
                        >
                            {t('repair_detail')}
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
                                                    <button data-testId='modal-repair-btn' type="button" onClick={(e) => { setOpenModal(true); setDataDetail(undefined); }} className="btn btn-primary btn-sm m-1 custom-button" >
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
                                            className="whitespace-nowrap table-hover"
                                            records={listDataDetail}
                                            columns={columns}
                                            // recordsPerPageOptions={PAGE_SIZES}
                                            // onRecordsPerPageChange={e => handleChangePage(pagination?.page, e)}
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
                        <>
                            <div className="rounded">
                                <button
                                    type="button"
                                    className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                    onClick={() => handleActive(3)}
                                >
                                    {t('repair_history')}
                                    <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(3) ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </div>
                                </button>
                                <div className={`${active.includes(3) ? 'custom-content-accordion' : ''}`}>
                                    <AnimateHeight duration={300} height={active.includes(3) ? 'auto' : 0}>
                                        <div className='p-4'>
                                            <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                                                {/* <input type="text" className="form-input w-auto" placeholder={`${t('search')}`} onChange={(e) => handleSearch(e.target.value)} /> */}
                                            </div>
                                            <div className="datatables">
                                                <DataTable
                                                    highlightOnHover
                                                    className="whitespace-nowrap table-hover custom_table"
                                                    records={history?.data}
                                                    columns={columnsHistory}
                                                    totalRecords={paginationHistory?.totalRecords}
                                                    recordsPerPage={paginationHistory?.perPage}
                                                    page={paginationHistory?.page}
                                                    onPageChange={(p) => handleChangePage(p, paginationHistory?.perPage)}
                                                    recordsPerPageOptions={PAGE_SIZES}
                                                    onRecordsPerPageChange={e => handleChangePage(paginationHistory?.page, e)}
                                                    sortStatus={sortStatus}
                                                    onSortStatusChange={setSortStatus}
                                                    minHeight={200}
                                                    paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`}
                                                />
                                            </div>
                                        </div>
                                        <HistoryModal
                                            openModal={openModalH}
                                            setOpenModal={setOpenModalH}
                                            data={dataDetail}
                                            setData={setDataDetail}
                                            orderDetailMutate={mutate}
                                            id={idH}
                                        />
                                    </AnimateHeight>
                                </div>
                            </div>

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
                        </>
                    }
                    <div style={{ display: 'flex', marginTop: '30px' }}>
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
                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                        {
                            !disable &&
                            <>
                                <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                    {t('cancel')}
                                </button>
                                <button data-testId="submit-btn" type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmit()}>
                                    {router.query.id !== "create" ? t('update') : t('save_daf')}
                                </button>
                            </>
                        }
                        {
                            (router.query.id === "create") &&
                            <button data-testId="submit-approval-btn" type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmitApproval()}>
                                {data?.createdById && data?.status === "DRAFT" ? t('continue_approval') : t('continue_approval')}
                            </button>
                        }
                        {
                            data?.status !== "DRAFT" &&
                                data?.currentApprover?.id !== id ?
                                <></> :
                                <>
                                    {
                                        (data?.status !== "DRAFT" && data?.status !== "REJECTED" && data?.status !== "APPROVED") &&
                                        disable && open && Number(data?.createdById) !== id &&
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
                                        <button data-testId="submit-continue-btn" type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmitApproval()}>
                                            {data?.createdById && data?.status === "DRAFT" ? t('continue_approval') : t('continue_approval')}
                                        </button>
                                    }
                                </>
                        }

                    </div>
                </div>
            </div >
        </div >
    );
};
export default DetailPage;
