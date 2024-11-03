import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { showMessage } from '@/@core/utils';
import IconBack from '@/components/Icon/IconBack';
import { IconLoading } from '@/components/Icon/IconLoading';
import { createCalendar, deleteCalendar, detailCalendar, updateCalendar } from '@/services/apis/calendar.api';
import { Calendars } from '@/services/swr/calendar.swr';
import { Departments } from '@/services/swr/department.swr';
import { Humans } from '@/services/swr/human.swr';
import { useProfile } from '@/services/swr/profile.swr';
import { IRootState } from '@/store';
import { clearDate } from '@/store/calendarSlice';
import { setPageTitle } from '@/store/themeConfigSlice';
import { loadMore } from '@/utils/commons';
import { Lao } from '@/utils/lao';
import dayjs from 'dayjs';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import { Field, Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { useDebounce } from 'use-debounce';
import * as Yup from 'yup';

import ApprovalModal from '../modal/ApprovalModal';
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
const AddWorkScheduleModal = ({ ...props }: Props) => {
	const themeConfig = useSelector((state: IRootState) => state.themeConfig);
	const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;
	const [queryHuman, setQueryHuman] = useState<any>();
	const router = useRouter();
	//scroll
	const [loadHuman, setLoadHuman] = useState(false);

	const [openModalApproval, setOpenModalApproval] = useState(false);
	const [usersParticipate, setUsersParticipate] = useState<any>([]);
	const [dataHuman, setDataHuman] = useState<any>([]);
	const [pageHuman, setSizeHuman] = useState<any>(1);
	const [debouncedPageHuman] = useDebounce(pageHuman, 500);
	const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
	const [queryDepartment, setQueryDepartment] = useState<any>();
	const [loadDepartment, setLoadDepartment] = useState(false);
	const [dataDepartment, setDataDepartment] = useState<any>([]);
	const [initialValue, setInitialValue] = useState<any>();
    const [isAdd, setIsAdd]= useState(false);
    const [loadDetail, setLoadDetail] = useState(true)

	const [pageDepartment, setSizeDepartment] = useState<any>(1);
	const [debouncedPage] = useDebounce(pageDepartment, 500);
	const [debouncedQuery] = useDebounce(queryDepartment, 500);
	const [query, setQuery] = useState<any>({});
	const [isLoading, setIsLoading] = useState(true);
	const [data, setData] = useState<any>();
	const { data: departmentparents, pagination: paginationDepartment, isLoading: DepartmentLoading } = Departments({ page: debouncedPage, search: debouncedQuery?.search });
	const [disable, setDisable] = useState<any>(false);
	const dispatch = useDispatch();
	const selectedDate = useSelector((state: IRootState) => state.calendar);

	const { data: userData } = useProfile();
	const { data: manages, pagination: paginationHuman } = Humans({
		sortBy: 'id.ASC',
		page: debouncedPageHuman,
		perPage: 10,
		search: debouncedQueryHuman?.search,
	});
	useEffect(() => {
		dispatch(setPageTitle(disable ? `${t('detail_job_assignment')}` : data ? t('update_job_assignment') : t('add_calendar')));
	});
	useEffect(() => {
		if (Number(router.query.id)) {
			handleData();
			setQuery({ id: router.query.id, ...router.query });
		}
		if (router.query.id === 'create') {
			setIsLoading(false);
		}

		setDisable(router.query.status === 'true' ? true : false);
	}, [router]);

	const [create, setCreate] = useState(false);
	const handleData = () => {
		if (Number(router.query.id)) {
			setLoadDetail(true)
			detailCalendar(router.query.id)
				.then((res) => {
					setLoadDetail(false)
					setData(res.data);
					setIsLoading(false);
					res?.data?.createdById === userData?.data?.id ? setCreate(true) : setCreate(false);
				})
				.catch((err) => {
					showMessage(`${err?.response?.data?.message}`, 'error');
				});
		}
	};

	const handleOnScrollBottomHuman = () => {
		setLoadHuman(true);
		if (paginationHuman?.page < paginationHuman?.totalPages) {
			setSizeHuman(paginationHuman?.page + 1);
		}
	};
	useEffect(() => {
		loadMore(departmentparents, dataDepartment, paginationDepartment, setDataDepartment, 'id', 'name', setLoadDepartment);
	}, [paginationDepartment, debouncedPage, debouncedQuery]);
	useEffect(() => {
		loadMore(manages, dataHuman, paginationHuman, setDataHuman, 'id', 'fullName', setLoadHuman);
	}, [paginationHuman, debouncedPageHuman, debouncedQueryHuman]);
	useEffect(() => {
		setInitialValue({
			userIds: '',
			title: data ? `${data?.title}` : '',
			startDate: data ? data?.startDate : selectedDate?.startDate,
			endDate: data ? data?.endDate : selectedDate?.endDate,
			location: data ? `${data?.location}` : '',
			level: data ? `${data?.level}` : null,
			description: data ? `${data?.description}` : '',
			// departments: data ? data.departments : [0],
			type: data ? `${data?.type}` : 'ALL',
			departments: data?.departments
				? data?.departments?.map((i: any) => ({
						value: i?.id,
						label: i?.name,
				  }))
				: [0],
		});
	}, [data, router]);
	const handleSearchDepartment = (param: any) => {
		setQueryDepartment({ search: param });
	};
	const handleSearchHuman = (param: any) => {
		setQueryHuman({ search: param });
	};
	///////////////////
	const { t } = useTranslation();
	const SubmittedForm = Yup.object().shape({
		title: Yup.string().required(`${t('please_fill_title_work_schedule')}`),
		location: Yup.string().required(`${t('please_fill_add')}`),
		startDate: Yup.date().typeError(`${t('please_fill_work_start_date')}`),
        endDate: Yup.date().typeError(`${t('please_fill_work_end_date')}`),
		level: Yup.string().typeError(`${t('please_select_work_level')}`),
		type: Yup.string().required(),
		// userIds: Yup.array()
		//     .min(1, `${t('please_select_the_staff')}`)
		//     .required(`${t('please_select_the_staff')}`),
		// departments: Yup.array()
		//     .min(1, `${t('please_select_the_staff')}`)
		//     .required(`${t('please_select_the_staff')}`),
	});
	const { isAddWorkScheduleModal, setIsAddWokScheduleModal, params, minStartDate, minEndDate, saveWorkSchedule } = props;
	const { data: calendar, pagination, mutate } = Calendars({ sortBy: 'id.ASC', ...router.query });

	const handleAddWorkSchedule = (value: any) => {
		if (router.query.id === 'create') {
			const user = value.userIds.map((i: any) => i.value);
			const department = value.departments.map((i: any) => i.value);
			createCalendar({
				...value,
				userIds: user[0] ? user : [0],
				departments: department[0] ? department : [0],
			})
				.then(() => {
					showMessage(`${t('create_work_schedule_success')}`, 'success');
					dispatch(clearDate());
					router.push(`/hrm/calendar?page=${router?.query?.page}&perPage=${router?.query?.perPage}`);
				})
				.catch((err) => {
					showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
					dispatch(clearDate());
				});
		} else {
			const user = value.userIds.map((i: any) => i.value);
			updateCalendar(router.query.id, {
				...value,
				userIds: user[0] ? user : [0],
				departments: value?.departments?.map((i: any) => i.value),
			})
				.then(() => {
					showMessage(`${t('update_work_schedule_success')}`, 'success');
					router.push(`/hrm/calendar`);
				})
				.catch((err) => {
					showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
				});
		}
	};
	const handleOnScrollBottom = () => {
		setLoadDepartment(true);
		setTimeout(() => {
			setSizeDepartment(paginationDepartment?.page + 1);
		}, 1000);
	};
	const t2 = data?.users
		?.map((user: User) => {
			return dataHuman
				?.filter((human: Human) => user?.id === human?.value)
				.map((human: any) => ({
					...human,
				}));
		})
		.flat();
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
				title: `${t('delete_work_schedule')}`,
				html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data.title}?`,
				padding: '2em',
				showCancelButton: true,
				cancelButtonText: `${t('cancel')}`,
				confirmButtonText: `${t('confirm')}`,
				reverseButtons: true,
			})
			.then((result) => {
				if (result.value) {
					deleteCalendar(data?.id)
						.then(() => {
							showMessage(`${t('delete_work_schedules_success')}`, 'success');
							mutate();
							router.push('/hrm/calendar');
						})
						.catch(() => {
							showMessage(`${t('delete_work_schedules_error')}`, 'error');
						});
				}
			});
	};

	const formikRef = useRef<any>();
	useEffect(() => {
		if (formikRef.current) {
			formikRef.current.setFieldValue('userIds', usersParticipate);
		}
	}, [usersParticipate]);
	return (
		<div className="p-5">
			  {(isLoading || loadDetail) && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
			<ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
				<li>
					<Link href="/hrm/dashboard" className="text-primary hover:underline">
						{t('dashboard')}
					</Link>
				</li>
				<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
					<Link href="/hrm/calendar" className="text-primary hover:underline">
						<span>{t('Job assignment')}</span>
					</Link>
				</li>
				<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
					<span>
						{!disable && (data ? t('update_job_assignment') : t('add_calendar'))}
						{disable && t('detail_calendar')}
					</span>
				</li>
			</ul>
			<div className="header-page-bottom mb-4 flex justify-between pb-4">
				<h1 className="page-title">
					{!disable && (data ? t('update_job_assignment') : t('add_calendar'))}
					{disable && t('detail_calendar')}
				</h1>
				<div className="flex" style={{ alignItems: 'center' }}>
					{disable && (
						<RBACWrapper permissionKey={['calendar:update']} type={'AND'}>
							<Link href={`/hrm/calendar/${router?.query.id}`}>
								<button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('edit')}</button>
							</Link>
						</RBACWrapper>
					)}
					<Link href="/hrm/calendar">
						<div className="btn btn-primary btn-sm back-button m-1 h-9">
							<IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
							<span>{t('back')}</span>
						</div>
					</Link>
				</div>
			</div>
			<Formik
				initialValues={{
					userIds: data?.users
						? data?.users.map((i: any) => ({
								value: i.id,
								label: i.fullName,
						  }))
						: [],
					title: data ? `${data?.title}` : '',
					startDate: data ? data?.startDate : selectedDate?.startDate,
					endDate: data ? data?.endDate : selectedDate?.endDate,
					location: data ? `${data?.location}` : '',
					level: data ? `${data?.level}` : null,
					description: data ? `${data?.description}` : '',
					// departments: data ? data.departments : [0],
					type: data ? `${data?.type}` : 'ALL',
					departments: data?.departments
						? data?.departments?.map((i: any) => ({
								value: i?.id,
								label: i?.name,
						  }))
						: [0],
				}}
				validationSchema={SubmittedForm}
				onSubmit={(values) => {
					handleAddWorkSchedule(values);
				}}
				innerRef={formikRef}
				enableReinitialize
			>
				{({ errors, touched, submitCount, setFieldValue, values }) => (
					<Form className="space-y-5">
						<div className="mb-3 flex gap-2">
							<div className="flex-1">
								<label className="label" htmlFor="title">
									{t('calendar_title')}
									<span style={{ color: 'red' }}> *</span>
								</label>
								<Field disabled={disable} autoComplete="off" name="title" type="text" id="title" placeholder={t('fill_calendar_title')} className="form-input" />
								{submitCount ? errors.title ? <div className="mt-1 text-danger"> {`${errors.title}`} </div> : null : ''}
							</div>
							<div className="flex-1">
								<label className="label" htmlFor="location">
									{t('address')}
									<span style={{ color: 'red' }}> *</span>
								</label>
								<Field disabled={disable} autoComplete="off" name="location" type="text" id="location" placeholder={t('enter_address')} className="form-input" />
								{submitCount ? errors.location ? <div className="mt-1 text-danger"> {`${errors.location}`} </div> : null : ''}
							</div>
						</div>

						<div className="mb-3 flex gap-2">
							<div className="flex-1">
								<label className="label" htmlFor="startDate">
									{t('from_time')}
									<span style={{ color: 'red' }}>* </span>
								</label>
								<Flatpickr
									disabled={disable}
									options={{
										enableTime: true,
										dateFormat: 'd-m-Y H:i',
										time_24hr: true,
										locale: {
											...chosenLocale,
										},
									}}
									value={dayjs(values?.startDate).format('DD-MM-YYYY HH:mm')}
									onChange={(e: any) => {
										if (e?.length > 0) {
											setFieldValue('startDate', dayjs(e[0]).toISOString());
										}
									}}
									placeholder={`${t('choose_from_time')}`}
									className="calender-input form-input"
								/>
								{submitCount ? errors.startDate ? <div className="mt-1 text-danger"> {`${errors.startDate}`} </div> : null : ''}
							</div>
							<div className="flex-1">
								<label className="label" htmlFor="endDate">
									{t('end_time')} <span style={{ color: 'red' }}>* </span>
								</label>
								<Flatpickr
									disabled={disable}
									options={{
										enableTime: true,
										dateFormat: 'd-m-Y H:i',
										time_24hr: true,
										locale: {
											...chosenLocale,
										},
									}}
									value={dayjs(values?.endDate).format('DD-MM-YYYY HH:mm')}
									placeholder={`${t('choose_end_time')}`}
									onChange={(e: any) => {
										if (e?.length > 0) {
											setFieldValue('endDate', dayjs(e[1]).toISOString());
										}
									}}
									className="calender-input form-input"
								/>
								{submitCount ? errors.endDate ? <div className="mt-1 text-danger"> {`${errors.endDate}`} </div> : null : ''}
							</div>
						</div>
						<div className="mb-3 flex gap-2">
							<div className="flex-1">
								<label>
									{t('level')} <span style={{ color: 'red' }}> *</span>
								</label>
								<div className="mt-3">
									<label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
										<Field disabled={disable} autoComplete="off" type="radio" name="level" value="LESS_IMPORTANT" className="form-radio" />
										<span className="ltr:pl-2 rtl:pr-2">{t('less_important')}</span>
									</label>
									<label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
										<Field
											disabled={disable}
											autoComplete="off"
											type="radio"
											name="level"
											value="NORMAL"
											className="form-radio "
											style={{ color: 'rgb(0 171 85 / var(--tw-bg-opacity))' }}
										/>
										<span className="ltr:pl-2 rtl:pr-2">{t('normal')}</span>
									</label>
									<label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
										<Field autoComplete="off" disabled={disable} type="radio" name="level" value="IMPORTANT" className="form-radio " style={{ color: 'orange' }} />
										<span className="ltr:pl-2 rtl:pr-2">{t('important')}</span>
									</label>
									<label className="inline-flex cursor-pointer">
										<Field autoComplete="off" disabled={disable} type="radio" name="level" value="HIGH_PRIORITY" className="form-radio " style={{ color: 'red' }} />
										<span className="ltr:pl-2 rtl:pr-2">{t('priority')}</span>
									</label>
								</div>{' '}
								{submitCount ? errors.level ? <div className="mt-1 text-danger"> {`${errors.level}`} </div> : null : ''}
							</div>
						</div>
						<div className="mb-3">
							<label className="label" htmlFor="description">
								{t('description')}
							</label>
							<Field
								disabled={disable}
								autoComplete="off"
								id="description"
								as="textarea"
								rows="2"
								name="description"
								className="form-input"
								placeholder={t('fill_work_schedule_description')}
							/>
						</div>
						<div className="flex">
							<div className="mb-3 w-1/2">
								<label className="label" htmlFor="type">
									{t('participants')}
									<span style={{ color: 'red' }}> *</span>
								</label>
								<div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
									<label style={{ marginBottom: 0, marginRight: '10px' }}>
										<Field
											// disabled={data}
											autoComplete="off"
											type="radio"
											name="type"
											value={true}
											checked={values?.type === 'ALL'}
											className="form-checkbox rounded-full"
											onChange={(e: any) => {
												if (e.target.checked) {
													setFieldValue('type', 'ALL');
												} else {
													setFieldValue('type', 'HUMAN');
												}
											}}
										/>
										{t('allHuman')}
									</label>
									<label style={{ marginBottom: 0 }}>
										<Field
											// disabled={data}
											autoComplete="off"
											type="radio"
											name="type"
											value={false}
											checked={values?.type === 'HUMAN'}
											className="form-checkbox rounded-full"
											onChange={(e: any) => {
												if (e.target.checked) {
													setFieldValue('type', 'HUMAN');
												} else {
													setFieldValue('type', 'ALL');
												}
											}}
										/>
										{t('choose_human')}
									</label>
								</div>
							</div>
						</div>
						{values?.type === 'HUMAN' && (
							<div className="flex justify-between gap-5" style={{ marginTop: '10px' }}>
								<div className="mb-5 w-1/2">
									<label className="label" htmlFor="departments">
										{' '}
										{t('departmentParticipate')}
									</label>
									<Select
										id="departments"
										name="departments"
										placeholder={t('choose_department')}
										onInputChange={(e) => handleSearchDepartment(e)}
										options={dataDepartment}
										// isDisabled={true}
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
									<label htmlFor="userIds" className="label">
										{t('usersParticipate')}
									</label>
									<div onClick={() => setOpenModalApproval(true)}>
										<Select
											id="userIds"
											name="userIds"
											onInputChange={(e) => handleSearchHuman(e)}
											options={dataHuman}
											isLoading={loadHuman}
											onMenuOpen={() => setSizeHuman(1)}
											onMenuScrollToBottom={() => handleOnScrollBottomHuman()}
											placeholder={t('choose_human')}
											isMulti
											closeMenuOnSelect={false}
											maxMenuHeight={160}
											value={values.userIds}
											onChange={(e) => {
												setFieldValue('userIds', usersParticipate);
											}}
											menuIsOpen={false}
											openMenuOnFocus={false}
										/>
									</div>
								</div>
							</div>
						)}
						<div className="!mt-8 flex items-center justify-end">
							<Link href="/hrm/calendar">
								{!disable && (
									<button type="button" className="btn btn-outline-danger cancel-button">
										{t('cancel')}
									</button>
								)}
							</Link>
							{disable && (
								<RBACWrapper permissionKey={['calendar:remove']} type={'AND'}>
									<button type="button" className="btn btn-outline-danger ltr:ml-4 rtl:mr-4" onClick={() => handleDelete(data)}>
										{t('delete')}
									</button>
								</RBACWrapper>
							)}
							{!disable && (
								<button type="submit" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => console.log(errors)}>
									{data ? t('update') : t('add')}
								</button>
							)}
						</div>
					</Form>
				)}
			</Formik>
			<ApprovalModal openModal={openModalApproval} setOpenModal={setOpenModalApproval} setUsersParticipate={setUsersParticipate} usersParticipate={usersParticipate} />
		</div>
	);
};

export default AddWorkScheduleModal;
