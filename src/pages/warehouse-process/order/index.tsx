import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { Orders } from '@/services/swr/order.swr';
import { DeleteOrder, OrderCancel, OrderReceive, OrderShipping } from '@/services/apis/order.api';
import { PAGE_SIZES } from '@/utils/constants';
import { downloadFile, showMessage } from '@/@core/utils';
import { IconLoading } from '@/components/Icon/IconLoading';
import moment from 'moment';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewEye from '@/components/Icon/IconNewEye';
import Link from 'next/link';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { DropdownWarehouses } from '@/services/swr/dropdown.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { Loader } from '@mantine/core';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import { removeVietnameseTones } from '@/utils/commons';

interface Props {
    [key: string]: any;
}

const OrderForm = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [active, setActive] = useState<any>([1]);
    const [department, setDepartment] = useState<any>();
    const [profile, setProfile] = useState<any>();
    const isFirstRender = useRef(true);
    const [isAdmin, setIsAdmin] = useState<any>();
    const [isLoadingExportFile, setIsLoadingExportFile] = useState({});
    const [isDisabled, setIsDisabled] = useState(false);

    const [showLoader, setShowLoader] = useState(true);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });


    // get data
    const { data: orders, pagination, mutate, isLoading } = Orders({ ...router.query, warehouseId: active.includes(0) ? "" : active, sortBy: "id.DESC", departmentId: isAdmin === false ? department : '' });
    const { data: warehouses, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({});

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        dispatch(setPageTitle(`${t('Order')}`));
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfile(JSON.parse(localStorage.getItem('profile') || ''))
            setIsAdmin(localStorage.getItem('admin') === '1' ? true : false)
        }
    }, [router])

    useEffect(() => {
        if (typeof window !== 'undefined' && profile) {
            setDepartment(profile?.department?.id);
        }
    }, [profile])

    useEffect(() => {
        setShowLoader(false);
    }, [orders])

    const handleDelete = ({ id, name }: any) => {
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
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${name} ?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteOrder({ id }).then(() => {
                        mutate();
                        showMessage(`${t('delete_success')}`, 'success');
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    });
                }
            });
    };

    const handleSearch = (param: any) => {
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    search: param.target.value,
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

    const handleDetail = (value: any) => {
        router.push(`/warehouse-process/order/${value.id}?status=${value.status}`)
    }

    const handleShipping = ({ id }: any) => {
        OrderShipping({ id }).then(() => {
            mutate();
            showMessage(`${t('update_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleCancel = ({ id }: any) => {
        OrderCancel({ id }).then(() => {
            mutate();
            showMessage(`${t('update_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleReceive = ({ id }: any) => {
        OrderReceive({ id }).then(() => {
            mutate();
            showMessage(`${t('update_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleReturnColor = (status: any) => {
        switch (status) {
            case "COMPLETED":
            case "APPROVED":
                return "success";
            case "REJECTED":
                return "danger"
            default:
                return "warning"
        }
    }

    const handleReturnText = (status: any) => {
        switch (status) {
            case "DRAFT":
                return t("draft");
            case "PENDING":
                return t("pending");
            case "IN_PROGRESS":
                return t("in_progress");
            case "APPROVED":
                return t("approved");
            case "REJECTED":
                return t("rejected");
            default:
                return t("complete");
        }
    }

    const handleExportFile = (param: any) => {
        setIsLoadingExportFile((prev) => ({ ...prev, [param.id]: true }));
        setIsDisabled(true)
        downloadFile(
            `${removeVietnameseTones(param.name) + '_' + removeVietnameseTones(param.createdBy?.department?.name || "") + '_' + moment().format("DD-MM-YYYY")}.pdf`,
            `/order/${param.id}/export`)
            .finally(() => {
                setIsLoadingExportFile((prev) => ({ ...prev, [param.id]: false }));
                setIsDisabled(false)
            })
    };

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(pagination?.page - 1) * pagination?.perPage + index + 1}</span>,
        },
        // { accessor: 'code', title: 'Mã đơn hàng', sortable: false },
        { accessor: 'name', title: `${t('name_order')}`, sortable: false },
        // { accessor: 'type', title: 'Loại phiếu', sortable: false },
        // {
        //     accessor: 'proposals',
        //     title: 'Yêu cầu',
        //     render: ({ proposals, repairRequests }: any) => <span>{
        //         proposals?.map((item: any, index: any) => { return proposals.length > index + 1 ? item.name + ", " : item.name }) ||
        //         repairRequests?.map((item: any, index: any) => { return repairRequests.length > index + 1 ? item.name + ", " : item.name })
        //     }</span>,
        // },
        {
            accessor: 'warehouse',
            title: `${t('warehouse_name')}`,
            render: ({ warehouse }: any) => <span>{warehouse?.name}</span>,
        },
        // {
        //     accessor: 'estimatedDeliveryDate',
        //     title: 'Nhận hàng dự kiến',
        //     render: ({ estimatedDeliveryDate }: any) => <span>{moment(estimatedDeliveryDate).format("DD/MM/YYYY")}</span>,
        // },
        {
            accessor: 'status',
            title: `${t('status')}`,
            sortable: false,
            render: ({ status }: any) => {
                return (
                    <span className={`badge uppercase bg-${handleReturnColor(status)}`}>{
                        handleReturnText(status)
                    }</span>
                )
            },
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            width: '10%',
            render: (records: any) => (
                <div className="flex justify-center gap-2 mr-2">
                    <div className="w-[auto]">
                        <Link href={`/warehouse-process/order/${records.id}?status=${true}`}>
                            <button data-testId='detail-order-btn' type='button' className='button-detail'>
                                <IconNewEye /> <span>{t('detail')}</span>
                            </button>
                        </Link>
                    </div>
                    {
                        (records?.status === 'APPROVED' || records?.status === "COMPLETED") &&
                        <div className="w-[auto]">
                            {
                                <button disabled={isDisabled} type="button" className="button-download1" onClick={() => handleExportFile(records)}>
                                    {
                                        isLoadingExportFile[records?.id as keyof typeof isLoadingExportFile] === true ? <Loader size="xs" color='#000' className='rtl:ml-2' /> : <IconNewDownload className="ltr:mr-2 rtl:ml-2" />
                                    }
                                    <span>{t('export_file')}</span>
                                </button>
                            }
                        </div>
                    }
                    {
                        records.status === "DRAFT" &&
                        <div className="w-[auto]">
                            <RBACWrapper permissionKey={['order:update']} type={'AND'}>
                                <button data-testId='edit-order-btn' type="button" className='button-edit' onClick={() => handleDetail(records)}>
                                    <IconNewEdit /><span>
                                        {t('edit')}
                                    </span>
                                </button>
                            </RBACWrapper>
                        </div>
                    }
                    {
                        (records.status !== "APPROVED" && records.status !== "COMPLETED" && records.status !== "FINISHED") &&
                        <div className="w-[auto]">
                            <RBACWrapper permissionKey={['order:remove']} type={'AND'}>
                                <button type="button" className='button-delete' onClick={() => handleDelete(records)}>
                                    <IconNewTrash />
                                    <span>
                                        {t('delete')}
                                    </span>
                                </button>
                            </RBACWrapper>
                        </div>
                    }
                </div >
            ),
        },
    ]

    const handleActive = (item: any) => {
        if (Number(localStorage.getItem('defaultFilterOrder')) === item.value) {
            setActive([0]);
            localStorage.setItem('defaultFilterOrder', "");
            router.push({
                query: { warehouseId: '' }
            })
        } else {
            router.push({
                query: { warehouseId: item.value }
            })
            setActive([item.value]);
            localStorage.setItem('defaultFilterOrder', item.value);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && isFirstRender.current) {
            setActive([Number(localStorage.getItem('defaultFilterOrder'))]);
            router.push({
                query: { warehouseId: localStorage.getItem('defaultFilterOrder') }
            })
        }
        isFirstRender.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    return (
        <div>
            {/* {showLoader && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )} */}
            <title>order</title>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                        <li>
                            <Link href="/hrm/dashboard" className="text-primary hover:underline">
                                {t('dashboard')}
                            </Link>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <span>{t('order')}</span>

                        </li>
                    </ul>
                </div>
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        <RBACWrapper permissionKey={['order:create']} type={'AND'}>
                            <button data-testId='add-order' type="button" className="m-1 button-table button-create" onClick={(e) => router.push(`/warehouse-process/order/create`)}>
                                <IconNewPlus />
                                <span className='uppercase'>{t('add')}</span>
                            </button>
                        </RBACWrapper>
                    </div>

                    <input
                        autoComplete="off"
                        type="text"
                        className="form-input w-auto"
                        data-testid="search-order-input"
                        placeholder={`${t('search')}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e)
                            }
                        }}
                    />
                </div>
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap gap-1">
                        {/* <IconFilter /> */}
                        {/* <span>lọc nhanh :</span> */}
                        {
                            isAdmin === true &&
                            <div className='flex items-center flex-wrap gap-2'>
                                {
                                    warehouses?.data.map((item: any, index: any) => {
                                        return (
                                            <div key={index} className={active.includes(item.value) ? 'border p-2 rounded bg-[#E9EBD5] text-[#476704] cursor-pointer' : 'border p-2 rounded cursor-pointer'} onClick={() => handleActive(item)}>{item.label}</div>
                                        );
                                    })
                                }
                            </div>
                        }
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={orders?.data}
                        noRecordsIcon={isLoading && (
                            <div className="mt-10 z-[60] place-content-center">
                                <IconLoading />
                            </div>
                        )}
                        noRecordsText=""
                        columns={columns}
                        totalRecords={pagination?.totalRecords}
                        recordsPerPage={pagination?.perPage}
                        page={pagination?.page}
                        onPageChange={(p) => handleChangePage(p, pagination?.perPage)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={e => handleChangePage(pagination?.page, e)}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default OrderForm;
