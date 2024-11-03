import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { WarehousingBill } from '@/services/swr/warehousing-bill.swr';
import { DeleteWarehousingBill, WarehousingBillApprove, WarehousingBillReject } from '@/services/apis/warehousing-bill.api';
import { PAGE_SIZES } from '@/utils/constants';
import { downloadFile, showMessage } from '@/@core/utils';
import { IconLoading } from '@/components/Icon/IconLoading';
import { DropdownWarehouses } from '@/services/swr/dropdown.swr';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import Link from 'next/link';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { removeVietnameseTones } from '@/utils/commons';
import moment from 'moment';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import { Loader } from '@mantine/core';


interface Props {
    [key: string]: any;
}

const WarehousingPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [active, setActive] = useState<any>([1]);
    const [select, setSelect] = useState<any>();
    const [pageWarehouse, setPageWarehouse] = useState(1);
    const [department, setDepartment] = useState<any>();
    const [profile, setProfile] = useState<any>();
    const [isAdmin, setIsAdmin] = useState<any>();
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoadingExportFile, setIsLoadingExportFile] = useState({});

    const [showLoader, setShowLoader] = useState(true);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });


    // get data
    const { data: warehousing, pagination, mutate, isLoading } = WarehousingBill({
        ...router.query, type: "IMPORT", warehouseId: active.includes(0) ? "" : active, sortBy: "id.DESC",
        //  departmentId: isAdmin === false ? department : ''
    });
    const { data: warehouses, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({ page: pageWarehouse });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        dispatch(setPageTitle(`${t('warehousing_bill')}`));
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
    }, [warehousing])

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
                title: `${t('delete_warehousing_import')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${name} ?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteWarehousingBill({ id }).then(() => {
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
        router.push(`/warehouse-process/warehousing-bill/import/${value.id}?status=${value.status}`)
    }

    const handleApprove = ({ id }: any) => {
        WarehousingBillApprove({ id }).then(() => {
            mutate();
            showMessage(`${t('update_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleReject = ({ id }: any) => {
        WarehousingBillReject({ id }).then(() => {
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
            case "EXPORTED":
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
            `/warehousing-bill/${param.id}/generate-pdf`)
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
        // { accessor: 'name', title: 'Tên phiếu kho', sortable: false },
        // { accessor: 'type', title: 'Loại phiếu', sortable: false },
        {
            accessor: 'proposal',
            title: `${t('proposal_type')}`,
            render: ({ proposalId, orderId, repairRequestId }: any) => <span>
                {
                    proposalId !== null ? t('proposal') :
                        orderId !== null ? t('order') :
                            repairRequestId !== null ? t('repair') : t('orther')
                }
            </span>,
        },
        // {
        //     accessor: 'order',
        //     title: 'Đơn hàng',
        //     render: ({ order }: any) => <span>{order?.name}</span>,
        // },
        {
            accessor: 'warehouse',
            title: `${t('warehouse_name')}`,
            render: ({ warehouse }: any) => <span>{warehouse?.name}</span>,
        },
        {
            accessor: 'status',
            title: `${t('status')}`,
            render: ({ status }: any) =>
                <span className={`badge uppercase bg-${handleReturnColor(status)} `}>{
                    handleReturnText(status)
                }</span>,
            sortable: false
        },
        // { accessor: 'note', title: 'Ghi chú', sortable: false },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: '10%',
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="flex justify-center gap-2 mr-2">
                    <RBACWrapper
                        permissionKey={['warehousingBillImport:find']} type={'OR'}>
                        <div className="w-[auto]">
                            <Link href={`/warehouse-process/warehousing-bill/import/${records.id}?status=${true}&&type=${records.status}`}>
                                <button data-testid='detail-import-btn' type='button' className='button-detail'>
                                    <IconNewEye /> <span>{t('detail')}</span>
                                </button>
                            </Link>
                        </div>
                    </RBACWrapper>
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
                        <RBACWrapper permissionKey={['warehousingBillImport:update']} type={'AND'}>
                            <div className="w-[auto]">
                                <button data-testId='edit-import-btn' type="button" className='button-edit' onClick={() => handleDetail(records)}>
                                    <IconNewEdit /><span>
                                        {t('edit')}
                                    </span>
                                </button>
                            </div>
                        </RBACWrapper>
                    }
                    {
                        (records.status !== "APPROVED" && records.status !== "COMPLETED" && records.status !== "FINISHED") &&
                        <RBACWrapper permissionKey={['warehousingBillImport:remove']} type={'AND'}>
                            <div className="w-[auto]">
                                <button type="button" className='button-delete' onClick={() => handleDelete(records)}>
                                    <IconNewTrash />
                                    <span>
                                        {t('delete')}
                                    </span>
                                </button>
                            </div>
                        </RBACWrapper>
                    }
                </div>
            ),
        },
    ]

    const handleActive = (item: any) => {
        if (Number(localStorage.getItem('defaultFilterImport')) === item.value) {
            setActive([0]);
            localStorage.setItem('defaultFilterImport', "0");
        } else {
            setActive([item.value]);
            localStorage.setItem('defaultFilterImport', item.value);
        }
    };

    const handleChangeSelect = (e: any) => {
        setSelect(e);
        localStorage.setItem('defaultSelectImport', JSON.stringify(e))
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            setActive([Number(localStorage.getItem('defaultFilterImport'))])
            if (localStorage.getItem("defaultSelectImport") !== null) {
                setSelect(JSON.parse(localStorage.getItem("defaultSelectImport") || ""))
            }
        }
    }, [router]);

    return (
        <div>
            {showLoader && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
            <title>product</title>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                        <li>
                            <Link href="/hrm/dashboard" className="text-primary hover:underline">
                                {t('dashboard')}
                            </Link>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <span>{t('warehousing_bill_import_text')}</span>

                        </li>
                    </ul>
                </div>
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        <RBACWrapper permissionKey={['warehousingBillImport:create']} type={'AND'}>
                            <button data-testId="add-import" type="button" className="m-1 button-table button-create" onClick={(e) => router.push(`/warehouse-process/warehousing-bill/import/create`)}>
                                <IconNewPlus />
                                <span className='uppercase'>{t('add')}</span>
                            </button>
                        </RBACWrapper>
                    </div>

                    <input
                        data-testId='search-import-input'
                        autoComplete="off"
                        type="text"
                        className="form-input w-auto"
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
                        {/* <span>Lọc nhanh :</span> */}
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
                        {/* <span className='ml-9'>Lọc kho :</span>
                        <div className='w-52'>
                            <Select
                                options={dataWarehouseDropdown}
                                onMenuOpen={() => setPageWarehouse(1)}
                                onMenuScrollToBottom={handleMenuScrollToBottomWarehouse}
                                isLoading={warehouseLoading}
                                maxMenuHeight={160}
                                className='z-10'
                                value={select || ''}
                                onChange={e => handleChangeSelect(e)}
                            />
                        </div> */}
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={warehousing?.data}
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

export default WarehousingPage;
