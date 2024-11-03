import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { convertTimeFormat, showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { EditTimekeepingStaff } from '@/services/apis/timekeeping-staff.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { PAGE_NUMBER_DEFAULT, PAGE_SIZES, PAGE_SIZES_DEFAULT } from '@/utils/constants';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Shifts } from '@/services/swr/shift.swr';
import Select from 'react-select';
import { UpdateShiftTimekeepingV2 } from '@/services/apis/shift-timekeeping.api';
import { Loader } from '@mantine/core';

interface Props {
    [key: string]: any;
}

const AddShiftTimekeepingModal = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const router = useRouter();
    const [selectedShifts, setSelectedShifts] = useState<any[]>([]);
    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [recordsData, setRecordsData] = useState<any>();
    const [search, setSearch] = useState<any>('');
    const [type, setType] = useState<any>();
    const [filter, setFilter] = useState<any>({
        page: 1,
        perPage: 10,
    });
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    const [openModal, setOpenModal] = useState(false);
    const list_type = [
        {
            value: '',
            label: `${t('all')}`,
        },
        {
            value: 'TIME_RANGE',
            label: `${t('shift_base_time')}`,
        },
        {
            value: 'HOUR_BASED',
            label: `${t('shift_base_total_time')}`,
        },
    ];

    // get data
    const { data: shift, pagination, mutate, loading } = Shifts({ sortBy: 'id.ASC', ...filter });
    useEffect(() => {
        setShowLoader(false);
    }, [recordsData]);
    useEffect(() => {
        if (props?.selectedCell?.shiftInfo) {
            setSelectedShifts(props?.selectedCell?.shiftInfo?.filter((shift: any) => shift.shiftId !== null)?.map((e: any) => e.shiftId))
        } else {
            setSelectedShifts([]);
        }
    }, [props?.selectedCell]);

    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            // Xử lý sự kiện khi nhấn phím Enter ở đây
            handleSearch(search);
        }
    };
    const handleSearch = (param: any) => {
        setSearch(param);
        setFilter({
            page: 1,
            perPage: 10,
            search: param,
        })
    };
    const handleChangePage = (page: number, pageSize: number) => {
        setPage(page)
        setFilter({
            ...filter,
            page: page,
            perPage: pageSize,
        })
    };
    const handleFilterType = (param: any) => {
        setFilter({
            ...filter,
            type: param?.value === 'TIME_RANGE' ? 1 : 0,
        });
    };
    const handleChangeSelect = (value: any, id: any) => {
        if (value) {
            setSelectedShifts(prev => [...prev, id])
        } else {
            setSelectedShifts(prev => prev?.filter(e => e !== id))
        }
    }
    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        {
            accessor: 'code',
            title: `${t('code_shift')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{records?.code}</span>,
        },
        {
            accessor: 'name',
            title: `${t('name_shift')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{records?.name}</span>,
        },
        {
            accessor: 'time',
            title: `${t('time')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{convertTimeFormat(records?.startTime)}-{convertTimeFormat(records?.endTime)}</span>,
        },
        {
            accessor: 'choose',
            title: `${t('choose')}`,
            sortable: false, render: (records: any) => <input autoComplete="off"
                type="checkbox"
                checked={selectedShifts.find((shift) => shift === records.id)}
                onChange={(e) => handleChangeSelect(e.target.checked, records?.id)}
                className='form-checkbox' />
        },
    ];

    const handleSubmit = () => {
        const dataSubmit = {
            shiftIds: selectedShifts
        };
        UpdateShiftTimekeepingV2(props?.selectedCell?.timekeepingStaff?.id, dataSubmit).then((res: any) => {
            const flag = props?.selectedCell?.shiftInfo?.filter((shift: any) => shift.shiftId !== null)?.map((e: any) => e.shiftId)?.length > 0
            if (flag) {
                showMessage(`${t('Successfully updated work shifts for user')}`, 'success');
            }
            else {
                showMessage(`${t('Successfully created work shifts for user')}`, 'success');
            }
            props.mutate();
            setSelectedShifts([])
            props?.handleCancel();
        }).catch((err: any) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }
    return (
        <Transition appear show={props.openModal ?? false} as={Fragment}>
            <Dialog as="div" open={props.openModal} onClose={() => props.setOpenModal(false)} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel w-full max-w-xl overflow-hidden rounded-lg border-0 p-0 text-[#476704] dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => props?.handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c] uppercase">
                                    {props?.selectedCell?.staffInfo?.fullName} - {t(props?.selectedCell?.date?.dayOfWeek)} {props?.selectedCell?.date?.date}/{props?.selectedCell?.date?.month}
                                </div>
                                <div className="panel">
                                    <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                        <div className="flex flex-wrap items-center">
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex gap-1">
                                                <div className="flex-1">
                                                    {/* <Select
                                                        className="zIndex-10 w-[190px]"
                                                        id="unidepartmentparentIdtId"
                                                        name="departmentparentId"
                                                        value={list_type?.find((e: any) => e.value === type)}
                                                        placeholder={t('choose_type_shift')}
                                                        onChange={(e: any) => {
                                                            if (e) {
                                                                handleFilterType(e);
                                                            }
                                                        }}
                                                        options={list_type}
                                                        maxMenuHeight={160}
                                                    /> */}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        autoComplete="off" type="text" className="form-input w-auto"
                                                        placeholder={`${t('search')}`} value={search}
                                                        onKeyDown={(e) => handleKeyPress(e)}
                                                        onChange={(e) => (e.target.value === '' ? handleSearch('') : setSearch(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="datatables">
                                        {
                                            loading ? <div className='flex justify-center'><Loader /></div> : <DataTable
                                                highlightOnHover
                                                className="table-hover custom_table whitespace-nowrap"
                                                records={shift?.data}
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
                                        }

                                    </div>
                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => props?.handleCancel()}>
                                            {t('cancel')}
                                        </button>
                                        <button
                                            data-testId="submit-modal-btn" type="submit"
                                            className="btn btn-primary add-button ltr:ml-4 rtl:mr-4"
                                            onClick={() => handleSubmit()}
                                            disabled={selectedShifts?.length === 0}
                                        >
                                            {props.selectedCell?.shiftInfo ? t('update') : t('add_new')}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition >
    );
};

export default AddShiftTimekeepingModal;
