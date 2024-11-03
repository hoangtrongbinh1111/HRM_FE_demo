import { useEffect, Fragment, useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { lazy } from 'react';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
// ** Styles
//
import Select, { components, StylesConfig, GroupBase, OptionProps, CSSObjectWithLabel } from 'react-select';

import 'flatpickr/dist/plugins/monthSelect/style.css';
import monthSelectPlugin, { Config } from 'flatpickr/dist/plugins/monthSelect';
import { deleteDepartment, detailDepartment, listAllDepartment, listAllDepartmentTree } from '../../../services/apis/department.api';
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
// helper
import { capitalize, formatDate, showMessage } from '@/@core/utils';
// icons
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPlus from '@/components/Icon/IconPlus';

import { useRouter } from 'next/router';
import dayjs from 'dayjs';
// json
import DayList from './dayOfMonth_list.json';
import EmployeeList from './employee_list.json';
import TimekeepingModal from './modal/TimekeepingModal';
import UpdateTimekeeping from './modal/UpdateTimekeeping';
import AddShiftTimekeepingModal from './modal/AddShiftTimekeeping';
import DetailShiftUserModal from './modal/DetailShiftUserModal';
import IconFolderMinus from '@/components/Icon/IconFolderMinus';
import IconDownload from '@/components/Icon/IconDownload';
import IconEye from '@/components/Icon/IconEye';
import IconChecks from '@/components/Icon/IconChecks';
import { flattenDepartments, getDayBetweenDates, getDaysOfCurrentWeek, getDaysOfMonth, getWeekDaysOfMonth, loadMore, makeRamdomText } from '@/utils/commons';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import { TimekeepingStaffs } from '@/services/swr/timekeeping-staff.swr';
import Link from 'next/link';
import Modal from './modal';
import { IRootState } from '@/store';
import { Lao } from '@/utils/lao';
import { useSelector } from 'react-redux';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { IconFilter } from '@/components/Icon/IconFilter';
import { Humans } from '@/services/swr/human.swr';
import { useDebounce } from 'use-debounce';
import IconNewUnion from '@/components/Icon/IconNewUnion1';
import IconNewShiftTimekeeping from '@/components/Icon/IconNewShiftTimekeeping';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import OverTime from './overTime';
import moment from 'moment';
import { Loader } from '@mantine/core';
import { DropdownDepartment, DropdownSuperior, DropdownUsers } from '@/services/swr/dropdown.swr';
import { TestTimekeeping } from '@/services/apis/timekeeping.api';

interface Props {
    [key: string]: any;
}
interface Column {
    accessor: string;
    title: string | JSX.Element;
    // width: number;
    render: (records: any, index: any) => JSX.Element;
    sortable?: boolean;
}

interface Day {
    dayMonth: string;
    dayWeek: string;
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
        paddingLeft: state.data.level ? state.data.level * LEVEL_INDENT : 10,
    }),
};
interface HumanOption {
    value: string;
    label: string;
}
function countDaysBetween(startDate: string, endDate: string): number {
    const start = moment(startDate, 'YYYY-MM-DD');
    const end = moment(endDate, 'YYYY-MM-DD');
    return end.diff(start, 'days') + 1;
}

