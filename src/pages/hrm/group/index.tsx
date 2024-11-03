import { useEffect, Fragment, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { PAGE_SIZES } from '@/utils/constants';
import { showMessage } from '@/@core/utils';
import { IconLoading } from '@/components/Icon/IconLoading';
import Link from 'next/link';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import { Groups } from '@/services/swr/group.swr';
import { DeleteGroup } from '@/services/apis/group.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';


interface Props {
    [key: string]: any;
}

const GroupPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    // get data
    const { data: group, pagination, mutate, isLoading } = Groups({ sortBy: "id.DESC", ...router.query });

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(pagination?.page - 1) * pagination?.perPage + index + 1}</span>,
        },
        { accessor: 'name', title: <div className='flex justify-center'>{t('group_name')}</div>, sortable: false },
        {
            accessor: 'users',
            title: <div className='flex justify-center'>{t('member')}</div>,
            sortable: false,
            render: (record: any) => {
                const kq = record?.details?.map((i: any) => i?.user?.fullName).join(', ');
                return <span className='flex justify-center'>{kq}</span>;
            },
        },
        {
            accessor: 'action',
            title: <div className='flex justify-center'>{t('action')}</div>,
            titleClassName: 'text-center',
            width: '10%',
            render: (records: any) => (
                <div className="flex justify-center gap-2 mr-2">
                    <RBACWrapper permissionKey={['group:findOne']} type={'AND'}>
                        <div className="w-[auto]">
                            <Link href={`/hrm/group/${records.id}`}>
                                <button type='button' className='button-detail'>
                                    <IconNewEye /> <span>{t('detail')}</span>
                                </button>
                            </Link>
                        </div>
                    </RBACWrapper>
                    <RBACWrapper permissionKey={['group:remove']} type={'AND'}>
                        <div className="w-[auto]">
                            <button type="button" className='button-delete' onClick={() => handleDelete(records)}>
                                <IconNewTrash />
                                <span>
                                    {t('delete')}
                                </span>
                            </button>
                        </div>
                    </RBACWrapper>
                </div>
            ),
        },
    ]

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
                    DeleteGroup({ id }).then(() => {
                        mutate();
                        showMessage(`${t('delete_success')}`, 'success');
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    });
                }
            });
    };

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

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                        <li>
                            <Link href="/hrm/dashboard" className="text-primary hover:underline">
                                {t('dashboard')}
                            </Link>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <span>{t('group')}</span>

                        </li>
                    </ul>
                </div>
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        <RBACWrapper permissionKey={['group:create']} type={'AND'}>
                            <button type="button" className="m-1 button-table button-create" onClick={(e) => router.push(`/hrm/group/create`)}>
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
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={group?.data}
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

export default GroupPage;
