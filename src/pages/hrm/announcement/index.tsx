import { useEffect, useRef, useState, useCallback } from 'react';
import { setPageTitle } from '../../../store/themeConfigSlice';
import Link from 'next/link';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn';
import { Lao } from '@/utils/lao';
import 'tippy.js/dist/tippy.css';
import { convertDateFormat2, formatStartDate, formatEndDate } from '@/utils/commons';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
// API
import { Positions } from '@/services/swr/position.swr';
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
// helper
import { downloadFile, downloadFile2, showMessage } from '@/@core/utils';
// icons
import { useRouter } from 'next/router';
import IconNewEye from '@/components/Icon/IconNewEye';

import { IconLoading } from '@/components/Icon/IconLoading';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
// json
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { Announcements } from '@/services/swr/announcement.swr';
import { toDateString } from '@/utils/commons';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import IconCalendar from '@/components/Icon/IconCalendar';
interface Props {
    [key: string]: any;
}
import { useProfile } from '@/services/swr/profile.swr';
import { IRootState } from '@/store';
import { Switch, MantineProvider } from '@mantine/core';
import { deleteAnnouncement, makeHighLight } from '@/services/apis/announcement.api';
import { allowAccess } from '@/@core/rbac/RBACWrapper';
const Announcement = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(setPageTitle(`${t('announcement')}`));
    });

    // const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const router = useRouter();

    const [showLoader, setShowLoader] = useState(true);
    const [status, setStatus] = useState();
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [recordsData, setRecordsData] = useState<any>();
    const [search, setSearch] = useState<any>('');

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    const { data: userData } = useProfile();
    const { data: announcements, pagination, mutate, loading } = Announcements({ sortBy: 'id.DESC', ...router.query });
    let user: any;
    if (typeof window !== 'undefined') {
        const userString = localStorage.getItem('profile');
        user = userString ? JSON.parse(userString) : null;
    }
    useEffect(() => {
        const searchQuery = router?.query?.search;

        if (typeof searchQuery === 'string') {
            setSearch(searchQuery);
        } else if (Array.isArray(searchQuery)) {
            setSearch(searchQuery[0] || '');
        } else {
            setSearch('');
        }
    }, [router?.query?.search, router?.query?.departmentId]);
    useEffect(() => {
        setShowLoader(false);
    }, [recordsData]);
    const handleEdit = (data: any) => {
        router.push(`/hrm/announcement/${data?.id}?page=${pagination?.page}&perPage=${pagination?.perPage}&status=true`);
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

    const handleDetail = (data: any) => {
        router.push(`/hrm/announcement/detail/${data?.id}?page=${pagination?.page}&perPage=${pagination?.perPage}&status=true`);
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
    const handleSearchTime = (param: any) => {
        const startDate = dayjs(param[0]);
        const endDate = dayjs(param[1]);

        if (param[1]) {
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    startDate: formatStartDate(startDate),
                    endDate: formatEndDate(endDate),
                },
            });
        }
    };
    const handleChangeStatus = (param: any) => {
        setStatus(param?.value);
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                status: param?.value,
            },
        });
    };
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            // Xử lý sự kiện khi nhấn phím Enter ở đây
            handleSearch(search);
        }
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
                title: `${t('delete_announcement')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data.title}?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    deleteAnnouncement(data?.id)
                        .then(() => {
                            showMessage(`${t('delete_announcement_success')}`, 'success');
                            mutate();
                        })
                        .catch((err) => {
                            showMessage(`${t('delete_announcement_error')}`, 'error');
                        });
                }
            });
    };
    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        {
            accessor: 'createdBy',
            title: `${t('userCreate')}`,
            sortable: false,
            width: 150,
            render: (record: any) => <span>{record?.createdBy?.fullName}</span>,
        },

        {
            accessor: 'title',
            title: `${t('title')}`,
            sortable: false,
            width: 250,
        },
        {
            accessor: 'createdAt',
            title: `${t('dataAnnouncement')}`,

            sortable: false,
            render: (record: any) => <span>{toDateString(record?.createdAt)}</span>,
        },

        {
            accessor: 'users',
            title: `${t('userReceive')}`,
            sortable: false,
            render: (record: any) => {
                const kq = record?.users?.map((i: any) => i?.fullName).join(', ');
                const department = record?.departments?.map((i: any) => i?.name).join(', ');
                const re = department === '' && kq === '' ? `${t('all')}` : kq && kq !== '' ? `${department}${department ? ' và ' : ''}${kq}` : `${department}`;
                return <span>{re?.length > 40 ? re?.substring(0, 40) + '......' : re}</span>;
            },
        },
        {
            accessor: 'isHighlight',
            title: `${t('announcementHighlight')}`,
            sortable: false,
            render: (record: any) => {
                return <span>{record?.isHighlight ? <span >{t('highlight_1')}</span> : <span>{t('highlight_2')}</span>}</span>
            }
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: 250,
            style: { whiteSpace: 'pre-wrap' },
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="mx-auto flex items-center justify-center gap-2">
                    <div className="w-[auto]">
                        <button type="button" className="button-detail" onClick={() => handleDetail(records)}>
                            <IconNewEye />
                            <span>{t('detail')}</span>
                        </button>
                    </div>
                    {status !== 'received' && records?.createdBy?.id === userData?.data?.id && (
                        <RBACWrapper permissionKey={['announcement:update']} type={'AND'}>
                            <div className="w-[auto]">
                                <button type="button" className="button-edit" onClick={() => handleEdit(records)}>
                                    <IconNewEdit />
                                    <span>{t('edit')}</span>
                                </button>
                            </div>
                        </RBACWrapper>
                    )}
                     {status !== 'received' && records?.createdBy?.id === userData?.data?.id && (
                        <RBACWrapper permissionKey={['position:remove']} type={'AND'}>
                        <div className="w-[auto]">
                            <button type="button" className="button-delete" onClick={() => handleDelete(records)}>
                                <IconNewTrash />
                                <span>{t('delete')}</span>
                            </button>
                        </div>
                    </RBACWrapper>
                    )}
                    
                </div>
            ),
        },
    ];
    return (
        <div>
            {/* {loading && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )} */}
            <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('homepage')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('announcement')}</span>
                </li>
            </ul>
            <title>{t('announcement')}</title>
            <div className="panel mt-6">
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <RBACWrapper permissionKey={['announcement:create']} type={'AND'}>
                        <div className="flex flex-wrap items-center">
                            <Link href="/hrm/announcement/create">
                                <button type="button" className=" button-table button-create m-1">
                                    <IconNewPlus />
                                    <span className="uppercase">{t('add')}</span>
                                </button>
                            </Link>
                        </div>
                    </RBACWrapper>
                    <div className="flex flex-row gap-2">
                        <div className="flex w-[240px] flex-1">
                            <Select
                                className="zIndex-10 w-[220px]"
                                options={[
                                    { value: 'sent', label: 'Thư gửi' },
                                    { value: 'received', label: 'Thư nhận' },
                                ]}
                                placeholder={t('choose_status')}
                                onChange={(e: any) => {
                                    handleChangeStatus(e);
                                }}
                                value={router.query.status === 'sent' ? { value: 'sent', label: 'Thư gửi' } : router.query.status === 'received' ? { value: 'received', label: 'Thư nhận' } : ''}
                                isClearable
                            />
                        </div>

                        <div className="flex w-[240px] flex-1">
                            <Flatpickr
                                options={{
                                    locale: {
                                        ...chosenLocale,
                                    },
                                    mode: 'range',
                                    dateFormat: 'd-m-Y',
                                    defaultDate: [`${convertDateFormat2(router?.query.startDate)}`, `${convertDateFormat2(router?.query.endDate)}`],
                                }}
                                placeholder={`${t('Duration')}`}
                                className="form-input w-[220px]"
                                onChange={(e) => handleSearchTime(e)}
                            />
                            <div style={{ margin: '8px -31px' }}>
                                <IconCalendar />
                            </div>
                        </div>

                        <div className="flex w-[140px] flex-1" style={{ alignItems: 'flex-start', justifyContent: 'flex-end' }}>
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
                    </div>
                </div>
                <div className="datatables" id="annoucement-table">
                    <DataTable
                        whitespace-nowrap
                        highlightOnHover
                        style={{ whiteSpace: 'pre-wrap' }}
                        className="table-hover custom_table button_hover whitespace-nowrap"
                        records={announcements?.data}
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
        </div>
    );
};

export default Announcement;