const Department = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(setPageTitle(`${t('shift_timekeeping')}`));
    });
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [departmentPage, setDepartmentPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [humanPage, setHumanPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [inputValue, setInputValue] = useState<any>();
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [recordsData, setRecordsData] = useState<any>();
    const [total, setTotal] = useState(0);
    const [getStorge, setGetStorge] = useState<any>();
    const [data, setData] = useState<any>();
    const [listDay, setListDay] = useState<any[]>([]);
    const [search, setSearch] = useState<any>();
    const [openTime, setOpenTime] = useState(false);
    const [dataSuperiorDropdown, setDataSuperiorDropdown] = useState<any>([]);
    const [tableName, setTableName] = useState('');

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [queryHuman, setQueryHuman] = useState<any>();
    const [showAddShift, setShowAddShift] = useState(false);
    const [showDetailShift, setShowDetailShift] = useState(false);
    // const [showEditShift, setShowEditShift] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [open, setOpen] = useState(false);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const [quickFilter, setQuickFilter] = useState<any>();
    const [displayMode, setDisplayMode] = useState(2);
    const [groupedOptions, setGroupedOptions] = useState<any>([
        {
            label: `${t('work_department')}`,
            options: [],
        },
    ]);
    const [searchDepartment, setSearchDepartment] = useState('')

    const [viewUpdate, setViewUpdate] = useState(false);
    const flatpickrRef = useRef<any>(null);
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: departmentPage, perPage: 10, search: searchDepartment });

    const VIEW_OPTIONS = [
        {
            label: t('Display by Working Days'),
            value: 0,
        },
        {
            label: t('Display by Working Hours'),
            value: 1,
        },
        {
            label: t('Display Attendance'),
            value: 2,
        },
    ];
    const {
        data: timekeepingStaff,
        pagination,
        mutate,
        loading,
    } = TimekeepingStaffs({
        sortBy: 'id.DESC',
        ...router.query,
    });
    const [loadHuman, setLoadHuman] = useState(false);
    const [departmentId2, setDepartmentId2] = useState<any>();

    const [dataHuman, setDataHuman] = useState<any>([]);
    const [pageHuman, setSizeHuman] = useState<any>(1);
    const [debouncedPageHuman] = useDebounce(pageHuman, 500);
    const [debouncedQueryHuman] = useDebounce(queryHuman, 1000);
    const [searchHuman, setSearchHuman] = useState("")
    const [selectedCell, setSelectedCell] = useState<any>();
    const handleSearchHuman = (param: any) => {
        setQueryHuman({ search: param });
    };
    const [selectedDepartmentOptions, setSelectedDepartmentOptions] = useState<any>([]);
    const [selectedHumanOptions, setSelectedHumanOptions] = useState<HumanOption[]>([]);

    const handleLoad = () => {
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
            },
        });
    }
    const handleChangeDepartment = (selected: any) => {
        setSelectedDepartmentOptions(selected);
        setSelectedHumanOptions([]);
        setPage(1);
        if (selected) {
            setDepartmentId2(selected);
            delete router.query.userIds;
            delete router.query.SelectedHumanOptions;
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: 1,
                    departmentIds: selected?.map((item: any) => item.value),
                    SelectedDepartmentOptions: selected?.map((item: any) => item.label),
                },
            });
        } else {
            setDepartmentId2(selected);
            delete router.query.departmentIds;
            delete router.query.userIds;
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                },
            });
        }
    };

    const handleChangeHuman = (selected: any) => {
        setPage(1);
        setSelectedHumanOptions(selected);
        if (selected) {
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: 1,
                    userIds: selected?.map((item: any) => item.value),
                    SelectedHumanOptions: selected?.map((item: any) => item.label),
                },
            });
        } else {
            delete router.query.userIds;
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                },
            });
        }
    };
    const CustomOption = (props: any) => {
        return (
            <components.Option {...props}>
                <input type="checkbox" checked={props.isSelected} onChange={() => null} style={{ marginRight: 8 }} />
                <label>{props.label}</label>
            </components.Option>
        );
    };
    const LIST_STATUS = [
        {
            label: `${t('shiftNotStartedYet')}`, // chưa đến ca
            color: '#D9D9D9',
            background: '#EFEFEF',
        },
        {
            label: `${t('noAttendanceRecorded')}`, // không chấm công
            color: '#DADADA',
            background: '#c4c4c4',
        },
        {
            label: `${t('onLeave')}`, // nghỉ phép
            color: '#002868',
            background: '#8B9DBE',
        },
        {
            label: `${t('onBusinessTrip')}`, // đang đi công tác
            color: '#9CD3EB',
            background: '#D1ECF5',
        },
        {
            label: `${t('notYetClockedInClockedOut')}`, // chưa vào ca ra ca
            color: '#C8102E',
            background: '#E79BAA',
        },
        {
            label: `${t('lateArrivalEarlyDeparture')}`, // vào trễ ra sớm
            color: '#FFCD00',
            background: '#FFE680',
        },
        {
            label: `${t('punctualAttendance')}`, // chấm công đúng giờ
            color: '#97994A',
            background: '#B2D184',
        },
    ];

    const { data: superiorDropdown, pagination: paginationHuman, isLoading: superiorLoading, mutate: mutateSuperior } = DropdownUsers({ page: debouncedPageHuman, departmentId: departmentId2, search: debouncedQueryHuman });
    useEffect(() => {
        mutateSuperior();
    }, [departmentId2]);
    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data);
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
        }
    }, [departmentId2, paginationDepartment]);
    useEffect(() => {
        listAllDepartmentTree({
            page: 1,
            perPage: 100,
        })
            .then((res: any) => {
                const listDepartment_ = flattenDepartments(res?.data);
                setGroupedOptions([
                    {
                        label: `${t('work_department')}`,
                        options: listDepartment_,
                    },
                ]);
            })
            .catch((err: any) => {
                console.log(err);
            });
    }, []);
    // useEffect

    useEffect(() => {
        if (router.isReady) {
            const startDay_ = router?.query?.startDate as string;
            const endDay_ = router?.query?.endDate as string;
            const listDepartments = router?.query?.departmentIds;
            const listUsers = router?.query?.userIds
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

            // cập nhật chọn phòng ban
            let selectedDepartmentOptions2: any[] = [];
            if (Array.isArray(router?.query?.departmentIds) && Array.isArray(router?.query?.SelectedDepartmentOptions)) {
                selectedDepartmentOptions2 = router.query.departmentIds.map((departmentId: string, index: number) => ({
                    value: departmentId,
                    label: router.query.SelectedDepartmentOptions ? router.query.SelectedDepartmentOptions[index] : '',
                }));
            } else if (typeof router?.query?.userIds === 'string' && typeof router?.query?.SelectedDepartmentOptions === 'string') {
                selectedDepartmentOptions2 = [{
                    value: router.query.departmentIds,
                    label: router.query.SelectedDepartmentOptions,
                }];
            } else {
                selectedDepartmentOptions2 = [];
            }
            setSelectedDepartmentOptions(selectedDepartmentOptions2);

            const listDay_ = startDay_ && endDay_ ? getDayBetweenDates(startDay_, endDay_) : getDaysOfCurrentWeek();
            setListDay(listDay_);
            const startDate = listDay_[0];
            const endDate = listDay_[listDay_?.length - 1];
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    startDate: startDay_ ?? dayjs(startDate?.fullDay).format('YYYY-MM-DD'),
                    endDate: endDay_ ?? dayjs(endDate?.fullDay).format('YYYY-MM-DD'),
                    departmentIds: listDepartments,
                    userIds: listUsers
                },
            });
            setTableName(`days-${countDaysBetween(startDay_ ?? dayjs(startDate?.fullDay).format('YYYY-MM-DD'), endDay_ ?? dayjs(endDate?.fullDay).format('YYYY-MM-DD'))}`)

            if (flatpickrRef?.current) {
                flatpickrRef.current?.flatpickr?.setDate([dayjs(startDate?.fullDay).format('DD-MM-YYYY'), dayjs(endDate?.fullDay).format('DD-MM-YYYY')]);
            }
        }
    }, [router.isReady]);

    useEffect(() => {
        setShowLoader(false);
    }, [recordsData]);

    const handleOnScrollBottomHuman = () => {
        setLoadHuman(true);
        if (paginationHuman?.page < paginationHuman?.totalPages) {
            setSizeHuman(paginationHuman?.page + 1);
        }
    };

    const handleSearch = (param: any) => {
        setSearch(param);
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                search: param,
            },
        });
    };

    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            handleSearch(search);
        }
    };
    const handleChangeMonth = (selectedDates: any, dateStr: any) => {
        const date_str = selectedDates[0] ?? '';
        const year: number = date_str.getFullYear();
        const month: number = date_str.getMonth() + 1;
        const listDay = getWeekDaysOfMonth(year, month);
        setListDay(listDay);
        setTableName('days-7');
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: page,
                    perPage: pageSize,
                    month: month,
                    year: year,
                },
            },
            undefined,
            { shallow: true },
        );
    };
    useEffect(() => {
        mutateSuperior()
    }, [searchHuman, humanPage]);
    const handleChangeQueryHuman = (value: any) => {
        setQueryHuman(value);
        setSizeHuman(1)
    }
    const handleChangePage = (page: number, pageSize: number) => {
        setPage(page);
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
    const handleAddShift = (item: any, info: any, findItem: any) => {
        setSelectedCell({
            date: item,
            staffInfo: {
                id: info?.id,
                fullName: info?.fullName,
            },
            timekeepingStaff: findItem,
        });
        setShowAddShift(true);
    };
    const handleDetail = (item: any, info: any, shiftTimekeepings: any, timekeepingStaffInfo: any) => {
        setSelectedCell({
            date: item,
            staffInfo: {
                id: info?.id,
                fullName: info?.fullName,
            },
            shiftInfo: shiftTimekeepings,
            timekeepingStaff: timekeepingStaffInfo,
        });
        // setShowEditShift(true);
        setShowDetailShift(true);
    };

    const handleEdit = (item: any, info: any, shiftTimekeepings: any, findItem: any) => {
        setSelectedCell({
            date: item,
            staffInfo: {
                id: info?.id,
                fullName: info?.fullName,
            },
            shiftInfo: shiftTimekeepings,
            timekeepingStaff: findItem,
        });
        // setShowEditShift(true);
        setShowAddShift(true);
    };
    const columns: Array<Column> = [
        {
            accessor: 'id',
            title: '#',
            // width: 30,
            render: (records: any, index: any) => (
                <span>{(page - 1) * pageSize + index + 1}</span>
            ),
        },
        {
            accessor: 'fullName',
            title: `${t('personel_name')}`,
            sortable: false,
            // width: 180,
            render: (records: any, index: any) => (
                <span style={{ width: '100px' }}>{records?.fullName || ""}</span>
            ),
        },
        {
            accessor: 'code',
            title: `${t('duty')}`,
            sortable: false,
            // width: 180,
            render: (records: any, index: any) => (
                <span style={{ width: '100px' }}>{records?.position?.name}</span>
            ),
        },
    ];

    // useEffect để cập nhật màu nền cho các phần tử có className 'currentDay'
    useEffect(() => {
        const childElements = document.querySelectorAll('.currentDay');
        childElements.forEach((childElement) => {
            const parentElement = (childElement as HTMLElement).parentElement;

            if (parentElement instanceof HTMLElement) {
                parentElement.style.backgroundColor = '#F4F6EB'; // Đổi màu nền
            }
        });
    }, [timekeepingStaff?.data]);

    // Thêm cột động dựa trên listDay
    listDay?.forEach((item: any, columIndex: number) => {
        columns.push({
            accessor: '',
            // width: listDay?.length > 7 ? 100 : 700/listDay?.length,
            title: (
                <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {t(item?.dayOfWeek)} {item?.date}/{item?.month}
                </div>
            ),
            render: (records: any, index: any) => {
                const findItem = records?.timekeepingStaffs?.find((e: any) =>
                    Number(item?.date) === Number(dayjs(e?.time).date())
                );

                switch (displayMode) {
                    case 0:
                        // Hiển thị theo ngày công
                        return (
                            <span className="text-center" style={{ cursor: 'pointer' }}>
                                {findItem ? findItem?.totalWork : '-'}
                            </span>
                        );

                    case 1:
                        // Hiển thị theo giờ công
                        return (
                            <span className="text-center" style={{ cursor: 'pointer' }}>
                                {findItem ? findItem?.totalHours : '-'}
                            </span>
                        );

                    default:
                        // Hiển thị theo chấm công
                        const isCurrentDay = findItem?.time === dayjs(new Date()).format('YYYY-MM-DD');
                        if (findItem?.shiftTimekeepings?.length > 0) {
                            return (
                                <div className={`${isCurrentDay ? 'hover-row currentDay' : 'hover-row'}`}>
                                    <div className="shiftInfo">
                                        <div className="text-center font-bold text-info" style={{ marginBottom: '0.2rem' }}>
                                            {findItem?.shiftTimekeepings?.length === 1
                                                ? findItem?.shiftTimekeepings[0]?.shift?.name
                                                : `${findItem?.shiftTimekeepings?.length} ${t('shift_')}`}
                                        </div>

                                        <div
                                            className="gap-1"
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            {findItem?.shiftTimekeepings?.map((shift: any, index_: any) => (
                                                <IconNewShiftTimekeeping
                                                    key={index_}
                                                    className={`iconshift-${shift?.status}`}
                                                    color={`${LIST_STATUS[shift?.status]?.color}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="action-buttons">
                                        <button
                                            className="view-button"
                                            onClick={() =>
                                                handleDetail(item, records, findItem?.shiftTimekeepings, findItem)
                                            }
                                            title={`${t('detail_shift_timekeeping')}`}
                                        >
                                            <IconNewEye />
                                        </button>
                                        <button
                                            className="edit-button"
                                            onClick={() =>
                                                handleEdit(item, records, findItem?.shiftTimekeepings, findItem)
                                            }
                                            title={`${t('update_shift_timekeeping')}`}
                                        >
                                            <IconNewEdit />
                                        </button>
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <span
                                    className={`${isCurrentDay ? 'timekeeping-add-btn currentDay' : 'timekeeping-add-btn'
                                        }`}
                                    onClick={() => handleAddShift(item, records, findItem)}
                                    style={{
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        height: '100%',
                                        alignItems: 'center',
                                    }}
                                >
                                    <IconNewUnion />
                                </span>
                            );
                        }
                }
            },
        });
    });


    const handleChangeUsers = (de: any) => {
        if (de) {
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: 1,
                    userIds: de?.map((item: any) => item?.value),
                },
            });
        } else {
            delete router.query.userId;
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                },
            });
        }
    };
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
            setTableName(`days-${countDaysBetween(de[0], de[1])}`)
            setListDay(getDayBetweenDates(dayjs(de[0]).format('YYYY-MM-DD'), dayjs(de[1]).format('YYYY-MM-DD')));
        }
    };
    const handleCancel = () => {
        setShowAddShift(false);
        setShowDetailShift(false);
        // setShowEditShift(false);
        setSelectedCell(null);
    };
    const handleMenuDepartmentScrollToBottom = () => {
        setTimeout(() => {
            setDepartmentPage(paginationDepartment?.page + 1);
        }, 1000);
    };
    const handleMenuHumanScrollToBottom = () => {
        setTimeout(() => {
            setSizeHuman(paginationHuman?.page + 1);
        }, 1000);
    };
    useEffect(() => {
        if (paginationHuman?.page === undefined) return;
        if (paginationHuman?.page === 1) {
            setDataSuperiorDropdown(superiorDropdown?.data);
        } else {
            const dataSuperior = [...dataSuperiorDropdown, ...superiorDropdown?.data];
            setDataSuperiorDropdown(dataSuperior);
        }
    }, [paginationHuman]);

    const [selectAllDepartment, setSelectAllDepartment] = useState(false);
    const [selectAllHuman, setSelectAllHuman] = useState(false);

    const handleSelectAllDepartment = () => {
        if (selectAllDepartment) {
            setSelectedDepartmentOptions([]);
            delete router.query.departmentIds;
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                },
            });
        } else {
            const listDe = dataDepartment.map((i: any) => ({ label: `${i.label} - ${i.position_name}`, value: i.value }));
            setSelectedDepartmentOptions(listDe);
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    departmentIds: listDe?.map((item: any) => item?.value),
                },
            });
        }
        setSelectAllDepartment(!selectAllDepartment);
    };
    const handleSelectAllHuman = () => {
        if (selectAllHuman) {
            setSelectedHumanOptions([]);
            delete router.query.userIds;
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                },
            });
        } else {
            const listHu = superiorDropdown.map((i: any) => ({ label: `${i.label} - ${i.position_name}`, value: i.value }));
            setSelectedHumanOptions(listHu);
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    userIds: listHu?.map((item: any) => item?.value),
                },
            });
        }
        setSelectAllHuman(!selectAllHuman);
    };
    const CustomMultiValueRemove = () => null;
    const CustomMenuListDepartment = (props: any) => {
        return (
            <>
                <div
                    style={{
                        padding: '10px',
                        cursor: 'pointer',
                        backgroundColor: '#f0f0f0',
                        textAlign: 'center',
                        fontWeight: 'bold',
                    }}
                    onClick={handleSelectAllDepartment}
                >
                    {selectAllDepartment ? `${t('cancel_select')}` : `${t('check_all')}`}
                </div>
                <components.MenuList {...props}>{props.children}</components.MenuList>
            </>
        );
    };
    const CustomMenuListHuman = (props: any) => {
        return (
            <>
                {/* <div
                    style={{
                        padding: '10px',
                        cursor: 'pointer',
                        backgroundColor: '#f0f0f0',
                        textAlign: 'center',
                        fontWeight: 'bold',
                    }}
                    onClick={handleSelectAllHuman}
                >
                    {selectAllHuman ? `${t('cancel_select')}` : `${t('check_all')}`}
                </div> */}
                <components.MenuList {...props}>{props.children}</components.MenuList>
            </>
        );
    };
    const handleUpdateTimekeeping = () => {
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
                title: `${t('update_timekeeping')}`,
                html: `<span class='confirm-span'>${t('confirm_update_timekeeping')}</span>?<br/>`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    TestTimekeeping().then((result) => {
                        showMessage(`${t('update_timekeeping_success')}`, 'success');
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    });
                }
            });
    };
    const handleChangeQueryDepartment = (value: any) => {
        setSearchDepartment(value);
        setDepartmentPage(1)
    }
    return (
        <div>
            {showLoader && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )}
            <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('homepage')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('shift_timekeeping')}</span>
                </li>
            </ul>
            <div className="panel mt-6">
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center">
                        {/* <Link href="/hrm/overtime-form/AddNewForm">
                        <button type="button" className="btn btn-primary btn-sm m-1 custom-button" >
                                    <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                                    {t('add')}
                                    </button>
                        </Link> */}

                        {/* <button type="button" className="btn btn-primary btn-sm m-1 custom-button" >
                            <IconFolderMinus className="ltr:mr-2 rtl:ml-2" />
                            Nhập file
                        </button> */}
                        <RBACWrapper permissionKey={['timekeepingStaff:workCalculation']} type={'AND'}>
                            {/* <button type="button" className="button-table button-download">
                                <IconNewDownload2 />
                                <span className="uppercase">{t('export_file_excel')}</span>
                            </button> */}
                            <button type="button" className="button-table button-download" style={{ marginLeft: '10px' }} onClick={() => setViewUpdate(true)}>
                                <span className="uppercase">{t('update_timekeeping')}</span>
                            </button>
                        </RBACWrapper>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-1">
                            {/* <input
                                autoComplete="off"
                                type="text"
                                className="form-input ml-1 w-auto"
                                placeholder={`${t('search')}`}
                                onKeyDown={(e) => handleKeyPress(e)}
                                onChange={(e) => (e.target.value === '' ? handleSearch('') : setSearch(e.target.value))}
                            /> */}
                            {/* <Flatpickr
                                className="form-input"
                                options={{
                                    locale: {
                                        ...chosenLocale,
                                    },
                                    // dateFormat: 'd/m/y',
                                    defaultDate: new Date(),
                                    plugins: [
                                        monthSelectPlugin(monthSelectConfig), // Sử dụng plugin với cấu hình
                                    ],
                                }}
                                onChange={(selectedDates, dateStr, instance) => {
                                    handleChangeMonth(selectedDates, dateStr);
                                }}
                            /> */}
                        </div>
                    </div>
                </div>
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center" style={{ alignItems: 'flex-end' }}>
                    <div className="flex flex-wrap items-center gap-1">
                        <IconFilter />
                        <span>{t('Quick filter')}:</span>
                        <div className="flex flex-wrap items-center gap-1">
                            <div className="flex w-[270px] flex-1">
                                <Select
                                    className="zIndex-10 w-[250px] shiftimekeeing-select"
                                    id="departmentId"
                                    name="departmentId"
                                    // placeholder={t('choose_department')}
                                    options={dataDepartment} // Ensure dataDepartment is an array of DepartmentOption objects
                                    // maxMenuHeight={160}
                                    onMenuOpen={() => setDepartmentPage(1)}
                                    onMenuScrollToBottom={handleMenuDepartmentScrollToBottom}
                                    isLoading={isLoadingDepartment}
                                    onChange={(e: any) => {
                                        handleChangeDepartment(e);
                                    }}
                                    value={selectedDepartmentOptions}
                                    isClearable
                                    isMulti
                                    onInputChange={(e) => {
                                        handleChangeQueryDepartment(e)
                                    }}
                                    components={{ Option: CustomOption, MultiValueRemove: CustomMultiValueRemove }}
                                    placeholder={t('choose_department')}
                                    styles={{
                                        option: (base: CSSObjectWithLabel) => ({
                                            ...base,
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: base.isSelected ? 'rgb(171, 182, 103)' : base.isFocused ? 'rgb(210, 214, 165)' : 'white',
                                            color: base.isSelected ? 'white' : 'black',
                                            ':active': {
                                                backgroundColor: 'rgb(171, 182, 103)',
                                                color: 'white',
                                            },
                                        }),
                                        control: (base: CSSObjectWithLabel) => ({
                                            ...base,
                                            minHeight: '40px',
                                        }),
                                        menuPortal: (base: CSSObjectWithLabel) => ({
                                            ...base,
                                            zIndex: 9999,
                                        }),
                                        multiValue: (base: any, { index }) => ({
                                            ...base,
                                            display: index === 0 ? 'flex' : 'none',
                                            position: 'relative',
                                            '::after':
                                                selectedDepartmentOptions.length > 1 && index === 0
                                                    ? {
                                                        content: `"......."`,
                                                        left: '30px',
                                                        top: '0',
                                                        color: 'black',
                                                        height: "15px"
                                                    }
                                                    : {},
                                        }),
                                        multiValueLabel: (base: any, { index }) => ({
                                            ...base,
                                            display: 'block',
                                        }),
                                    }}
                                />
                            </div>

                            <div className="flex w-[220px] flex-1">
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
                            </div>
                            <div className="flex w-[230px] flex-1">
                                <Select
                                    className="zIndex-10 w-[220px]"
                                    options={VIEW_OPTIONS}
                                    placeholder={t('choose_department')}
                                    styles={customStyles}
                                    value={VIEW_OPTIONS?.find((options: any) => options.value === displayMode)}
                                    onChange={(e: any) => {
                                        setDisplayMode(e?.value);
                                    }}
                                />
                            </div>
                            <div className="flex w-[300px] flex-1">
                                <Select
                                    className="zIndex-10 w-[300px] shiftimekeeing-select"
                                    options={dataSuperiorDropdown.map((i: any) => ({
                                        label: `${i.label} - ${i.position_name}`,
                                        value: i.value,
                                    }))}
                                    name="approverId"
                                    value={selectedHumanOptions}
                                    onChange={handleChangeHuman}
                                    onMenuOpen={() => setHumanPage(1)}
                                    onMenuScrollToBottom={handleMenuHumanScrollToBottom}
                                    isMulti
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    isLoading={superiorLoading}
                                    onInputChange={(e) => {
                                        handleChangeQueryHuman(e)
                                    }}
                                    components={{ Option: CustomOption, MultiValueRemove: CustomMultiValueRemove }}
                                    placeholder={t('Choose staff')}
                                    styles={{
                                        option: (base: CSSObjectWithLabel) => ({
                                            ...base,
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: base.isSelected ? 'rgb(171, 182, 103)' : base.isFocused ? 'rgb(210, 214, 165)' : 'white',
                                            color: base.isSelected ? 'white' : 'black',
                                            ':active': {
                                                backgroundColor: 'rgb(171, 182, 103)',
                                                color: 'white',
                                            },
                                        }),
                                        control: (base: CSSObjectWithLabel) => ({
                                            ...base,
                                            minHeight: '40px',
                                        }),
                                        menuPortal: (base: CSSObjectWithLabel) => ({
                                            ...base,
                                            zIndex: 9999,
                                        }),
                                        multiValue: (base: any, { index }) => ({
                                            ...base,
                                            display: index === 0 ? 'flex' : 'none',
                                            position: 'relative',
                                            '::after':
                                                selectedHumanOptions.length > 1 && index === 0
                                                    ? {
                                                        content: `", ......."`,
                                                        left: '30px',
                                                        top: '0',
                                                        color: 'black',
                                                    }
                                                    : {},
                                        }),
                                        multiValueLabel: (base: any, { index }) => ({
                                            ...base,
                                            display: 'block',
                                        }),
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-3">
                        <button
                            type="button"
                            className="button-table"
                            style={{ marginLeft: '10px', width: "120px" }}
                            onClick={() => setOpenTime(true)}>
                            <span className="uppercase">{t('config_shift_base_time')}</span>
                        </button>
                    </div>
                </div>
                <div className="datatables" id="shiftTimekeeping">
                    {loading ? (
                        <div className="flex justify-center">
                            <Loader />
                        </div>
                    ) : (
                        <DataTable
                            highlightOnHover
                            // id="timekeepingStaff"
                            className={`timekeeping-staff table-hover custom_table whitespace-nowrap ${tableName}`}
                            records={timekeepingStaff?.data}
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
                    )}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                        }}
                    >
                        {LIST_STATUS?.map((item: any, index: number) => {
                            return (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        marginLeft: '1rem',
                                        alignItems: 'center',
                                    }}
                                >
                                    <IconNewShiftTimekeeping className={`iconshift-${index}`} color={`${item?.color}`} />
                                    <span style={{ marginLeft: '5px' }}>{item?.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <TimekeepingModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                data={data}
                setData={setData}
                mutate={mutate}
            />
            <UpdateTimekeeping
                openModal={viewUpdate}
                setOpenModal={setViewUpdate}
                mutate={mutate}
            />
            <Modal open={open} setOpen={setOpen}></Modal>
            {selectedCell && (
                <AddShiftTimekeepingModal
                    openModal={showAddShift}
                    setOpenModal={setShowAddShift}
                    data={data}
                    setData={setData}
                    mutate={mutate}
                    selectedCell={selectedCell}
                    handleCancel={handleCancel}
                />
            )}
            {selectedCell && (
                <DetailShiftUserModal
                    openModal={showDetailShift}
                    setOpenModal={setShowAddShift}
                    data={data}
                    setData={setData}
                    mutate={mutate}
                    selectedCell={selectedCell}
                    handleCancel={handleCancel}
                    listStatus={LIST_STATUS}
                />
            )}
            <OverTime openModal={openTime} setOpenModal={setOpenTime} mutate={mutate} handleLoad={handleLoad} />
        </div>
    );
};

export default Department;
