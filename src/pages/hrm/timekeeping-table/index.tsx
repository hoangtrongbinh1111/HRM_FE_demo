import { useEffect, Fragment, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { lazy } from 'react';
import Link from 'next/link';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import Select from "react-select";
import Dropdown from '@/components/Dropdown';
import dynamic from 'next/dynamic';
const NoSSRDropdown = dynamic(() => import('@/components/Dropdown'), { ssr: false });

// API
import { deleteDepartment, detailDepartment, listAllDepartment, listAllDepartmentTree } from '../../../services/apis/department.api';
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
// helper
import { capitalize, downloadFile, formatDate, showMessage } from '@/@core/utils';
// icons
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPlus from '@/components/Icon/IconPlus';

import { useRouter } from 'next/router';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
// ** Styles
//

import "flatpickr/dist/plugins/monthSelect/style.css"
import monthSelectPlugin, { Config } from "flatpickr/dist/plugins/monthSelect"
// json
import TimekeepingList from './timekeeping_fake.json';
import DepartmentModal from './modal/DepartmentModal';
import IconFolderMinus from '@/components/Icon/IconFolderMinus';
import IconDownload from '@/components/Icon/IconDownload';
import IconEye from '@/components/Icon/IconEye';
import IconChecks from '@/components/Icon/IconChecks';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewCheck from '@/components/Icon/IconNewCheck';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { flattenDepartments, getDaysOfMonth, isDayCanBlockTimekeeping, loadMore } from '@/utils/commons';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconEdit from '@/components/Icon/IconEdit';
import { TimekeepingStaffs } from '@/services/swr/timekeeping-staff.swr';
import { Timekeepings } from '@/services/swr/timekeeping.swr';
import { GetAllTimekeeping, LockTimekeeping } from '@/services/apis/timekeeping.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import TableTree, { Cell, Header, Headers, Row, Rows } from '@atlaskit/table-tree';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import { IRootState } from '@/store';
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
import { setCurrentPageTimekeepingTable, setListTimekeepingTable } from '@/store/timekeepingTableSlice';
import IconNewArrowDown from '@/components/Icon/IconNewArrowDown';
import IconNewArrowUp from '@/components/Icon/IconNewArrowUp';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDebounce } from 'use-debounce';
import dayjs from 'dayjs';
import { IconFilter } from '@/components/Icon/IconFilter';
import { Humans } from '@/services/swr/human.swr';
import { Loader } from '@mantine/core';
import { DropdownDepartment } from '@/services/swr/dropdown.swr';
import ModalExcel from './modelExcel';
import ModalDate from './modalDate';
import ModalMonth from './modalMonth';

import IconFile from '@/components/Icon/IconFile';
import IconTxtFile from '@/components/Icon/IconTxtFile';
interface Props {
    [key: string]: any;
}
const monthSelectConfig: Partial<Config> = {
    shorthand: true, //defaults to false
    dateFormat: 'm/Y', //defaults to "F Y"
    theme: 'light', // defaults to "light"
};

const formatGroupLabel = (data: any) => (
    <div className="groupStyles">
        <span>{data.label}</span>
        <span className="groupBadgeStyles">{data.options.length}</span>
    </div>
);

const LEVEL_INDENT = 20;
const customStyles = {
    option: (provided: any, state: any) => ({
        ...provided,
        paddingLeft: state.data.level ? state.data.level * LEVEL_INDENT : 10
    })
};


