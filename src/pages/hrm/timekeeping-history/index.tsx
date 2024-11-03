import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
// Third party libs
// import 'flatpickr/dist/themes/material_blue.css'; // hoặc theme khác mà bạn thích
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useTranslation } from 'react-i18next';
import Select from "react-select";
import 'tippy.js/dist/tippy.css';
// API
// constants
import { PAGE_NUMBER_DEFAULT, PAGE_SIZES, PAGE_SIZES_DEFAULT } from '@/utils/constants';
// helper

// icons
import IconCalendar from '@/components/Icon/IconCalendar';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconNewEye from '@/components/Icon/IconNewEye';
import 'flatpickr/dist/flatpickr.css';
import monthSelectPlugin, { Config } from "flatpickr/dist/plugins/monthSelect";
import "flatpickr/dist/plugins/monthSelect/style.css";
import { useRouter } from 'next/router';
import Flatpickr from 'react-flatpickr';
// json
import { HistoryTimekeepings } from '@/services/swr/historyTimekeeping.swr';
import { Timekeeper } from '@/services/swr/Timekeeper.swr';
import { IRootState } from '@/store';
import { Lao } from "@/utils/lao";
import dayjs from 'dayjs';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useSelector } from 'react-redux';
import { getStartEndMonth } from '@/utils/commons';
interface Props {
    [key: string]: any;
}
const monthSelectConfig: Partial<Config> = {
    shorthand: true, //defaults to false
    dateFormat: "m/Y", //defaults to "F Y"
    theme: "light" // defaults to "light"
};
interface HumanOption {
    value: string;
    label: string;
}
const HistoryTimekeeping = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(setPageTitle(`${t('timekeeping-history')}`));
    });

    const router = useRouter();

    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [recordsData, setRecordsData] = useState<any>();
    const [getStorge, setGetStorge] = useState<any>();
    const [data, setData] = useState<any>();
    const [search, setSearch] = useState<any>("");
    const [date, setDate] = useState([null, null]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const flatpickrRef = useRef<any>(null);
    const [selectedHumanOptions, setSelectedHumanOptions] = useState<HumanOption[]>([]);

    const [openModal, setOpenModal] = useState(false);
    //get data
    const today = new Date(); // Đối tượng Date sẽ lấy ngày và giờ hiện tại

    const { data: history, pagination, mutate, loading } = HistoryTimekeepings({
        sortBy: 'id.DESC',
        // time: dayjs(today).format('YYYY-MM-DD'),
        status: 1,
        ...router.query
    });

    let user: any;
    if (typeof window !== 'undefined') {
        const userString = localStorage.getItem('profile');
        user = userString ? JSON.parse(userString) : null;
    }
    useEffect(() => {
        setShowLoader(false);
    }, [history])

    useEffect(() => {
        if (router.isReady) {
            const startDay_ = router?.query?.startDate as string;
            const endDay_ = router?.query?.endDate as string;
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const [startOfMonth, endOfMonth] = getStartEndMonth(currentYear, currentMonth);
            const startDate = startDay_ ?? startOfMonth;
            const endDate = endDay_ ?? endOfMonth;
            const listUsers = router?.query?.userIds
            const searchParam = router?.query?.search
            setSearch(searchParam);

            let selectedHumanOptions2: HumanOption[] = [];

            if (Array.isArray(router?.query?.userIds) && Array.isArray(router?.query?.SelectedHumanOptions)) {
                selectedHumanOptions2 = router.query.userIds.map((userId: string, index: number) => ({
                    value: userId,
                    label: router.query.SelectedHumanOptions ? router.query.SelectedHumanOptions[index] : '',
                }));
            } else if (typeof router?.query?.userIds === 'string' && typeof router?.query?.SelectedHumanOptions === 'string') {
                selectedHumanOptions2 = [{
                    value: router.query.userIds,
                    label: router.query.SelectedHumanOptions,
                }];
            } else {
                selectedHumanOptions2 = [];
            }

            // Cập nhật state với giá trị mới
            setSelectedHumanOptions(selectedHumanOptions2);
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    startDate: startDate,
                    endDate: endDate,
                    search: searchParam
                    // userIds: listUsers
                },
            });

            if (flatpickrRef?.current) {
                flatpickrRef.current?.flatpickr?.setDate([dayjs(startDate).format('DD-MM-YYYY'), dayjs(endDate).format('DD-MM-YYYY')]);
            }
        }
    }, [router.isReady]);

    const handleChangeDates = (de: any) => {
        if (de?.length === 2) {
            setPage(1);
            flatpickrRef.current?.flatpickr?.setDate([dayjs(de[0]).format('DD-MM-YYYY'), dayjs(de[1]).format('DD-MM-YYYY')]);
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: 1,
                    startDate: dayjs(de[0]).format('YYYY-MM-DD'),
                    endDate: dayjs(de[1]).format('YYYY-MM-DD'),
                },
            });
        }
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
    const handleDetail = (value: any) => {
        router.push(`/hrm/timekeeping-history/detail/${value?.id}?page=${pagination?.page}&perPage=${pagination?.perPage}`)
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
    const handleSearchByStatus = (param: any) => {
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                status: param?.value,
            },
        });
    };
    const handleChangeMonth = (month: any) => {
        const month_ = month?.split('/')[0]
        const year_ = month?.split('/')[1]

        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    time: `${year_}-${month_}-01`,
                },
            }
        );
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
    }, [router?.query?.search]);
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            handleSearch(search)
        }
    };
    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },

        {
            accessor: 'name',
            title: `${t('personel_name')}`, sortable: false,
            render: (record: any) => {
                return <span>{record?.staff?.fullName}</span>
            },
        },
        {
            accessor: 'code',
            title: `${t('personel_code')}`, sortable: false,
            render: (record: any) => {
                return <span>{record?.staff?.code}</span>
            },
        },
        {
            accessor: 'timesheet',
            title: `${t('time_timekeeping')}`,
            sortable: false,
            render: (record: any) => {
                return <>{dayjs(record?.timeSheet).format('DD-MM-YYYY HH:mm:ss')}</>;
            }
        },
        {
            accessor: 'timekeeperId',
            title: `${t('machine_timekeeping')}`, sortable: false,
            render: (record: any) => {
                return <span>{record?.timekeeper?.name}</span>
            },
        },
        {
            accessor: 'status',
            title: `${t('type_timekeeping')}`, sortable: false,
            render: (record: any) => {
                return <span>{record?.status === 1 ? `${t('Face Attendance')}` : `${t('GPS Attendance')}`}</span>
            }
        }, {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="w-[auto]">
                    <button data-testId="detail-proposal-btn" type='button' className='button-detail' onClick={() => handleDetail(records)}>
                        <IconNewEye /> <span>{t('detail')}</span>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            {showLoader && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('timekeeping-history')}</span>
                </li>
            </ul>
            <title>{t('department')}</title>
            <div className="panel mt-6">
                <div className="flex md:items-center md:flex-row flex-col mb-4.5 gap-5" style={{ justifyContent: "flex-end" }}>
                    <div className='flex flex-row gap-2'>
                        <div className='flex w-[240px]'>
                            <Select
                                className="zIndex-10 w-[240px]"
                                id='unidepartmentparentIdtId'
                                name='departmentparentId'
                                placeholder={t('choose_status')}
                                options={[{
                                    value: 1,
                                    label: `${t('Face Attendance')}`
                                },
                                {
                                    value: 2,
                                    label: `${t('GPS Attendance')}`
                                }]}
                                isClearable
                                value={router.query.status === '2' ? {
                                    value: 2,
                                    label: `${t('GPS Attendance')}`
                                } : {
                                    value: 1,
                                    label: `${t('Face Attendance')}`
                                }}
                                maxMenuHeight={160}
                                onChange={(e) => handleSearchByStatus(e)}
                            />
                        </div>
                        <div className='flex w-[280px]' style={{ alignItems: "flex-start", padding: '0 10px' }}>
                            {/* <Flatpickr
                                className='form-input'
                                options={{
                                    defaultDate: new Date(), // Đặt ngày mặc định là ngày hiện tại
                                    locale: {
                                        ...Vietnamese // Có thể cần import ngôn ngữ Vietnamese từ thư viện Flatpickr
                                    },
                                    plugins: [
                                        monthSelectPlugin(monthSelectConfig) // Sử dụng plugin với cấu hình
                                    ]
                                }}
                                placeholder={`${t('choose_month')}`}
                                onChange={(selectedDates, dateStr, instance) => {
                                    handleChangeMonth(dateStr);
                                }}
                            /> */}
                            <Flatpickr
                                ref={flatpickrRef}
                                className="form-input"
                                placeholder={`${t('choose_time_duration')}`}
                                options={{
                                    locale: {
                                        ...chosenLocale,
                                    },
                                    mode: 'range',
                                    dateFormat: 'd-m-Y',
                                }}
                                onChange={(e: any) => {
                                    handleChangeDates(e);
                                }}
                            />

                            <div style={{ margin: '8px -31px' }} >
                                <IconCalendar />
                            </div>
                        </div>
                        <div className='flex' style={{ alignItems: "flex-start" }}>
                            <input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} value={search} onKeyDown={(e) => handleKeyPress(e)} onChange={(e) => e.target.value === "" ? handleSearch("") : setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        style={{ whiteSpace: 'pre-wrap' }}
                        className="whitespace-nowrap table-hover custom_table button_hover"
                        records={history?.data}
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

export default HistoryTimekeeping;
