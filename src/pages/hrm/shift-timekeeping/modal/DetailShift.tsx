import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import { convertTimeFormat, showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { PAGE_NUMBER_DEFAULT, PAGE_SIZES, PAGE_SIZES_DEFAULT } from '@/utils/constants';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { Shifts } from '@/services/swr/shift.swr';
import { addUsersShift } from '@/services/apis/user-shift.api';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import { DetailShiftTimekeeping } from '@/services/apis/shift-timekeeping.api';
import { Loader, Tabs } from '@mantine/core';
import dayjs from 'dayjs';
import moment from 'moment';
import UpdateShiftTimekeeping from "./UpdateShiftTimekeeping"
interface Props {
    [key: string]: any;
}

const DetailShift = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [selectedShifts, setSelectedShifts] = useState<any[]>([]);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [search, setSearch] = useState<any>('');
    const [filter, setFilter] = useState<any>({
        search: '',
        type: '',
    });
    const [loading, setLoading] = useState(true);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [showAddShift, setShowAddShift] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [detailInfo, setDetailInfo] = useState<any>();
    const [shiftTimekeeping, setShiftTimekeeping] = useState<any>();
    const [history, setHistory] = useState<any[]>([]);
    const handleUpdate = (info: any) => {
        setShiftTimekeeping(info)
        setOpenModal(true)
    }
    const handleCancelUpdate = () => {
        setOpenModal(false)
        setShiftTimekeeping(null)
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
    }, [router?.query?.search, router?.query?.type]);
    // get data
    const { data: shift, pagination, mutate } = Shifts({ sortBy: 'id.ASC', ...router.query });
    const getData = () => {
        DetailShiftTimekeeping(props?.selectedShift).then((res) => {
            setDetailInfo(res?.data)
            setLoading(false);
        }).catch((err) => {
            console.log(err);
            setLoading(false);
        })
    }
    useEffect(() => {
        getData();
    }, [props?.selectedShift]);

    const handleChangeSelect = (value: any, id: any) => {
        if (value) {
            setSelectedShifts(prev => [...prev, id])
        } else {
            setSelectedShifts(prev => prev?.filter(e => e !== id))
        }
    }

    const dataTest = [
        {
            timeSheet: "2024-08-25T23:22:22.000Z"
        }
    ]

    const historyColumns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        {
            accessor: 'timeSheet',
            title: `${t('time')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{dayjs(records?.historyTimekeeping?.timeSheet).format('HH:mm DD-MM-YYYY')}</span>,
        },
        {
            accessor: 'name',
            title: `${t('equipment_type')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{records?.historyTimekeeping?.timekeeper?.name}</span>,
        },
        {
            accessor: 'name',
            title: `${t('description')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{records?.name}</span>,
        }
    ];
    const logsColumns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'createdAt',
            title: `${t('time_update')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{dayjs(records?.createdAt).format('HH:mm DD-MM-YYYY')}</span>,
        },
        {
            accessor: 'startTime',
            title: `${t('time_checkin')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{dayjs(records?.startTime).format('HH:mm')}</span>,
        },
        {
            accessor: 'endTime',
            title: `${t('time_checkout')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{dayjs(records?.endTime).format('HH:mm')}</span>,
        },
        { accessor: 'description', title: `${t('description')}`, sortable: false },
    ]
    const handleSubmit = () => {
        const date = props?.selectedCell?.date
        const monthNum = date?.month < 10 ? `0${date.month}` : `${date.month}`
        const dayString = `${date?.yearNum}-${monthNum}-${date?.date}`
        const dataSubmit = {
            startDay: dayString,
            endDay: dayString,
            userId: props?.selectedCell?.staffInfo?.id,
            details: selectedShifts?.map((id: any) => ({
                workingDay: dayString,
                shiftId: id
            }))
        };
        addUsersShift(dataSubmit).then((res: any) => {
            showMessage(`${t('Successfully created work shifts for user')}`, 'success');
            props.mutate()
            props?.handleCancel();
        }).catch((err: any) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }
    const handleCancel = () => {
        setShowAddShift(false);
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
                            <Dialog.Panel className="panel w-full max-w-[45rem] overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => props?.handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c] text-[#476704]">
                                    {/* <span>{t('shift_of_staff')} </span> */}
                                    <span className='uppercase'>{props?.selectedCell?.staffInfo?.fullName} - {t(props?.selectedCell?.date?.dayOfWeek)} {props?.selectedCell?.date?.date}/{props?.selectedCell?.date?.month}</span>
                                </div>
                                {
                                    loading ? <div className="flex justify-center mb-4"><Loader /></div> : <div className="panel">
                                        <h1 className='uppercase text-center text-black'>{props?.selectedCell?.staffInfo?.fullName}</h1>
                                        <h1 className='uppercase text-center text-black'>
                                            {t(props?.selectedCell?.date?.dayOfWeek)} - {props?.selectedCell?.date?.date}/{props?.selectedCell?.date?.month}/{props?.selectedCell?.date?.yearNum}
                                        </h1>
                                        <div className='flex justify-between p-2' style={{ borderTop: "1px solid #ccc" }}>
                                            <div className='col col-3'>
                                                <div style={{ fontWeight: "bold" }}>
                                                    {detailInfo?.shift?.name}
                                                </div>
                                                <div>
                                                    {`${convertTimeFormat(detailInfo?.shift?.startTime)} - ${convertTimeFormat(detailInfo?.shift?.endTime)}`}
                                                </div>
                                            </div>
                                            <div
                                                className='col col-3 flex'
                                                style={{
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <input
                                                    type='checkbox'
                                                    name=''
                                                    checked={detailInfo?.startTime}
                                                    disabled
                                                    style={{
                                                        transform: 'scale(1.3)',
                                                        marginRight: "5px",
                                                        marginBottom: "0.375rem"
                                                    }}
                                                />
                                                <label>{detailInfo?.startTime ? dayjs(detailInfo?.startTime).format('HH:mm') : '-:-'}</label>
                                            </div>
                                            <div
                                                className='col col-3 flex'
                                                style={{
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <input
                                                    type='checkbox'
                                                    name=''
                                                    checked={detailInfo?.endTime}
                                                    disabled
                                                    style={{
                                                        transform: 'scale(1.3)',
                                                        marginRight: "5px",
                                                        marginBottom: "0.375rem"
                                                    }}
                                                />
                                                <label>{detailInfo?.endTime ? dayjs(detailInfo?.endTime).format('HH:mm') : '-:-'}</label>
                                            </div>
                                            <div
                                                className='col col-3 flex'
                                                style={{
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => { handleUpdate(detailInfo) }}
                                                >
                                                    <IconNewEdit
                                                        color="#476704"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2" style={{ borderTop: "1px solid #ccc" }}>
                                            <span style={{ fontWeight: "bold" }}>{t('totalWork')}: </span>
                                            <span>{detailInfo?.totalWork ?? 0}</span>
                                        </div>
                                        <div style={{ borderTop: "1px solid #ccc" }}>
                                            <Tabs defaultValue="history">
                                                <Tabs.List>
                                                    <Tabs.Tab value="history">
                                                        <h1 style={{ fontWeight: "bold" }}>{t('timekeeping_history')}</h1>
                                                    </Tabs.Tab>
                                                    <Tabs.Tab value="logs">
                                                        <h1 style={{ fontWeight: "bold" }}>{t('logs')}</h1>
                                                    </Tabs.Tab>
                                                </Tabs.List>
                                                <Tabs.Panel value="history">
                                                    <div className="datatables">
                                                        <DataTable
                                                            highlightOnHover
                                                            className="whitespace-nowrap table-hover"
                                                            records={detailInfo?.shiftTimekeepingDetail}
                                                            // records={dataTest}
                                                            columns={historyColumns}
                                                            sortStatus={sortStatus}
                                                            onSortStatusChange={setSortStatus}
                                                            minHeight={200}
                                                        />
                                                    </div>
                                                </Tabs.Panel>

                                                <Tabs.Panel value="logs">
                                                    <div className="datatables">
                                                        <DataTable
                                                            highlightOnHover
                                                            className="whitespace-nowrap table-hover"
                                                            records={detailInfo?.shiftTimekeepingLog}
                                                            columns={logsColumns}
                                                            sortStatus={sortStatus}
                                                            onSortStatusChange={setSortStatus}
                                                            minHeight={200}
                                                        />
                                                    </div>
                                                </Tabs.Panel>

                                            </Tabs>
                                        </div>
                                    </div>
                                }

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                    {
                        shiftTimekeeping && <UpdateShiftTimekeeping
                            openModal={openModal}
                            handleCancel={handleCancelUpdate}
                            info={shiftTimekeeping}
                            selectedCell={props?.selectedCell}
                            getData={getData}
                            shiftInfo={detailInfo?.shift}
                        />
                    }
                </div>
            </Dialog>
        </Transition >
    );
};

export default DetailShift;
