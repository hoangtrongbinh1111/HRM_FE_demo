import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import { Lao } from '@/utils/lao';
import Select, { StylesConfig } from 'react-select';
import { DropdownSuperior } from '@/services/swr/dropdown.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { LeavingLateEarlyForward } from '@/services/apis/leaving-late-early.api';
import { DropdownDepartment } from '@/services/swr/dropdown.swr';
import { useProfile } from '@/services/swr/profile.swr';
import dayjs from 'dayjs';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
// import '.style'
import { IRootState } from '@/store';
import { convertDayjsToArray, formatDate } from '@/utils/commons';
import { Shifts } from '@/services/swr/shift.swr';
interface Props {
	[key: string]: any;
}
const cycles = [
	{
		value: 1,
		label: 'Ngày',
	},
	{
		value: 2,
		label: 'Tuần',
	},
	{
		value: 3,
		label: 'Tháng',
	},
	{
		value: 4,
		label: 'Luân phiên',
	},
];

const OverTime = ({ ...props }) => {
	const formikRef = useRef<any>();
	const { t } = useTranslation();
	const router = useRouter();
	const [dataSuperiorDropdown, setDataSuperiorDropdown] = useState<any>([]);
	const [page, setPage] = useState(1);
	const [searchSuperior, setSearchSuperior] = useState<any>();
	const [dataDepartment, setDataDepartment] = useState<any>([]);
	const [departmentId, setDepartmentId] = useState<any>();
	const SubmittedForm = Yup.object().shape({
		// approverId: new Yup.ObjectSchema().required(`${t('please_fill_approver')}`),
	});
	const [number, setNumber] = useState<any>(1);
	const [isHigh, setIsHigh] = useState<any>('false');
	const [T, setT] = useState<any>(1);
	const [start, setStart] = useState<any>();
	const [end, setEnd] = useState<any>();
	const [daysArray, setDaysArray] = useState<any[]>([]);
	const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, perPage: 100 });
	const { data: superiorDropdown, pagination: superiorPagination, isLoading: superiorLoading } = DropdownSuperior({ page: page, search: searchSuperior, departmentId: departmentId });
	const { data: shiftss, pagination: paginationShift } = Shifts({
		sortBy: 'id.ASC',
		perPage: 100,
	});
	const shifts = shiftss?.data.map((item: any) => ({
		value: item.id,
		label: item.name,
	}));
	const { data: userData } = useProfile();
	const themeConfig = useSelector((state: IRootState) => state.themeConfig);
	const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;
	useEffect(() => {
		if (paginationDepartment?.page === undefined) return;
		if (paginationDepartment?.page === 1) {
			setDataDepartment(dropdownDepartment?.data);
		} else {
			setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
		}
	}, [departmentId]);

	useEffect(() => {
		if (paginationDepartment?.page === undefined) return;
		if (paginationDepartment?.page === 1) {
			setDataDepartment(dropdownDepartment?.data);
		} else {
			setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paginationDepartment]);
	useEffect(() => {
		if (superiorPagination?.page === undefined) return;
		if (superiorPagination?.page === 1) {
			if (isHigh === 'true') {
				setDataSuperiorDropdown(superiorDropdown?.data);
			} else {
				const dataSuperior = superiorDropdown?.data?.filter((item: any) => item.value !== userData?.data?.id);
				setDataSuperiorDropdown(dataSuperior);
			}
		} else {
			const dataSuperior = [...dataSuperiorDropdown, ...superiorDropdown?.data];
			if (isHigh === 'true') {
				setDataSuperiorDropdown(dataSuperior);
			} else {
				setDataSuperiorDropdown(dataSuperior?.filter((item: any) => item.value !== userData?.data?.id));
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [superiorPagination]);

	useEffect(() => {
		const days = [];
		if (T === 4 && !(start && end)) {
			for (let i = 1; i <= number; i++) {
				days.push(`${i}`);
			}
		}
		if (start && end) {
			const diffInDays = dayjs(end).diff(dayjs(start), 'day');
			const dayMap: { [key in 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday']: string } = {
				Monday: 'T2',
				Tuesday: 'T3',
				Wednesday: 'T4',
				Thursday: 'T5',
				Friday: 'T6',
				Saturday: 'T7',
				Sunday: 'CN',
			};
			if (T === 1) {
				for (let i = 0; i <= diffInDays; i++) {
					const day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' = dayjs(start).add(i, 'day').format('dddd') as
						| 'Monday'
						| 'Tuesday'
						| 'Wednesday'
						| 'Thursday'
						| 'Friday'
						| 'Saturday'
						| 'Sunday';
					const dayVN = dayMap[day]; // Bây giờ TypeScript sẽ hiểu biến 'day' là khóa hợp lệ
					const formattedDate = dayjs(start).add(i, 'day').format('DD/MM'); // Format ngày tháng
					days.push(`${dayVN}, ${formattedDate}`); // Thêm vào mảng với định dạng "T2, 01/01"
				}
			} else if (T === 2) {
				// Chu kỳ tuần
				const dayMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
				for (let i = 0; i < 7; i++) {
					days.push(dayMap[i]);
				}
			} else if (T === 3) {
				// Chu kỳ tháng
				for (let i = 1; i <= 31; i++) {
					days.push(`${i}`);
				}
			}
			if (T === 4) {
				if (formikRef.current) {
					formikRef.current.setFieldValue('number', dayjs(end).diff(dayjs(start), 'day'));
				}
				for (let i = 1; i <= dayjs(end).diff(dayjs(start), 'day'); i++) {
					days.push(`${i}`);
				}
			}
		}
		setDaysArray(days);
	}, [start, end, T, number]);
	const handleMenuScrollToBottom = () => {
		setTimeout(() => {
			setPage(superiorPagination?.page + 1);
		}, 1000);
	};
	const customStyles: StylesConfig<any, false> = {
		menuPortal: (base: any) => ({
			...base,
			zIndex: 9999,
		}),
	};
	const handleProposal = (param: any) => {
		props?.setUsersParticipate(param?.approverId);
		props.setOpenModal(false);
	};
	const handleCancel = () => {
		setNumber(1);
		setStart('');
		setEnd('');
		props.setOpenModal(false);
	};
	return (
		<Transition appear show={props.openModal ?? false} as={Fragment}>
			<Dialog
				as="div"
				open={props.openModal}
				onClose={() => {
					props.setOpenModal(false);
				}}
				className="relative z-50"
			>
				<Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
							<Dialog.Panel className="panel w-full max-w-[1250px] overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
								<button
									type="button"
									onClick={() => {
										handleCancel();
									}}
									className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
								>
									<IconX />
								</button>
								<div
									style={{backgroundColor: 'rgb(141,153,68)', color: 'white' }}
									className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5"
								>
									{t('set_shift_by_time')}
								</div>
								<div>
									<div className="p-5">
										<Formik
											initialValues={{
												departmentId: '',
												approverId: '',
												startDate: '',
												number: 1,
												endDate: '',
												cycle: { value: 1, label: 'Ngày' },
											}}
											innerRef={formikRef}
											onSubmit={async (values, { resetForm }) => {
												await handleProposal(values);
												resetForm();
											}}
											enableReinitialize
										>
											{({ errors, values, setFieldValue, submitCount }) => (
												<Form className="space-y-5">
													<div className="mb-5 flex justify-between gap-4">
														<div className="mb-5 flex w-1/2">
															<label style={{ width: '20%' }} htmlFor="departmentId">
															{t('department')}<span style={{ color: 'red' }}>*</span>
															</label>
															<div style={{ width: '80%' }}>
																<Select
																	id="departmentId"
																	name="departmentId"
																	placeholder={t('choose_department')}
																	options={dataDepartment}
																	maxMenuHeight={160}
																	value={dataDepartment.find((e: any) => e.value === departmentId)}
																	onMenuOpen={() => setPage(1)}
																	onMenuScrollToBottom={handleMenuScrollToBottom}
																	isLoading={isLoadingDepartment}
																	onChange={(e) => {
																		setFieldValue('departmentId', e);
																		setDepartmentId(e?.value);
																	}}
																	menuPortalTarget={document.body} // Hiển thị menu bên ngoài form
																	styles={customStyles}
																/>
															</div>
														</div>
														<div className="mb-5 flex w-1/2">
															<label htmlFor="approverId" style={{ width: '30%' }}>
															{t('employee')}<span style={{ color: 'red' }}>*</span>
															</label>
															<div style={{ width: '70%' }}>
																<Select
																	id="approverId"
																	name="approverId"
																	options={dataSuperiorDropdown.map((i: any) => ({ label: `${i.label} - ${i.position_name}`, value: i.value }))}
																	onMenuOpen={() => setPage(1)}
																	onMenuScrollToBottom={handleMenuScrollToBottom}
																	placeholder={t('choose_human')}
																	maxMenuHeight={160}
																	isMulti
																	closeMenuOnSelect={false}
																	isLoading={superiorLoading}
																	value={values?.approverId}
																	onInputChange={(e) => setSearchSuperior(e)}
																	onChange={(e) => {
																		setFieldValue('approverId', e);
																	}}
																	menuPortalTarget={document.body} // Hiển thị menu bên ngoài form
																	styles={{
																		menuPortal: (base: any) => ({
																			...base,
																			zIndex: 9999,
																		}),
																	}}
																/>
															</div>
															{submitCount && errors.approverId ? <div className="mt-1 text-danger">{`${errors.approverId}`}</div> : null}
														</div>
													</div>
													<div className="mb-5 flex justify-between gap-4">
														<div className="mb-5 flex w-1/2">
															<label style={{ width: '20%' }} htmlFor="startDate">
															{t('from_date')}<span style={{ color: 'red' }}>*</span>
															</label>
															<div style={{ width: '80%' }}>
																<Flatpickr
																	options={{
																		enableTime: false,
																		dateFormat: 'd-m-Y',
																		locale: {
																			...chosenLocale,
																		},
																	}}
																	value={dayjs(values?.startDate).format('DD-MM-YYYY')}
																	onChange={(e: any) => {
																		if (e?.length > 0) {
																			setFieldValue('startDate', dayjs(e[0]).toISOString());
																			setStart(dayjs(e[0]).format('YYYY-MM-DD'));
																		}
																	}}
																	placeholder="Chọn ngày bắt đầu"
																	className="calender-input form-input"
																/>
															</div>
														</div>
														<div className="mb-5 flex w-1/2">
															<label style={{ width: '30%' }} htmlFor="endDate">
															{t('date_of_out')}<span style={{ color: 'red' }}>*</span>
															</label>
															<div style={{ width: '70%' }}>
																<Flatpickr
																	options={{
																		enableTime: false,
																		dateFormat: 'd-m-Y',
																		locale: {
																			...chosenLocale,
																		},
																	}}
																	value={dayjs(values?.endDate).format('DD-MM-YYYY')}
																	placeholder="Chọn ngày kết thúc"
																	onChange={(e: any) => {
																		if (e?.length > 0) {
																			setFieldValue('endDate', dayjs(e[0]).toISOString());
																			setEnd(dayjs(e[0]).format('YYYY-MM-DD'));
																		}
																	}}
																	className="calender-input form-input"
																/>
															</div>
														</div>
													</div>
													<div className="mb-5 flex justify-between gap-4">
														<div className="mb-5 flex w-1/2">
															<label style={{ width: '20%' }} htmlFor="cycle">
															{t('cycle')}<span style={{ color: 'red' }}>*</span>
															</label>
															<div style={{ width: '80%' }}>
																<Select
																	id="cycle"
																	name="cycle"
																	options={cycles}
																	onMenuOpen={() => setPage(1)}
																	placeholder="Ngày"
																	closeMenuOnSelect={true}
																	maxMenuHeight={160}
																	value={values?.cycle}
																	onChange={(e) => {
																		setT(e?.value);
																		setFieldValue('cycle', e);
																	}}
																	menuPortalTarget={document.body} // Hiển thị menu bên ngoài form
																	styles={{
																		menuPortal: (base: any) => ({
																			...base,
																			zIndex: 9999,
																		}),
																	}}
																/>
															</div>
														</div>
														{values?.cycle?.value === 4 ? (
															<div className="mb-5 flex w-1/2">
																<label style={{ width: '30%' }} htmlFor="number">
																	{t('alternate')} <span style={{ color: 'red' }}>* </span>
																</label>
																<Field
																	style={{ width: '70%' }}
																	autoComplete="off"
																	name="number"
																	type="number"
																	id="number"
																	onChange={(e: any) => {
																		setNumber(e.target.value);
																		setFieldValue('number', e.target.value);
																	}}
																	placeholder={`${t('enter_name_task')}`}
																	className="form-input"
																/>
															</div>
														) : (
															<></>
														)}
													</div>
													{(values.startDate && values.endDate) || values?.cycle?.value === 4 ? (
														<div className="mb-5 flex justify-between gap-4" style={{ maxHeight: '400px', backgroundColor: '#959E5E', overflow: 'auto' }}>
															<div className="overflow-x-auto" style={{ width: '100%', backgroundColor: '#959E5E' }}>
																<table className="min-w-[600px] border-collapse border border-gray-200">
																	<thead>
																		<tr>
																			<th
																				className="border border-gray-300 px-4 py-2 text-white"
																				style={{
																					fontSize: '16px',
																					minWidth: '200px',
																					fontWeight: 'bold',
																					position: 'sticky',
																					left: 0,
																					top: 0,
																					backgroundColor: '#959E5E', // Explicitly set background color
																					zIndex: 2, // Higher z-index for the header to stay above the rows
																				}}
																			>
																				{t('shift_day')}
																			</th>
																			{daysArray.map((day, index) => (
																				<th
																					key={index}
																					className="border border-gray-300 px-4 py-2 text-white"
																					style={{
																						fontSize: '16px',
																						textAlign: 'center',
																						minWidth: '130px',
																						fontWeight: 'bold',
																						top: 0,
																						position: 'sticky',
																						zIndex: 1, // Ensure headers are above the rest of the content
																						backgroundColor: '#959E5E' // Explicitly set background color
																					}}
																				>
																					{day}
																				</th>
																			))}
																		</tr>
																	</thead>
																	<tbody>
																		{shifts.map((shift: any, shiftIndex: any) => (
																			<tr key={shiftIndex}>
																				<td
																					className="border border-gray-300 px-4 py-2 text-white"
																					style={{
																						minWidth: '200px',
																						position: 'sticky',
																						left: 0,
																						color: 'black',
																						backgroundColor: 'white', // Explicitly set background color
																						zIndex: 1, // Ensure it's above other columns when scrolling
																					}}
																				>
																					{shift.label} ({shift.value})
																				</td>
																				{daysArray.map((_, dayIndex) => (
																					<td key={dayIndex} className="border border-gray-300 px-4 py-2 text-center" style={{ minWidth: '80px' }}>
																						<input style={{ width: '18px', height: '18px' }} type="checkbox" className="custom-checkbox" />
																					</td>
																				))}
																			</tr>
																		))}
																	</tbody>
																</table>
															</div>
														</div>
													) : (
														<div className="mb-5 flex justify-between gap-4">
															<div className="overflow-x-auto" style={{ width: '100%' }}>
																<table className="min-w-[600px] border-collapse border border-gray-200">
																	<thead>
																		<tr>
																			<th
																				className="border border-gray-300 px-4 py-2 text-white"
																				style={{ fontSize: '20px', textAlign: 'center', border: '1px solid #959E5E', backgroundColor: '#959E5E' }}
																			>
																				{t('shift_weekday')}
																			</th>
																		</tr>
																	</thead>
																	<tbody>
																		<tr>
																			<div style={{ marginTop: '20px', fontWeight: 'bold' }} className="mb-5 text-center text-red-500">
																			{t('please_enter_start_and_end_date')}
																			</div>
																		</tr>
																	</tbody>
																</table>
															</div>
														</div>
													)}
													<div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
														<button type="button" className="btn btn-outline-danger cancel-button " onClick={() => handleCancel()}>
														{t('close')}
														</button>
														<button type="submit" style={{ backgroundColor: 'aqua !important' }} className="btn add-button tl ltr:ml-4 rtl:mr-4">
														{t('setup')}
														</button>
													</div>
												</Form>
											)}
										</Formik>
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

export default OverTime;
