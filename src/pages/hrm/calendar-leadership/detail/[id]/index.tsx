import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { showMessage } from '@/@core/utils';
import IconBack from '@/components/Icon/IconBack';
import { IconLoading } from '@/components/Icon/IconLoading';
import { createCalendarLeaderShip, deleteCalendarLeaderShip, detailCalendarLeaderShip, updateCalendarLeaderShip } from '@/services/apis/calendarLeadership.api';
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
	const fileRef = useRef<any>();
	const [usersParticipate, setUsersParticipate] = useState<any>([]);
	const [openModalApproval, setOpenModalApproval] = useState(false);
	//scroll
	const [loadHuman, setLoadHuman] = useState(false);

	const [dataHuman, setDataHuman] = useState<any>([]);
	const [pageHuman, setSizeHuman] = useState<any>(1);
	const [debouncedPageHuman] = useDebounce(pageHuman, 500);
	const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
	const [queryDepartment, setQueryDepartment] = useState<any>();
	const [loadDepartment, setLoadDepartment] = useState(false);
	const [dataDepartment, setDataDepartment] = useState<any>([]);
	const [initialValue, setInitialValue] = useState<any>();

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
		dispatch(setPageTitle(disable ? `${t('detail_calendar_leadership')}` : data ? t('update_calendar_leadership') : t('add_calendar')));
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]);
	const [create, setCreate] = useState(false);
	const handleData = () => {
		if (Number(router.query.id)) {
			detailCalendarLeaderShip(router.query.id)
				.then((res) => {
					setData(res.data);
					setIsLoading(false);
					res?.data?.createdById === userData?.data?.id ? setCreate(true) : setCreate(false);
					if (formikRef.current) {
						formikRef.current.setFieldValue('users', { value: res.data.users[0].id, label: `${res.data.users[0].fullName} - ${res.data.users[0].position?.name}` });
					}
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
		if (paginationHuman?.page === undefined) return;
		if (paginationHuman?.page === 1) {
			setDataHuman(
				manages?.data?.map((item: any) => ({
					value: item.id,
					label: `${item.fullName} - ${item.position?.name}`,
				})),
			);
			setLoadHuman(false);
		} else {
			setDataHuman([
				...dataHuman,
				...manages?.data?.map((item: any) => ({
					value: item.id,
					label: `${item.fullName} - ${item.position?.name}`,
				})),
			]);
			setLoadHuman(false);
		}
	}, [paginationHuman, debouncedPageHuman, debouncedQueryHuman]);
	useEffect(() => {
		setInitialValue({
			users: data ? `${data?.users}` : '',
			status: data ? `${data?.status}` : '',
			startDate: data ? data?.startDate : selectedDate?.startDate,
			endDate: data ? data?.endDate : selectedDate?.endDate,
			location: data ? `${data?.location}` : '',
			level: data ? `${data?.level}` : null,
			description: data ? `${data?.description}` : '',
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
		status: Yup.string().required(`${t('please_fill_title_work_schedule')}`),
		startDate: Yup.date().typeError(`${t('please_fill_work_start_date')}`),
		endDate: Yup.date().typeError(`${t('please_fill_work_end_date')}`),
		type: Yup.string().required(),
	});
	const { isAddWorkScheduleModal, setIsAddWokScheduleModal, params, minStartDate, minEndDate, saveWorkSchedule } = props;
	const { data: calendar, pagination, mutate } = Calendars({ sortBy: 'id.ASC', ...router.query });

	const handleAddWorkSchedule = (value: any) => {
		if (router.query.id === 'create') {
			createCalendarLeaderShip({
				...value,
				users: value?.users?.value,
			})
				.then(() => {
					showMessage(`${t('create_work_schedule_success')}`, 'success');
					dispatch(clearDate());
					router.push(`/hrm/calendar-leadership`);
				})
				.catch((err) => {
					showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
					dispatch(clearDate());
				});
		} else {
			updateCalendarLeaderShip(router.query.id, {
				...value,
				userIds: value?.userIds?.map((i: any) => i.value),
				departments: value?.departments?.map((i: any) => i.value),
			})
				.then(() => {
					showMessage(`${t('update_work_schedule_success')}`, 'success');
					router.push(`/hrm/calendar-leadership`);
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
				html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data.status}?`,
				padding: '2em',
				showCancelButton: true,
				cancelButtonText: `${t('cancel')}`,
				confirmButtonText: `${t('confirm')}`,
				reverseButtons: true,
			})
			.then((result) => {
				if (result.value) {
					deleteCalendarLeaderShip(data?.id)
						.then(() => {
							showMessage(`${t('delete_work_schedules_success')}`, 'success');
							mutate();
							router.push('/hrm/calendar-leadership');
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
			formikRef.current.setFieldValue('users', usersParticipate);
		}
	}, [usersParticipate]);
	return (
		<div className="p-5">
			{isLoading && (
				<div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
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
					<Link href="/hrm/calendar-leadership" className="text-primary hover:underline">
						<span>{t('calendar_leadership')}</span>
					</Link>
				</li>
				<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
					<span>
						{!disable && (data ? t('update_calendar_leadership') : t('add_calendar'))}
						{disable && t('detail_calendar_leadership')}
					</span>
				</li>
			</ul>
			<div className="header-page-bottom mb-4 flex justify-between pb-4">
				<h1 className="page-title">
					{!disable && (data ? t('update_calendar_leadership') : t('add_calendar'))}
					{disable && t('detail_calendar_leadership')}
				</h1>
				<div className="flex" style={{ alignItems: 'center' }}>
					{
						<RBACWrapper permissionKey={['calendar:update']} type={'AND'}>
							<Link href={`/hrm/calendar-leadership/${router?.query.id}`}>
								<button className="edit-page-btn btn btn-primary h-9 ltr:ml-4 rtl:mr-4">{t('edit')}</button>
							</Link>
						</RBACWrapper>
					}
					<Link href="/hrm/calendar-leadership">
						<div className="btn btn-primary btn-sm back-button m-1 h-9">
							<IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
							<span>{t('back')}</span>
						</div>
					</Link>
				</div>
			</div>
			<Formik
				initialValues={{
					users: data ? { value: data?.users[0]?.id, label: data?.users[0]?.fullName } : '',
					status: data ? `${data?.status}` : '',
					startDate: data ? data?.startDate : selectedDate?.startDate,
					endDate: data ? data?.endDate : selectedDate?.endDate,
					description: data ? `${data?.description}` : '',
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
								<label className="label" htmlFor="users">
									{t('leadership_information')}
								</label>
								<div onClick={() => setOpenModalApproval(true)}>
									<Select
										isDisabled={true}
										id="users"
										name="users"
										onInputChange={(e) => handleSearchHuman(e)}
										options={dataHuman}
										onMenuOpen={() => setSizeHuman(1)}
										onMenuScrollToBottom={() => handleOnScrollBottomHuman()}
										placeholder={t('choose_leadership_information')}
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
							<div className="flex-1">
								<label className="label" htmlFor="status">
									{t('status1')}
									<span style={{ color: 'red' }}> *</span>
								</label>
								<Field disabled={true} autoComplete="off" name="status" type="text" id="status" placeholder={t('fill_calendar_title')} className="form-input" />
								{submitCount ? errors.status ? <div className="mt-1 text-danger"> {`${errors.status}`} </div> : null : ''}
							</div>
						</div>

						<div className="mb-3 flex gap-2">
							<div className="flex-1">
								<label className="label" htmlFor="startDate">
									{t('from_time')}
									<span style={{ color: 'red' }}>* </span>
								</label>
								<Flatpickr
									disabled={true}
									options={{
										enableTime: true,
										dateFormat: 'H:i d-m-Y',
										time_24hr: true,
										locale: {
											...chosenLocale,
										},
									}}
									value={dayjs(values?.startDate).format('HH:mm DD-MM-YYYY')}
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
									disabled={true}
									options={{
										enableTime: true,
										dateFormat: 'H:i d-m-Y',
										time_24hr: true,
										locale: {
											...chosenLocale,
										},
									}}
									value={dayjs(values?.endDate).format('HH:mm DD-MM-YYYY')}
									placeholder={`${t('choose_end_time')}`}
									onChange={(e: any) => {
										if (e?.length > 0) {
											setFieldValue('endDate', dayjs(e[0]).toISOString());
										}
									}}
									className="calender-input form-input"
								/>
								{submitCount ? errors.endDate ? <div className="mt-1 text-danger"> {`${errors.endDate}`} </div> : null : ''}
							</div>
						</div>
						<div className="mb-3 " style={{ marginTop: '20px' }}>
							<label className="label" htmlFor="description">
								{t('notes')}
							</label>
							<Field disabled={true} autoComplete="off" id="description" as="textarea" rows="2" name="description" className="form-input" placeholder={t('enter_note')} />
						</div>

						<div className="!mt-8 flex items-center justify-end">
							<Link href="/hrm/calendar-leadership">
								{!disable && (
									<button type="button" className="btn btn-outline-danger cancel-button">
										{t('cancel')}
									</button>
								)}
							</Link>
						</div>
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default AddWorkScheduleModal;
