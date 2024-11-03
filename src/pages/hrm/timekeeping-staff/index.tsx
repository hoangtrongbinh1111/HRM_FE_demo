import { useEffect, Fragment, useState, useCallback } from 'react';
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
import Select from 'react-select';

import 'flatpickr/dist/plugins/monthSelect/style.css';
import monthSelectPlugin, { Config } from 'flatpickr/dist/plugins/monthSelect';
import { deleteDepartment, detailDepartment, listAllDepartment, listAllDepartmentTree } from '../../../services/apis/department.api';
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
// helper
import { capitalize, downloadFile, downloadFile2, formatDate, showMessage } from '@/@core/utils';
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
import IconFolderMinus from '@/components/Icon/IconFolderMinus';
import IconDownload from '@/components/Icon/IconDownload';
import IconEye from '@/components/Icon/IconEye';
import IconChecks from '@/components/Icon/IconChecks';
import { flattenDepartments, getDaysOfMonth, loadMore, roundDecimal } from '@/utils/commons';
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
import OverTime from './overTime';
import IconNewUnion from '@/components/Icon/IconNewUnion1';
import IconNewShiftTimekeeping from '@/components/Icon/IconNewShiftTimekeeping';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import { Loader } from '@mantine/core';
import { DropdownDepartment } from '@/services/swr/dropdown.swr';
import ModalExcel from './modelExcel';

