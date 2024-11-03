
import 'flatpickr/dist/flatpickr.css';
import 'tippy.js/dist/tippy.css';
import { convertDateFormat2, formatStartDate, formatEndDate, formatDate2 } from '@/utils/commons';
// API
import { useEffect, useRef, useState, useCallback } from 'react';
import { Switch, MantineProvider } from '@mantine/core';
import { allowAccess } from '@/@core/rbac/RBACWrapper';
import { deleteCalendar } from '@/services/apis/calendar.api';
import { IconLoading } from '@/components/Icon/IconLoading';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import Link from 'next/link';
import Select from "react-select";
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import dayjs from "dayjs";
// API
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT, LIST_STATUS_COLOR, LIST_STATUS_MEAN, LIST_STATUS } from '@/utils/constants';
// helper
import { capitalize, formatDate, showMessage } from '@/@core/utils';
import IconPlus from '@/components/Icon/IconPlus';
import IconCalendar from '@/components/Icon/IconCalendar';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useRouter } from 'next/router';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import "flatpickr/dist/plugins/monthSelect/style.css"
import monthSelectPlugin, { Config } from "flatpickr/dist/plugins/monthSelect"

// json
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import "react-dropdown-tree-select/dist/styles.css";
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { LeavingLateEarlys } from '@/services/swr/leaving-late-early.swr';
import { listAllDepartmentTree } from '@/services/apis/department.api';
import { flattenDepartments, toDateString } from '@/utils/commons';
import { DeleteLeavingLateEarly } from '@/services/apis/leaving-late-early.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { useProfile } from '@/services/swr/profile.swr';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { Calendars } from '@/services/swr/calendar.swr';

