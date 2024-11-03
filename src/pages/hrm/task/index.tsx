import React, { useEffect, useMemo, useState } from 'react';

import IconDownload from '@/components/Icon/IconDownload';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setPageTitle } from '@/store/themeConfigSlice';
import { showMessage } from '@/@core/utils';
import { PAGE_NUMBER_DEFAULT, PAGE_SIZES, PAGE_SIZES_DEFAULT } from '@/utils/constants';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Link from 'next/link';
import dayjs from 'dayjs';
import Select from 'react-select';

import TaskList from './task_list.json';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPlus from '@/components/Icon/IconPlus';
import TaskModal from './modal/TaskModal';
import { ActionIcon, Button, Checkbox, MultiSelect, Stack, TextInput } from '@mantine/core';
import { useRouter } from 'next/router';
import IconFile from '@/components/Icon/IconFile';
import IconTag from '@/components/Icon/IconTag';
import IconEdit from '@/components/Icon/IconEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import list_departments from '../department/department_list.json';
import { IconFilter } from '@/components/Icon/IconFilter';
import { Humans } from '@/services/swr/human.swr';
import { Tasks } from '@/services/swr/task.swr';
import { deleteTask } from '@/services/apis/task.api';
import { Departments } from '@/services/swr/department.swr';
import { DropdownDepartment, DropdownPosition } from '@/services/swr/dropdown.swr';
import { useProfile } from '@/services/swr/profile.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const Task = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(setPageTitle(`${t('task_list')}`));
    });
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [total, setTotal] = useState(0);
    const [getStorge, setGetStorge] = useState<any>();
    const [data, setData] = useState<any>();
    const [active, setActive] = useState<any>('');
    const [search, setSearch] = useState<any>("");
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [openModal, setOpenModal] = useState(false);
    const { data: recordsData, pagination, isLoading, mutate } = Tasks({ sortBy: 'id.DESC', ...router.query });
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });

    const { data: permission } = useProfile();
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

    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment([{ value: 'all', label: 'Tất cả' }, ...dropdownDepartment?.data]);
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationDepartment]);
    useEffect(() => {
        setTotal(getStorge?.length);
        setPageSize(PAGE_SIZES_DEFAULT);
    }, [getStorge, getStorge?.length, page]);
    // useEffect(() => {
    //     setShowLoader(false);
    // }, [recordsData?.data]);
    const handleActive = (value: any) => {
        setActive(value);
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                status: value,
            },
        });
    };
    const handleEdit = (data: any) => {
        router.push(`/hrm/task/${data?.id}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
    };
    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(paginationDepartment?.page + 1);
        }, 1000);
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
                title: `${t('delete_task')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data.name}?`,
                padding: '2em',
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                showCancelButton: true,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    deleteTask(data?.id)
                        .then(() => {
                            mutate();
                            showMessage(`${t('delete_task_success')}`, 'success');
                        })
                        .catch((err) => {
                            showMessage(`${err?.response?.data?.message}`, 'error');
                        });
                }
            });
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
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            // Xử lý sự kiện khi nhấn phím Enter ở đây
            handleSearch(search)
        }
    };
    const handleDepartment = (param: any) => {
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                departmentIdOfHuman: param?.value === 0 ? '' : param?.value,
            },
        });
    };

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
    const handleDetail = (item: any) => {
        router.push(`/hrm/task/detail/${item?.id}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
    };
    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        {
            accessor: 'creator',
            title: `${t('creator_task')}`,
            sortable: false,
            render: (records: any) => {
                return <span>{records?.createdBy?.fullName}</span>;
            },
        },
        {
            accessor: 'name',
            title: `${t('name_task')}`,
            sortable: false,
            render: (records: any) => {
                return <span onClick={() => handleDetail(records)}>{records?.name}</span>;
            },
        },
        // {
        //     accessor: 'department',
        //     title: `${t('department')}`,
        //     render: (records: any) => {
        //         return <span>{records?.assignee?.department?.name}</span>
        //     }
        // },
        {
            accessor: 'executor',
            title: `${t('executor_task')}`,
            sortable: false,
            render: (records: any) => {
                return <span>{records?.assignee?.fullName}</span>;
            },
        },
        {
            accessor: 'dueDate',
            title: `${t('deadline_task')}`,
            sortable: false,
            render: (records: any, index: any) => (records?.dueDate ? <span>{`${dayjs(records?.dueDate).format('DD/MM/YYYY')}`}</span> : <></>),
        },
        {
            accessor: 'status',
            title: `${t('status')}`,
            render: (records: any, index: any) => (
                <span>{records?.status === 'UNFINISHED' ? `${t('Unfinished_task')}` : records?.status === 'DOING' ? `${t('Doing_task')}` : `${t('finsished_task')}`}</span>
            ),
        },
        {
            accessor: 'progress',
            title: `${t('%_task')}`,
            sortable: false,
            render: (records: any, index: any) => (records?.progress ? <span>{records?.progress}%</span> : <>0%</>),
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: 250,
            style: { whiteSpace: 'pre-wrap' },
            titleClassName: 'text-center',
            render: (records: any) => {
                return (
                    <div className="mx-auto flex items-center justify-start gap-2">
                        <RBACWrapper permissionKey={['task:findOne']} type={'AND'}>
                            <div className="w-[auto]">
                                <button type="button" className="button-detail" onClick={() => handleDetail(records)}>
                                    <IconNewEye />
                                    <span>{t('detail')}</span>
                                </button>
                            </div>
                        </RBACWrapper>
                        {records?.createdById !== permission?.data?.id &&
                            records?.assignee?.id !== permission?.data?.id &&
                            records?.coordinators?.some((coordinator: any) => coordinator.id === permission?.data?.id) ? (
                            <></>
                        ) : (
                            <RBACWrapper permissionKey={['task:update']} type={'AND'}>
                                <div className="w-[auto]">
                                    <button type="button" className="button-edit" onClick={() => handleEdit(records)}>
                                        <IconNewEdit />
                                        <span>{t('edit')}</span>
                                    </button>
                                </div>
                            </RBACWrapper>
                        )}
                        {records?.createdById === permission?.data?.id && (
                            <RBACWrapper permissionKey={['task:remove']} type={'AND'}>
                                <div className="w-[auto]">
                                    <button type="button" className="button-delete" onClick={() => handleDelete(records)}>
                                        <IconNewTrash />
                                        <span>{t('delete')}</span>
                                    </button>
                                </div>
                            </RBACWrapper>
                        )}
                    </div>
                );
            },
        },
    ];
    return (
        <div>
            {/* {isLoading && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )} */}
            <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('task_list')}</span>
                </li>
            </ul>
            <div className="panel mt-6">
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <RBACWrapper permissionKey={['task:create']} type={'AND'}>
                        <div className="flex flex-wrap items-center">
                            <Link href="/hrm/task/AddNewTask">
                                <button type="button" className=" button-table button-create m-1">
                                    <IconNewPlus />
                                    <span className="uppercase">{t('add')}</span>
                                </button>
                            </Link>
                        </div>
                    </RBACWrapper>
                </div>
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center gap-1">
                        <IconFilter />
                        <span>{t('Quick filter')} :</span>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className={active === '' ? 'cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704]' : 'cursor-pointer rounded border p-2'} onClick={() => handleActive('')}>
                                {t('all')}
                            </div>
                            <div
                                className={active === 'UNFINISHED' ? 'cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704]' : 'cursor-pointer rounded border p-2'}
                                onClick={() => handleActive('UNFINISHED')}
                            >
                                {t('Pending')}
                            </div>
                            <div
                                className={active === 'DOING' ? 'cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704]' : 'cursor-pointer rounded border p-2'}
                                onClick={() => handleActive('DOING')}
                            >
                                {t('In progress')}
                            </div>
                            <div
                                className={active === 'FINISHED' ? 'cursor-pointer rounded border bg-[#E9EBD5] p-2 text-[#476704]' : 'cursor-pointer rounded border p-2'}
                                onClick={() => handleActive('FINISHED')}
                            >
                                {t('Completed')}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} value={search} onKeyDown={(e) => handleKeyPress(e)} onChange={(e) => e.target.value === "" ? handleSearch("") : setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="table-hover custom_table whitespace-nowrap"
                        records={recordsData?.data}
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
                <TaskModal openModal={openModal} setOpenModal={setOpenModal} data={data} totalData={getStorge} setData={setData} setGetStorge={setGetStorge} />
            </div>
        </div>
    );
};

export default Task;
