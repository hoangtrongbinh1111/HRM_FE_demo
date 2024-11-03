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

// json
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { toDateString } from '@/utils/commons';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import IconCalendar from '@/components/Icon/IconCalendar';
interface Props {
    [key: string]: any;
}
import { useProfile } from '@/services/swr/profile.swr';
import { IRootState } from '@/store';
import { NotificationGroup } from '@/services/swr/notification-group.swr';
import { GroupDropdowns, Groups } from '@/services/swr/group.swr';

const Announcement = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;

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
    const [search, setSearch] = useState<any>('');
    const [dataGroupDropdown, setDataGroupDropdown] = useState<any>([]);
    const [pageGroup, setPageGroup] = useState(1);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    const { data: userData } = useProfile();
    const { data: notificationGroup, pagination, mutate, loading } = NotificationGroup({ sortBy: 'id.DESC', ...router.query });
    const { data: group, pagination: paginationGroup, mutate: mutateGroup, loading: loadingGroup } = GroupDropdowns({ page: pageGroup, sortBy: 'id.DESC', ...router.query });
    useEffect(() => {
        if (paginationGroup?.page === undefined) return;
        if (paginationGroup?.page === 1) {
            setDataGroupDropdown(group?.data)
        } else {
            setDataGroupDropdown([...dataGroupDropdown, ...group?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationGroup])

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPageGroup(paginationGroup?.page + 1);
        }, 1000);
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


    const handleEdit = (data: any) => {
        router.push(`/hrm/group-notification/${data?.id}`);
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
        router.push(`/hrm/group-notification/${data?.id}?status=true`);
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
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                status: param?.value,
            },
        });
    };

    const handleChangeGroup = (param: any) => {
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                groupId: param?.value,
            },
        });
    };

    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            // Xử lý sự kiện khi nhấn phím Enter ở đây
            handleSearch(search);
        }
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
            render: (record: any) => <span>{record?.createdBy?.fullName}</span>,
        },

        { accessor: 'title', title: `${t('title')}`, sortable: false },
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
                const kq = record?.receivers?.map((i: any) => i?.receiverName?.fullName).join(', ');
                return <span>{kq}</span>;
            },
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: 250,
            style: { whiteSpace: 'pre-wrap' },
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="mx-auto flex items-center justify-start gap-2">
                    <div className="w-[auto]">
                        <button type="button" className="button-detail" onClick={() => handleDetail(records)}>
                            <IconNewEye />
                            <span>{t('detail')}</span>
                        </button>
                    </div>
                    {status !== 'received' && records?.createdBy?.id === userData?.data?.id && (
                        <div className="w-[auto]">
                            <button type="button" className="button-edit" onClick={() => handleEdit(records)}>
                                <IconNewEdit />
                                <span>{t('edit')}</span>
                            </button>
                        </div>
                    )}
                </div>
            ),
        },
    ];
    return (
        <div>
            {/* {showLoader && (
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
                    <div className="flex flex-wrap items-center">
                        <Link href="/hrm/group-notification/create">
                            <button type="button" className=" button-table button-create m-1">
                                <IconNewPlus />
                                <span className="uppercase">{t('add')}</span>
                            </button>
                        </Link>
                    </div>
                    <div className="flex flex-row gap-2">
                        <div className="flex w-[220px] flex-1">
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
                        <div className="flex w-[220px] flex-1">
                            <Select
                                className="zIndex-10 w-[220px]"
                                options={dataGroupDropdown}
                                placeholder={t('choose_group')}
                                onChange={(e: any) => {
                                    handleChangeGroup(e);
                                }}
                                value={router.query.group}
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
                                className="form-input"
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
                <div className="datatables">
                    <DataTable
                        whitespace-nowrap
                        highlightOnHover
                        style={{ whiteSpace: 'pre-wrap' }}
                        className="table-hover custom_table button_hover whitespace-nowrap"
                        records={notificationGroup?.data}
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