interface Props {
    [key: string]: any;
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

const Department = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(setPageTitle(`${t('timekeeping_employee')}`));
    });
    const [openDepartment, setOpenDepartment] = useState(false);
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [recordsData, setRecordsData] = useState<any>();
    const [total, setTotal] = useState(0);
    const [getStorge, setGetStorge] = useState<any>();
    const [data, setData] = useState<any>();
    const [listDay, setListDay] = useState<undefined | string[]>(undefined);
    const [search, setSearch] = useState<any>();

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [queryHuman, setQueryHuman] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [open, setOpen] = useState(false);
    const [openTime, setOpenTime] = useState(false);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const [dataHuman, setDataHuman] = useState<any>([]);
    const [pageHuman, setSizeHuman] = useState<any>(1);
    const [queryDepartment, setQueryDepartment] = useState<any>();
    const [debouncedQuery] = useDebounce(queryDepartment, 500);
    const [groupedOptions, setGroupedOptions] = useState<any>([
        {
            label: `${t('work_department')}`,
            options: [],
        },
    ]);
    const [departmentPage, setDepartmentPage] = useState<any>(PAGE_NUMBER_DEFAULT);

    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const {
        data: dropdownDepartment,
        pagination: paginationDepartment,
        mutate: mutateDepartment,
        isLoading: isLoadingDepartment,
    } = DropdownDepartment({ page: departmentPage, perPage: 10, search: debouncedQuery?.search });

    const {
        data: timekeepingStaff,
        pagination,
        isLoading,
        mutate,
    } = TimekeepingStaffs({
        sortBy: 'id.DESC',
        month: currentMonth,
        year: currentYear,
        ...router.query,
    });
    const [loadHuman, setLoadHuman] = useState(false);

    const [debouncedPageHuman] = useDebounce(pageHuman, 500);
    const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
    const [departmentIds, setDepartmentIds] = useState<any>([]);
    const [userIds, setUserIds] = useState<any>([]);
    const [filterDate, setFilterDate] = useState<any>();
    const [departmentId2, setDepartmentId2] = useState<any>();

    const handleSearchHuman = (param: any) => {
        setQueryHuman({ search: param });
    };
    const [selectedDepartment, setSelectedDepartment] = useState<any[]>([]);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setGetStorge(EmployeeList);
            localStorage.setItem('employeeList', JSON.stringify(EmployeeList));
        }
    }, []);
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

    useEffect(() => {
        setTotal(getStorge?.length);
        setPageSize(PAGE_SIZES_DEFAULT);
        setRecordsData(
            getStorge?.filter((item: any, index: any) => {
                return index <= 9 && page === 1 ? item : index >= 10 && index <= page * 9 ? item : null;
            }),
        );
        const listDay_ = getDaysOfMonth(currentYear, currentMonth);
        setListDay(listDay_);
    }, [getStorge, getStorge?.length, page]);

    useEffect(() => {
        setShowLoader(false);
    }, [recordsData]);
    const { data: manages, pagination: paginationHuman } = Humans({
        sortBy: 'id.ASC',
        page: debouncedPageHuman,
        perPage: 10,
        search: debouncedQueryHuman?.search,
    });
    const handleOnScrollBottomHuman = () => {
        setLoadHuman(true);
        if (paginationHuman?.page < paginationHuman?.totalPages) {
            setSizeHuman(paginationHuman?.page + 1);
        }
    };
    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data);
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
        }
    }, [departmentId2, paginationDepartment]);
    useEffect(() => {
        loadMore(manages, dataHuman, paginationHuman, setDataHuman, 'id', 'fullName', setLoadHuman);
    }, [paginationHuman, debouncedPageHuman, debouncedQueryHuman]);
    const handleEdit = (findItem: any) => {
        setOpenModal(true);
        setData(findItem);
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
        const listDay = getDaysOfMonth(year, month);
        setListDay(listDay);
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
    const handleSearchDepartment = (param: any) => {
        setQueryDepartment({ search: param });
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
                title: `${t('delete_department')}`,
                text: `${t('delete')} ${data.name}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    const value = getStorge.filter((item: any) => {
                        return item.id !== data.id;
                    });
                    localStorage.setItem('employeeList', JSON.stringify(value));
                    setGetStorge(value);
                    showMessage(`${t('delete_department_success')}`, 'success');
                }
            });
    };
    const handleCheck = (data: any) => {
        const swalChecks = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary',
                cancelButton: 'btn btn-danger ltr:mr-3 rtl:ml-3',
                popup: 'sweet-alerts',
            },
            buttonsStyling: false,
        });
        swalChecks
            .fire({
                title: `${t('check_timekeeping')}`,
                text: `${t('check')} ${data.name}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    const value = getStorge.filter((item: any) => {
                        return item.id !== data.id;
                    });
                    localStorage.setItem('employeeList', JSON.stringify(value));
                    setGetStorge(value);
                    showMessage(`${t('check_timekeeping_success')}`, 'success');
                }
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
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        // {
        //     accessor: 'code',
        //     title: 'Mã chấm công', sortable: false
        // },
        {
            accessor: 'fullName',
            title: `${t('personel_name')}`,
            sortable: false,
        },
    ];

    listDay?.map((item: string, columIndex: number) => {
        columns.push({
            accessor: '',
            title: item,
            render: (records: any, index: any) => {
                const findItem = records?.timekeepingStaffs?.find((e: any) => Number(item) === Number(dayjs(e?.time).date()));
                if (findItem) {
                    return <span style={{ cursor: 'pointer' }}>{roundDecimal(findItem?.totalWork)}</span>;
                } else return <span style={{ cursor: 'pointer' }}>-</span>;
            },
        });
    });
    columns.push({
        accessor: '',
        title: `${t('totalWork')}`,
        // sortable: false,
        // textAlign: "center",
        render: (records: any) => {
            return <span>{roundDecimal(records?.timekeepingStaffs?.reduce((acc: number, item: any) => acc + (item?.totalWork ?? 0), 0) ?? 0)}</span>;
        },
    });
    const handleChangeDepartment = (de: any) => {
        if (de) {
            setSelectedDepartment(de?.map((item: any) => item.value));
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    // departmentIds: de?.id
                    departmentIds: de?.map((item: any) => item.value),
                },
            });
        } else {
            delete router.query.departmentIds;
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                },
            });
        }
    };
    const handleChangeUsers = (de: any) => {
        if (de) {
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
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
        if (de) {
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    startDate: dayjs(de[0]).format('YYYY-MM-DD'),
                    endDate: dayjs(de[1]).format('YYYY-MM-DD'),
                },
            });
        } else {
            delete router.query.startDate;
            delete router.query.endDate;
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                },
            });
        }
    };
    const handleExportFile = () => {
        if (selectedDepartment?.length === 0) {
            showMessage(`${t('please_select_department')}`, 'warning');
            return;
        } else {
            setLoading(true);
            const stringQuery = new URLSearchParams({
                month: (router.query.month ?? currentMonth).toString(),
                year: (router.query.year ?? currentYear).toString(),
            });

            if (Array.isArray(selectedDepartment)) {
                selectedDepartment.forEach((departmentId) => {
                    stringQuery.append('departmentIds', departmentId);
                });
            } else {
                stringQuery.append('departmentIds', selectedDepartment);
            }
            downloadFile('timekeeping_staff.xlsx', `/timekeeping-staff/export?${stringQuery}`).finally(() => {
                setLoading(false);
            });
        }
    };
    const handleMenuDepartmentScrollToBottom = () => {
        setTimeout(() => {
            setDepartmentPage(paginationDepartment?.page + 1);
        }, 1000);
    };
    return (
        <div>
            {isLoading && (
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
                    <span>{t('timekeeping-staff')}</span>
                </li>
            </ul>
            <div className="panel mt-6">
                {/* <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center">
                    </div>
                </div> */}
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center gap-1">
                        <IconFilter />
                        <span>{t('Quick filter')}:</span>
                        <div className="flex flex-wrap items-center gap-1">
                            <div className="flex w-[250px] flex-1">
                                <Select
                                    className="zIndex-10 w-[230px]"
                                    id="departmentId"
                                    name="departmentId"
                                    placeholder={t('choose_department')}
                                    options={dataDepartment} // Ensure dataDepartment is an array of DepartmentOption objects
                                    maxMenuHeight={160}
                                    onMenuOpen={() => setDepartmentPage(1)}
                                    onInputChange={(e) => handleSearchDepartment(e)}
                                    onMenuScrollToBottom={handleMenuDepartmentScrollToBottom}
                                    isLoading={isLoadingDepartment}
                                    onChange={(e: any) => {
                                        handleChangeDepartment(e);
                                    }}
                                    styles={customStyles}
                                    isMulti
                                />
                            </div>
                            <div className="flex w-[250px] flex-1">
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
                            <div className="flex w-[250px] flex-1">

                                <Flatpickr
                                    className="form-input w-[230px]"
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
                                />
                            </div>
                        </div>
                    </div>
                    {/* <div className="flex flex-row gap-3">
                    <button type="button" className="button-table button-download" style={{ marginLeft: '10px' }} onClick={() => setOpenTime(true)}>
                                <span className="uppercase">{t('shift_base_time')}</span>
                            </button>
                    </div> */}
                </div>

                <div className="datatables" id="timekeepingStaff">
                    <DataTable
                        highlightOnHover
                        className="timekeeping-staff table-hover custom_table whitespace-nowrap"
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
                </div>
            </div>
            <ModalExcel openModal={openDepartment} setOpenModal={setOpenDepartment} />
            <TimekeepingModal openModal={openModal} setOpenModal={setOpenModal} data={data} setData={setData} mutate={mutate} />
            <Modal open={open} setOpen={setOpen}></Modal>
        </div>
    );
};

export default Department;
