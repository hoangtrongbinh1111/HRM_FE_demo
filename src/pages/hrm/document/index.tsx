import { useEffect, Fragment, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { PAGE_SIZES } from '@/utils/constants';
import { showMessage } from '@/@core/utils';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import Link from 'next/link';
import { AccessControl } from '@/services/swr/access-control.swr';
import { DeleteAccessControl } from '@/services/apis/access-control.api';
import Select, { components } from 'react-select';
import { DropdownDepartment, DropdownPosition } from '@/services/swr/dropdown.swr';
import { Positions } from '@/services/swr/position.swr';
import { Departments } from '@/services/swr/department.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const RolePage = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [pagePosition, setPagePosition] = useState(1);
    const [dataPosition, setDataPosition] = useState<any>([]);
    const [searchPosition, setSearchPosition] = useState<any>();
    const [department, setDepartment] = useState<any>();
    const [position, setPosition] = useState<any>();
    const [entity, setEntity] = useState<any>();
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });
    const [search, setSearch] = useState<any>("");

    useEffect(() => {
        dispatch(setPageTitle(`${t('document_level')}`));
    });

    // get data
    const {
        data: accessControl,
        pagination,
        mutate,
        loading,
    } = AccessControl({
        sortBy: 'id.ASC',
        ...router.query,
    });
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });
    const { data: dropdownPosition, pagination: paginationPosition, mutate: mutatePosition, isLoading: isLoadingPosition } = DropdownPosition({ page: pagePosition, search: searchPosition });

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
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            handleSearch(search)
        }
    };
    const handleSearchAll = (param: any, x: string) => {

        const newQuery = { ...router.query };

        if (x === 'entity') {
            newQuery.entity = param?.value === 'all' ? '' : param?.value;
        } else if (x === 'department') {
            newQuery.departmentId = param?.value === 'all' ? '' : param?.value;
        } else if (x === 'position') {
            newQuery.positionId = param?.value === 'all' ? '' : param?.value;
        }

        router.replace({
            pathname: router.pathname,
            query: newQuery,
        });
    };

    useEffect(() => {
        const searchQuery = router?.query?.search;

        if (typeof searchQuery === 'string') {
            setSearch(searchQuery);
        } else if (Array.isArray(searchQuery)) {
            setSearch(searchQuery[0] || '');
        } else {
            setSearch('');
        }

    }, [router?.query?.search, router?.query?.entity, router?.query?.positionId, router?.query?.departmentId]);

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

    useEffect(() => {
        mutatePosition();
        mutateDepartment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router])

    const handleEdit = (data: any) => {
        router.push(`/hrm/document/${data?.id}?page=${pagination?.page}&perPage=${pagination?.perPage}&positionId=${router?.query?.positionId}&departmentId=${router?.query?.departmentId}`)
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
                title: `<span style="white-space: nowrap; font-size: 18px; font-weight: bold;">${t('delete_document')}</span>`, // Điều chỉnh tiêu đề trực tiếp trong hàm
                html: `<span class='confirm-span'>${t('confirm_delete')}</span>?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteAccessControl({ id })
                        .then(() => {
                            mutate();
                            showMessage(`${t('delete_document_success')}`, 'success');
                        })
                        .catch((err) => {
                            showMessage(`${err?.response?.data?.message}`, 'error');
                        });
                }
            });
    };

    // const handleSearch = (param: any) => {
    //     router.replace({
    //         pathname: router.pathname,
    //         query: {
    //             ...router.query,
    //             search: param.target.value,
    //         },
    //     });
    // };

    useEffect(() => {
        if (!dataDepartment.find((item: any) => item.value === 'all')) {
            setDataDepartment([{ value: 'all', label: 'Tất cả' }, ...dataDepartment]);
        }
    }, [dataDepartment]);
    const columns = [
        {
            accessor: 'id',
            title: '#',
            width: '8%',
            render: (records: any, index: any) => <span style={{ padding: '12px' }}>{(pagination?.page - 1) * pagination?.perPage + index + 1}</span>,
        },
        {
            accessor: 'department',
            title: `${t('department')}`,
            width: '15%',
            render: ({ department }: any) => <span style={{ padding: '12px' }}>{department?.name ?? 'Tất cả'}</span>,
            sortable: false,
        },
        {
            accessor: 'position',
            title: `${t('position')}`,
            width: '20%',
            render: ({ position }: any) => <span style={{ padding: '12px' }}>{position?.name}</span>,
            sortable: false,
        },
        {
            accessor: 'entity',
            title: `${t('document type')}`,
            width: '20%',
            render: (records: any) => <span style={{ padding: '12px' }}>{t(records.entity)}</span>,
            sortable: false,
        },
        {
            accessor: 'entity',
            title: `${t('role_view')}`,
            width: '20%', render: (records: any) => (
                <span style={{ padding: '12px' }}>
                    {records?.canViewAllDepartments === true
                        ? t('View all departments')
                        : records?.canViewOwnDepartment === true
                            ? t('View my department')
                            : records?.canViewSpecificDepartment === true
                                ? t('View particular departments')
                                : null}
                </span>
            ),

            sortable: false,
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: '20%',
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="mx-auto flex items-center justify-center gap-2">
                    <RBACWrapper permissionKey={['document:update']} type={'AND'}>
                        <div className="w-[auto]">
                            <button type="button" className="button-edit" onClick={() => handleEdit(records)}>
                                <IconNewEdit />
                                <span>{t('edit')}</span>
                            </button>
                        </div>
                    </RBACWrapper>
                    <RBACWrapper permissionKey={['document:remove']} type={'AND'}>
                        <div className="w-[auto]">
                            <button type="button" className="button-delete" onClick={() => handleDelete(records)}>
                                <IconNewTrash />
                                <span>{t('delete')}</span>
                            </button>
                        </div>
                    </RBACWrapper>
                </div>
            ),
        },
    ];

    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment([{ value: 'all', label: 'Tất cả' }, ...dropdownDepartment?.data]);
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

    useEffect(() => {
        if (paginationPosition?.page === undefined) return;
        if (paginationPosition?.page === 1) {
            setDataPosition([{ value: 'all', label: 'Tất cả' }, ...dropdownPosition?.data]);
        } else {
            setDataPosition([...dataPosition, ...dropdownPosition?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationPosition]);

    const handleMenuScrollPositionToBottom = () => {
        setTimeout(() => {
            setPagePosition(paginationPosition?.page + 1);
        }, 1000);
    };

    const document: any = [
        { value: 'leavingLateEarly', label: `${t('leavingLateEarly')}` },
        { value: 'forgotCheckinOut', label: `${t('forgotCheckinOut')}` },
        { value: 'leaveApplication', label: `${t('leaveApplication')}` },
        { value: 'resignationLetter', label: `${t('resignationLetter')}` },
        { value: 'paymentRequestList', label: `${t('paymentRequestList')}` },
        { value: 'paymentOrder', label: `${t('paymentOrder')}` },
        { value: 'drivingOrder', label: `${t('driving_order')}` },
        { value: 'travelPaper', label: `${t('travelPaper')}` },
        { value: 'confirmPortal', label: `${t('confirm_portal')}` },
        { value: 'requestOvertime', label: `${t('requestOvertime')}` },
        { value: 'requestAdvancePayment', label: `${t('request_advance_payment')}` },
        { value: 'trackingLog', label: `${t('trackingLog')}` },
        { value: 'riceCoupon', label: `${t('riceCoupon')}` },
        { value: 'foodVoucher', label: `${t('food_voucher')}` },
        { value: 'requestAdditionalPersonnel', label: `${t('requestAdditionalPersonnel')}` },
        { value: 'otherDocument', label: `${t('otherDocument')}` },
        { value: 'timeAttendance', label: `${t('timeAttendance')}` },
        { value: 'proposal', label: `${t('proposal')}` },
        { value: 'order', label: `${t('proposal_order')}` },
        { value: 'repairRequest', label: `${t('repair_request')}` },
        { value: 'warehousingBill', label: `${t('wareHousingBillExportImport')}` },
        { value: 'stocktake', label: `${t('proposal_stocktake')}` },
    ];

    return (
        <div>
            {/* {loading && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )} */}
            <div className="mb-1 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <ul className="mb-1 flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/hrm/dashboard" className="text-primary hover:underline">
                            {t('dashboard')}
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{t('access_control')}</span>
                    </li>
                </ul>
            </div>
            <div className="panel mt-6">
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <RBACWrapper permissionKey={['document:create']} type={'AND'}>
                        <button type="button" onClick={(e) => router.push('document/create')} className="button-table button-create m-1 ">
                            <IconNewPlus />
                            <span className="uppercase">{t('add')}</span>
                        </button>
                    </RBACWrapper>
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
                <div className="mb-4.5 flex flex-col justify-end gap-5 md:flex-row md:items-center">
                    <div className="z-10 flex items-center">
                        <label className="label mr-2">{t('document') + ':'}</label>
                        <Select
                            options={document || []}
                            maxMenuHeight={260}
                            onChange={(e) => {
                                setEntity(e)
                                handleSearchAll(e, 'entity')
                            }}
                            value={entity}
                            className="min-w-[250px]"
                            placeholder={`${t("choose_document")}`}
                        />
                    </div>
                    <div className="z-10 flex items-center">
                        <label className="label mr-2">{t('department') + ':'}</label>
                        <Select
                            options={dataDepartment}
                            maxMenuHeight={260}
                            onMenuOpen={() => setPage(1)}
                            onMenuScrollToBottom={handleMenuScrollToBottom}
                            isLoading={isLoadingDepartment}
                            onInputChange={(e) => setSearchDepartment(e)}
                            // value={departments?.find((i: any) => i.value == router?.query?.departmentId)}
                            onChange={(e) => {
                                setDepartment(e)
                                handleSearchAll(e, 'department')
                            }}
                            className="min-w-[250px]"
                            placeholder={`${t("choose_department")}`}
                        />
                    </div>
                    <div className="z-10 flex items-center">
                        <label className="label mr-2">{t('position') + ':'}</label>
                        <Select
                            options={dataPosition}
                            maxMenuHeight={260}
                            onMenuOpen={() => setPagePosition(1)}
                            onMenuScrollToBottom={handleMenuScrollPositionToBottom}
                            isLoading={isLoadingPosition}
                            // value={positions?.find((i: any) => i.value == router?.query?.positionId)}
                            onChange={(e) => {
                                setPosition(e)
                                handleSearchAll(e, 'position')
                            }}
                            // value={position}
                            className="min-w-[250px]"
                            placeholder={`${t("choose_position")}`}
                        />
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="table-hover custom_table whitespace-nowrap"
                        records={accessControl?.data}
                        columns={columns}
                        totalRecords={pagination?.totalRecords}
                        recordsPerPage={pagination?.perPage}
                        page={pagination?.page}
                        onPageChange={(p) => {
                            handleChangePage(p, pagination?.perPage);
                        }}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={(e) => handleChangePage(pagination?.page, e)}
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
