import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
import "flatpickr/dist/plugins/monthSelect/style.css"
import monthSelectPlugin, { Config } from "flatpickr/dist/plugins/monthSelect"
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
import { showMessage } from '@/@core/utils';
import { IconLoading } from '@/components/Icon/IconLoading';
import { useRouter } from 'next/router';
import EmployeeList from './employee_list.json';
import TimekeepingModal from './modal/TimekeepingModal';
import { getDaysOfMonth } from '@/utils/commons';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
interface Props {
    [key: string]: any;
}
const monthSelectConfig: Partial<Config> = {
    shorthand: true, //defaults to false
    dateFormat: "m/Y", //defaults to "F Y"
    theme: "light" // defaults to "light"
};

export const Department = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(setPageTitle(`${t('timekeeping')}`));
    });
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [recordsData, setRecordsData] = useState<any>();
    const [total, setTotal] = useState(0);
    const [getStorge, setGetStorge] = useState<any>();
    const [data, setData] = useState<any>();
    const [listDay, setListDay] = useState<undefined | string[]>(undefined);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    const [openModal, setOpenModal] = useState(false);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setGetStorge(EmployeeList);
            localStorage.setItem('employeeList', JSON.stringify(EmployeeList));
        }
    }, []);

    useEffect(() => {
        setTotal(getStorge?.length);
        setPageSize(PAGE_SIZES_DEFAULT);
        setRecordsData(getStorge?.filter((item: any, index: any) => { return index <= 9 && page === 1 ? item : index >= 10 && index <= (page * 9) ? item : null; }));
        const listDay_ = getDaysOfMonth(currentYear, currentMonth);
        setListDay(listDay_);
    }, [getStorge, getStorge?.length, page]);

    useEffect(() => {
        setShowLoader(false);
    }, [recordsData]);

    const handleEdit = (data: any) => {
        setOpenModal(true);
        setData(data);
    };
    const handleChangeMonth = (selectedDates: any, dateStr: any) => {
        const date_str = selectedDates[0] ?? "";
        const year: number = date_str.getFullYear();
        const month: number = date_str.getMonth() + 1;
        const listDay = getDaysOfMonth(year, month);
        setListDay(listDay);
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
                    const value = getStorge.filter((item: any) => { return (item.id !== data.id); });
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
                    const value = getStorge.filter((item: any) => { return (item.id !== data.id); });
                    localStorage.setItem('employeeList', JSON.stringify(value));
                    setGetStorge(value);
                    showMessage(`${t('check_timekeeping_success')}`, 'success');
                }
            });
    };
    const handleSearch = (e: any) => {
        if (e.target.value === "") {
            setRecordsData(getStorge);
        } else {
            setRecordsData(
                getStorge.filter((item: any) => {
                    return item.name.toLowerCase().includes(e.target.value.toLowerCase());
                })
            );
        }
    };
    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        {
            accessor: 'code',
            title: 'Mã chấm công', sortable: false
        },
        {
            accessor: 'name',
            title: `${t('personel_name')}`, sortable: false,
        }
    ];

    listDay?.map((item: string, columIndex: number) => {
        columns.push(
            {
                accessor: '',
                title: item,
                render: (records: any, index: any) =>
                    // if (columIndex <= 3) {
                    //     return <span onClick={() => handleEdit(records)} style={{cursor: "pointer"}}>1</span>
                    // } else {
                    //     return <div onClick={() => setOpenModal(true)} style={{cursor: "pointer", height: "20px"}}></div>
                    // }
                    <span onClick={() => handleEdit(records)} style={{ cursor: "pointer" }}>1</span>,
            }
        );
    });
    columns.push({
        accessor: '',
        title: `${t('totalWork')}`,
        sortable: false
    });

    return (
        <div>
            {showLoader && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
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
                        <button type="button" className="button-table button-download">
                            <IconNewDownload2 />
                            <span className='uppercase'>{t('export_file_excel')}</span>
                        </button>
                    </div>
                    <div className='flex gap-2'>
                        <div className='flex gap-1'>
                            <Flatpickr
                                className='form-input'
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
                                    handleChangeMonth(selectedDates, dateStr);
                                }} />
                        </div>
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table custom_table_fixcolumn"
                        records={recordsData}
                        columns={columns}
                        totalRecords={total}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`} />
                </div>
            </div>
            <TimekeepingModal
                openModal={openModal}
                setOpenModal={setOpenModal}
                data={data}
                totalData={getStorge}
                setData={setData}
                setGetStorge={setGetStorge} />
        </div>
    );
};
export default Department;
