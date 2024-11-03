import { useEffect, Fragment, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { Stocktakes } from '@/services/swr/stocktake.swr';
import { DeleteStocktake } from '@/services/apis/stocktake.api';
import { PAGE_SIZES } from '@/utils/constants';
import { showMessage } from '@/@core/utils';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import Link from 'next/link';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const StocktakePage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(true);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });


    // get data
    const { data: stocktakes, pagination, mutate, isLoading } = Stocktakes({ ...router.query, sortBy: "id.DESC" });
    useEffect(() => {
        dispatch(setPageTitle(`${t('Stocktake')}`));
    });

    useEffect(() => {
        setShowLoader(false);
    }, [stocktakes])

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
                title: `${t('delete_stocktake')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${name} ?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteStocktake({ id }).then(() => {
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
        router.push(`/warehouse-process/stocktake/${value.id}?status=${value.status}`)
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
            case "STOCKTAKING":
                return t("stocktaking");
            case "FINISHED":
                return t("finished");
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
        { accessor: 'name', title: `${t('name_stocktake')}`, sortable: false },
        {
            accessor: 'warehouse',
            title: `${t('warehouse_name')}`,
            render: ({ warehouse }: any) => <span>{warehouse?.name}</span>,
        },
        {
            accessor: 'participants',
            title: `${t('participants')}`,
            render: ({ participants }: any) => {
                return participants?.map((item: any, index: any) => {
                    return (
                        <span key={item}>{index + 1 < participants.length ? item?.fullName + ", " : item?.fullName}</span>
                    )
                })
            }
        },
        {
            accessor: 'startDate',
            title: `${t('start_date')}`,
            render: ({ startDate }: any) => <span>{moment(startDate).format("DD/MM/YYYY")}</span>,
        },
        {
            accessor: 'EndDate',
            title: `${t('end_date')}`,
            render: ({ endDate }: any) => <span>{moment(endDate).format("DD/MM/YYYY")}</span>,
        },
        {
            accessor: 'status',
            title: `${t('status')}`,
            render: ({ status }: any) => {
                return (
                    <span className={`badge uppercase bg-${handleReturnColor(status)}`}>{
                        handleReturnText(status)
                    }</span>
                )
            },
            sortable: false
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => {
                return (
                    <>
                        <div className="flex justify-center gap-2">
                            <div className="w-[auto]">
                                <Link href={`/warehouse-process/stocktake/${records.id}?status=${true}&&type=${records.status
                                    }`}>
                                    <button type='button' className='button-detail'>
                                        <IconNewEye /> <span>{t('detail')}</span>
                                    </button>
                                </Link>
                            </div>
                            {
                                records.status === "DRAFT" &&
                                <RBACWrapper permissionKey={['stocktake:update']} type={'AND'}>
                                    <div className="w-[auto]">
                                        <button type="button" className='button-edit' onClick={() => handleDetail(records)}>
                                            <IconNewEdit /><span>
                                                {t('edit')}
                                            </span>
                                        </button>
                                    </div>
                                </RBACWrapper>
                            }
                            {
                                records.status === "DRAFT" &&
                                <RBACWrapper permissionKey={['stocktake:remove']} type={'AND'}>
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
                    </>
                )
            }
        },
    ]

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
                            <span>{t('stocktake')}</span>

                        </li>
                    </ul>
                </div>
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        <RBACWrapper permissionKey={['stocktake:create']} type={'AND'}>
                            <button type="button" className="m-1 button-table button-create" onClick={(e) => router.push(`/warehouse-process/stocktake/create?status=DRAFT`)}>
                                <IconNewPlus />
                                <span className='uppercase'>{t('add')}</span>
                            </button>
                        </RBACWrapper>
                    </div>

                    <input
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
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={stocktakes?.data}
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

export default StocktakePage;
