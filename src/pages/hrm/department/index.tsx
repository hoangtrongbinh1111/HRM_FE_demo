import { useEffect, Fragment, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

import { setPageTitle } from '../../../store/themeConfigSlice';
import { lazy } from 'react';
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
import { Departments, DepartmentsTree } from '@/services/swr/department.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

// json
import DepartmentList from './department_list.json';
import DepartmentModal from './modal/DepartmentModal';
import IconFolderMinus from '@/components/Icon/IconFolderMinus';
import IconDownload from '@/components/Icon/IconDownload';

import Link from 'next/link';
import { Box } from '@atlaskit/primitives';
import TableTree, { Cell, Header, Headers, Row, Rows } from '@atlaskit/table-tree';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconDisplaylist from '@/components/Icon/IconDisplaylist';
import IconDisplayTree from '@/components/Icon/IconDisplayTree';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { deleteDepartment } from '@/services/apis/department.api';
import IconNewEye from '@/components/Icon/IconNewEye';
interface Props {
	[key: string]: any;
}

const Department = ({ ...props }: Props) => {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	useEffect(() => {
		dispatch(setPageTitle(`${t('department_list')}`));
	});

	const router = useRouter();

	const [display, setDisplay] = useState('tree');
	const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
	const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
	const [search, setSearch] = useState('');
	const [getStorge, setGetStorge] = useState<any>();
	const [data, setData] = useState<any>();

	const [openModal, setOpenModal] = useState(false);

	const { data: department, pagination, mutate, loading: showLoader } = Departments({ sortBy: 'id.ASC', ...router.query });
	const { data: departmenttree, pagination: paginationDepartmentTree, mutate: mutateDepartmentTree, loading: loadingTree } = DepartmentsTree({ sortBy: 'id.ASC', ...router.query });

	useEffect(() => {
		const searchQuery = router?.query?.search;
		if (typeof searchQuery === 'string') {
			setSearch(searchQuery);
		} else if (Array.isArray(searchQuery)) {
			setSearch(searchQuery[0] || ''); // Use the first element if it's an array
		} else {
			setSearch(''); // Handle undefined case
		}
	}, [router?.query?.search]);

	const handleEdit = (data: any) => {
		router.push(`/hrm/department/${data}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
	};
	const handleDetail = (data: any) => {
		// setOpenModal(true);
		// setData(data);
		router.push(`/hrm/department/detail/${data}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
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
				html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data.name}?`,
				// text: `${t('confirm_delete')} ${data.name}`,
				padding: '2em',
				showCancelButton: true,
				cancelButtonText: `${t('cancel')}`,
				confirmButtonText: `${t('confirm')}`,
				reverseButtons: true,
			})
			.then((result) => {
				if (result.value) {
					deleteDepartment(data?.id)
						.then(() => {
							mutate();
							mutateDepartmentTree();
							showMessage(`${t('delete_department_success')}`, 'success');
						})
						.catch((err) => {
							showMessage(`${err?.response?.data?.message}`, 'error');
						});
				}
			});
	};

	const handleSearch = (param: any) => {
		if (display === 'tree') setDisplay('flat')
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

	type Item = {
		id: number;
		name: string;
		code: string;
		status: string;
		abbreviation: string;
		children?: Item[];
	};
	const renderPageNumbers = () => {
		const pageNumbers = [];
		const currentPage = display == 'tree' ? paginationDepartmentTree?.page : pagination?.page;
		const totalPages = display == 'tree' ? paginationDepartmentTree?.totalPages : pagination?.totalPages;

		if (currentPage > 2) {
			pageNumbers.push(
				<li>
					<button
						type="button"
						onClick={() => handleChangePage(1, 10)}
						className={`flex justify-center rounded-full bg-white-light px-3.5 py-2  font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary`}
					>
						1
					</button>
				</li>,
			);
			pageNumbers.push(
				<li>
					<button
						type="button"
						className={`flex justify-center rounded-full bg-white-light px-3.5 py-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary`}
					>
						...
					</button>
				</li>,
			);
		}
		for (let i = 1; i <= totalPages; i++) {
			if (currentPage < i + 2 && currentPage > i - 2) {
				pageNumbers.push(
					<li>
						<button
							type="button"
							key={i}
							onClick={() => handleChangePage(i, 10)}
							className={`flex justify-center rounded-full px-3.5 py-2 font-semibold ${
								i === currentPage
									? 'bt-pagination-active text-white transition dark:bg-primary dark:text-white-light'
									: 'bg-white-light text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary'
							}`}
						>
							{i}
						</button>
					</li>,
				);
			}
		}
		if (currentPage < totalPages - 2) {
			pageNumbers.push(
				<li>
					<button
						type="button"
						className={`flex justify-center rounded-full bg-white-light px-3.5 py-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary`}
					>
						...
					</button>
				</li>,
			);
		}
		if (currentPage < totalPages - 1) {
			pageNumbers.push(
				<li>
					<button
						type="button"
						onClick={() => handleChangePage(totalPages, 10)}
						className={`flex justify-center rounded-full bg-white-light px-3.5 py-2  font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary`}
					>
						{totalPages}
					</button>
				</li>,
			);
		}
		return pageNumbers;
	};

	return (
		<div>
			<ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
				<li>
					<Link href="/hrm/dashboard" className="text-primary hover:underline">
						{t('dashboard')}
					</Link>
				</li>
				<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
					<span>{t('department_list')}</span>
				</li>
			</ul>

			<title>{t('department')}</title>
			<div className="panel mt-6">
				<div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
					<div className="flex flex-wrap items-center">
						<RBACWrapper permissionKey={['department:create']} type={'AND'}>
							<Link href="/hrm/department/AddNewDepartment">
								<button type="button" className="button-table button-create m-1">
									<IconNewPlus />
									<span className="uppercase">{t('add')}</span>
								</button>
							</Link>
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
					<div className="display-style">
						<input
							autoComplete="off"
							type="text"
							id="search"
							defaultValue={search}
							className="form-input w-auto"
							placeholder={`${t('search')}`}
							onKeyDown={(e) => handleKeyPress(e)}
							onChange={(e) => (e.target.value === '' ? handleSearch('') : setSearch(e.target.value))}
						/>
						<button
							type="button"
							className="btn btn-primary btn-sm custom-button-display  m-1"
							style={{ backgroundColor: display === 'flat' ? '#E9EBD5' : '#FAFBFC', color: 'black' }}
							onClick={() => setDisplay('flat')}
						>
							<IconDisplaylist fill={display === 'flat' ? '#959E5E' : '#BABABA'}></IconDisplaylist>
						</button>
						<button
							type="button"
							className="btn btn-primary btn-sm custom-button-display  m-1"
							style={{ backgroundColor: display === 'tree' ? '#E9EBD5' : '#FAFBFC' }}
							onClick={() => setDisplay('tree')}
						>
							<IconDisplayTree fill={display === 'tree' ? '#959E5E' : '#BABABA'}></IconDisplayTree>
						</button>
					</div>
				</div>
				<div>
					{/* {loadingTree ? (
						<div style={{width:  '100px !important', height:  '100px !important'}} className="  grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
							<IconLoading />
						</div>
					) : ( */}
						<div className="personnel-container mb-5">
							<TableTree className="personne-table">
								<Headers id="personnel-table-header" style={{ backgroundColor: '#EBEAEA' }}>
									<Header width={'27%'} color="black">
										{t('name_department')}
									</Header>
									<Header width={'22%'} color="black">
										{t('code_department')}
									</Header>
									<Header width={'22%'} color="black">
										{t('Abbreviated_name')}
									</Header>
									<Header width={'20%'} color="black">
										{t('action')}
									</Header>
								</Headers>
								<Rows
									items={display === 'tree' ? departmenttree?.data : department?.data ? department?.data : []}
									render={({ id, name, code, abbreviation, children = [] }: Item) => (
										<Row itemId={id} items={children} hasChildren={display === 'tree' && children.length > 0} isDefaultExpanded>
											<Cell singleLine>{name}</Cell>
											<Cell>{code}</Cell>
											<Cell>{abbreviation}</Cell>
											<Cell>
												<div className="mx-auto flex flex w-max items-center justify-center gap-2">
													<RBACWrapper permissionKey={['department:findOne']} type={'AND'}>
														<div className="w-[auto]">
															<button type="button" className="button-detail" onClick={() => handleDetail(id)}>
																<IconNewEye />
																<span>{t('detail')}</span>
															</button>
														</div>
													</RBACWrapper>
													<RBACWrapper permissionKey={['department:update']} type={'AND'}>
														<div className="w-[auto]">
															<button type="button" className="button-edit" onClick={() => handleEdit(id)}>
																<IconNewEdit />
																<span>{t('edit')}</span>
															</button>
														</div>
													</RBACWrapper>
													<RBACWrapper permissionKey={['department:remove']} type={'AND'}>
														<div className="w-[auto]">
															<button type="button" className="button-delete" onClick={() => handleDelete({ id, name })}>
																<IconNewTrash />
																<span>{t('delete')}</span>
															</button>
														</div>
													</RBACWrapper>
												</div>
											</Cell>
										</Row>
									)}
								/>
							</TableTree>
							<div className={`flex w-full ${display !== 'tree' ? 'justify-between' : 'justify-end'}`}>
								{display !== 'tree' && (
									<ul className="inline-flex items-center space-x-1 rtl:space-x-reverse" style={{ marginTop: '20px' }}>
										Hiển thị mục {(pagination?.page - 1) * pagination?.perPage + 1} đến{' '}
										{pagination?.page < pagination?.totalPages ? pagination?.page * pagination?.perPage : pagination?.totalRecords} mục. Tổng {pagination?.totalRecords} mục. Mỗi
										trang có {pagination?.perPage}
									</ul>
								)}
								<ul className="inline-flex items-center justify-end space-x-1 rtl:space-x-reverse" style={{ marginTop: '10px' }}>
									<li>
										<button
											onClick={() => handleChangePage(display === 'tree' ? paginationDepartmentTree?.page - 1 : pagination?.page - 1, 10)}
											type="button"
											disabled={display === 'tree' ? paginationDepartmentTree?.page === 1 : pagination?.page === 1}
											className="flex justify-center rounded-full bg-white-light p-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
										>
											<IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
										</button>
									</li>
									{renderPageNumbers()}
									<li>
										<button
											onClick={() => handleChangePage(display === 'tree' ? paginationDepartmentTree?.page + 1 : pagination?.page + 1, 10)}
											type="button"
											disabled={display === 'tree' ? paginationDepartmentTree?.page === paginationDepartmentTree?.totalPages : pagination?.page === pagination?.totalPages}
											className="flex justify-center rounded-full bg-white-light p-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
										>
											<IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
										</button>
									</li>
								</ul>
							</div>
						</div>
					{/* )} */}
				</div>
			</div>
			<DepartmentModal openModal={openModal} setOpenModal={setOpenModal} data={data} totalData={getStorge} setData={setData} setGetStorge={setGetStorge} />
		</div>
	);
};

export default Department;
