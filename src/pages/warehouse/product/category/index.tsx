import { useEffect, Fragment, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { lazy } from 'react';
import { setPageTitle } from '@/store/themeConfigSlice';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
// API
import { ProductCategorys } from '@/services/swr/product.swr';
import { DeleteProductCategory } from '@/services/apis/product.api';
// constants
import { PAGE_SIZES } from '@/utils/constants';
// helper
import { showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPlus from '@/components/Icon/IconPlus';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';

// modal
import CategoryModal from './CategoryModal';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import Link from 'next/link';
import { DropdownWarehouses } from '@/services/swr/dropdown.swr';

interface Props {
    [key: string]: any;
}

const ProductCategoryPage = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [showLoader, setShowLoader] = useState(true);
    const [data, setData] = useState<any>();
    const [openModal, setOpenModal] = useState(false);
    const [active, setActive] = useState<any>([]);
    const isFirstRender = useRef(true);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    // get data
    const { data: category, pagination, mutate, isLoading } = ProductCategorys({ sortBy: "id.DESC", ...router.query });
    const { data: warehouses, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({});

    useEffect(() => {
        dispatch(setPageTitle(`${t('category')}`));
    });

    useEffect(() => {
        setShowLoader(false);
    }, [category]);

    const handleEdit = (data: any) => {
        router.push(`/warehouse/product/category/${data?.id}`);
        setData(data);
    };

    const handleDelete = ({ id, name }: any) => {
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
                title: `${t('delete_category')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${name} ?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteProductCategory({ id })
                        .then(() => {
                            mutate();
                            showMessage(`${t('delete_category_success')}`, 'success');
                        })
                        .catch((err) => {
                            showMessage(`${t('delete_category_error')}`, 'error');
                        });
                }
            });
    };

    const handleSearch = (param: any) => {
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                search: param.target.value,
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
        { accessor: 'name', title: `${t('name_category')}`, sortable: false },
        {
            accessor: 'warehouse',
            title: `${t('warehouse_name')}`,
            render: ({ warehouse }: any) => <span>{warehouse?.name}</span>,
            sortable: false,
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            width: '10%',
            render: (records: any) => (
                <div className="flex justify-center gap-2 mr-2">
                    <RBACWrapper permissionKey={['productCategory:findOne']} type={'AND'}>
                        <div className="w-[auto]">
                            <button data-testId="edit-category-btn" type="button" className='button-edit' onClick={() => handleEdit(records)}>
                                <IconNewEdit /><span>
                                    {t('edit')}
                                </span>
                            </button>
                        </div>
                    </RBACWrapper>
                    <RBACWrapper permissionKey={['productCategory:delete']} type={'AND'}>
                        <div className="w-[auto]">
                            <button data-testId="delete-category-btn" type="button" className='button-delete' onClick={() => handleDelete(records)}>
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
    ];

    const handleActive = (item: any) => {
        if (Number(localStorage.getItem('defaultFilterCategory')) === item.value) {
            setActive([0]);
            localStorage.setItem('defaultFilterCategory', "");
            router.push({
                query: { warehouseId: '' }
            })
        } else {
            router.push({
                query: { warehouseId: item.value }
            })
            setActive([item.value]);
            localStorage.setItem('defaultFilterCategory', item.value);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && isFirstRender.current) {
            setActive([Number(localStorage.getItem('defaultFilterCategory'))]);
            router.push({
                query: { warehouseId: localStorage.getItem('defaultFilterCategory') }
            })
        }
        isFirstRender.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    return (
        <div>
            {showLoader && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )}
            <title>category</title>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                        <li>
                            <Link href="/hrm/dashboard" className="text-primary hover:underline">
                                {t('dashboard')}
                            </Link>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <span>{t('category')}</span>

                        </li>
                    </ul>
                </div>

                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="flex items-center flex-wrap">
                        <RBACWrapper permissionKey={['productCategory:create']} type={'AND'}>
                            <button data-testId="add-category" type="button" className="m-1 button-table button-create" onClick={(e) => router.push(`/warehouse/product/category/create`)}>
                                <IconNewPlus />
                                <span className='uppercase'>{t('add')}</span>
                            </button>
                        </RBACWrapper>
                    </div>

                    <input
                        autoComplete="off"
                        type="text"
                        data-testid="search-category-input"
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
                    <div className='flex items-center flex-wrap gap-2'>
                        {
                            warehouses?.data.map((item: any, index: any) => {
                                return (
                                    <div key={index} className={active.includes(item.value) ? 'border p-2 rounded bg-[#E9EBD5] text-[#476704] cursor-pointer' : 'border p-2 rounded cursor-pointer'} onClick={() => handleActive(item)}>{item.label}</div>
                                );
                            })
                        }
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={category?.data}
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
                        onRecordsPerPageChange={(e) => handleChangePage(pagination?.page, e)}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`}
                    />
                </div>
            </div>
            <CategoryModal openModal={openModal} setOpenModal={setOpenModal} data={data} setData={setData} categoryMutate={mutate} />
        </div>
    );
};

export default ProductCategoryPage;
