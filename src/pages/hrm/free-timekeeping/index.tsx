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
import Select from 'react-select';

// ** Styles
//
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

// json
import TimekeepingModal from './modal/TimekeepingModal';
import IconFolderMinus from '@/components/Icon/IconFolderMinus';
import IconDownload from '@/components/Icon/IconDownload';
import IconEye from '@/components/Icon/IconEye';
import IconChecks from '@/components/Icon/IconChecks';
import { flattenDepartments, getDaysOfMonth, toDateString } from '@/utils/commons';
import Link from 'next/link';
import IconTrash from '@/components/Icon/IconTrash';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import { FreeTimekeepings } from '@/services/swr/free-timekeeping.swr';
import { withCoalescedInvoke } from 'next/dist/lib/coalesced-function';
import { DeleteFreeTimekeeping } from '@/services/apis/free-timekeeping.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
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
	const dispatch = useDispatch();
	const { t } = useTranslation();
	useEffect(() => {
		dispatch(setPageTitle(`${t('freeTimekeeping')}`));
	});
	const [listDay, setListDay] = useState<undefined | string[]>(undefined);
	const router = useRouter();
	const [showLoader, setShowLoader] = useState(true);
	const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
	const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
	const [recordsData, setRecordsData] = useState<any>();
	const [total, setTotal] = useState(0);
	const [getStorge, setGetStorge] = useState<any>();
	const [data, setData] = useState<any>();
	const [search, setSearch] = useState<any>('');

	const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

	const [openModal, setOpenModal] = useState(false);
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;
	const currentYear = currentDate.getFullYear();
	const [isSelected, setIsSelected] = useState<any>(undefined);
	const [isDelete, setDelete] = useState<undefined | string[]>(undefined);
	const [listSelected, setListSelected] = useState<any>([]);

	const [groupedOptions, setGroupedOptions] = useState<any>([
		{
			label: `${t('department')}`,
			options: [],
		},
	]);
	const { data: freeTimekeeping, pagination, mutate } = FreeTimekeepings({ sortBy: 'id.DESC', ...router.query, status: 1 });

	useEffect(() => {
		listAllDepartmentTree({
			page: 1,
			perPage: 100,
		})
			.then((res: any) => {
				const listDepartment_ = flattenDepartments(res?.data);
				setGroupedOptions([
					{
						label: `${t('department')}`,
						options: listDepartment_,
					},
				]);
			})
			.catch((err: any) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		setShowLoader(false);
	}, [recordsData]);

	const handleEdit = (data: any) => {
		setOpenModal(true);
		setData(data);
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
				title: `${t('delete_staff_from_free_timekeeping')}`,
				text: `${t('delete')} ${data.fullName}`,
				padding: '2em',
				showCancelButton: true,
				cancelButtonText: `${t('cancel')}`,
				confirmButtonText: `${t('confirm')}`,
				reverseButtons: true,
			})
			.then((result) => {
				if (result.value) {
					DeleteFreeTimekeeping({ id: data?.id })
						.then((res) => {
							showMessage(`${t('delete_success')}`, 'success');
							mutate();
						})
						.catch((err) => {
							showMessage(`${err?.response?.data?.message}`, 'error');
						});
				}
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
			handleSearch(search);
		}
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

	const handleSelect = (data: any, selected: any) => {
		let listSelectTempt = [];
		if (selected) {
			listSelectTempt = [...listSelected, data?.id];
		} else {
			listSelectTempt = listSelected?.filter((item: any) => {
				return item !== data?.id;
			});
		}
		setListSelected(listSelectTempt);
		if (selected || listSelectTempt.length > 0) {
			setIsSelected(true);
		} else {
			setIsSelected(false);
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
			title: `${t('personel_code')}`,
			sortable: false,
		},
		{
			accessor: 'fullName',
			title: `${t('personel_name')}`,
			sortable: false,
		},
		{
			accessor: 'department',
			title: `${t('department')}`,
			sortable: false,
			render: (records: any, index: any) => <span>{records?.department?.name}</span>,
		},
		{
			accessor: 'duty',
			title: `${t('personel_position')}`,
			sortable: false,
			render: (records: any, index: any) => <span>{records?.position?.name}</span>,
		},

		{
			accessor: 'action',
			title: `${t('action')}`,
			titleClassName: 'text-center',
			render: (records: any) => (
				<div className="mx-auto flex w-max items-center gap-2">
					<RBACWrapper permissionKey={['freeTimekeeping:remove']} type={'AND'}>
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
	];

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
		setPage(page);
		return pageSize;
	};

	const handleChangeDepartment = (de: any) => {
		if (de) {
			router.replace({
				pathname: router.pathname,
				query: {
					...router.query,
					departmentId: de.id,
				},
			});
		} else {
			delete router.query.departmentId;
			router.replace({
				pathname: router.pathname,
				query: {
					...router.query,
				},
			});
		}
	};

	return (
		<div>
			{showLoader && (
				<div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
					<IconLoading />
				</div>
			)}
			<div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
				<ul className="mb-1 flex space-x-2 rtl:space-x-reverse">
					<li>
						<Link href="/hrm/dashboard" className="text-primary hover:underline">
							{t('dashboard')}
						</Link>
					</li>
					<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
						<span>{t('attendance_exemption')}</span>
					</li>
				</ul>
			</div>
			<div className="panel mt-6">
				<div className="mb-4.5 flex flex-col justify-between gap-1 md:flex-row md:items-center">
					<div className="flex flex-wrap items-center">
						<RBACWrapper permissionKey={['freeTimekeeping:add']} type={'AND'}>
							<button type="button" className="button-table button-export m-1" style={{ padding: '0.5rem' }} onClick={() => setOpenModal(true)}>
								<IconNewPlus />
								<span className="uppercase">{t('add_personnel')}</span>
							</button>
						</RBACWrapper>

						{/* <button type="button" className="btn btn-primary btn-sm m-1 custom-button" >
                            <IconFolderMinus className="ltr:mr-2 rtl:ml-2" />
                            Nhập file
                        </button> */}
						{/* <button type="button" className="button-table button-download" >
                            <IconNewDownload2 className="ltr:mr-2 rtl:ml-2" />
                            <span className="uppercase">Xuất file excel</span>
                        </button> */}
						{isSelected && (
							<button type="button" className="btn btn-primary btn-sm custom-button m-1" onClick={() => handleDelete({})}>
								<IconTrash className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
								{t('delete')}
							</button>
						)}
					</div>
					<div className="flex gap-2">
						{/* <div className='flex gap-1'>
                        <div className="flex items-center min-w-[auto]" style={{width: "50%"}}>{t('choose_month')}</div>
                        <Flatpickr
                            className='form-input'
                            options = {{
                            // dateFormat: 'm/Y',
                            defaultDate: new Date(),
                            locale: {
                                ...Vietnamese
                            },
                                plugins: [
                                    monthSelectPlugin(monthSelectConfig) // Sử dụng plugin với cấu hình
                                ]
                            }}
                            onChange={(selectedDates, dateStr) => {
                               handleChangeMonth(selectedDates, dateStr)
                            }}
                         />
                        </div> */}
						<Select
							className="zIndex-10 w-[200px]"
							options={groupedOptions}
							placeholder={t('choose_department')}
							styles={customStyles}
							formatGroupLabel={formatGroupLabel}
							onChange={(e: any) => {
								handleChangeDepartment(e);
							}}
							isClearable
						/>
						<input
							autoComplete="off"
							type="text"
							className="form-input w-auto"
							placeholder={`${t('search')}`}
							onKeyDown={(e) => handleKeyPress(e)}
							onChange={(e) => (e.target.value === '' ? handleSearch('') : setSearch(e.target.value))}
						/>
					</div>
				</div>
				<div className="datatables">
					<DataTable
						highlightOnHover
						className="table-hover custom_table whitespace-nowrap"
						records={freeTimekeeping?.data}
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
			<TimekeepingModal openModal={openModal} setOpenModal={setOpenModal} data={data} totalData={getStorge} setData={setData} setGetStorge={setGetStorge} mutate={mutate} />
		</div>
	);
};

export default Department;
