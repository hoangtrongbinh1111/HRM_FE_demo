import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import Link from 'next/link';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
// API
import { Positions } from '@/services/swr/position.swr';
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
// helper
import { downloadFile, downloadFile2, showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import IconImportFile from '@/components/Icon/IconImportFile';
import { useRouter } from 'next/router';

import RBACWrapper from '@/@core/rbac/RBACWrapper';
// json
import DutyModal from './modal/DutyModal';
import duty_list from './duty_list.json';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { deletePosition, exportPosition } from '@/services/apis/position.api';
import GroupPosition from '../group-position';
import { GroupPositions } from '@/services/swr/group-position.swr';
interface Props {
	[key: string]: any;
}

const Duty = ({ ...props }: Props) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dispatch = useDispatch();
	const { t } = useTranslation();
	useEffect(() => {
		dispatch(setPageTitle(`${t('duty_list')}`));
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

	const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

	const [openModal, setOpenModal] = useState(false);
	//get data
	const {
		data: position,
		pagination,
		mutate,
		isLoading,
	} = Positions({
		sortBy: 'id.ASC',
		...router.query,
	});
	const {
		data: groupPositionsData,
		pagination: groupPositionPagination,
		mutate: groupPositionMutate,
	} = GroupPositions({
		sortBy: 'id.ASC',
	});
	let user: any;
	if (typeof window !== 'undefined') {
		const userString = localStorage.getItem('profile');
		user = userString ? JSON.parse(userString) : null;
	}
	useEffect(() => {
		setShowLoader(false);
	}, [recordsData]);
	const handleExcel = () => {
		exportPosition()
			.then((res) => {
				downloadFile2(res?.data);
			})
			.catch((e) => {
				console.log(e);
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
	const handleEdit = (data: any) => {
		router.push(`/hrm/duty/${data}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
	};
	const handleDetail = (data: any) => {
		router.push(`/hrm/duty/detail/${data}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
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
				title: `${t('delete_duty')}`,
				html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data.name}?`,
				padding: '2em',
				showCancelButton: true,
				cancelButtonText: `${t('cancel')}`,
				confirmButtonText: `${t('confirm')}`,
				reverseButtons: true,
			})
			.then((result) => {
				if (result.value) {
					deletePosition(data?.id)
						.then(() => {
							showMessage(`${t('delete_duty_success')}`, 'success');
							mutate();
						})
						.catch((err) => {
							showMessage(`${t('delete_duty_error')}`, 'error');
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
			handleSearch(search);
		}
	};
	const columns = [
		{
			accessor: 'id',
			title: '#',
			render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
		},
		{ accessor: 'name', title: `${t('name_duty')}`, sortable: false, width: '20%', render: ({ name }: any) => <span style={{ margin: '12px' }}>{name}</span> },
		{ accessor: 'code', title: `${t('code_duty')}`, sortable: false, width: '10%', render: ({ code }: any) => <span style={{ margin: '12px' }}>{code}</span> },
		{
			accessor: 'duty_group',
			title: `${t('name_group_duty')}`,
			sortable: false,
			width: '20%',
			render: ({ positionGroup }: any) => <span style={{ margin: '12px' }}>{positionGroup?.name}</span>,
		},
		{
			accessor: 'level',
			title: `${t('level')}`,
			sortable: false,
			width: '10%',
			render: ({ level }: any) => <span style={{ margin: '12px', textAlign: 'left', display: 'block' }}>{level}</span>,
		},
		{
			accessor: 'description',
			title: `${t('description')}`,
			sortable: false,
			width: '10%',
			render: ({ description }: any) => (
			  <span style={{ margin: '12px' }}>
				{description?.length > 50 ? `${description?.slice(0, 50)}...` : description}
			  </span>
			),
		  },
		{
			accessor: 'status',
			title: `${t('status')}`,
			sortable: false,
			width: '10%',
			render: ({ isActive }: any) => (
				<span className={`badge bg-${isActive ? 'success' : 'danger'}`} style={{ margin: '12px' }}>
					{isActive ? t('active') : t('inactive')}
				</span>
			),
		},
		{
			accessor: 'action',
			title: `${t('action')}`,
			titleClassName: 'text-center',
			render: (records: any) => (
				<div className="mx-auto flex items-center justify-center gap-2">
					<RBACWrapper permissionKey={['position:findOne']} type={'AND'}>
						<div className="w-[auto]">
							<button type="button" className="button-detail" onClick={() => handleDetail(records?.id)}>
								<IconNewEye />
								<span>{t('detail')}</span>
							</button>
						</div>
					</RBACWrapper>
					{user?.position?.code == 'Admin' ? (
						<>
							<RBACWrapper permissionKey={['position:update']} type={'AND'}>
								<div className="w-[auto]">
									<button type="button" className="button-edit" onClick={() => handleEdit(records?.id)}>
										<IconNewEdit />
										<span>{t('edit')}</span>
									</button>
								</div>
							</RBACWrapper>
							<RBACWrapper permissionKey={['position:remove']} type={'AND'}>
								<div className="w-[auto]">
									<button type="button" className="button-delete" onClick={() => handleDelete(records)}>
										<IconNewTrash />
										<span>{t('delete')}</span>
									</button>
								</div>
							</RBACWrapper>
						</>
					) : (
						<></>
					)}
				</div>
			),
		},
	];

	return (
		<div>
			{/* {(isLoading && (
					<div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
						<IconLoading />
					</div>
			))} */}
			<ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
				<li>
					<Link href="/hrm/dashboard" className="text-primary hover:underline">
						{t('dashboard')}
					</Link>
				</li>
				<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
					<span>{t('duty_list')}</span>
				</li>
			</ul>
			<title>{t('department')}</title>
			<div className="panel mt-6">
				<div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
					<div className="flex flex-wrap items-center">
						<RBACWrapper permissionKey={['position:create']} type={'AND'}>
							<Link href="/hrm/duty/create">
								<button type="button" className=" button-table button-create m-1">
									<IconNewPlus />
									<span className="uppercase">{t('add')}</span>
								</button>
							</Link>
						</RBACWrapper>

						<RBACWrapper permissionKey={['duty:excel']} type={'AND'}>
							<button type="button" style={{ width: '150x' }} className=" button-table button-download m-1" onClick={() => handleExcel()}>
								<IconNewDownload2 />
								<span className="uppercase">{t('export_file_excel')}</span>
							</button>
						</RBACWrapper>
						{/* <button type="button" className="btn btn-primary btn-sm m-1 custom-button" >
                            <IconFolderMinus className="ltr:mr-2 rtl:ml-2" />
                            Nhập file
                        </button>
                        <button type="button" className="btn btn-primary btn-sm m-1 custom-button" >
                            <IconDownload className="ltr:mr-2 rtl:ml-2" />
                            Xuất file excel
                        </button> */}
					</div>
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
				<div className="datatables" id="duty-table">
					<DataTable
						highlightOnHover
						className="table-hover custom_table button_hover whitespace-nowrap"
						records={position?.data}
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
			<DutyModal openModal={openModal} setOpenModal={setOpenModal} data={data} totalData={getStorge} setData={setData} setGetStorge={setGetStorge} />
		</div>
	);
};

export default Duty;
