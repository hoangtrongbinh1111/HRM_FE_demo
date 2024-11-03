import Link from 'next/link';

import { DataTable } from 'mantine-datatable';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';

import { getQuantityByDepartment, getQuantityByNation } from '@/services/apis/human.api';
import { Announcements } from '@/services/swr/announcement.swr';
import { InventoryExpired, WarehouseStatistic } from '@/services/swr/statistic.swr';
import { toDateString } from '@/utils/commons';
import { PAGE_SIZES } from '@/utils/constants';
import { Tooltip } from '@mantine/core';
import moment from 'moment';
import { useRouter } from 'next/router';
import Modal from './announcement/modal';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});

import { listAllTaskDashboard } from '@/services/apis/task.api';
import { CalendarLeaderShips } from '@/services/swr/calendarLeaderShip.swr';
import dayjs from 'dayjs';
import CountUp from 'react-countup';
const DashBoard = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(`${t('dashboard')}`));
    });
    const [quantityByNation, setQuantityByNation] = useState<any>([]);
    const [quantityPercent, setQuantityPercent] = useState<any>([]);
    const [open, setOpen] = useState(false);
    const { t } = useTranslation();
    const router = useRouter();
    const { data: announcements, pagination } = Announcements({ sortBy: 'id.DESC', page: 1, perPage: 100 });
    const { data: dataCalendar } = CalendarLeaderShips({ sortBy: 'id.DESC', page: 1, perPage: 100 });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [isMounted, setIsMounted] = useState(false);
    const [inventoryPage, setInventoryPage] = useState<any>();
    const [idAnnoucement, setIdAnnoucement] = useState<any>();
    //get data
    const { data: warehouseStatistic } = WarehouseStatistic({ sortBy: 'id.DESC' });
    const { data: inventoryExpired, pagination: inventoryPagination, mutate } = InventoryExpired({ sortBy: 'id.DESC', page: inventoryPage });
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [dataByDepartment, setDataByDepartment] = useState<any>();
    const [hoveredAnnouncement, setHoveredAnnouncement] = useState(null);
    const handleAnnouncementClick = (announcement: any) => {
        setSelectedAnnouncement(announcement);
    };
    const handleMouseEnter = (announcement: any) => {
        setHoveredAnnouncement(announcement);
    };
    const date = new Date();
    const handleMouseLeave = () => {
        setHoveredAnnouncement(null);
    };
    useEffect(() => {
        setIsMounted(true);
    });
    useEffect(() => {
        setIdAnnoucement(announcements?.data[0] ?? null);
        setSelectedAnnouncement(announcements?.data[0] ?? null);
    }, [announcements]);
    // const [dataCalendar, setDataCalendar] = useState<any>();
    const [dataTask, setDataTask] = useState<any>();
    // useEffect(() => {
    // 	listAllCalendarLeaderShip({
    // 		param: {
    // 			page: 1,
    // 			perPage: 1,
    // 		},
    // 	})
    // 		.then((res) => {
    // 			setDataCalendar(res?.data);
    // 		})
    // 		.catch((e) => console.log(e));
    // }, []);
    useEffect(() => {
        listAllTaskDashboard({
            param: {
                page: 1,
                perPage: 100,
            },
        })
            .then((res) => {
                setDataTask(res?.data);
            })
            .catch((e) => console.log(e));
    }, []);
    useEffect(() => {
        getQuantityByNation()
            .then((res) => {
                const listByNation = res?.data;
                setQuantityByNation(listByNation);
                const total = listByNation.reduce((accumulator: any, currentValue: any) => {
                    return Number(accumulator) + Number(currentValue?.quantity);
                }, 0);
                setQuantityPercent(
                    listByNation.map((nation: any) => {
                        const percentage = (nation?.quantity / total) * 100;
                        return Math.round(percentage) ?? 0;
                    }),
                );
            })
            .catch((err) => {
                console.log(err);
            });
        getQuantityByDepartment().then((res) => {
            const listData = res?.data;
            const listCount = listData?.map((department: any) => department?.userCount)
            const listName = listData?.map((department: any) => department?.departmentName);
            // setDataByDepartment({
            //     label: listName ?? [],
            //     count: listCount ?? []
            // })
            setDataByDepartment({
                series: [
                    {
                        name: `${t('quantity')}`,
                        data: listCount,
                    },
                ],
                options: {
                    chart: {
                        height: 400,
                        type: 'bar',
                        zoom: {
                            enabled: false,
                        },
                        toolbar: {
                            show: false,
                        },
                    },
                    colors: ['#002868', '#002868'],
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        show: true,
                        width: 2,
                        colors: ['transparent'],
                    },
                    plotOptions: {
                        bar: {
                            horizontal: false,
                            columnWidth: '50%', // Tăng độ rộng của cột
                            endingShape: 'rounded',
                        },
                    },
                    grid: {
                        borderColor: isDark ? '#191e3a' : '#e0e6ed',
                        xaxis: {
                            lines: {
                                show: false,
                            },
                        },
                        padding: {
                            bottom: 10
                          },
                    },
                    legend: {
                        show: false,
                    },
                    xaxis: {
                        categories: listName,
                        axisBorder: {
                            color: isDark ? '#191e3a' : '#e0e6ed',
                        },
                        tickPlacement: 'on',
                        labels: {
                            rotate: -45,
                            style: {
                                fontSize: '12px',
                                // padding: 100
                            },
                            allowOverlap: false,
                            // padding: 100
                        },
                        scrollbar: {
                            enabled: true, // Kích hoạt thanh cuộn ngang
                            height: 10, // Tùy chỉnh chiều cao của thanh cuộn
                        },
                    },
                    yaxis: {
                        opposite: isRtl ? true : false,
                        labels: {
                            offsetX: isRtl ? -10 : 0,
                        },
                        max: Math.max(...listCount),
                        scrollbar: {
                            enabled: true, // Kích hoạt thanh cuộn ngang
                            height: 10, // Tùy chỉnh chiều cao của thanh cuộn
                        },
                    },
                    tooltip: {
                        theme: isDark ? 'dark' : 'light',
                        y: {
                            formatter: function (val: any) {
                                return val;
                            },
                        },
                    },
                },
            });

        })
            .catch((err) => {
                console.log(err);
            });
    }, []);
    const lineChart: any = {
        series: [
            {
                name: 'Sales',
                data: [45, 55, 75, 25, 45, 110],
            },
        ],
        options: {
            chart: {
                height: 300,
                type: 'line',
                toolbar: false,
            },
            colors: ['#4361EE'],
            tooltip: {
                marker: false,
                y: {
                    formatter(number: number) {
                        return '$' + number;
                    },
                },
            },
            stroke: {
                width: 2,
                curve: 'smooth',
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June'],
                axisBorder: {
                    color: isDark ? '#191e3a' : '#e0e6ed',
                },
            },
            yaxis: {
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -20 : 0,
                },
            },
            grid: {
                borderColor: isDark ? '#191e3a' : '#e0e6ed',
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
            },
        },
    };

    const columnChart: any = {
        series: [
            {
                name: `${t('quantity')}`,
                data: [14, 50, 13, 23, 25, 17, 15, 20, 45],
            },
        ],
        options: {
            chart: {
                height: 300,
                type: 'bar',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            colors: ['#002868', '#002868'],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent'],
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded',
                },
            },
            grid: {
                borderColor: isDark ? '#191e3a' : '#e0e6ed',
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
            },
            legend: {
                show: false,
            },
            xaxis: {
                categories: [
                    `${t('Administration Department')}`,
                    `${t('Planning Department')}`,
                    `${t('Technical Department')}`,
                    `${t('Operations Department')}`,
                    `${t('Finance and Accounting Department')}`,
                    `${t('Finance and Accounting Department')}`,
                    `${t('Processing Supervision Board')}`,
                    `${t('Camera Unit')}`,
                    `${t('Production Supervision Board')}`,
                ],
                axisBorder: {
                    color: isDark ? '#191e3a' : '#e0e6ed',
                },
            },
            yaxis: {
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -10 : 0,
                },
            },
            tooltip: {
                theme: isDark ? 'dark' : 'light',
                y: {
                    formatter: function (val: any) {
                        return val;
                    },
                },
            },
        },
    };

    const barChart: any = {
        series: [
            {
                name: `${t('good')}`,
                data: [44, 55, 57, 56],
            },
            {
                name: `${t('satisfactory')}`,
                data: [76, 85, 101, 98],
            },
            {
                name: `${t('unsatisfactory')}`,
                data: [35, 41, 36, 26],
            },
        ],
        options: {
            chart: {
                height: 300,
                type: 'bar',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 1,
            },
            colors: ['#002868', '#FFCD00', '#C8102E'],

            xaxis: {
                categories: [`${t('Administration Department')}`, `${t('Planning Department')}`, `${t('Technical Department')}`, `${t('Operations Department')}`],
                axisBorder: {
                    color: isDark ? '#191e3a' : '#e0e6ed',
                },
            },
            yaxis: {
                opposite: isRtl ? true : false,
                reversed: isRtl ? true : false,
            },
            grid: {
                borderColor: isDark ? '#191e3a' : '#e0e6ed',
            },
            fill: {
                opacity: 0.8,
            },
            legend: {
                position: 'top',
            },
        },
    };
    const donutChart: any = {
        series: [1143, 25, 3],
        options: {
            chart: {
                height: 300,
                type: 'donut',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            stroke: {
                show: false,
            },
            grid: {
                padding: {
                    top: 10,
                },
            },
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                            show: true,

                            total: {
                                showAlways: true,
                                show: true,
                            },
                        },
                    },
                },
            },
            labels: [t('employee'), t('team leader'), t('head of department')],
            colors: ['#C8102E', '#FFCD00', '#002868'],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 300,
                        },
                    },
                },
            ],
            legend: {
                position: 'top',
            },
        },
    };
    const quaterChart: any = {
        series: [44, 55, 13],
        options: {
            chart: {
                height: 300,
                type: 'pie',
            },
            labels: [`${t('good')}`, `${t('satisfactory')}`, `${t('unsatisfactory')}`],
            colors: ['#002868', '#FFCD00', '#C8102E'],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 300,
                        },
                    },
                },
            ],
            legend: {
                position: 'left',
            },
        },
    };
    const columnChartInventory: any = {
        series: [
            {
                name: 'Revenue',
                data:
                    warehouseStatistic?.data?.map((item: any) => {
                        return item.products[0];
                    }) || [],
            },
        ],
        options: {
            chart: {
                height: 300,
                type: 'bar',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            colors: ['#C8102E', '#FFCD00', '#9CD3EB', '#002868', '#476704'],
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent'],
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    endingShape: 'rounded',
                    distributed: true,
                },
            },
            legend: {
                show: false,
            },
            grid: {
                borderColor: isDark ? '#191e3a' : '#e0e6ed',
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
            },
            xaxis: {
                categories:
                    warehouseStatistic?.data?.map((item: any) => {
                        return `${t(item.name)}`;
                    }) || [],
                axisBorder: {
                    color: isDark ? '#191e3a' : '#e0e6ed',
                },
            },
            yaxis: {
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -10 : 0,
                },
            },
            tooltip: {
                theme: isDark ? 'dark' : 'light',
                y: {
                    formatter: function (val: any) {
                        return val;
                    },
                },
            },
        },
    };
    const handleChangePage = (page: number, pageSize: number) => {
        setInventoryPage(page);
        return pageSize;
    };
    return (
        <div>
            <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="#" className="dashboard-title uppercase hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                {/* <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('staff statistic')}</span>
                </li> */}
            </ul>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="panel h-full xl:col-span-2">
                    <div className="mb-5 flex items-center justify-between">
                        <span className="dashboard-component-title">{t('staff structure')}</span>
                    </div>
                    <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-3">
                        <div className="flex justify-around border-r">
                            <div className="flex shrink-0 items-center justify-center" style={{ width: '128px' }}>
                                <img className="object-cover" src="/assets/images/vietnam.gif" alt="flag"></img>
                            </div>
                            <div className="font-semibold ltr:ml-3 rtl:mr-3">
                                <h5 className="uppercase text-[#082819]" style={{ fontSize: '14px', fontWeight: '700' }}>
                                    {t('Vietnam')}
                                </h5>
                                <CountUp start={0} end={Number(quantityByNation[0]?.quantity ?? 0)} duration={2} useEasing>
                                    {({ countUpRef }) => (
                                        <p className="text-[#C8102E]" style={{ fontSize: '40px', fontWeight: '700', lineHeight: '50px', textAlign: 'center' }}>
                                            <span ref={countUpRef} />
                                        </p>
                                    )}
                                </CountUp>
                                <h5 className="text-[#082819]" style={{ fontSize: '14px', fontWeight: '400' }}>
                                    {t('staff')}
                                </h5>
                            </div>
                        </div>
                        <div className="flex justify-around border-r">
                            <div className="flex shrink-0 items-center justify-center" style={{ width: '128px' }}>
                                <img className="object-cover" src="/assets/images/lao.gif" alt="flag"></img>
                            </div>
                            <div className="font-semibold ltr:ml-3 rtl:mr-3">
                                <h5 className="uppercase text-[#082819]" style={{ fontSize: '14px', fontWeight: '700' }}>
                                    {t('laos')}
                                </h5>
                                <CountUp start={0} end={Number(quantityByNation[1]?.quantity ?? 0)} duration={2} useEasing>
                                    {({ countUpRef }) => (
                                        <p className="text-[#002868]" style={{ fontSize: '40px', fontWeight: '700', lineHeight: '50px', textAlign: 'center' }}>
                                            <span ref={countUpRef} />
                                        </p>
                                    )}
                                </CountUp>
                                <h5 className="text-[#082819]" style={{ fontSize: '14px', fontWeight: '400' }}>
                                    {t('staff')}
                                </h5>
                            </div>
                        </div>
                        <div className="flex justify-around">
                            <div className="flex shrink-0 items-center justify-center" style={{ width: '128px' }}>
                                <img className="object-cover" src="/assets/images/quocte.gif" alt="flag"></img>
                            </div>
                            <div className="font-semibold ltr:ml-3 rtl:mr-3">
                                <h5 className="uppercase text-[#082819]" style={{ fontSize: '14px', fontWeight: '700' }}>
                                    {t('International')}
                                </h5>
                                <CountUp start={0} end={Number(quantityByNation[2]?.quantity ?? 0)} duration={4} useEasing>
                                    {({ countUpRef }) => (
                                        <p className="text-[#476704]" style={{ fontSize: '40px', fontWeight: '700', lineHeight: '50px', textAlign: 'center' }}>
                                            <span ref={countUpRef} />
                                        </p>
                                    )}
                                </CountUp>
                                <h5 className="text-[#082819]" style={{ fontSize: '14px', fontWeight: '400' }}>
                                    {t('staff')}
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="flex h-4 w-full space-x-1.5 rounded-full bg-[#ebedf2] dark:bg-dark/40" style={{ height: '8px', marginTop: '20px' }}>
                        <Tooltip arrowOffset={15} arrowSize={5} label={`${t('Vietnam')}: ${quantityPercent[0]}%`} color="#C8102E" position="bottom">
                            <div className="h-4 rounded-full bg-[#C8102E] text-center text-xs text-white" style={{ height: '8px', width: `${quantityPercent[0]}%` }}></div>
                        </Tooltip>
                        <Tooltip arrowOffset={15} arrowSize={5} label={`${t('laos')}: ${quantityPercent[1]}%`} color="#002868" position="bottom">
                            <div className="h-4 rounded-full bg-[#002868] text-center text-xs text-white" style={{ height: '8px', width: `${quantityPercent[1]}%` }}></div>
                        </Tooltip>
                        <Tooltip arrowOffset={15} arrowSize={5} label={`${t('International')}: ${100 - quantityPercent[0] - quantityPercent[1]}%`} color="#476704" position="bottom">
                            <div className="h-4 rounded-full bg-[#476704]  text-center text-xs text-white" style={{ height: '8px', width: `${100 - quantityPercent[0] - quantityPercent[1]}%` }}></div>
                        </Tooltip>
                    </div>
                </div>
                <div className="panel h-full xl:col-span-2">
                    <div className="-mx-5 mb-5 flex items-start justify-between border-b border-white-light p-5 pt-0 dark:border-[#1b2e4b] dark:text-white-light">
                        <span className="dashboard-component-title">{t('Leader work schedule')}</span>
                    </div>
                    <div className="mb-5">
                        <div className="datatables">
                            <PerfectScrollbar className="perfect-scrollbar relative h-[50vh] space-y-7 ltr:-mr-3 ltr:pr-3 rtl:-ml-3 rtl:pl-3" style={{ width: '100%' }}>
                                <DataTable
                                    highlightOnHover
                                    className="table-hover custom_table2 whitespace-nowrap"
                                    records={dataCalendar?.data || []}
                                    columns={[
                                        {
                                            accessor: 'stt',
                                            title: <div style={{ textAlign: 'center' }}>STT</div>,
                                            render: (records: any, index: any) => <span style={{ display: 'block', textAlign: 'center' }}>{index + 1}</span>,
                                        },
                                        {
                                            accessor: 'fullName',
                                            title: <div style={{ textAlign: 'center' }}>{t('name_staff')}</div>,
                                            sortable: false,
                                            render: (record: any) => <span style={{ display: 'block', textAlign: 'center', fontWeight: 'bold' }}>{record?.users[0]?.fullName}</span>,
                                        },
                                        {
                                            accessor: 'position',
                                            title: <div style={{ textAlign: 'center' }}>{t('position')}</div>,
                                            sortable: false,
                                            render: (record: any) => <span style={{ display: 'block', textAlign: 'center' }}>{record?.users[0]?.position?.name}</span>,
                                        },

                                        {
                                            accessor: 'status',
                                            title: <div style={{ textAlign: 'center' }}>{t('status1')}</div>,
                                            sortable: false,
                                            render: (record: any) => <span style={{ display: 'block', textAlign: 'center' }}>{record?.status}</span>,
                                        },
                                        {
                                            accessor: 'time',
                                            title: <div style={{ textAlign: 'center' }}>{t('start_end_time')}</div>,
                                            sortable: false,
                                            render: (record: any) => (
                                                <span style={{ display: 'block', textAlign: "center" }}>
                                                    {record?.startDate ? dayjs(record?.startDate).format('DD/MM') : ''} {record?.startDate && record?.endDate ? '-' : ''}{' '}
                                                    {record?.endDate ? dayjs(record?.endDate).format('DD/MM/YYYY') : ''}
                                                </span>
                                            ),
                                        },
                                    ]}
                                    minHeight={200}
                                    recordsPerPageOptions={PAGE_SIZES}
                                    onRecordsPerPageChange={(e) => handleChangePage(inventoryPagination?.page, e)}
                                />
                            </PerfectScrollbar>
                        </div>
                    </div>
                </div>
                <div className="panel h-full xl:col-span-2">
                    <div className="-mx-5 mb-5 flex items-start justify-between border-b border-white-light p-5 pt-0 dark:border-[#1b2e4b] dark:text-white-light">
                        <span className="dashboard-component-title">{`${t('announcement')}`}</span>
                    </div>
                    <div>
                        <div className="flex">
                            <PerfectScrollbar className="perfect-scrollbar relative h-[360px] space-y-7 ltr:-mr-3 ltr:pr-3 rtl:-ml-3 rtl:pl-3" style={{ width: '50%' }}>
                                {announcements?.data.map((announcement: any) => (
                                    <>
                                        <div
                                            key={announcement.id}
                                            onClick={() => {
                                                handleAnnouncementClick(announcement);
                                                setIdAnnoucement(announcement);
                                            }}
                                            onMouseEnter={() => handleMouseEnter(announcement)}
                                            onMouseLeave={handleMouseLeave}
                                            className="flex cursor-pointer"
                                            style={{
                                                backgroundColor: selectedAnnouncement === announcement ? '#E9EBD5' : hoveredAnnouncement === announcement ? 'rgb(244 246 235 / 72%)' : '#FFFFFF',
                                                padding: '15px 10px 0px 10px',
                                                margin: '7px 7px 0 7px',
                                                borderRadius: '2px',
                                                transition: 'background-color 0.3s ease',
                                            }}
                                        >
                                            <a className="flex items-center ">
                                                <div>
                                                    <h6 className="flex font-semibold dark:text-white-light">
                                                        <p style={{ fontSize: '15px', marginLeft: '7px', marginBottom: '5px', fontWeight: 'bold' }}>{announcement.title}</p>
                                                    </h6>
                                                    <h6 className="flex font-semibold dark:text-white-light">
                                                        <p style={{ fontSize: '15px', color: '#476704', marginLeft: '7px', marginRight: '12px', fontWeight: 'bold' }}>
                                                            {announcement.createdBy?.fullName}
                                                        </p>{' '}
                                                        <p style={{ fontStyle: 'italic', color: '#476704' }}> {toDateString(announcement.createdAt)}</p>
                                                    </h6>
                                                </div>
                                            </a>
                                        </div>
                                        <hr style={{ margin: '0 7px 0 7px' }}></hr>
                                    </>
                                ))}
                            </PerfectScrollbar>
                            {announcements?.pagination?.totalRecords !== 0 ? (
                                <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
                                    <PerfectScrollbar
                                        className="perfect-scrollbar relative h-[360px] ltr:-mr-3 ltr:pr-3 rtl:-ml-3 rtl:pl-3"
                                        style={{
                                            backgroundColor: '#F4F6EB',
                                            margin: '15px',
                                            padding: '15px',
                                            borderRadius: '15px',
                                            border: '1px solid #ccc',
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: '1.5em',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                                marginBottom: '10px',
                                            }}
                                        >
                                            {idAnnoucement?.title}
                                        </div>
                                        <div dangerouslySetInnerHTML={{ __html: idAnnoucement?.contentHtml }}></div>
                                    </PerfectScrollbar>
                                    <div
                                        style={{
                                            marginLeft: '15px',
                                        }}
                                    >
                                        {idAnnoucement?.attachments?.length > 0 && <p>{t('attach_file')}:</p>}
                                        {idAnnoucement?.attachments?.map((item: any, index: number) => {
                                            return (
                                                <>
                                                    {item?.path && (
                                                        <div className="flex gap-4">
                                                            <Link href={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} target="_blank" className="d-block ml-5" style={{ color: 'blue' }}>
                                                                {item?.name}
                                                            </Link>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                </div>

                <div className="panel h-full xl:col-span-2" style={{ overflowX: "scroll" }}>
                    <div className="mb-5 flex items-center justify-between">
                        <span className="dashboard-component-title">{t('Staff quantity by department')}</span>
                    </div>
                    <div className="mb-5" style={{ width: "450rem" }}>
                        {isMounted && dataByDepartment && (
                            <ReactApexChart
                                series={dataByDepartment?.series}
                                options={dataByDepartment?.options}
                                className="overflow-hidden rounded-lg bg-white dark:bg-black"
                                type="bar"
                                height={500}
                                width={'100%'}
                            />
                        )}
                    </div>
                </div>

                {/* <div className="panel">
                    <div className="mb-5 flex items-center justify-between">
                        <h5 className="text-lg font-semibold dark:text-white">Tình hình nhân sự</h5>
                    </div>
                    <p>Tất cả đơn vị</p>

                    <div className="mb-5" style={{ zIndex: '9999999', position: "relative" }}>
                        {isMounted && <ReactApexChart series={donutChart.series} options={donutChart.options} className="rounded-lg bg-white dark:bg-black overflow-hidden" type="donut" height={300} width={"100%"} />}
                    </div>
                </div> */}
                {/* <div className="panel">
                    <div className="mb-5 flex items-center justify-between">
                        <span className="dashboard-component-title">{t('Status of work settlement')}</span>
                    </div>
                    <div className="mb-5">
                        {isMounted && (
                            <ReactApexChart
                                series={quaterChart.series}
                                options={quaterChart.options}
                                className="overflow-hidden rounded-lg bg-white dark:bg-black"
                                type="pie"
                                height={300}
                                width={'100%'}
                            />
                        )}
                    </div>
                </div>
                <div className="panel">
                    <div className="mb-5 flex items-center justify-between">
                        <span className="dashboard-component-title">{t('Statistics of tasks by department')}</span>
                    </div>
                    <div className="mb-5">
                        {isMounted && <ReactApexChart series={barChart.series} options={barChart.options} className="rounded-lg bg-white dark:bg-black" type="bar" height={300} width={'100%'} />}
                    </div>
                </div> */}
                <div className="panel">
                    <div className="mb-5 flex items-center justify-between">
                        {/* <h5 className="text-lg font-semibold dark:text-white-light">{t("Inventory of materials")}</h5> */}
                        <span className="dashboard-component-title">{t('Product Statistic')}</span>
                    </div>
                    <div className="mb-5">
                        {isMounted && (
                            <ReactApexChart
                                series={columnChartInventory.series}
                                options={columnChartInventory.options}
                                className="overflow-hidden rounded-lg bg-white dark:bg-black"
                                type="bar"
                                height={300}
                                width={'100%'}
                            />
                        )}
                    </div>
                </div>
                <div className="panel">
                    <div className="mb-5 flex items-center justify-between">
                        {/* <h5 className="text-lg font-semibold dark:text-white-light">{t("Inventory of expired materials")}</h5> */}
                        <span className="dashboard-component-title">{t('Expired product Statistic')}</span>
                    </div>
                    <div className="mb-5">
                        <div className="datatables">
                            <DataTable
                                highlightOnHover
                                className="table-hover custom_table whitespace-nowrap"
                                records={inventoryExpired?.data || []}
                                columns={[
                                    {
                                        accessor: 'stt',
                                        title: '#',
                                        render: (records: any, index: any) => <span>{index + 1}</span>,
                                    },
                                    { accessor: 'name', title: `${t('name')}`, sortable: false },
                                    { accessor: 'category', title: `${t('type')}`, sortable: false },
                                    { accessor: 'warehouse', title: `${t('warehouse')}`, sortable: false },
                                    { accessor: 'quantity', title: `${t('quantity')}`, sortable: false },
                                    {
                                        accessor: 'expiredAt',
                                        title: `${t('expiration')}`,
                                        render: (records: any, index: any) => <span>{moment(records).format('YYYY-MM-DD')}</span>,
                                        sortable: false,
                                    },
                                ]}
                                minHeight={200}
                                totalRecords={inventoryPagination?.totalRecords}
                                recordsPerPage={inventoryPagination?.perPage}
                                page={inventoryPagination?.page}
                                onPageChange={(p) => handleChangePage(p, inventoryPagination?.perPage)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={(e) => handleChangePage(inventoryPagination?.page, e)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Modal open={open} id={idAnnoucement} setOpen={setOpen}></Modal>
        </div >
    );
};

export default DashBoard;
