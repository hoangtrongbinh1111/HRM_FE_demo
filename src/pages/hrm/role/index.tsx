import { useEffect, Fragment, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle, setPagination } from '@/store/themeConfigSlice';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
// API
import { Roles } from '@/services/swr/role.swr';
// constants
import { PAGE_SIZES } from '@/utils/constants';
import { DeleteRole } from '@/services/apis/role.api';
// helper
import { showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPlus from '@/components/Icon/IconPlus';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import Link from 'next/link';
interface Props {
    [key: string]: any;
}

const RolePage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [search, setSearch] = useState<any>('');
    const [showLoader, setShowLoader] = useState(true);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });


    // get data
    const { data: role, pagination, mutate, loading } = Roles({ sortBy: 'id.ASC', ...router.query });

    useEffect(() => {
        dispatch(setPageTitle(`${t('role_list')}`));
    });
    useEffect(() => {
        const searchQuery = router?.query?.search;

        if (typeof searchQuery === 'string') {
            setSearch(searchQuery);
        } else if (Array.isArray(searchQuery)) {
            setSearch(searchQuery[0] || '');
        } else {
            setSearch('');
        }
    }, [router?.query?.search]);
    useEffect(() => {
        setShowLoader(false);
    }, [role])

    const handleEdit = (data: any) => {
        
		router.push(`role/${data?.id}`);
        dispatch(setPagination(router.query));
    };

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
                title: `${t('delete_role')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${name}?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteRole({ id }).then(() => {
                        mutate();
                        showMessage(`${t('delete_role_success')}`, 'success');
                    }).catch((err) => {
                        showMessage(`${t('delete_role_error')}`, 'error');
                    });
                }
            });
    };

    const handleSearch = (param: any) => {
        setSearch(param);
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                page: 1,
                perPage: 10,
                search: param,
            },
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

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(pagination?.page - 1) * pagination?.perPage + index + 1}</span>,
        },
        { accessor: 'name', title: 'Tên quyền', sortable: false },
        { accessor: 'description', title: `${t('notes')}`, sortable: false },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: "30%",
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="mx-auto flex items-center gap-2 justify-center">
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

                </div>
            ),
        },
    ]
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            // Xử lý sự kiện khi nhấn phím Enter ở đây
            handleSearch(search);
        }
    };
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('role_list')}</span>

                </li>
            </ul>
            {/* {showLoader || loading && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )} */}
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                </div>
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        <button type="button" onClick={(e) => router.push('role/create')} className="button-table button-create m-1 " >
                            <IconNewPlus />
                            <span className="uppercase">{t('add')}</span>
                        </button>
                    </div>
                    <input
                        autoComplete="off"
                        type="text"
                        className="form-input w-auto"
                        placeholder={`${t('search')}`}
                        value={search}
                        onKeyDown={(e) => handleKeyPress(e)}
                        onChange={(e) => (e.target.value === '' ? handleSearch('') : setSearch(e.target.value))}
                    />
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={role?.data}
                        columns={columns}
                        totalRecords={pagination?.totalRecords}
                        recordsPerPage={pagination?.perPage}
                        page={pagination?.page}
                        onPageChange={(p) => {
                            handleChangePage(p, pagination?.perPage)
                        }}
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

export default RolePage;
