import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import Link from 'next/link';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
// API
import { Positions } from '@/services/swr/position.swr';
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
// helper
import { downloadFile, downloadFile2, showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import IconImportFile from '@/components/Icon/IconImportFile';
import { useRouter } from 'next/router';
import IconNewEye from '@/components/Icon/IconNewEye';


// json
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { deletePosition, exportPosition } from '@/services/apis/position.api';
import GroupPosition from '../group-position';
import { GroupPositions } from '@/services/swr/group-position.swr';
import { Departments } from '@/services/swr/department.swr';
import DutyModal from './modal/DutyModal';
import { Timekeeper } from '@/services/swr/Timekeeper.swr';
import { deleteTimekeeper } from '@/services/apis/timekeeper.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const TimekeeperPage = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(setPageTitle(`${t('timekeeper')}`));
    });

    const router = useRouter();

    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [recordsData, setRecordsData] = useState<any>();
    const [total, setTotal] = useState(0);
    const [getStorge, setGetStorge] = useState<any>();
    const [data, setData] = useState<any>();
    const [search, setSearch] = useState<any>("");

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    const [openModal, setOpenModal] = useState(false);
    //get data
    const { data: departments } = Departments({ page: 1, perPage: 100 });
    const { data: timekeeper, pagination, mutate, loading } = Timekeeper({
        sortBy: 'id.DESC',
        ...router.query
    });

    const { data: groupPositionsData, pagination: groupPositionPagination, mutate: groupPositionMutate } = GroupPositions({
        sortBy: 'id.ASC',
    });
    let user: any;
    if (typeof window !== 'undefined') {
        const userString = localStorage.getItem('profile');
        user = userString ? JSON.parse(userString) : null;
    }
    useEffect(() => {
        setShowLoader(false);
    }, [recordsData])
    const handleDetail = (item: any) => {
        router.push(`/hrm/timekeeper/detail/${item?.code}?page=${pagination?.page}&perPage=${pagination?.perPage}`)
    }
    const handleExcel = () => {
        exportPosition()
            .then((res) => {
                downloadFile2(res?.data)
            })
            .catch((e) => {
                console.log(e)
            })
    }
    const handleEdit = (data: any) => {
        router.push(`/hrm/timekeeper/${data?.code}?page=${pagination?.page}&perPage=${pagination?.perPage}`)
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

    const handleDelete = (data: any) => {
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
                title: `${t('delete_timekeeper')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data.name}?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    deleteTimekeeper(data?.id).then(() => {
                        showMessage(`${t('delete_timekeeper_success')}`, 'success');
                        mutate();
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
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
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            // Xử lý sự kiện khi nhấn phím Enter ở đây
            handleSearch(search)
        }
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
    }, [router?.query?.search]);
    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        { accessor: 'name', title: <div className='flex'>{t('name_timekeeper')}</div>, sortable: false },
        // { accessor: 'code', title: <div className='flex'>{t('code_timekeeper')}</div >, sortable: false },
        { accessor: 'location', title: <div className='flex'>{t('position_timekeeper')}</div>, sortable: false },
        // {
        //     accessor: 'department',
        //     title: <div className='flex'>{t('department_timekeeper')}</div>,
        //     sortable: false,
        //     minWidth: 150,
        //     style: { whiteSpace: 'pre-wrap' }, // Kích hoạt text wrap
        //     render: ({ departments }: any) => {
        //         const kq = departments?.map((item: any) => item?.name).join(', ');
        //         return kq;
        //     },
        // },
        {
            accessor: 'status',
            title: `${t('status')}`,
            sortable: false,
            // style: { whiteSpace: 'pre-wrap' },
            render: ({ isActive }: any) => <span className={`badge bg-${isActive ? "success" : "danger"} `}>{isActive ? t('active') : t('inactive2')}</span>,
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: '300px',
            style: { whiteSpace: 'pre-wrap' },
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="mx-auto flex items-center gap-2 justify-center">

                    <RBACWrapper permissionKey={['timekeeper:detail']} type={'AND'}>
                        <div className="w-[auto]">
                            <button type="button" className='button-detail' onClick={() => handleDetail(records)}>
                                <IconNewEye /><span>
                                    {t('detail')}
                                </span>
                            </button>
                        </div>
                    </RBACWrapper>
                    <RBACWrapper permissionKey={['timekeeper:edit']} type={'AND'}>
                        <div className="w-[auto]">
                            <button type="button" className='button-edit' onClick={() => handleEdit(records)}>
                                <IconNewEdit /><span>
                                    {t('edit')}
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
            {/* {(showLoader || loading) && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )} */}
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('timekeeper')}</span>

                </li>
            </ul>
            <title>{t('department')}</title>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-end md:flex-row flex-col mb-4.5 gap-5">

                    <input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} value={search} onKeyDown={(e) => handleKeyPress(e)} onChange={(e) => e.target.value === "" ? handleSearch("") : setSearch(e.target.value)} />
                </div>
                <div className="datatables" id='timekeeper'>
                    <DataTable
                        whitespace-nowrap
                        highlightOnHover
                        style={{ whiteSpace: 'pre-wrap' }}
                        className="whitespace-nowrap table-hover custom_table button_hover"
                        records={timekeeper?.data}
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

export default TimekeeperPage;
