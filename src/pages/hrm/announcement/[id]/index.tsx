import { useEffect, useRef, useState, createContext } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';

import { IconLoading } from '@/components/Icon/IconLoading';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import IconArrowLeft from '@/components/Icon/IconArrowLeft';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconBack from '@/components/Icon/IconBack';
import Select from 'react-select';
import { formatDate2, removeNullProperties, toDateString } from '@/utils/commons';
import { C } from '@fullcalendar/core/internal-common';
import { Positions } from '@/services/swr/position.swr';
import { detailPosition, updatePosition } from '@/services/apis/position.api';
import { listAllGroupPositon } from '@/services/apis/group-position.api';
import { GroupPositions } from '@/services/swr/group-position.swr';
import { DropdownRole } from '@/services/swr/dropdown.swr';
import { useDebounce } from 'use-debounce';
import { Humans } from '@/services/swr/human.swr';
import { Departments } from '@/services/swr/department.swr';
import { loadMore } from '@/utils/commons';
import { Upload } from '@/services/apis/upload.api';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import { Lao } from '@/utils/lao';
import { detailAnnouncement, makeHighLight, sendAnnouncement, updateAnnouncement } from '@/services/apis/announcement.api';
import { listAllTimekeeperHuman } from '@/services/apis/timekeeper.api';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import AnimateHeight from 'react-animate-height';
import ApprovalModal from '../modal/ApprovalModal';
import { useMyContext } from '../../../../components/Layouts/myContext';
import { Loader } from '@mantine/core';
interface Props {
	[key: string]: any;
}
interface Human {
	value: number;
	label: string;
}
interface User {
	id: number;
	fullName: string;
}
const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const DetailDuty = ({ ...props }: Props) => {
	const { setMyValue, myValue } = useMyContext();
	const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(setPageTitle(t('Update Announcement')));
	});
	const themeConfig = useSelector((state: IRootState) => state.themeConfig);
	const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;

    const [isAdd, setIsAdd]= useState(false);
	const [openModalApproval, setOpenModalApproval] = useState(false);
	const [usersParticipate, setUsersParticipate] = useState<any>([]);
	const router = useRouter();
	const [detail, setDetail] = useState<any>();
	const [dataPath, setDataPath] = useState<any>();
	const [path, setPath] = useState<any>([]);
	const id = Number(router.query.id);
	const [humans, setHuman] = useState([]);
	const { t } = useTranslation();
	const [initialValue, setInitialValue] = useState<any>();
	const fileRef = useRef<any>();
	useEffect(() => {
		const id = router.query.id;
		if (id) {
			detailAnnouncement(id)
				.then((res) => {
					setDetail(res?.data);
					setPath(res?.data?.attachments);
				})
				.catch((err: any) => {
					console.log(err);
				});
		}
	}, [router]);
	//scroll
	const [dataDepartment, setDataDepartment] = useState<any>([]);
	const [pageDepartment, setSizeDepartment] = useState<any>(1);
	const [debouncedPage] = useDebounce(pageDepartment, 500);
	const [queryDepartment, setQueryDepartment] = useState<any>();
	const [debouncedQuery] = useDebounce(queryDepartment, 500);
	const [queryHuman, setQueryHuman] = useState<any>();
	const [dataHuman, setDataHuman] = useState<any>([]);
	const [pageHuman, setSizeHuman] = useState<any>(1);
	const [debouncedPageHuman] = useDebounce(pageHuman, 500);
	const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
	const [loadHuman, setLoadHuman] = useState(false);
	const [loadDepartment, setLoadDepartment] = useState(false);
	const { data: departmentparents, pagination: paginationDepartment, isLoading: DepartmentLoading } = Departments({ page: debouncedPage, search: debouncedQuery?.search });

	const [active, setActive] = useState<any>([1]);
	const { data: manages, pagination: paginationHuman } = Humans({
		sortBy: 'id.ASC',
		page: debouncedPageHuman,
		perPage: 10,
		search: debouncedQueryHuman?.search,
	});
	const handleActive = (value: any) => {
		if (active.includes(value)) {
			setActive(active.filter((item: any) => item !== value));
		} else {
			setActive([value, ...active]);
		}
	};
	const handleOnScrollBottom = () => {
		setLoadDepartment(true);
		setTimeout(() => {
			setSizeDepartment(paginationDepartment?.page + 1);
		}, 1000);
	};
	const handleOnScrollBottomHuman = () => {
		setLoadHuman(true);
		setTimeout(() => {
			setSizeHuman(paginationHuman?.page + 1);
		}, 1000);
	};
	useEffect(() => {
		loadMore(departmentparents, dataDepartment, paginationDepartment, setDataDepartment, 'id', 'name', setLoadDepartment);
	}, [paginationDepartment, debouncedPage, debouncedQuery]);
	useEffect(() => {
		loadMore(manages, dataHuman, paginationHuman, setDataHuman, 'id', 'fullName', setLoadHuman);
	}, [paginationHuman, debouncedPageHuman, debouncedQueryHuman]);

	const handleSearchDepartment = (param: any) => {
		setQueryDepartment({ search: param });
	};
	const handleSearchHuman = (param: any) => {
		setQueryHuman({ search: param });
	};
	///path
	useEffect(() => {
		const listPath = path?.filter((item: any) => item !== undefined) ?? [];
		setPath([...listPath, dataPath]); // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataPath]);

	const handleChange = async (event: any) => {
		const files = Array.from(event.target.files);

		const uploadPromises = await Object.keys(event.target.files).map((item: any) => {
			const formData = new FormData();
			formData.append('file', event.target.files[item]);
			formData.append('fileName', event.target.files[item].name);
			Upload(formData)
				.then((res) => {
					setDataPath({ id: res.data.id, path: res.data.path, name: res?.data?.name });
					return { id: res.data.id, path: res.data.path, name: res.data.name };
				})
				.catch((err) => {
					showMessage(`${err?.response?.data?.message}`, 'error');
				});
		});
		const newFiles = await Promise.all(uploadPromises);
		const validNewFiles = newFiles.filter((file) => file !== null);

		setPath((prevPath: any) => {
			if (!Array.isArray(prevPath)) {
				return validNewFiles;
			}
			return [...prevPath, ...validNewFiles];
		});

		// Update the file input value
		const dataTransfer = new DataTransfer();
		[...fileRef.current.files].forEach((file: any) => dataTransfer.items.add(file));
		fileRef.current.files = dataTransfer.files;
	};
	const handleDuty = async (value: any) => {
        setIsAdd(true)
		try {
			if (detail?.isHighlight !== value?.isHighlight) {
				await makeHighLight(detail?.id);
				setMyValue(!myValue);
			}
	
			await updateAnnouncement(detail?.id, {
				content: value?.content,
				contentHtml: value?.contentHtml,
			});
			setLoadDetail(false)
			setIsAdd(false)
			showMessage(`${t('update_announcement_success')}`, 'success');
			router.push(`/hrm/announcement?page=${router?.query?.page}&perPage=${router?.query?.perPage}`);
		} catch (err: any) {
			setIsAdd(false)
			if (err.response && err.response.data && err.response.data.message) {
				const errorMessage = err.response.data.message[0]?.error 
					? err.response.data.message[0]?.error 
					: err.response.data.message;
				showMessage(errorMessage, 'error');
			} else {
				showMessage('An unknown error occurred', 'error');
			}
		}
	};
	
	const getAllTimekeeperHuman = () => {
		listAllTimekeeperHuman({})
			.then((res) => {
				const kq = res?.data?.map((i: any) => {
					return {
						value: i?.id,
						label: `${i?.full_name} - ${i?.position_name ? i?.position_name : 'Chưa có chức vụ'} - ${i?.department_name ? i?.department_name : 'Chưa thuộc phòng ban nào'}`,
					};
				});
				setHuman(kq);
			})
			.catch((e) => console.log(e));
	};
	useEffect(() => {
		getAllTimekeeperHuman();
	}, []);
	useEffect(() => {
		setUsersParticipate(
			detail?.users?.map((i: any) => ({
				value: i?.id,
				label: i?.fullName,
			})),
		);
		setInitialValue({
			title: detail ? detail?.title : '',
			content: detail ? detail?.content : '',
			typeReceiver: detail ? detail?.typeReceiver : '',
			type: detail ? detail?.type : '',
			users:
				detail?.typeReceiver === 'HUMAN'
					? detail?.users?.map((i: any) => ({
							value: i?.id,
							label: i?.fullName,
					  }))
					: [],
			departments: detail?.departments
				? detail?.departments?.map((i: any) => ({
						value: i?.id,
						label: i?.name,
				  }))
				: [],
		});
		setPath(detail?.attachments);
	}, [detail, router]);
	const t2 = detail?.users
		?.map((user: User) => {
			return humans
				?.filter((human: Human) => user?.id === human?.value)
				.map((human: any) => ({
					...human,
				}));
		})
		.flat();
	//use_send
	const { data: department, pagination, mutate } = Departments({ sortBy: 'id.ASC', page: 1, perPage: 10 });

	const [dataSend, setDataSend] = useState<any>();
	const [page, setPage] = useState<any>(1);
	const PAGE_SIZES = [10, 20, 30, 50, 100];
	const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [loadDetail, setLoadDetail] = useState(true)
	useEffect(() => {
		const id = router.query.id;
		setLoadDetail(true)
		if (id) {
			sendAnnouncement(id)
				.then((res) => {
					setLoadDetail(false)
					setDataSend(res);
				})
				.catch((err: any) => {
					console.log(err);
				});
		}
	}, [router, page, pageSize]);
	const handleChangePage = (page: number, pageSize: number) => {
		setPage(page);
		setPageSize(pageSize);
	};
	const columnTask = [
		{
			accessor: 'id',
			title: 'STT',
			render: (records: any, index: any) => <span>{index + 1}</span>,
		},
		// {
		// 	accessor: 'creator',
		// 	title: `${t('code')}`,
		// 	sortable: false,
		// 	render: (records: any) => {
		// 		return <span>{records?.receiver?.code}</span>;
		// 	},
		// },
		{
			accessor: 'name',
			title: `${t('name')}`,
			sortable: false,
			render: (records: any) => {
				return <span>{records?.receiver?.fullName}</span>;
			},
		},
		{
			accessor: 'time',
			title: `${t('time_seen')}`,
			sortable: false,
			render: (records: any) => {
				return <span>{formatDate2(dayjs(records?.createdAt))}</span>;
			},
		},
	];
	const formikRef = useRef<any>();
	useEffect(() => {
		if (formikRef.current) {
			formikRef.current.setFieldValue('users', usersParticipate);
		}
	}, [usersParticipate]);
	return (
		<div>	
			{loadDetail && (
			<div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
				<IconLoading />
			</div>
		)}
			<div className="p-5">
				<ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
					<li>
						<Link href="/hrm/dashboard" className="text-primary hover:underline">
							<span>{t('homepage')}</span>
						</Link>
					</li>
					<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
						<Link href="/hrm/announcement" className="text-primary hover:underline">
							<span>{t('announcement')}</span>
						</Link>
					</li>
					<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
						<span>{t('Update Announcement')}</span>
					</li>
				</ul>
				<div className="header-page-bottom mb-4 flex justify-between pb-4">
					<h1 className="page-title">{t('Update Announcement')}</h1>
					<Link href={`/hrm/announcement?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
						<button type="button" className="btn btn-primary btn-sm back-button m-1">
							<IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
							<span>{t('back')}</span>
						</button>
					</Link>
				</div>
				{detail?.id !== undefined && (
					<Formik
						initialValues={{
							title: detail ? detail?.title : '',
							content: detail ? detail?.content : '',
							startDate: detail ? `${detail?.startDate}` : '',
							endDate: detail ? `${detail?.endDate}` : '',
							location: detail ? `${detail?.location}` : '',
							isHighlight: detail?.isHighlight ? true : false,
							typeReceiver: detail ? detail?.typeReceiver : '',
							type: detail ? detail?.type : '',
							users: detail?.typeReceiver === 'HUMAN' ? t2 : [],
							contentHtml: detail ? detail?.contentHtml : '',
							departments: detail?.departments
								? detail?.departments?.map((i: any) => ({
										value: i?.id,
										label: i?.name,
								  }))
								: [],
						}}
						innerRef={formikRef}
						// validationSchema={SubmittedForm}
						onSubmit={(values) => {
							handleDuty(values);
						}}
					>
						{({ errors, touched, submitCount, setFieldValue, values }) => (
							<Form className="space-y-5" style={{ padding: '0 15px' }}>
								{/* <div className="flex justify-between gap-5">
							<div className="mb-5 w-1/2"> */}
								<label htmlFor="title" className="label">
									{' '}
									{t('title')}
								</label>
								<Field autoComplete="off" disabled style={{ marginTop: '3px' }} name="title" type="text" id="title" placeholder={`${t('please_fill_title')}`} className="form-input" />
								{/* {submitCount ? errors.title ? <div className="mt-1 text-danger"> {errors.title} </div> : null : ''} */}
								{/* </div>


						</div> */}

								<div className="flex justify-between gap-5">
									<div className="mb-5 w-1/2">
										<label htmlFor="type" className="label">
											{t('type_')}
										</label>
										<div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
											<label style={{ marginBottom: 0, marginRight: '10px' }}>
												<Field
													autoComplete="off"
													type="radio"
													disabled
													name="type"
													value={values?.type}
													checked={values.type === 'NORMAL'}
													className="radioCheck form-checkbox rounded-full"
													onChange={(e: any) => {
														setFieldValue('type', 'NORMAL');
													}}
												/>
												{t('normal')}
											</label>
											<label style={{ marginBottom: 0 }}>
												<Field
													autoComplete="off"
													type="radio"
													name="type"
													disabled
													value={values?.type}
													checked={values.type === 'IMPORTANT'}
													className="radioCheck form-checkbox rounded-full"
													onChange={(e: any) => {
														setFieldValue('type', 'IMPORTANT');
													}}
												/>
												{t('important')}
											</label>
										</div>
									</div>
									<div className="mb-5 w-1/2">
										<label htmlFor="location" className="label">
											{t('address')}
										</label>
										<Field disabled autoComplete="off" name="location" type="text" id="location" placeholder={t('enter_address')} className="form-input" />
										{submitCount ? errors.location ? <div className="mt-1 text-danger"> {errors.location} </div> : null : ''}
									</div>
								</div>
								<div className="mb-3 flex gap-2" style={{ marginTop: '0px' }}>
									<div className="flex-1">
										<label htmlFor="startDate" className="label">
											{t('from_time')}
										</label>
										<Flatpickr
											disabled
											data-enable-time
											options={{
												enableTime: true,
												dateFormat: 'H:i d-m-Y',
												time_24hr: true,
												locale: {
													...chosenLocale,
												},
											}}
											value={values?.startDate}
											onChange={(e: any) => {
												if (e?.length > 0) {
													setFieldValue('startDate', dayjs(e[0]).toISOString());
												}
											}}
											placeholder={`${t('choose_from_time')}`}
											className="calender-input form-input"
										/>
										{submitCount ? errors.startDate ? <div className="mt-1 text-danger"> {errors.startDate} </div> : null : ''}
									</div>
									<div className="flex-1">
										<label htmlFor="endDate" className="label">
											{t('end_time')}
										</label>
										<Flatpickr
											disabled
											data-enable-time
											options={{
												enableTime: true,
												dateFormat: 'H:i d-m-Y',
												time_24hr: true,
												locale: {
													...chosenLocale,
												},
											}}
											value={values?.endDate}
											placeholder={`${t('choose_end_time')}`}
											onChange={(e: any) => {
												if (e?.length > 0) {
													setFieldValue('endDate', dayjs(e[0]).toISOString());
												}
											}}
											className="calender-input form-input"
										/>
										{submitCount ? errors.endDate ? <div className="mt-1 text-danger"> {errors.endDate} </div> : null : ''}
									</div>
								</div>
								<div className="flex justify-between gap-5">
									<div className="mb-5 w-1/2">
										<label htmlFor="typeReceiver" className="label">
											{t('type1')}
										</label>
										<div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
											<label style={{ marginBottom: 0, marginRight: '10px' }}>
												<Field
													autoComplete="off"
													type="radio"
													disabled
													name="typeReceiver"
													value={values?.typeReceiver}
													checked={values.typeReceiver === 'ALL'}
													className="radioCheck form-checkbox rounded-full"
													onChange={(e: any) => {
														setFieldValue('typeReceiver', 'ALL');
													}}
												/>
												{t('allHuman')}
											</label>
											<label style={{ marginBottom: 0 }}>
												<Field
													autoComplete="off"
													type="radio"
													disabled
													name="typeReceiver"
													defaultValue={detail?.typeReceiver}
													value={values?.typeReceiver}
													checked={values.typeReceiver === 'HUMAN'}
													className="radioCheck form-checkbox rounded-full"
													onChange={(e: any) => {
														setFieldValue('typeReceiver', 'HUMAN');
													}}
												/>
												{t('chooseHuman')}
											</label>
										</div>
									</div>
									{values?.typeReceiver === 'ALL' ? (
										<div className="mb-5 w-1/2">
											<label htmlFor="isHighlight" className="label">
												{t('highlight')}
											</label>
											<div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
												<label style={{ marginBottom: 0, marginRight: '10px' }}>
													<Field
														autoComplete="off"
														type="radio"
														name="isHighlight"
														value={values?.isHighlight}
														checked={values.isHighlight}
														className="form-checkbox rounded-full"
														onChange={(e: any) => {
															console.log(e);
															setFieldValue('isHighlight', true);
														}}
													/>
													{t('highlight_true')}
												</label>
												<label style={{ marginBottom: 0, marginRight: '10px' }}>
													<Field
														autoComplete="off"
														type="radio"
														name="isHighlight"
														value={values?.isHighlight}
														checked={!values.isHighlight}
														className="form-checkbox rounded-full"
														onChange={(e: any) => {
															setFieldValue('isHighlight', false);
														}}
													/>
													{t('highlight_false')}
												</label>
											</div>
										</div>
									) : (
										<></>
									)}
								</div>
								{values?.typeReceiver === 'ALL' ? (
									<></>
								) : (
									<div className="flex justify-between gap-5" style={{ marginTop: '10px' }}>
										<div className="mb-5 w-1/2">
											<label htmlFor="departments" className="label">
												{' '}
												{t('departmentParticipate')}
											</label>
											<Select
												id="departments"
												name="departments"
												placeholder={t('choose_department')}
												onInputChange={(e) => handleSearchDepartment(e)}
												options={dataDepartment}
												isDisabled={true}
												isLoading={loadDepartment}
												onMenuOpen={() => setSizeDepartment(1)}
												onMenuScrollToBottom={() => handleOnScrollBottom()}
												maxMenuHeight={160}
												isMulti
												closeMenuOnSelect={false}
												value={values.departments}
												onChange={(e) => {
													setFieldValue('departments', e);
												}}
											/>
										</div>
										<div className="mb-5 w-1/2">
											<label htmlFor="users" className="label">
												{t('usersParticipate')}
											</label>
											<div>
												<Select
													id="users"
													name="users"
													isDisabled={true}
													onInputChange={(e) => handleSearchHuman(e)}
													options={dataHuman}
													// isLoading={load}
													onMenuOpen={() => setSizeHuman(1)}
													onMenuScrollToBottom={() => handleOnScrollBottomHuman()}
													placeholder={t('choose_human')}
													isMulti
													closeMenuOnSelect={false}
													maxMenuHeight={160}
													value={values.users}
													onChange={(e) => {
														setFieldValue('users', usersParticipate);
													}}
													menuIsOpen={false}
													openMenuOnFocus={false}
												/>
											</div>
										</div>
									</div>
								)}
								<div className="h-fit">
									<ReactQuill
										theme="snow"
										id="contentHtml"
										value={values.contentHtml || ''}
										defaultValue={values.contentHtml || ''}
										onChange={(contentHtml, delta, source, editor) => {
											values.contentHtml = contentHtml;
											values.content = editor.getText();
											setFieldValue('contentHtml', contentHtml);
										}}
										style={{ minHeight: '100px' }}
									/>
								</div>
								<div>
									<Field
										innerRef={fileRef}
										autoComplete="off"
										name="attachmentIds"
										type="file"
										disabled
										id="attachmentIds"
										className="form-input"
										accept="image/*,.zip,.pdf,.xls,.xlsx,.txt.doc,.docx"
										multiple
										onChange={(e: any) => {
											handleChange(e);
										}}
									/>

									{path !== undefined ? (
										<div className="mt-2 grid gap-4 rounded border p-2">
											<p>{t('List of file upload paths')}</p>
											{path?.map((item: any, index: number) => {
												return (
													<>
														{item?.path && (
															<div className="flex gap-4">
																<Link href={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} target="_blank" className="d-block ml-5" style={{ color: 'blue' }}>
																	{item?.name}
																</Link>
															</div>
														)}
													</>
												);
											})}
										</div>
									) : (
										<></>
									)}
								</div>
								<div className="mt-5 rounded">
									<button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(1)}>
										{t('List of viewed personnel')}
										<div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
											<IconCaretDown />
										</div>
									</button>
									<div className={`${active.includes(1) ? 'custom-content-accordion' : ''}`}>
										<AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
											<div className="p-4">
												<div className="mb-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">
													<div className="flex flex-wrap items-center"></div>
												</div>
												<div className="datatables">
													<DataTable
														highlightOnHover
														records={dataSend?.data}
														columns={columnTask}
														sortStatus={sortStatus}
														onSortStatusChange={setSortStatus}
														minHeight={200}
														style={{ whiteSpace: 'pre-wrap' }}
														className="table-hover custom_table button_hover whitespace-nowrap"
														totalRecords={dataSend?.pagination?.totalRecords}
														recordsPerPage={dataSend?.pagination?.perPage}
														page={dataSend?.pagination?.page}
														onPageChange={(p) => handleChangePage(p, pagination?.perPage)}
														recordsPerPageOptions={PAGE_SIZES}
														onRecordsPerPageChange={(e) => handleChangePage(pagination?.page, e)}
														paginationText={({ from, to, totalRecords }) =>
															`${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`
														}
													/>
												</div>
											</div>
										</AnimateHeight>
									</div>
								</div>

								<div>
									<div className="!mt-8 flex items-center justify-end">
										<Link href={`/hrm/announcement?page=${router?.query?.page}&perPage=${router?.query?.perPage}`} className="text-primary">
											<button type="button" className="btn cancel-button btn-outline-danger">
												{t('cancel')}
											</button>
										</Link>
										<button type="submit" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" disabled={isAdd}>
										{isAdd ? <Loader size="sm" /> : detail?.id ? t('update') : t('add')}
										</button>
									</div>
								</div>
							</Form>
						)}
					</Formik>
				)}
			</div>
			<ApprovalModal openModal={openModalApproval} setOpenModal={setOpenModalApproval} setUsersParticipate={setUsersParticipate} usersParticipate={usersParticipate} />
		</div>
	);
};

export default DetailDuty;