interface Props {
    [key: string]: any;
}
const monthSelectConfig: Partial<Config> = {
    shorthand: true, //defaults to false
    dateFormat: "m/Y", //defaults to "F Y"
    theme: "light" // defaults to "light"
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
const Calendar = ({ ...props }: Props) => {
	const themeConfig = useSelector((state: IRootState) => state.themeConfig);

	const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;

	const fileInputRef = useRef<HTMLInputElement>(null);
	const dispatch = useDispatch();
	const { t } = useTranslation();
	useEffect(() => {
		dispatch(setPageTitle(`${t('calendar')}`));
	});

	// const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
	const router = useRouter();

	const [showLoader, setShowLoader] = useState(true);
	const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
	const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
	const [recordsData, setRecordsData] = useState<any>();
	const [search, setSearch] = useState<any>('');

	const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

	const { data: userData } = useProfile();
	const { data: announcements, pagination, mutate, isLoading } = Calendars({ sortBy: 'id.DESC', ...router.query });
	let user: any;

	const [groupedOptions, setGroupedOptions] = useState<any>([
		{
			label: `${t('work_department')}`,
			options: [],
		},
	]);

	const LEVEL_INDENT = 20;
	const customStyles = {
		option: (provided: any, state: any) => ({
			...provided,
			paddingLeft: state.data.level ? state.data.level * LEVEL_INDENT : 10,
		}),
	};

	if (typeof window !== 'undefined') {
		const userString = localStorage.getItem('profile');
		user = userString ? JSON.parse(userString) : null;
	}
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
	useEffect(() => {
		const searchQuery = router?.query?.search;

		if (typeof searchQuery === 'string') {
			setSearch(searchQuery);
		} else if (Array.isArray(searchQuery)) {
			setSearch(searchQuery[0] || '');
		} else {
			setSearch('');
		}
	}, [router?.query?.search, router?.query?.departmentId]);
	useEffect(() => {
		setShowLoader(false);
	}, [recordsData]);
	const handleEdit = (data: any) => {
		router.push(`/hrm/calendar/${data?.id}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
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
				title: `${t('delete_job_assignment')}`,
				text: `${t('delete')} ${t('Job assignment')}`,
				padding: '2em',
				showCancelButton: true,
				cancelButtonText: `${t('cancel')}`,
				confirmButtonText: `${t('confirm')}`,
				reverseButtons: true,
			})
			.then((result) => {
				if (result.value) {
					deleteCalendar(data.id)
						.then(() => {
							mutate();
							showMessage(`${t('delete_success')}`, 'success');
						})
						.catch((err) => {
							showMessage(`${err?.response?.data?.message}`, 'error');
						});
				}
			});
	};
	const handleChangeMonth = (month: any) => {
		const month_ = month?.split('/')[0];
		const year_ = month?.split('/')[1];
		router.replace({
			pathname: router.pathname,
			query: {
				...router.query,
				month: Number(month_),
				year: Number(year_),
			},
		});
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

	const handleDetail = (data: any) => {
		router.push(`/hrm/calendar/detail/${data?.id}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
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
	const handleSearchTime = (param: any) => {
		const startDate = dayjs(param[0]);
		const endDate = dayjs(param[1]);

		if (param[1]) {
			router.replace({
				pathname: router.pathname,
				query: {
					...router.query,
					startDate: formatStartDate(startDate),
					endDate: formatEndDate(endDate),
				},
			});
		}
	};

	const handleKeyPress = (event: any) => {
		if (event.key === 'Enter') {
			// Xử lý sự kiện khi nhấn phím Enter ở đây
			handleSearch(search);
		}
	};

	const columns = [
		{
			accessor: 'id',
			title: '#',
			render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
		},
		{
			accessor: 'createdById',
			title: `${t('userCreate')}`,
			sortable: false,
			render: (record: any) => <span>{record?.createdBy?.fullName}</span>,
		},

		{ accessor: 'title', title: `${t('title')}`, sortable: false },
		// {
		//     accessor: 'contentHtml',
		//     title: `${t('content')}`,
		//     sortable: false,
		//     render: (record: any) => {
		//         const contentHtml = record?.contentHtml;
		//         return <span>{contentHtml?.length > 60 ? contentHtml?.substring(0, 60) + '...' : contentHtml}</span>;
		//     }
		// },
		{
			accessor: 'createdAt',
			title: `${t('startDate')}`,
			sortable: false,
			render: (record: any) => <span>{formatDate2(record?.startDate)}</span>,
		},
		{
			accessor: 'createdAt',
			title: `${t('endDate')}`,
			sortable: false,
			render: (record: any) => <span>{formatDate2(record?.endDate)}</span>,
		},
		{
			accessor: 'users',
			title: `${t('Participants')}`,
			sortable: false,
			render: (record: any) => {
				const kq = record?.users?.map((i: any) => i?.fullName).join(', ');
				const department = record?.departments?.map((i: any) => i?.name).join(', ');
				const re = record?.type === 'ALL' ? `${t('all')}` : department === '' && kq === '' ? '' : kq && kq !== '' ? `${department}${department ? ' và ' : ''}${kq}` : `${department}`;
				return <span>{re?.length > 50 ? re?.substring(0, 50) + '...' : re}</span>;
			},
		},
		{
			accessor: 'action',
			title: `${t('action')}`,
			width: 250,
			style: { whiteSpace: 'pre-wrap' },
			titleClassName: 'text-center',
			render: (records: any) => (
				<div className="mx-auto flex items-center justify-start gap-2">
					<div className="w-[auto]">
						<button type="button" className="button-detail" onClick={() => handleDetail(records)}>
							<IconNewEye />
							<span>{t('detail')}</span>
						</button>
					</div>
					{records?.createdById === userData?.data?.id && (
						<RBACWrapper permissionKey={['calendar:update']} type={'AND'}>
							<div className="w-[auto]">
								<button type="button" className="button-edit" onClick={() => handleEdit(records)}>
									<IconNewEdit />
									<span>{t('edit')}</span>
								</button>
							</div>
						</RBACWrapper>
					)}
					{records?.createdById === userData?.data?.id && (
						<RBACWrapper permissionKey={['calendar:delete']} type={'AND'}>
							<div className="w-[auto]">
								<button type="button" className="button-delete" onClick={() => handleDelete(records)}>
									<IconNewTrash />
									<span>{t('delete')}</span>
								</button>
							</div>
						</RBACWrapper>
					)}
				</div>
			),
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
						{t('homepage')}
					</Link>
				</li>
				<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
					<span>{t('calendar')}</span>
				</li>
			</ul>
			<title>{t('calendar')}</title>
			<div className="panel mt-6">
				<div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
					<RBACWrapper permissionKey={['calendar:create']} type={'AND'}>
						<div className="flex flex-wrap items-center">
							<Link href="/hrm/calendar/create">
								<button type="button" className=" button-table button-create m-1">
									<IconNewPlus />
									<span className="uppercase">{t('add')}</span>
								</button>
							</Link>
						</div>
					</RBACWrapper>
					<div className="flex flex-row gap-2">
						{/* <div className='flex flex-1 w-[220px]'>
                            <Select
                                className="zIndex-10 w-[220px]"
                                options={[{ value: 'sent', label: 'Thư gửi' }, { value: 'received', label: 'Thư nhận' }]}
                                placeholder={t('choose_status')}
                                onChange={(e: any) => {
                                    // handleChangeStatus(e);
                                }}
                                value={router.query.status === 'sent' ? { value: 'sent', label: 'Thư gửi' } : router.query.status === 'received' ? { value: 'received', label: 'Thư nhận' } : ''}
                                isClearable
                            />
                        </div> */}
						<div className="flex w-[220px] flex-1">
							<Select
								className="zIndex-10 w-[200px]"
								options={groupedOptions}
								placeholder={t('choose_department')}
								styles={customStyles}
								// value={router?.query?.departmentId}

								formatGroupLabel={formatGroupLabel}
								onChange={(e: any) => {
									handleChangeDepartment(e);
								}}
								isClearable
							/>
						</div>
						<div className="flex w-[240px] flex-1" style={{ marginRight: '-20px' }}>
							<Flatpickr
								className="form-input"
								options={{
									defaultDate: `${router?.query?.month}/${router?.query?.year}`,
									locale: {
										...chosenLocale,
									},
									plugins: [
										monthSelectPlugin(monthSelectConfig), // Sử dụng plugin với cấu hình
									],
								}}
								placeholder={`${t('choose_month')}`}
								onChange={(selectedDates, dateStr, instance) => {
									handleChangeMonth(dateStr);
								}}
							/>
							<div style={{ margin: '8px -31px' }}>
								<IconCalendar />
							</div>
						</div>

						<div className="flex w-[140px] flex-1" style={{ alignItems: 'flex-start', justifyContent: 'flex-end' }}>
							<input
								autoComplete="off"
								type="text"
								className="form-input w-auto"
								placeholder={`${t('search')}`}
								value={search}
								onKeyDown={(e) => handleKeyPress(e)}
								onChange={(e) => (e.target.value === '' ? handleSearch('') : setSearch(e.target.value))}
							/>
						</div>
					</div>
				</div>
				<div className="datatables">
					<DataTable
						whitespace-nowrap
						highlightOnHover
						style={{ whiteSpace: 'pre-wrap' }}
						className="table-hover custom_table button_hover whitespace-nowrap"
						records={announcements?.data}
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
		</div>
	);
};

export default Calendar;
