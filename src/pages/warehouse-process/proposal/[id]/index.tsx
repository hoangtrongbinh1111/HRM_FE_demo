import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { readExcelFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { AddProposalDetails, CreateProposal, DeleteProposal, DeleteProposalDetail, EditProposal, GetProposal, ProposalApprove } from '@/services/apis/proposal.api';
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
import { DropdownDepartment, DropdownWarehouses } from '@/services/swr/dropdown.swr';
import DetailModal from '../modal/DetailModal';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { useProfile } from '@/services/swr/profile.swr';
import IconImportFile from '@/components/Icon/IconImportFile';
import { Upload } from '@/services/apis/upload.api';
import { GetProductByCode } from '@/services/apis/product.api';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import { IRootState } from '@/store';
import { getConfig } from '@/services/apis/config-approve.api';
import SwitchBtn from '../../switchBtn';
interface Props {
    [key: string]: any;
}

const DetailPage = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [disable, setDisable] = useState<any>(false);
    const [dataDetail, setDataDetail] = useState<any>();
    const [listDataDetail, setListDataDetail] = useState<any>();
    const [openModal, setOpenModal] = useState(false);
    const [openModalApproval, setOpenModalApproval] = useState(false);
    const [openModalReject, setOpenModalReject] = useState(false);
    const [query, setQuery] = useState<any>({});
    const [active, setActive] = useState<any>([1, 2]);
    const [initialValue, setInitialValue] = useState<any>();
    const [warehouseId, setWarehouseId] = useState<any>();
    const [data, setData] = useState<any>();
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');
    const [page, setPage] = useState(1);
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const formRef = useRef<any>();
    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [send, SetSend] = useState<any>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [btnRule, setBtnRule] = useState(false);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    // get data
    const { data: ProposalDetail, pagination, mutate, isLoading } = ProposalDetails({ ...query, perPage: 0 });
    const { data: warehouseDropdown, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({ page: 1 });
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });
    const { data: profile } = useProfile();
    const [sign, setSign] = useState(false);

    useEffect(() => {
        dispatch(setPageTitle(`${t('proposal')}`));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(ProposalDetail?.data);
        }
    }, [ProposalDetail?.data, router]);

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
        GetProposal({ id: router.query.id })
            .then((res) => {
                setData(res.data);
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
    };

    useEffect(() => {
        setInitialValue({
            name: data ? `${data?.name}` : '',
            content: data ? `${data?.content}` : '',
            departmentId: data?.department
                ? {
                    value: `${data?.department?.id}`,
                    label: `${data?.department?.name}`,
                }
                : profile?.data?.department
                    ? {
                        value: `${profile?.data?.department?.id}`,
                        label: `${profile?.data?.department?.name}`,
                    }
                    : '',
            personRequest: data?.createdBy ? data?.createdBy.fullName : JSON.parse(localStorage.getItem('profile') || '').fullName,
            timeRequest: data?.createdAt ? moment(data?.createdAt).format('DD/MM/YYYY hh:mm') : moment().format('DD/MM/YYYY hh:mm'),
            warehouseId: data
                ? {
                    value: `${data?.warehouse?.id}`,
                    label: `${data?.warehouse?.name}`,
                }
                : '',
            currentApprover: data?.currentApprover ? data?.currentApprover?.fullName :
                data?.approvalHistory[0]?.approver?.fullName ? data?.approvalHistory[0]?.approver?.fullName : '',
        });
        setWarehouseId(data?.warehouse?.id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, router]);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required(`${t('please_fill_name_proposal')}`),
        // content: Yup.string().required(`${t('please_fill_content_proposal')}`),
        departmentId: new Yup.ObjectSchema().required(`${t('please_fill_department')}`),
    });

    const handleEdit = (data: any) => {
        setDataDetail(data);
        setOpenModal(true);
    };

    const handleDelete = ({ id, product }: any) => {
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
                    if (Number(router.query.id)) {
                        DeleteProposalDetail({ id: router.query.id, detailId: id })
                            .then(() => {
                                mutate();
                                showMessage(`${t('delete_product_success')}`, 'success');
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

    const handleSearch = (param: any) => {
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                search: param,
            },
        });
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
            render: ({ product, name }: any) => <span>{product?.name || name}</span>,
            sortable: false,
        },
        { accessor: 'quantity', title: `${t('quantity')}`, sortable: false },
        // { accessor: 'price', title: 'Giá', sortable: false },
        { accessor: 'note', title: `${t('description')}`, sortable: false },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="mx-auto flex w-max items-center gap-2">
                    {(data?.status === 'DRAFT' || router.query.id === 'create') && (
                        <>
                            <button className="flex justify-between gap-1 rounded bg-[#9CD3EB] p-1" type="button" onClick={() => handleEdit(records)}>
                                <IconPencil /> <span>{`${t('edit')}`}</span>
                            </button>
                            <button className="flex justify-between gap-1 rounded bg-[#E43940] p-1 text-[#F5F5F5]" type="button" onClick={() => handleDelete(records)}>
                                <IconTrashLines /> <span>{`${t('delete')}`}</span>
                            </button>
                        </>
                    )}
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
            title: `${t('exe_day')}`,
            render: ({ submittedAt }: any) => <span>{moment(submittedAt).format('DD/MM/YYYY hh:mm:ss')}</span>,
            sortable: false,
        },
        { accessor: 'comment', title: `${t('description')}`, sortable: false },
    ];

    const handleCancel = () => {
        router.push(`/warehouse-process/proposal`);
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };

    const handleProposal = (param: any) => {
        const query: any = {
            name: param.name,
            type: 'SUPPLY',
            content: param.content,
            departmentId: Number(param?.departmentId?.value),
            warehouseId: Number(param?.warehouseId?.value),
        };

        if (data) {
            EditProposal({ id: data?.id, ...query })
                .then((res) => {
                    showMessage(`${t('edit_success')}`, 'success');
                    handleCancel();
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        } else {
            if (listDataDetail?.length === undefined || listDataDetail?.length === 0) {
                showMessage(`${t('please_fill_full_information')}`, 'error');
                handleActive(2);
            } else {
                CreateProposal(query)
                    .then((res) => {
                        handleDetail(res.data.id);
                    })
                    .catch((err) => {
                        showMessage(`${err?.response?.data?.message[0].error}`, 'error');
                    });
            }
        }
    };

    const handleDetail = (id: any) => {
        AddProposalDetails({
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
        })
            .catch((err) => {
                DeleteProposal({ id })
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
        ProposalApprove({ id: router.query.id })
            .then(() => {
                handleCancel();
                showMessage(`${t('update_success')}`, 'success');
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
    };

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit();
        }
    };

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
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_proposal_en.xlsx`, '_blank');
                break;
            case 'la':
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_proposal_lo.xlsx`, '_blank');
                break;
            default:
                window.open(`${process.env.NEXT_PUBLIC_BE_URL}/public/templates/import_items_proposal_vi.xlsx`, '_blank');
                break;
        }
    };

    return (
        <div>
            {isLoading && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )}
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">{t('proposal_supply')}</h1>
                <Link href="/warehouse-process/proposal">
                    <div className="btn btn-primary btn-sm back-button m-1 h-9">
                        <IconBack />
                        <span>{t('back')}</span>
                    </div>
                </Link>
            </div>
            <div className="mb-5">
                <div className="font-semibold">
                    <div className="rounded">
                        <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(1)}>
                            {t('supply_infomation')}
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
                                        handleProposal(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5">
                                            <div className="p-4">
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="personRequest" className="label">
                                                            {' '}
                                                            {t('person_request')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="personRequest"
                                                            type="text"
                                                            id="personRequest"
                                                            placeholder={`${t('enter_code')}`}
                                                            className={true ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={true}
                                                        />
                                                        {submitCount && errors.personRequest ? <div className="mt-1 text-danger"> {`${errors.personRequest}`} </div> : null}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="timeRequest" className="label">
                                                            {' '}
                                                            {t('time_request')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="timeRequest"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    data-enable-time
                                                                    options={{
                                                                        enableTime: true,
                                                                        dateFormat: 'd/m/Y  | H:i',
                                                                    }}
                                                                    value={field.value}
                                                                    className={true ? 'calender-input form-input bg-[#f2f2f2]' : 'calender-input form-input'}
                                                                    disabled={true}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount && errors.estimatedDeliveryDate ? <div className="mt-1 text-danger"> {`${errors.estimatedDeliveryDate}`} </div> : null}
                                                    </div>
                                                </div>
                                                <div className="mt-5">
                                                    <label htmlFor="name" className="label">
                                                        {' '}
                                                        {t('name_proposal')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field
                                                        autoComplete="off"
                                                        name="name"
                                                        type="text"
                                                        id="name"
                                                        placeholder={`${t('enter_name')}`}
                                                        className={disable ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                        disabled={disable}
                                                    />
                                                    {submitCount && errors.name ? <div className="mt-1 text-danger"> {`${errors.name}`} </div> : null}
                                                </div>
                                                <div className="mt-5 flex justify-between gap-5">
                                                    <div className=" w-1/2">
                                                        <label htmlFor="departmentId" className="label">
                                                            {' '}
                                                            {t('department')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Select
                                                            id="departmentId"
                                                            name="departmentId"
                                                            options={dataDepartment}
                                                            maxMenuHeight={160}
                                                            value={values?.departmentId}
                                                            onMenuOpen={() => setPage(1)}
                                                            onMenuScrollToBottom={handleMenuScrollToBottom}
                                                            isLoading={isLoadingDepartment}
                                                            onInputChange={(e) => setSearchDepartment(e)}
                                                            onChange={(e) => {
                                                                setFieldValue('departmentId', e);
                                                            }}
                                                            isDisabled={true}
                                                        />
                                                        {submitCount && errors.departmentId ? <div className="mt-1 text-danger"> {`${errors.departmentId}`} </div> : null}
                                                    </div>
                                                    <div className=" w-1/2">
                                                        <label htmlFor="warehouseId" className="label">
                                                            {t('warehouse')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Select
                                                            id="warehouseId"
                                                            name="warehouseId"
                                                            options={warehouseDropdown?.data}
                                                            isLoading={warehouseLoading}
                                                            maxMenuHeight={160}
                                                            value={values?.warehouseId}
                                                            onChange={(e) => {
                                                                setFieldValue('warehouseId', e);
                                                                setWarehouseId(e.value);
                                                            }}
                                                            isDisabled={disable}
                                                        />
                                                        {submitCount && errors.warehouseId ? <div className="mt-1 text-danger"> {`${errors.warehouseId}`} </div> : null}
                                                    </div>
                                                </div>
                                                <div className="mt-5">
                                                    <label htmlFor="type" className="label">
                                                        {' '}
                                                        {t('content')}
                                                    </label>
                                                    <Field
                                                        autoComplete="off"
                                                        name="content"
                                                        as="textarea"
                                                        id="content"
                                                        placeholder={`${t('enter_content')}`}
                                                        className={disable ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                        disabled={disable}
                                                    />
                                                    {submitCount && errors.content ? <div className="mt-1 text-danger"> {`${errors.content}`} </div> : null}
                                                </div>
                                                {router.query.id !== 'create' && data?.status !== 'APPROVED' && data?.status !== 'DRAFT' && (
                                                    <div className="mt-5">
                                                        <div className="w-1/2">
                                                            <label htmlFor="currentApprover" className="label">
                                                                {
                                                                    data?.status === 'REJECTED' && t('rejecter')
                                                                }
                                                                {
                                                                    (data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') && t('pending_current_approver')
                                                                }
                                                                {
                                                                    data?.status === "APPROVED" || data?.status === "COMPLETED" && t('approver')
                                                                }
                                                                <span style={{ color: 'red' }}> *
                                                                </span>
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
                                            {<RenturnError errors={errors} submitCount={submitCount} />}
                                        </Form>
                                    )}
                                </Formik>
                            </AnimateHeight>
                        </div>
                    </div>
                    <div className="rounded">
                        <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(2)}>
                            {t('product_list')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(2) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`${active.includes(2) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(2) ? 'auto' : 0}>
                                <div className="p-4">
                                    <div className="mb-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                        <div className="flex flex-wrap items-center">
                                            {!disable && (
                                                <>
                                                    <button
                                                        data-testId="modal-proposal-btn"
                                                        type="button"
                                                        onClick={(e) => {
                                                            setOpenModal(true);
                                                            setDataDetail(undefined);
                                                        }}
                                                        className="btn btn-primary btn-sm custom-button m-1"
                                                    >
                                                        <IconPlus className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
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
                                            )}
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
                                    proposalDetailMutate={mutate}
                                    warehouseId={warehouseId}
                                />
                                <ApprovalModal
                                    entity={`proposal${warehouseId === 7 ? '-tchc' : ''}`}
                                    btnRule={btnRule}
                                    openModal={openModalApproval}
                                    setOpenModal={setOpenModalApproval}
                                    handleData={handleData}
                                    data={data}
                                    handleCancel={handleCancel}
                                    id={id}
                                    sign={sign}
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
                    <SwitchBtn
                        entity={`proposal${warehouseId === 7 ? '-tchc' : ''}`}
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
            </div>
        </div>
    );
};
export default DetailPage;
