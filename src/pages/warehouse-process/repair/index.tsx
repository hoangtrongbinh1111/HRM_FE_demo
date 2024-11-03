import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { Repairs } from '@/services/swr/repair.swr';
import { DeleteRepair } from '@/services/apis/repair.api';
import { PAGE_SIZES } from '@/utils/constants';
import { showMessage } from '@/@core/utils';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewEye from '@/components/Icon/IconNewEye';
import Link from 'next/link';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const RepairPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [active, setActive] = useState<any>([1]);
    const [status, setStatus] = useState<any>();
    const [showLoader, setShowLoader] = useState(true);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    // get data
    const { data: repairs, pagination, mutate, isLoading } = Repairs({
        ...router.query,
        status: status,
        sortBy: "id.DESC"
    });

    useEffect(() => {
        setShowLoader(false);
    }, [repairs])

    useEffect(() => {
        if (active.includes(1)) {
            setStatus(["IN_PROGRESS"])
        } else if (active.includes(2)) {
            setStatus("GARAGE_RECEIVED&status=HEAD_APPROVED&status=COMPLETED")
        } else if (active.includes(3)) {
            setStatus(["HEAD_REJECTED"])
        } else {
            setStatus("")
        }
    }, [active])

    useEffect(() => {
        dispatch(setPageTitle(`${t('Repair')} `));
    });

    useEffect(() => {
        if (repairs?.data.length <= 0 && pagination.page > 1) {
            router.push({
                query: {
                    page: pagination.page - 1,
                    perPage: pagination.perPage
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repairs])

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
                title: `${t('delete_repair')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${name} ?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteRepair({ id }).then(() => {
                        mutate();
                        showMessage(`${t('delete_success')} `, 'success');
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message} `, 'error');
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
        router.push(`/warehouse-process/repair/${value.id}?status=${value.status}`)
    };

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

    const columns = [
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
            render: ({ status }: any) =>
                <span className={`badge uppercase bg-${handleReturnColor(status)} `}>{
                    handleReturnText(status)
                }</span>,
            sortable: false
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: '10%',
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="flex justify-center gap-2 mr-2">
                    <div className="w-[auto]">
                        <Link href={`/warehouse-process/repair/${records.id}?status=${true}&&type=approve`}>
                            <button data-testId='detail-repair-btn' type='button' className='button-detail'>
                                <IconNewEye /> <span>{t('detail')}</span>
                            </button>
                        </Link>
                    </div>
                    {
                        records.status === "DRAFT" &&
                        <RBACWrapper permissionKey={['repairRequest:update']} type={'AND'}>
                            <div className="w-[auto]">
                                <button data-testid="edit-repair-btn" type="button" className='button-edit' onClick={() => handleDetail(records)}>
                                    <IconNewEdit /><span>
                                        {t('edit')}
                                    </span>
                                </button>
                            </div>
                        </RBACWrapper>
                    }
                    {
                        (records.status !== "APPROVED" && records.status !== "COMPLETED" && records.status !== "FINISHED" && records.status !== "EXPORTED") &&
                        <RBACWrapper permissionKey={['repairRequest:remove']} type={'AND'}>
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
                </div >
            ),
        },
    ]

    const handleActive = (value: any) => {
        setActive([active.includes(value) ? 0 : value]);
        localStorage.setItem('defaultFilterRepair', active.includes(value) ? 0 : value);
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            setActive([Number(localStorage.getItem('defaultFilterRepair'))])
        }
    }, [router])

    return (
        <div>
            {/* {showLoader && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )} */}
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
                            <span>{t('repairRequest')}</span>

                        </li>
                    </ul>
                </div>
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        <RBACWrapper permissionKey={['repairRequest:create']} type={'AND'}>
                            <button data-testid="add-repair" type="button" className="m-1 button-table button-create" onClick={(e) => router.push(`/warehouse-process/repair/create`)}>
                                <IconNewPlus />
                                <span className='uppercase'>{t('add')}</span>
                            </button>
                        </RBACWrapper>
                    </div>

                    <input
                        data-testId='search-repair-input'
                        autoComplete="off"
                        className="form-input w-auto"
                        placeholder={`${t('search')} `}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e)
                            }
                        }}
                    />
                </div>
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap gap-1">
                        <div className='flex items-center flex-wrap gap-2'>
                            <div className={active.includes(1) ? 'border p-2 rounded bg-[#E9EBD5] text-[#476704] cursor-pointer' : 'border p-2 rounded cursor-pointer'} onClick={() => handleActive(1)}>Chưa duyệt</div>
                            <div className={active.includes(2) ? 'border p-2 rounded bg-[#E9EBD5] text-[#476704] cursor-pointer' : 'border p-2 rounded cursor-pointer'} onClick={() => handleActive(2)}>Đã duyệt</div>
                            <div className={active.includes(3) ? 'border p-2 rounded bg-[#E9EBD5] text-[#476704] cursor-pointer' : 'border p-2 rounded cursor-pointer'} onClick={() => handleActive(3)}>Không duyệt</div>
                        </div>
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={repairs?.data}
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
                        paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })} `}
                    />
                </div>
            </div>
        </div>
    );
};

export default RepairPage;
