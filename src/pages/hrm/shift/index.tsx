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
// API
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
// helper
import { capitalize, formatDate, showMessage } from '@/@core/utils';
// icons
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPlus from '@/components/Icon/IconPlus';
import Select from 'react-select';

import { useRouter } from 'next/router';
import ShiftModal from './modal/ShiftModal';
import shiftList from './shift.json';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
// json
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { Shifts } from '@/services/swr/shift.swr';
import { deleteShift } from '@/services/apis/shift.api';
import IconNewEye from '@/components/Icon/IconNewEye';

interface Props {
	[key: string]: any;
}

const Duty = ({ ...props }: Props) => {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	useEffect(() => {
		dispatch(setPageTitle(`${t('shift')}`));
	});

	const router = useRouter();

	const [showLoader, setShowLoader] = useState(true);
	const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
	const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
	const [recordsData, setRecordsData] = useState<any>();
	const [total, setTotal] = useState(0);
	const [getStorge, setGetStorge] = useState<any>();
	const [data, setData] = useState<any>();
	const [search, setSearch] = useState<any>('');
	const [type, setType] = useState<any>();
	const [filter, setFilter] = useState<any>({
		search: '',
		type: '',
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
	useEffect(() => {
		const searchQuery = router?.query?.search;

		if (typeof searchQuery === 'string') {
			setSearch(searchQuery);
		} else if (Array.isArray(searchQuery)) {
			setSearch(searchQuery[0] || '');
		} else {
			setSearch('');
		}

		setType(router?.query?.type === '0' ? 'HOUR_BASED' : 'TIME_RANGE');
	}, [router?.query?.search, router?.query?.type]);
	// get data
	const { data: shift, pagination, mutate, loading } = Shifts({ sortBy: 'id.ASC', ...router.query });

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const data = localStorage.getItem('shiftList');
			if (data) {
				setGetStorge(JSON.parse(data));
			} else {
				localStorage.setItem('shiftList', JSON.stringify(shiftList));
			}
		}
	}, []);

	useEffect(() => {
		setShowLoader(false);
	}, [recordsData]);

	const handleEdit = (data: any) => {
		router.push(`/hrm/shift/${data}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
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
				title: `${t('delete_shift')}`,
				html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data.name}?`,
				padding: '2em',
				showCancelButton: true,
				cancelButtonText: `${t('cancel')}`,
				confirmButtonText: `${t('confirm')}`,
				reverseButtons: true,
			})
			.then((result) => {
				if (result.value) {
					deleteShift(data?.id)
						.then(() => {
							mutate();
							showMessage(`${t('delete_shift_success')}`, 'success');
						})
						.catch((err) => {
							showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
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
	const handleFilterType = (param: any) => {
		setFilter({
			...filter,
			type: param?.value === 'TIME_RANGE' ? 1 : 0,
		});
		router.replace({
			pathname: router.pathname,
			query: {
				...router.query,
				type: param?.value ? (param?.value === 'TIME_RANGE' ? 1 : 0) : '',
			},
		});
	};

	const handleDetail = (data: any) => {
		setData(data);
	};
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
			accessor: 'type',
			title: `${t('type_shift')}`,
			sortable: false,
			render: (records: any, index: any) => <span>{records?.type === 1 ? t('shift_base_time') : t('shift_base_total_time')}</span>,
		},
		{
			accessor: 'startTime',
			title: `${t('from_time')}`,
			sortable: false,
			render: (records: any, index: any) => <span onClick={(records) => handleDetail(records)}>{records?.startTime}</span>,
		},
		{
			accessor: 'endTime',
			title: `${t('end_time')}`,
			sortable: false,
			render: (records: any, index: any) => <span>{records?.endTime}</span>,
		},
		{
			accessor: 'totalHours',
			title: `${t('time_shift')}`,
			sortable: false,
			render: (records: any, index: any) => <span>{records?.totalHours}</span>,
		},
		{
			accessor: 'action',
			title: `${t('action')}`,
			titleClassName: 'text-center',
			render: (records: any) => (
				<div className="mx-auto flex w-max items-center gap-2">
					<RBACWrapper permissionKey={['shift:findOne']} type={'AND'}>
						<div className="w-[auto]">
							<Link href={`/hrm/shift/detail/${records?.id}?pageL=${pagination?.page}&perPage=${pagination?.perPage}`}>
								<button type="button" className="button-detail">
									<IconNewEye /> <span>{t('detail')}</span>
								</button>
							</Link>
						</div>
					</RBACWrapper>
					<RBACWrapper permissionKey={['shift:update']} type={'AND'}>
						<div className="w-[auto]">
							<button type="button" className="button-edit" onClick={() => handleEdit(records?.id)}>
								<IconNewEdit />
								<span>{t('edit')}</span>
							</button>
						</div>
					</RBACWrapper>
					<RBACWrapper permissionKey={['shift:remove']} type={'AND'}>
						<div className="w-[auto]">
							<button type="button" className="button-delete" onClick={() => handleDelete(records)}>
								<IconNewTrash />
								<span>{t('delete')}</span>
							</button>
						</div>
					</RBACWrapper>
				</div>
			),
		},
	]
	return (
		<div>
			<ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
				<li>
					<Link href="/hrm/dashboard" className="text-primary hover:underline">
						{t('dashboard')}
					</Link>
				</li>
				<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
					<span>{t('shift')}</span>
				</li>
			</ul>
			{/* {(showLoader || loading) && (
				<div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
					<IconLoading />
				</div>
			)} */}
			<title>{t('shift')}</title>
			<div className="panel mt-6">
				<div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
					<div className="flex flex-wrap items-center">

						<RBACWrapper permissionKey={['shift:create']} type={'AND'}>
							<Link href="/hrm/shift/create">
								<button type="button" className=" button-table button-create m-1">
									<IconNewPlus />
									<span className="uppercase">{t('add')}</span>
								</button>
							</Link>
						</RBACWrapper>
						
					</div>
					<div className="flex gap-2">
						<div className="flex gap-1">
							<div className="flex-1">
								<Select
									className="zIndex-10 w-[190px]"
									id="unidepartmentparentIdtId"
									name="departmentparentId"
									value={list_type?.find((e: any) => e.value === type)}
									placeholder={t('choose_type_shift')}
									// defaultValue={'TIME_RANGE'}
									onChange={(e: any) => {
										if (e) {
											handleFilterType(e);
										}
									}}
									options={list_type}
									maxMenuHeight={160}
								/>
							</div>
							<div className="flex-1">
								<input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} value={search} onKeyDown={(e) => handleKeyPress(e)} onChange={(e) => e.target.value === "" ? handleSearch("") : setSearch(e.target.value)} />
							</div>
						</div>
					</div>
				</div>
				<div className="datatables">
					<DataTable
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
				</div>
			</div>
			<ShiftModal openModal={openModal} setOpenModal={setOpenModal} data={data} totalData={getStorge} setData={setData} setGetStorge={setGetStorge} />
		</div>
	);
};

export default Duty;
