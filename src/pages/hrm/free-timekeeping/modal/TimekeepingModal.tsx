import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';
import Select from "react-select";
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import IconX from '@/components/Icon/IconX';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../store/themeConfigSlice';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
// API
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
// helper
import { capitalize, formatDate, showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPlus from '@/components/Icon/IconPlus';
import withReactContent from 'sweetalert2-react-content';
import { useRouter } from 'next/router';

// json
import IconFolderMinus from '@/components/Icon/IconFolderMinus';
import IconDownload from '@/components/Icon/IconDownload';
import IconCalendar from '@/components/Icon/IconCalendar';

import IconNewPlus from '@/components/Icon/IconNewPlus';
import { Humans } from '@/services/swr/human.swr';
import { FreeTimekeepings } from '@/services/swr/free-timekeeping.swr';
import { CreateFreeTimekeeping } from '@/services/apis/free-timekeeping.api';
import { listAllDepartmentTree } from '@/services/apis/department.api';
import { flattenDepartments } from '@/utils/commons';
import { Positions } from '@/services/swr/position.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

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

const TimekeepingModal = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(setPageTitle(`${t('freeTimekeeping')}`));
    });
    const [listDepartment, setListDepartment] = useState<any>();
    const [listDuty, setListDuty] = useState<any>([]);
    const router = useRouter();
    const [display, setDisplay] = useState('tree')
    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [recordsData, setRecordsData] = useState<any>();
    const [total, setTotal] = useState(0);
    const [getStorge, setGetStorge] = useState<any>();
    const [data, setData] = useState<any>();
    const [currentPage, setCurrentPage] = useState<any>(1);
    const [selectedPosition, setSelectedPosition] = useState<any>();
    const [selectedDepartment, setSelectedDepartment] = useState<any>();
    const [search, setSearch] = useState("");
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const { data: freeTimekeeping, pagination, mutate } = FreeTimekeepings({ sortBy: 'id.ASC', page: currentPage, perPage: 10, status: 0, positionId: selectedPosition, departmentId: selectedDepartment, search: search });
    const { data: position } = Positions({ sortBy: 'id.ASC', page: 1, perPage: 50 });

    const [groupedOptions, setGroupedOptions] = useState<any>([
        {
            label: `${t('department')}`,
            options: []
        }
    ]
    );
    const [openModal, setOpenModal] = useState(false);
    const [codeArr, setCodeArr] = useState<string[]>([]);
    useEffect(() => {
        listAllDepartmentTree({
            page: 1,
            perPage: 100
        }).then((res: any) => {
            const listDepartment_ = flattenDepartments(res?.data);
            setGroupedOptions([
                {
                    label: `${t('department')}`,
                    options: listDepartment_
                }
            ])
        }).catch((err: any) => {
            console.log(err);
        }
        );
    }, [])

    const [treeview1, setTreeview1] = useState<string[]>(['images']);
    const [listSelected, setListSelected] = useState<any>([]);



    const [treeview2, setTreeview2] = useState<string[]>(['parent']);
    const toggleTreeview2 = (name: any) => {
        if (treeview2.includes(name)) {
            setTreeview2((value) => value.filter((d) => d !== name));
        } else {
            setTreeview2([...treeview2, name]);
        }
    };

    useEffect(() => {
        setShowLoader(false);
    }, [recordsData]);

    const handleSearch = (param: any) => {
        setSearch(param);
    };
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            handleSearch(search)
        }
    };

    const handleChangeSelect = (isSelected: any, record: any) => {
        if (isSelected) {
            setListSelected([...listSelected, record]);
        } else {
            setListSelected(listSelected?.filter((item: any) => item.id !== record.id));
        };
    };
    // const handleChangePage = (page: number, pageSize: number) => {
    //     router.replace(
    //         {
    //             pathname: router.pathname,
    //             query: {
    //                 ...router.query,
    //                 page: page,
    //                 perPage: pageSize,
    //             },
    //         },
    //         undefined,
    //         { shallow: true },
    //     );
    //     return pageSize;
    // };


    const columns = [
        {
            accessor: 'check',
            title: `${t('choose')}`,
            sortable: false, render: (records: any) => <input autoComplete="off" type="checkbox" onChange={(e) => handleChangeSelect(e.target.checked, records)} className='form-checkbox' />
        },
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(currentPage - 1) * pageSize + index + 1}</span>,
        },

        { accessor: 'fullName', title: `${t('personel_name')}`, sortable: false },
        { accessor: 'code', title: `${t('personel_code')}`, sortable: false },
        {
            accessor: 'department',
            title: `${t('department')}`,
            sortable: false,
            render: (record: any) => <span>{record?.department?.name}</span>
        },
        {
            accessor: 'position',
            title: `${t('personel_position')}`,
            sortable: false,
            render: (record: any) => <span>{record?.department?.name}</span>
        },

    ];

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
        setListSelected([])
        setSearch("");
        setSelectedDepartment(null);
        setSelectedPosition(null);
    };

    const handleAddToList = () => {
        const dataSubmit = {
            userIds: listSelected?.map((per: any) => per.id)
        }
        CreateFreeTimekeeping(dataSubmit).then((res: any) => {
            showMessage(`${t('add_personnel_to_list_success')}`, 'success');
            mutate();
            props.mutate();
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
        // showMessage(`${t('add_personnel_to_list_success')}`, 'success');
        props.setOpenModal(false);
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
                            <Dialog.Panel className="panel w-full max-w-5xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {`${t('add_exempt_timekeeping')}`}
                                </div>
                                <div className="">
                                    {showLoader && (
                                        <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                                            <IconLoading />
                                        </div>
                                    )}
                                    <div className="panel mt-6">
                                        <div className="mb-4.5 flex flex-col justify-between gap-20 md:flex-row md:items-center">
                                            <RBACWrapper permissionKey={['freeTimekeeping:add']} type={'AND'}>
                                                <div className="flex flex-wrap items-center">
                                                    {
                                                        listSelected?.length > 0 &&
                                                        <button type="button" className="button-table" onClick={() => handleAddToList()} style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
                                                            <IconNewPlus />
                                                            <span className="uppercase">Thêm vào danh sách</span>
                                                        </button>
                                                    }
                                                </div>
                                            </RBACWrapper>
                                            <div className='flex flex-1 flex-wrap gap-2 max-w-[60%] mb-1'>
                                                <div className="flex flex-1">
                                                    <Select
                                                        className="zIndex-10 w-[200px]"
                                                        options={groupedOptions}
                                                        placeholder={t('choose_department')}
                                                        styles={customStyles}
                                                        // value={router?.query?.departmentId}

                                                        formatGroupLabel={formatGroupLabel}
                                                        onChange={(e: any) => {
                                                            setSelectedDepartment(e?.value);
                                                        }}
                                                        isClearable
                                                    />
                                                </div>
                                                <div className="flex flex-1">
                                                    <Select
                                                        className="zIndex-10 w-[100%]"
                                                        name='dutyid'
                                                        placeholder={t('select_duty')}
                                                        options={position?.data?.map((item: any) => {
                                                            return {
                                                                value: item.id,
                                                                label: item.name,
                                                            }
                                                        })}
                                                        maxMenuHeight={160}
                                                        onChange={(e: any) => {
                                                            setSelectedPosition(e?.value)
                                                        }}
                                                        isClearable
                                                    />
                                                </div>
                                                <div className="flex flex-1">
                                                    <input
                                                        autoComplete="off"
                                                        type="text"
                                                        className="form-input w-auto ml-1"
                                                        placeholder={`${t('search')}`}
                                                        onChange={(e) => {
                                                            if (e.target.value === "") {
                                                                setSearch("")
                                                            }
                                                        }}
                                                        onKeyDown={(e: any) => {
                                                            if (e.key === "Enter") {
                                                                setSearch(e.target.value)
                                                                setCurrentPage(1)
                                                            }
                                                        }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="datatables">
                                            <DataTable
                                                highlightOnHover
                                                className="whitespace-nowrap table-hover custom_table"
                                                records={freeTimekeeping?.data}
                                                columns={columns}
                                                totalRecords={pagination?.totalRecords}
                                                recordsPerPage={pagination?.perPage}
                                                page={pagination?.page}
                                                onPageChange={(p) => setCurrentPage(p)}
                                                recordsPerPageOptions={PAGE_SIZES}
                                                onRecordsPerPageChange={e => setPageSize(e)}
                                                sortStatus={sortStatus}
                                                onSortStatusChange={setSortStatus}
                                                minHeight={200}
                                                paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default TimekeepingModal;