const Department = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [keyDownload, setKeyDownload] = useState('');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const timekeepingTable = useSelector((state: IRootState) => state.timekeepingTable);
    const [isReload, setIsReload] = useState(timekeepingTable?.isReload ?? false);
    const [mode, setMode] = useState("expand");
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState<any>();
    const [transformedData, setTransformedData] = useState<any>(timekeepingTable?.data ?? []);
    const [timekeepingTableTree, setTimekeepingTableTree] = useState<any>([])
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const [queryHuman, setQueryHuman] = useState<any>();
    const [groupedOptions, setGroupedOptions] = useState<any>([
        {
            label: `${t('work_department')}`,
            options: []
        }
    ]
    );
    const [loadHuman, setLoadHuman] = useState(false)
    const [loading, setLoading] = useState(false);

    const [dataHuman, setDataHuman] = useState<any>([]);
    const [pageHuman, setSizeHuman] = useState<any>(1);
    const [debouncedPageHuman] = useDebounce(pageHuman, 500);
    const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
    const [departmentIds, setDepartmentIds] = useState<any[]>([]);
    const [userIds, setUserIds] = useState<any>([])
    const [filterDate, setFilterDate] = useState<any>();

    const [openDepartment, setOpenDepartment] = useState(false);
    const [openDate, setOpenDate] = useState(false);
    const [openMonth, setOpenMonth] = useState(false);

    const handleSearchHuman = (param: any) => {
        setQueryHuman({ search: param });
    };
    const [selectedDepartment, setSelectedDepartment] = useState<any>();
    const [dataDepartment, setDataDepartment] = useState<any>([]);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(`${t('timekeeping-table')}`));
    });
    useEffect(() => {
        listAllDepartmentTree({
            page: 1,
            perPage: 100
        }).then((res: any) => {
            const listDepartment_ = flattenDepartments(res?.data);
            setGroupedOptions([
                {
                    label: `${t('work_department')}`,
                    options: listDepartment_
                }
            ])
        }).catch((err: any) => {
            console.log(err);
        }
        );
    }, [])

    const router = useRouter();
    const [search, setSearch] = useState<any>();
    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState(timekeepingTable?.currentPage ?? 1);
    const [pageSize, setPageSize] = useState(3);
    const [total, setTotal] = useState(0);
    const [getStorge, setGetStorge] = useState<any>();
    const [data, setData] = useState<any>();
    const [listDay, setListDay] = useState<undefined | string[]>(undefined);
    const [isClickLock, setIsClickLock] = useState(false);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const [openModal, setOpenModal] = useState(false);

    const { data: manages, pagination: paginationHuman } = Humans({
        sortBy: 'id.ASC',
        page: debouncedPageHuman,
        perPage: 10,
        search: debouncedQueryHuman?.search
    });
    const handleOnScrollBottomHuman = () => {
        setLoadHuman(true)
        if (paginationHuman?.page < paginationHuman?.totalPages) {
            setSizeHuman(paginationHuman?.page + 1);
        }
    };
    useEffect(() => {
        loadMore(manages, dataHuman, paginationHuman, setDataHuman, 'id', 'fullName', setLoadHuman);
    }, [paginationHuman, debouncedPageHuman, debouncedQueryHuman]);
    const getData = (page_: number, month_: number, year_: number, search_: string, departmentIds_: any[], userIds_: any[]) => {
        GetAllTimekeeping({
            page: page_,
            perPage: pageSize,
            ...(month_ && { month: month_ }),
            ...(year_ && { year: year_ }),
            ...(search_ && search_ !== "" && { search: search_ }),
            ...(departmentIds_ && departmentIds_?.length > 0 && { departmentIds: departmentIds_ }),
            ...(userIds_ && userIds_?.length > 0 && { userIds: userIds_ }),
            ...(filterDate && filterDate?.startDate && { startDate: filterDate?.startDate }),
            ...(filterDate && filterDate?.endDate && { startDate: filterDate?.endDate }),
        }).then(res => {
            const transformedData_ = res?.data ? res?.data?.map((department: any) => {
                return {
                    ...department,
                    users: department.users?.sort((user1: any, user2: any) => {
                        const numA = parseInt(user1?.code?.match(/\d+/)?.[0] || '0');
                        const numB = parseInt(user2?.code?.match(/\d+/)?.[0] || '0');
                        return numA - numB;
                    }).map((user: any) => {
                        return {
                            ...user,
                            ...user?.timeAttendances[0],
                            name: user.fullName
                        };
                    })
                };
            }) : [];

            setTotal(res?.pagination?.totalRecords);
            setTotalPages(res?.pagination?.totalPages)
            if (page_ === 1) {
                setTransformedData(transformedData_)
                setTimekeepingTableTree(res?.data)
            } else {
                setTransformedData((prev: any) => [...prev, ...transformedData_]);
                setTimekeepingTableTree((prev: any) => [...prev, res?.data])
            }
            setHasMore(page < res?.pagination?.totalPages);
        }).catch(err => {
            console.log(err)
        })
    }
    useEffect(() => {
        // setPage(1); // Reset to first page
        if (!isReload) {
            getData(page, selectedMonth, selectedYear, search, departmentIds, userIds);
        }
    }, [isReload]);
    const fetchMoreData = () => {
        const page_ = page + 1;
        setPage(page_);

        if (page_ > totalPages) {
            setHasMore(false);
            return;
        }
        // a fake async api call like which sends
        // 20 more records in .5 secs
        setTimeout(() => {
            getData(page_, selectedMonth, selectedYear, search, departmentIds, userIds);
        }, 500);
    };

    const handleEdit = (data: any) => {
        setOpenModal(true);
        setData(data);
    };

    const handleSearch = (param: any) => {
        setPage(1);
        setSearch(param);
        // router.replace({
        //     pathname: router.pathname,
        //     query: {
        //         ...router.query,
        //         search: param,
        //     },
        // });
        getData(1, selectedMonth, selectedYear, param, departmentIds, userIds);
    };
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            handleSearch(search)
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

    const handleDetail = (id: any) => {
        dispatch(setListTimekeepingTable(transformedData));
        dispatch(setCurrentPageTimekeepingTable(page + 1))
        router.push(`/hrm/timekeeping-table/detail/${id}?month=${selectedMonth}&year=${selectedYear}`);
    }
    const roundDecimal = (num: any) => {
        return Math.round(num * 10) / 10;
    };
    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        {
            accessor: 'code',
            title: `${t('personel_code')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{records?.staff?.code}</span>,
        },
        {
            accessor: 'name',
            title: `${t('personel_name')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{records?.staff?.fullName}</span>,

        },
        {
            accessor: 'weekdayWork',
            title: 'Công ngày thường',
            sortable: false,
            render: (records: any, index: any) => <span>{roundDecimal(records?.weekdayWork)}</span>,
        },
        // {
        //     accessor: 'extraWork1',
        //     title: 'Công làm thêm (giờ)',
        //     sortable: false,
        //     render: (records: any, index: any) => <span>{roundDecimal(records?.extraWork)}</span>,
        // },
        {
            accessor: 'dayOffWork1',
            title: 'Công nghỉ phép',
            sortable: false,
            render: (records: any, index: any) => <span>{roundDecimal(records?.dayOffWork)}</span>,
        },
        {
            accessor: 'holidayWork1',
            title: 'Công nghỉ lễ',
            sortable: false,
            render: (records: any, index: any) => <span>{roundDecimal(records?.holidayWork)}</span>,
        },
        {
            accessor: 'bussinessWork1',
            title: 'Công công tác',
            sortable: false,
            render: (records: any, index: any) => <span>{roundDecimal(records?.bussinessWork)}</span>,
        },
        {
            accessor: 'totalWork',
            title: 'Tổng thực tế',
            sortable: false,
            render: (records: any, index: any) => <span>{roundDecimal(records?.totalWork)}</span>,
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="flex items-center w-max mx-auto gap-2">
                    <RBACWrapper
                        permissionKey={['timeKeeping:findOne', 'timeKeeping:update']}
                        type={'OR'}>
                        <div className="w-[auto]">
                            <button type="button" className='button-detail' onClick={() => handleDetail(records)}>
                                <IconNewEye /><span>
                                    {t('detail')}
                                </span>
                            </button>

                        </div>
                    </RBACWrapper>
                    {/* <div className="w-[auto]">
                        <button data-testId="edit-proposal-btn" type="button" className='button-edit'>
                            <IconNewEdit />
                            <span>
                                {t('edit')}
                            </span>
                        </button>
                    </div> */}
                    {/* <div className="w-[auto]">
                        <button type="button" className='button-delete' onClick={() => handleDelete(records)}>
                            <IconNewTrash />
                            <span>
                                {t('delete')}
                            </span>
                        </button>
                    </div> */}
                </div>
            ),
        },
    ]
    const handleChangeMonth = (selectedDates: any, dateStr: any) => {
        setPage(1);
        const date_str = selectedDates[0] ?? ""
        const year: number = date_str.getFullYear();
        setSelectedYear(year);
        const month: number = date_str.getMonth() + 1;
        setSelectedMonth(month);
        // const listDay = getDaysOfMonth(year, month);
        // setListDay(listDay);
        // router.replace(
        //     {
        //         pathname: router.pathname,
        //         query: {
        //             ...router.query,
        //             page: page,
        //             perPage: pageSize,
        //             month: month,
        //             year: year
        //         },
        //     },
        //     undefined,
        //     { shallow: true },
        // );
        getData(1, month, year, search, departmentIds, userIds)
    }

    const handleBlockTimekeeping = () => {
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
                title: `${t('block_timekeeping')}`,
                html: `<span class='confirm-span'>${t('confirm_block')}</span>?<br/><span class='block-note'>${t('block_timekeeping_note')}</span>`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    const dataSubmit = {
                        month: selectedMonth,
                        year: selectedYear,
                    }
                    LockTimekeeping(dataSubmit).then((result) => {
                        showMessage(`${t('lock_timekeeping_success')}`, 'success');
                        setIsClickLock(true);
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                        setIsClickLock(false);
                    });
                }
            });
    };

    type Item = {
        id: number;
        fullName: string;
        code: string;
        name: string;
        positionId: string;
        hasChildren: boolean;
        position: object;
        users?: Item[];
        department: object;
        weekdayWork: number;
        extraWork: number;
        dayOffWork: number;
        holidayWork: number;
        bussinessWork: number;
        totalWork: number;
    };
    const handleChangeExpand = (event: any) => {
        setMode(event);
    };
    const handleChangeDepartment = (de: any) => {
        if (de) {
            const listId = de?.map((item: any) => item.value)
            setDepartmentIds(listId)
            getData(1, selectedMonth, selectedYear, search, listId, userIds)
        } else {
            setDepartmentIds([])
            getData(1, selectedMonth, selectedYear, search, [], userIds)
        }
    }
    const handleChangeUsers = (de: any) => {
        const listId = de?.map((item: any) => item.value)
        setUserIds(de?.map((item: any) => item?.value))
        getData(1, selectedMonth, selectedYear, search, departmentIds, listId)
    }
    const handleChangeDates = (de: any) => {
        setFilterDate({
            startDate: dayjs(de[0]).format('YYYY-MM-DD'),
            endDate: dayjs(de[1]).format('YYYY-MM-DD'),
        })
    }
    const handleExportFile = () => {
        if (departmentIds?.length === 0) {
            showMessage(`${t('please_select_department')}`, 'warning');
            return;
        } else {
            setLoading(true)
            const stringQuery = new URLSearchParams({
                month: (router.query.month ?? currentMonth).toString(),
                year: (router.query.year ?? currentYear).toString(),
            });

            if (Array.isArray(departmentIds)) {
                departmentIds.forEach(departmentId => {
                    stringQuery.append('departmentIds', departmentId);
                });
            } else {
                stringQuery.append('departmentIds', selectedDepartment);
            }
            downloadFile("time-keeping.xlsx", `/time-keeping/export?${stringQuery}`).finally(() => {
                setLoading(false)
            })
        }
    }
    const [departmentPage, setDepartmentPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [searchDepartment, setSearchDepartment] = useState('')
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: departmentPage, perPage: 10, search: searchDepartment });

    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data);
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
        }
    }, [paginationDepartment]);
    const handleMenuDepartmentScrollToBottom = () => {
        setTimeout(() => {
            setDepartmentPage(paginationDepartment?.page + 1);
        }, 1000);
    };
    const handleChangeQueryDepartment = (value: any) => {
        setSearchDepartment(value);
        setDepartmentPage(1)
    }
    useEffect(() => {
        mutateDepartment()
    }, [departmentPage, searchDepartment]);
    const handleDownloadFile = (typeFile: any, filter: any) => {
        setKeyDownload(typeFile);
        if (filter === "date") {
            setOpenDate(true)
        } else if (filter === "month") {
            setOpenMonth(true)
        } else {
            setOpenDepartment(true)
        }
    }

    return (
        <div>
            {/* {isLoading && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )} */}
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('homepage')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('timekeeping-table')}</span>

                </li>
            </ul>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        <NoSSRDropdown
                            offset={[0, 1]}
                            placement='bottom-start'
                            button={<button type="button"
                                className="button-table button-download"
                            >
                                <IconNewDownload2 />
                                <span className="uppercase">{t('export_file_excel')}</span>
                            </button>}
                        >
                            <ul>
                                <li>
                                    <div
                                        className="cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704] flex gap-1"
                                        style={{ border: "0.5px solid #ccc" }}
                                        onClick={() => handleDownloadFile('time-keeping', 'month')}
                                    >
                                        <IconTxtFile />
                                        <span className="rtl:ml-2">{t('timekeeping_table_report')}</span>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        className="cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704] flex gap-1"
                                        style={{ border: "0.5px solid #ccc" }}
                                        onClick={() => handleDownloadFile('timekeeping-staff-v2', 'date')}
                                    >
                                        <IconTxtFile />
                                        <span className="rtl:ml-2">{t('report_timekeeping_staff_v2')}</span>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        className="cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704] flex gap-1"
                                        style={{ border: "0.5px solid #ccc" }}
                                        onClick={() => handleDownloadFile('timekeeping-staff', 'date')}
                                    >
                                        <IconTxtFile />
                                        <span className="rtl:ml-2">{t('report_timekeeping_staff')}</span>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        className="cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704] flex gap-1"
                                        style={{ border: "0.5px solid #ccc" }}
                                        onClick={() => handleDownloadFile('timekeeping', 'date')}
                                    >
                                        <IconTxtFile />
                                        <span className="rtl:ml-2">{t('report_timekeeping')}</span>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        className="cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704] flex gap-1"
                                        style={{ border: "0.5px solid #ccc" }}
                                        onClick={() => handleDownloadFile('timekeepingDetailHorizontal', 'date')}                                    >
                                        <IconTxtFile />
                                        <span className="rtl:ml-2">{t('report_timekeeping_horizontal')}</span>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        className="cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704] flex gap-1"
                                        style={{ border: "0.5px solid #ccc" }}
                                        onClick={() => handleDownloadFile('timekeepingDetail', 'date')}
                                    >
                                        <IconTxtFile />
                                        <span className="rtl:ml-2">{t('report_timekeeping_detail')}</span>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        className="cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704] flex gap-1"
                                        style={{ border: "0.5px solid #ccc" }}
                                        onClick={() => handleDownloadFile('timekeepingEditHistory', 'date')}
                                    >
                                        <IconTxtFile />
                                        <span className="rtl:ml-2">{t('report_timekeeping_edit_history')}</span>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        className="cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704] flex gap-1"
                                        style={{ border: "0.5px solid #ccc" }}
                                        onClick={() => handleDownloadFile('overTime', 'date')}
                                    >
                                        <IconTxtFile />
                                        <span className="rtl:ml-2">{t('report_overTime')}</span>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        className="cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704] flex gap-1"
                                        style={{ border: "0.5px solid #ccc" }}
                                        onClick={() => handleDownloadFile('lateEarly', 'date')}
                                    >
                                        <IconTxtFile />
                                        <span className="rtl:ml-2">{t('report_lateEarly')}</span>
                                    </div>
                                </li>
                                <li>
                                    <div
                                        className="cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704] flex gap-1"
                                        style={{ border: "0.5px solid #ccc" }}
                                        onClick={() => handleDownloadFile('absent', 'date')}
                                    >
                                        <IconTxtFile />
                                        <span className="rtl:ml-2">{t('report_absent')}</span>
                                    </div>
                                </li>
                            </ul>
                        </NoSSRDropdown>

                    </div>
                    <div className="flex items-center">
                        {/* <button type="button" className="button-table button-import m-1" >
                            <IconNewPlus />
                            <span className="uppercase"> Tổng hợp</span>
                        </button> */}
                        {/* <button type="button" className="button-table w-1/2" style={{ paddingLeft: "5px", paddingRight: "5px" }}>
                            <IconEdit />
                            <span className="uppercase">Chỉnh sửa công</span>
                        </button> */}
                        {/* {
                            !isClickLock && isDayCanBlockTimekeeping() && <button type="button" className="button-table" style={{ paddingLeft: "5px", paddingRight: "5px", marginRight: "5px" }} onClick={() => handleBlockTimekeeping()}>
                                <IconChecks />
                                <span className="uppercase">Khóa công tổng hợp</span>
                            </button>
                        } */}
                        {/* {
                            !isClickLock && <button type="button" className="button-table" style={{ paddingLeft: "5px", paddingRight: "5px", marginRight: "5px" }} onClick={() => handleBlockTimekeeping()}>
                                <IconChecks />
                                <span className="uppercase">{t('block_timekeeping')}</span>
                            </button>
                        } */}
                        {
                            mode === "collapse" ? <button type="button" className='button-arrow-list' onClick={() => handleChangeExpand('expand')}>
                                <IconNewArrowDown /><span>
                                    {t('expand')}
                                </span>
                            </button> : <button type="button" className='button-arrow-list' onClick={() => handleChangeExpand('collapse')}>
                                <IconNewArrowUp /><span>
                                    {t('collapse')}
                                </span>
                            </button>
                        }
                        <button type="button" className="button-table" style={{ paddingLeft: "5px", paddingRight: "5px", marginRight: "5px" }} onClick={() => handleBlockTimekeeping()}>
                            <IconChecks />
                            <span className="uppercase">{t('block_timekeeping')}</span>
                        </button>
                    </div>
                </div>
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center gap-1">
                        <IconFilter />
                        <span>{t('Quick filter')}:</span>
                        <div className="flex flex-wrap items-center gap-1">
                            <div className='flex flex-1 w-[250px]'>
                                <Select
                                    className="zIndex-10 w-[230px]"
                                    id="departmentId"
                                    name="departmentId"
                                    placeholder={t('choose_department')}
                                    options={dataDepartment} // Ensure dataDepartment is an array of DepartmentOption objects
                                    maxMenuHeight={160}
                                    onMenuOpen={() => setDepartmentPage(1)}
                                    onMenuScrollToBottom={handleMenuDepartmentScrollToBottom}
                                    onInputChange={(e) => {
                                        handleChangeQueryDepartment(e)
                                    }}
                                    isLoading={isLoadingDepartment}
                                    onChange={(e: any) => {
                                        handleChangeDepartment(e);
                                    }}
                                    styles={customStyles}
                                    isMulti
                                />
                            </div>
                            <div className='flex flex-1 w-[250px]'>
                                <Select
                                    className="zIndex-10 w-[230px]"
                                    id="userIds"
                                    name="userIds"
                                    options={dataHuman}
                                    onInputChange={(e) => handleSearchHuman(e)}
                                    onMenuOpen={() => setSizeHuman(1)}
                                    onMenuScrollToBottom={() => handleOnScrollBottomHuman()}
                                    isLoading={loadHuman}
                                    isMulti
                                    closeMenuOnSelect={false}
                                    isSearchable
                                    placeholder={`${t('choose_staff')}`}
                                    onChange={(e) => {
                                        handleChangeUsers(e);
                                    }}
                                />
                            </div>
                            <div className='flex flex-1 w-[250px]'>
                                <Flatpickr
                                    className='form-input w-[230px]'
                                    options={{
                                        locale: {
                                            ...chosenLocale,
                                        },
                                        // dateFormat: 'd/m/y',
                                        defaultDate: new Date(),
                                        plugins: [
                                            monthSelectPlugin(monthSelectConfig) // Sử dụng plugin với cấu hình
                                        ]
                                    }}
                                    onChange={(selectedDates, dateStr, instance) => {
                                        handleChangeMonth(selectedDates, dateStr)
                                    }}
                                />
                            </div>
                            {/* <div className='flex flex-1 w-[250px]'>
                                <Flatpickr
                                    className="form-input"
                                    placeholder={`${t('choose_time_duration')}`}
                                    options={{
                                        locale: {
                                            ...chosenLocale,
                                        },
                                        mode: "range",
                                        dateFormat: 'd/m/Y',
                                        // defaultDate: new Date(),
                                        // plugins: [
                                        //     monthSelectPlugin(monthSelectConfig),
                                        // ],
                                    }}
                                    onChange={(e: any) => {
                                        console.log(e)
                                        // handleChangeMonth(selectedDates, dateStr);
                                        handleChangeDates(e)
                                    }}
                                />
                            </div> */}
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">

                    </div>
                </div>
                <div className="datatables personnel-container">
                    {/* <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={timekeeping?.data}
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
                    /> */}
                    <TableTree label="Advanced usage" className="personnel-table" id="personnel-table-header" style={{ backgroundColor: "#EBEAEA" }}>
                        <Headers>
                            <Header width={'310px'} color="black">{`${t('name_staff')}`}</Header>
                            <Header width={'250px'} color="black">{`${t('code_staff')}`}</Header>
                            <Header width={'15%'} color="black">{`${t('weekdayWork1')}`}</Header>
                            <Header width={'15%'} color="black">{`${t('extraWork1')}`}</Header>
                            <Header width={'15%'} color="black">{`${t('dayOffWork1')}`}</Header>
                            <Header width={'15%'} color="black">{`${t('holidayWork1')}`}</Header>
                            <Header width={'15%'} color="black">{`${t('bussinessWork1')}`}</Header>
                            <Header width={'15%'} color="black">{`${t('totalWork')}`}</Header>
                            <Header width={'15%'} color="black">{t('action')}</Header>
                        </Headers>
                        <InfiniteScroll
                            dataLength={mode === "expand" ? transformedData?.length : timekeepingTableTree.length}
                            next={fetchMoreData}
                            hasMore={hasMore}
                            loader={mode === "expand" ?
                                <p style={{ textAlign: 'center' }}>
                                    <b>{t('Loading')}...</b>
                                </p> : <div className="flex" style={{ textAlign: 'center', justifyContent: "center", marginTop: "0.5rem" }}>
                                    <button
                                        type='button'
                                        className='button-edit'
                                        onClick={() => fetchMoreData()}
                                    >
                                        {t('load more')}
                                    </button>
                                </div>
                            }
                            endMessage={
                                <p style={{ textAlign: 'center' }}>
                                    <b>{t('You have seen it all')}</b>
                                </p>
                            }
                        >
                            <Rows
                                items={transformedData}
                                render={({ id, fullName, name, code, dayOffWork, weekdayWork, extraWork, department, users = [], holidayWork, bussinessWork, totalWork }: Item) => (
                                    <Row
                                        itemId={id}
                                        items={users}
                                        hasChildren={users.length > 0}
                                        isDefaultExpanded={mode === "expand"}
                                    >
                                        <Cell width={'300px'}>{department && typeof department === 'object' && 'name' in department ? (department as any).name : name}</Cell>
                                        <Cell width={'250px'}>{fullName != undefined ? code : <></>}</Cell>
                                        <Cell width={'15%'}>{weekdayWork !== undefined ? `${roundDecimal(weekdayWork)}` : ''}</Cell>
                                        <Cell width={'15%'}>{extraWork !== undefined ? `${roundDecimal(extraWork)}` : ''}</Cell>
                                        <Cell width={'15%'}>{dayOffWork !== undefined ? `${roundDecimal(dayOffWork)}` : ''}</Cell>
                                        <Cell width={'15%'}>{holidayWork !== undefined ? `${roundDecimal(holidayWork)}` : ''}</Cell>
                                        <Cell width={'15%'}>{bussinessWork !== undefined ? `${roundDecimal(bussinessWork)}` : ''}</Cell>
                                        <Cell width={'15%'}>{totalWork !== undefined ? `${roundDecimal(totalWork)}` : ''}</Cell>
                                        <Cell width={'15%'}>
                                            {users.length === 0 && fullName != undefined ? <div className="flex items-center w-max mx-auto gap-2">
                                                {
                                                    <div className="flex items-center w-max mx-auto gap-2">
                                                        <RBACWrapper
                                                            permissionKey={['timeKeeping:findOne', 'timeKeeping:update']}
                                                            type={'OR'}>
                                                            <div className="w-[auto]">
                                                                <button type="button" className='button-detail' onClick={() => handleDetail(id)}>
                                                                    <IconNewEye /><span>
                                                                        {t('detail')}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </RBACWrapper>

                                                    </div>
                                                }
                                            </div> : <></>}
                                        </Cell>
                                    </Row>
                                )}
                            />
                        </InfiniteScroll>
                    </TableTree>
                    {/* <div className="flex w-full flex-col justify-start">
                        <ul className="inline-flex items-center space-x-1 rtl:space-x-reverse justify-end" style={{ marginTop: '10px' }}>
                            <li>
                                <button onClick={() => handleChangePage(paginationTree?.page - 1, 10)}
                                    type="button"
                                    disabled={paginationTree?.page === 1}
                                    className="flex justify-center rounded-full bg-white-light p-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
                                >
                                    <IconCaretDown className="w-5 h-5 rotate-90 rtl:-rotate-90" />
                                </button>
                            </li>
                            {renderPageNumbers()}
                            <li>
                                <button onClick={() => handleChangePage(paginationTree?.page + 1, 10)}
                                    type="button"
                                    disabled={paginationTree?.page === paginationTree?.totalPages}
                                    className="flex justify-center rounded-full bg-white-light p-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
                                >
                                    <IconCaretDown className="w-5 h-5 -rotate-90 rtl:rotate-90" />
                                </button>
                            </li>
                        </ul>
                    </div> */}
                </div>
            </div>
            <DepartmentModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                data={data}
                totalData={getStorge}
                setData={setData}
                setGetStorge={setGetStorge}
            />
            <ModalExcel openModal={openDepartment} setOpenModal={setOpenDepartment} keyDownload={keyDownload} />
            <ModalDate openModal={openDate} setOpenModal={setOpenDate} keyDownload={keyDownload} />
            <ModalMonth openModal={openMonth} setOpenModal={setOpenMonth} keyDownload={keyDownload} />

        </div >
    );
};

export default Department;
