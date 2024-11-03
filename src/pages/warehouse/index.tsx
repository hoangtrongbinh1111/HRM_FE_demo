import { useEffect, Fragment, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import { lazy } from 'react';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
// API
import { Warehouses } from '@/services/swr/warehouse.swr';
// constants
import { PAGE_SIZES } from '@/utils/constants';
// helper
import { showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
// modal
import WarehouseModal from './modal/WarehouseModal';
import { DeleteWarehouse } from '@/services/apis/warehouse.api';
import Link from 'next/link';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import IconNewTrash from '@/components/Icon/IconNewTrash';


interface Props {
    [key: string]: any;
}

const WarehousePage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [showLoader, setShowLoader] = useState(true);
    const [data, setData] = useState<any>();
    const [openModal, setOpenModal] = useState(false);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });


    // get data
    const { data: warehouse, pagination, mutate, isLoading } = Warehouses({ sortBy: "id.DESC", ...router.query });

    useEffect(() => {
        dispatch(setPageTitle(`${t('warehouse')}`));
    });

    useEffect(() => {
        setShowLoader(false);
    }, [warehouse])

    const handleEdit = (data: any) => {
        setOpenModal(true);
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
                title: `${t('delete_warehouse')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${name} ?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteWarehouse({ id }).then(() => {
                        mutate();
                        showMessage(`${t('delete_warehouse_success')}`, 'success');
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
                    search: param
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

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(pagination?.page - 1) * pagination?.perPage + index + 1}</span>,
        },
        { accessor: 'name', title: `${t('warehouse_name')}`, sortable: false },
        { accessor: 'code', title: `${t('code_warehouse')}`, sortable: false },
        { accessor: 'description', title: `${t('description')}`, sortable: false },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            width: '10%',
            render: (records: any) => (
                <div className="flex justify-center gap-2 mr-2">
                    <RBACWrapper permissionKey={['warehouse:findOne']} type={'AND'}>
                        <div className="w-[auto]">
                            <Link href={`/warehouse/${records.id}`}>
                                <button type='button' className='button-detail'>
                                    <IconNewEye /> <span>{t('detail')}</span>
                                </button>
                            </Link>
                        </div>
                    </RBACWrapper>
                    <RBACWrapper permissionKey={['warehouse:remove']} type={'AND'}>
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

    return (
        <div>
            {showLoader && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
            <title>Warehouse</title>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                        <li>
                            <Link href="/hrm/dashboard" className="text-primary hover:underline">
                                {t('dashboard')}
                            </Link>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <span>{t('warehouse')}</span>

                        </li>
                    </ul>
                </div>
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <RBACWrapper permissionKey={['warehouse:create']} type={'AND'}>
                        <div className="flex items-center flex-wrap">
                            <button type="button" className="m-1 button-table button-create" onClick={(e) => router.push(`/warehouse/create`)}>
                                <IconNewPlus />
                                <span className='uppercase'>{t('add')}</span>
                            </button>
                        </div>
                    </RBACWrapper>

                    {/* <input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} onChange={(e) => handleSearch(e.target.value)} /> */}
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={warehouse?.data}
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
            <WarehouseModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                data={data}
                setData={setData}
                warehouseMutate={mutate}
            />
        </div>
    );
};

export default WarehousePage;
