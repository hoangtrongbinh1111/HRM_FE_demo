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
import Select, { components, StylesConfig, GroupBase, OptionProps, CSSObjectWithLabel } from 'react-select';
import { DropdownSuperior, DropdownUsers, DropdownUsers2 } from '@/services/swr/dropdown.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { LeavingLateEarlyForward } from '@/services/apis/leaving-late-early.api';
import { DropdownDepartment } from '@/services/swr/dropdown.swr';
import { useProfile } from '@/services/swr/profile.swr';
import dayjs from 'dayjs';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
// import '.style'
import { Loader } from '@mantine/core';
import { IRootState } from '@/store';
import { convertDayjsToArray, formatDate, loadMore } from '@/utils/commons';
import { Shifts } from '@/services/swr/shift.swr';
import { addUsersShift } from '@/services/apis/user-shift.api';
import { AllDepartment } from '@/services/swr/department.swr';
import { useDebounce } from 'use-debounce';
interface Props {
	[key: string]: any;
}
interface DepartmentOption {
	label: string;
	value: string;
	total: string;
}

const OverTime = ({ ...props }) => {
	const formikRef = useRef<any>();
	const { t } = useTranslation();
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [searchSuperior, setSearchSuperior] = useState<any>();

	const [isAdd, setIsAdd] = useState(false);
	const [detail, setDetail] = useState<any>([]);

	const [queryPerson, setQueryPerson] = useState<any>();
	const [dataPersonSuperior, setDataPersonSuperior] = useState<any>([]);
	const [pagePersonSuperior, setSizePersonSuperior] = useState<any>(1);
	const [debouncedQueryPersonSuperior] = useDebounce(queryPerson, 500);

	const { data: departmentparent } = AllDepartment();
	const dataDepartment = departmentparent?.data[0]?.map((i: any) => ({
		value: i.id,
		label: i.name,
	}));

	const handleChange = (selected: any) => {
		setSelectedOptions(selected);
	};
	const CustomOption = (props: any) => {
		return (
			<components.Option {...props}>
				<input type="checkbox" checked={props.isSelected} onChange={() => null} style={{ marginRight: 8 }} />
				<label>{props.label}</label>
			</components.Option>
		);
	};
	const [selectedOptions2, setSelectedOptions2] = useState([]);
	const handleChange2 = (selected: any) => {
		setSelectedOptions2(selected);
	};
	const [isSelectAll, setIsSelectAll] = useState(false);
	const [menuIsOpen, setMenuIsOpen] = useState(false);
	const [number, setNumber] = useState<any>(1);
	const [T, setT] = useState<any>({
		value: 1,
		label: `${t('date_and_range_picker')}`,
	});
	const [start, setStart] = useState<any>();
	const [end, setEnd] = useState<any>();
	const [daysArray, setDaysArray] = useState<any[]>([]);
	// Get the array of department IDs
	const departmentIds1 = selectedOptions2?.map((i: any) => i?.value);

	let departmentIds = '';

	if (departmentIds1 && departmentIds1.length > 0) {
		departmentIds = departmentIds1.map((id, index) => (index === 0 ? `${id}` : `departmentIds=${id}`)).join('&');
	}
	const { data: superiorDropdown, pagination: superiorPagination } = DropdownUsers2({
		departmentIds: departmentIds ? departmentIds : 0,
		search: debouncedQueryPersonSuperior?.search,
	});

	const { data: shiftss, pagination: paginationShift } = Shifts({
		sortBy: 'id.ASC',
		perPage: 100,
	});
	const shifts = shiftss?.data.map((item: any) => ({
		...item,
		value: item.id,
		label: item.name,
	}));
	const { data: userData } = useProfile();
	const themeConfig = useSelector((state: IRootState) => state.themeConfig);
	const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;
	const cycles = [
		{
			value: 1,
			label: `${t('date_and_range_picker')}`,
		},
		{
			value: 2,
			label: `${t('week')}`,
		},
		{
			value: 3,
			label: `${t('Month')}`,
		},
		{
			value: 4,
			label: `${t('alternates')}`,
		},
	];
	const [loadHuman, setLoadHuman] = useState(false);
	const [dataSuperiorDropdown, setDataSuperiorDropdown] = useState<Array<{ value: any; label: string }>>([]);
	const [selectedOptions, setSelectedOptions] = useState<Array<{ value: any; label: string }>>([]);

	// Kiểm tra nếu tất cả checkbox trong một hàng (shift) đã được chọn
	const isAllSelectedForShift = (shiftIndex: any) => {
		return daysArray.every((_, dayIndex) => selectedCheckboxes?.[shiftIndex]?.[dayIndex] === true);
	};

	// Xử lý sự kiện chọn tất cả cho một hàng (shift)
	const handleSelectAllShift = (shiftIndex: any) => {
		const allSelected = isAllSelectedForShift(shiftIndex);
		const newSelectedCheckboxes = [...selectedCheckboxes];
		if( isAllSelectedForShift(shiftIndex)) 
			handleCheckboxChange(shiftIndex, -2) 
		else 
			handleCheckboxChange(shiftIndex, -1)
		daysArray.forEach((_, dayIndex) => {
			newSelectedCheckboxes[shiftIndex] = newSelectedCheckboxes[shiftIndex] || [];
			newSelectedCheckboxes[shiftIndex][dayIndex] = !allSelected;
		});
		setSelectedCheckboxes(newSelectedCheckboxes);
	};

	useEffect(() => {
		const days = [];
		if (T?.value === 4 && !(start && end)) {
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
			if (T?.value === 1) {
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
			} else if (T?.value === 2) {
				// Chu kỳ tuần
				const dayMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
				for (let i = 0; i < 7; i++) {
					days.push(dayMap[i]);
				}
			} else if (T?.value === 3) {
				// Chu kỳ tháng
				for (let i = 1; i <= 31; i++) {
					days.push(`${i}`);
				}
			}
			if (T?.value === 4) {
				if (formikRef.current) {
					formikRef.current.setFieldValue('number', dayjs(end).diff(dayjs(start), 'day'));
				}
				for (let i = 1; i <= dayjs(end).diff(dayjs(start), 'day'); i++) {
					days.push(`${i}`);
				}
			}
		}
		setDaysArray(days);
	}, [start, end, T?.value, number]);
	const SubmittedForm = Yup.object().shape({
		endDate: Yup.date().typeError(`${t('please_fill_work_end_date')}`),
	});
	const handleMenuScrollToBottom = () => {
		setTimeout(() => {
			setSizePersonSuperior(superiorPagination?.page + 1);
		}, 1000);
	};
	const customStyles: StylesConfig<any, false> = {
		menuPortal: (base: any) => ({
			...base,
			zIndex: 9999,
		}),
	};
	const handleProposal = (param: any) => {
		setIsAdd(true);
		addUsersShift({
			startDate: start,
			endDate: end,
			type: param?.cycle?.value,
			numberDay: dayjs(end).diff(dayjs(start), 'day'),
			details: detail,
		    userIds: selectedOptions?.map((i: any) => i.value)
			// ...(selectedOptions?.length !== superiorDropdown?.data?.length ? { userIds: selectedOptions?.map((i: any) => i.value) } : { departmentIds: selectedOptions2?.map((i: any) => i.value) }),
		})
			.then(() => {
				handleSuccess();
				props.mutate();
				showMessage(`${t('set_shift_by_time_success')}`, 'success');
			})
			.catch((err) => {
				setIsAdd(false);
				const errorMessage = err?.response?.data?.message[0]?.error ?? err?.response?.data?.message;
				showMessage(errorMessage, 'error');
			});
	};

	const handleSelectAll = () => {
		if (isSelectAll) {
			setSelectedOptions([]);
		} else {
			// Chọn tất cả
			setSelectedOptions(superiorDropdown?.data?.map((i: any) => ({ label: `${i.label} - ${i.position_name}`, value: i.value })));
		}
		setIsSelectAll(!isSelectAll); // Đảo ngược trạng thái sau khi chọn hoặc hủy chọn
		setMenuIsOpen(true); // Đảm bảo menu vẫn mở
	};

	const AllSelector = ({ isSelectedAll, selectAll }: { isSelectedAll: boolean; selectAll: () => void }) => {
		return (
			<div style={{ borderBottom: '1px solid #ccc', textAlign: 'center' }}>
				<button onClick={selectAll} style={{ width: '100%', textAlign: 'left', paddingLeft: '5px' }}>
					{isSelectedAll ? `${t('cancel_select')}` : `${t('check_all')}`}
				</button>
			</div>
		);
	};
	const CustomDropdownIndicator = (props: any) => {
		return (
			<components.DropdownIndicator {...props}>
				<AllSelector isSelectedAll={isSelectAll} selectAll={handleSelectAll} />
			</components.DropdownIndicator>
		);
	};
	const [initialStartDate, setInitialStartDate] = useState(null);
	const [initialEndDate, setInitialEndDate] = useState(null);

	useEffect(() => {
		if (start) {
			setInitialStartDate(start);
		}
		if (end) {
			setInitialStartDate(end);
		}
	}, [start, end]);
	const [date, setdate] = useState<any>();
	const handleSuccess = () => {
		setSelectedCheckboxes([]);
		setDetail([]);
		setDataSuperiorDropdown([]);
		setSelectedOptions([]);
		setSelectedOptions2([]);
		setIsAdd(false);
		setIsSelectAll(false);
		setNumber(1);
		formikRef.current.setFieldValue('endDate', start);
	};
	const handleCancel = () => {
		setT({
			value: 1,
			label: `${t('date_and_range_picker')}`,
		});
		setSelectedCheckboxes([]);
		setDetail([]);
		setDaysArray([]);
		setdate('');
		setDataSuperiorDropdown([]);
		setSelectedOptions([]);
		setSelectedOptions2([]);
		setNumber(1);
		setStart('');
		setIsAdd(false);
		setEnd('');
		setIsSelectAll(false);
		props.setOpenModal(false);
	};
	const [selectedCheckboxes, setSelectedCheckboxes] = useState(() => {
		const shiftsLength = shifts?.length || 0;
		const daysLength = daysArray?.length || 0;

		return Array(shiftsLength)
			.fill(null)
			.map(() => Array(daysLength).fill(false));
	});

	const handleCheckboxChange = (shiftIndex: any, dayIndex: any) => {
		
		// Tạo một bản sao mới của mảng `selectedCheckboxes` để tránh thay đổi trực tiếp state
		const updatedCheckboxes = selectedCheckboxes.map((shiftArray: any) => shiftArray?.slice());
	  
		// Đảm bảo `updatedCheckboxes[shiftIndex]` luôn được khởi tạo là mảng với giá trị `false` nếu nó chưa tồn tại
		if (!updatedCheckboxes[shiftIndex]) {
		  updatedCheckboxes[shiftIndex] = Array(daysArray.length).fill(false);
		}
	  
		if (dayIndex === -1) {
		  // Nếu dayIndex = -1, cập nhật tất cả các ngày trong mảng cho shiftIndex
		  updatedCheckboxes[shiftIndex] = updatedCheckboxes[shiftIndex].map(() => true); // Đánh dấu tất cả các checkbox trong hàng là true
		} else if (dayIndex === -2) {
		  // Nếu dayIndex = -1, cập nhật tất cả các ngày trong mảng cho shiftIndex
		  updatedCheckboxes[shiftIndex] = updatedCheckboxes[shiftIndex].map(() => false); // Đánh dấu tất cả các checkbox trong hàng là true
		} else {
		  // Đổi giá trị `false` thành `true` hoặc ngược lại khi checkbox được chọn hoặc bỏ chọn
		  updatedCheckboxes[shiftIndex][dayIndex] = !updatedCheckboxes[shiftIndex][dayIndex];
		}
	  
		// Cập nhật lại state `selectedCheckboxes` với mảng đã được thay đổi
		setSelectedCheckboxes(updatedCheckboxes);
	  
		// Tạo mảng `selectedItems` để lưu các thông tin cần thiết dựa trên các checkbox được chọn
		const year = dayjs(start).year();
		const selectedItems: any[] = [];
	  
		if (T?.value === 1) {
		  shifts.forEach((shift: any, shiftIdx: any) => {
			if (shiftIdx === shiftIndex && dayIndex === -1) {
			  // Nếu dayIndex = -1, thêm tất cả các ngày vào selectedItems cho shiftIndex
			  daysArray.forEach((day) => {
				const dateParts = day.split(', ')[1]; // Lấy phần "01/08"
				const formattedDate = `${dateParts}/${year}`.split('/').reverse().join('-');
				selectedItems.push({
				  workingDay: formattedDate,
				  shiftId: shift.value,
				});
			  });
			} else {
			  // Xử lý các trường hợp bình thường khi dayIndex không phải -1
			  daysArray.forEach((day, dayIdx) => {
				if (updatedCheckboxes[shiftIdx] && updatedCheckboxes[shiftIdx][dayIdx]) {
				  const dateParts = day.split(', ')[1]; // Lấy phần "01/08"
				  const formattedDate = `${dateParts}/${year}`.split('/').reverse().join('-');
				  selectedItems.push({
					workingDay: formattedDate,
					shiftId: shift.value,
				  });
				}
			  });
			}
		  });
		} else {
		  shifts.forEach((shift: any, shiftIdx: any) => {
			if (shiftIdx === shiftIndex && dayIndex === -1) {
			  // Nếu dayIndex = -1, thêm tất cả các ngày vào selectedItems cho shiftIndex
			  daysArray.forEach((day, dayIdx) => {
				selectedItems.push({
				  day: T?.value === 2 ? dayIdx : dayIdx + 1,
				  shiftId: shift.value,
				});
			  });
			} else {
			  // Xử lý các trường hợp bình thường khi dayIndex không phải -1
			  daysArray.forEach((day, dayIdx) => {
				if (updatedCheckboxes[shiftIdx] && updatedCheckboxes[shiftIdx][dayIdx]) {
				  selectedItems.push({
					day: T?.value === 2 ? dayIdx : dayIdx + 1,
					shiftId: shift.value,
				  });
				}
			  });
			}
		  });
		}
	  
		setDetail(selectedItems);
	  };
	  
	const CustomMultiValueRemove = () => null;
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
									style={{ color: 'white' }}
									type="button"
									onClick={() => {
										handleCancel();
									}}
									className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
								>
									<IconX />
								</button>
								<div
									style={{ backgroundColor: '#959E5E', color: 'white' }}
									className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]"
								>
									{t('set_shift_by_time')}
								</div>
								<div>
									<div className="p-5">
										<Formik
											initialValues={{
												departmentId: '',
												approverId: '',
												startDate: null,
												number: 1,
												endDate: null,
												cycle: { value: 1, label: `${t('date_and_range_picker')}` },
											}}
											validationSchema={SubmittedForm}
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
															<label style={{ width: '30%' }} htmlFor="departmentId">
																{t('department')}
															</label>
															<div style={{ width: '70%' }}>
																<Select
																	id="departmentId"
																	name="departmentId"
																	placeholder={t('choose_department')}
																	options={dataDepartment}
																	maxMenuHeight={270}
																	value={selectedOptions2}
																	onChange={handleChange2}
																	isMulti
																	hideSelectedOptions={false}
																	closeMenuOnSelect={false}
																	components={{ Option: CustomOption, MultiValueRemove: CustomMultiValueRemove }}
																	styles={{
																		option: (base: CSSObjectWithLabel) => ({
																			...base,
																			display: 'flex',
																			alignItems: 'center',
																			backgroundColor: base.isSelected2
																				? 'rgb(171, 182, 103)'
																				: base.isFocused
																				? 'rgb(210, 214, 165)' // Background color on hover
																				: 'white', // Default background color
																			color: base.isSelected2 ? 'white' : 'black',
																			':active': {
																				backgroundColor: 'rgb(171, 182, 103)', // Background color when selected and clicked
																				color: 'white',
																			},
																		}),
																		control: (base: CSSObjectWithLabel) => ({
																			...base,
																			minHeight: '40px',
																		}),
																		menuPortal: (base: CSSObjectWithLabel) => ({
																			...base,
																			zIndex: 9999,
																		}),
																		multiValue: (base: any, { index }) => ({
																			...base,
																			display: index === 0 ? 'flex' : 'none',
																			position: 'relative',
																			'::after':
																				selectedOptions2.length > 1 && index === 0
																					? {
																							content: `", ......."`,
																							left: '30px',
																							top: '0',
																							color: 'black',
																					  }
																					: {},
																		}),
																		multiValueLabel: (base: any, { index }) => ({
																			...base,
																			display: 'block',
																		}),
																	}}
																/>
																{/* {submitCount && errors.departmentId ? <div className="mt-1 text-danger">{errors.departmentId}</div> : null} */}
															</div>
														</div>
														<div className="mb-5 flex w-1/2">
															<label htmlFor="approverId" style={{ width: '20%' }}>
																{t('employee')}
																<span style={{ color: 'red' }}>*</span>
															</label>
															<div style={{ width: '80%' }}>
																<Select
																	id="approverId"
																	options={superiorDropdown?.data?.map((i: any) => ({ label: `${i.label} - ${i.position_name}`, value: i.value }))}
																	name="approverId"
																	value={selectedOptions}
																	onChange={handleChange}
																	// onMenuOpen={() => setSizePersonSuperior(1)}
																	// onMenuScrollToBottom={handleMenuScrollToBottom}
																	isMulti
																	maxMenuHeight={270}
																	closeMenuOnSelect={false}
																	hideSelectedOptions={false}
																	// isLoading={loadHuman}
																	menuIsOpen={menuIsOpen} // Sử dụng trạng thái này để kiểm soát menu
																	onBlur={() => setMenuIsOpen(false)} // Đóng menu khi mất focus nếu cần
																	onFocus={() => setMenuIsOpen(true)} // Mở menu khi có focus
																	components={{
																		Option: CustomOption,
																		DropdownIndicator: (props) => <CustomDropdownIndicator {...props} selectAll={handleSelectAll} />,
																	}}
																	placeholder={t('Choose staff')}
																	styles={{
																		option: (base: CSSObjectWithLabel) => ({
																			...base,
																			display: 'flex',
																			alignItems: 'center',
																			backgroundColor: base.isSelected
																				? 'rgb(171, 182, 103)' // Background color when selected
																				: base.isFocused
																				? 'rgb(210, 214, 165)' // Background color on hover
																				: 'white', // Default background color
																			color: base.isSelected ? 'white' : 'black',
																			':active': {
																				backgroundColor: 'rgb(171, 182, 103)', // Background color when selected and clicked
																				color: 'white',
																			},
																		}),
																		control: (base: CSSObjectWithLabel) => ({
																			...base,
																			minHeight: '40px',
																		}),
																		menuPortal: (base: CSSObjectWithLabel) => ({
																			...base,
																			zIndex: 9999,
																		}),
																		multiValue: (base: any, { index }) => ({
																			...base,
																			display: index === 0 ? 'flex' : 'none',
																			position: 'relative',
																			'::after':
																				selectedOptions.length > 1 && index === 0
																					? {
																							content: `", ......."`,
																							left: '30px',
																							top: '0',
																							color: 'black',
																					  }
																					: {},
																		}),
																		multiValueLabel: (base: any, { index }) => ({
																			...base,
																			display: 'block',
																		}),
																	}}
																/>

																{submitCount ? selectedOptions?.length <= 0 ? <div className="mt-1 text-danger"> {t('please_choose_employee')} </div> : '' : ''}
															</div>
														</div>
													</div>
													<div className="mb-5 flex justify-between gap-4">
														<div className="mb-5 flex w-1/2">
															<label style={{ width: '30%' }} htmlFor="startDate">
																{t('from_date')}
																<span style={{ color: 'red' }}>*</span>
															</label>
															<div style={{ width: '70%' }}>
																<Flatpickr
																	options={{
																		enableTime: false,
																		dateFormat: 'd-m-Y',
																		locale: {
																			...chosenLocale,
																		},
																		mode: 'range',
																	}}
																	value={date}
																	onChange={(e: any) => {
																		setdate(e);
																		setFieldValue('startDate', dayjs(e[0]).toISOString());
																		setFieldValue('endDate', dayjs(e[1]).toISOString());
																		setStart(dayjs(e[0]).format('YYYY-MM-DD'));
																		values?.endDate ? setEnd(dayjs(e[1]).format('YYYY-MM-DD')) : '';
																	}}
																	placeholder={t('choose_from_dayy') || ''}
																	className="calender-input form-input"
																/>

																{submitCount ? !start ? <div className="mt-1 text-danger"> {t('please_fill_work_start_date')} </div> : '' : ''}
															</div>
														</div>
														<div className="mb-5 flex w-1/2">
															<label style={{ width: '20%' }} htmlFor="cycle">
																{t('cycle')}
																<span style={{ color: 'red' }}>*</span>
															</label>
															<div style={{ width: '80%' }}>
																<Select
																	id="cycle"
																	name="cycle"
																	options={cycles}
																	onMenuOpen={() => setPage(1)}
																	// placeholder="Ngày"
																	// defaultValue={{value: 1, label: `${t('date_and_range_picker')}`}}
																	closeMenuOnSelect={true}
																	maxMenuHeight={160}
																	value={T}
																	onChange={(e) => {
																		setT(e);
																		setSelectedCheckboxes([]);
																		setFieldValue('cycle', e);
																	}}
																	styles={{
																		menuPortal: (base: any) => ({
																			...base,
																			zIndex: 9999,
																		}),
																	}}
																/>
															</div>
														</div>
													</div>
													<div className="mb-5 flex justify-between gap-4">
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
													{date?.length === 2 || (values?.cycle?.value === 4 && date?.length === 2) ? (
														<div className="mb-5 flex justify-between gap-4" style={{ maxHeight: '400px', overflow: 'auto' }}>
															<div className="overflow-x-auto" style={{ width: '100%' }}>
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
																			<th
																				className="border border-gray-300 px-4 py-2 text-white"
																				style={{
																					fontSize: '16px',
																					minWidth: '150px',
																					fontWeight: 'bold',
																					position: 'sticky',
																					left: 0,
																					top: 0,
																					backgroundColor: '#959E5E', // Explicitly set background color
																					zIndex: 2, // Higher z-index for the header to stay above the rows
																				}}
																			>
																				{t('check_all')}
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
																						backgroundColor: '#959E5E', // Explicitly set background color
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
																					{shift.label} ({shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)})
																				</td>
																				{/* Checkbox "Chọn tất cả" */}
																				<td key={-1} className="border border-gray-300 px-4 py-2 text-center" style={{ minWidth: '80px', textAlign: 'center' }}>
																					<input
																						style={{ width: '18px', height: '18px' }}
																						type="checkbox"
																						className="custom-checkbox"
																						checked={isAllSelectedForShift(shiftIndex)}
																						onChange={() => {
																							handleSelectAllShift(shiftIndex)}
																						}
																					/>
																				</td>
																				{daysArray.map((_, dayIndex) => (
																					<td
																						key={dayIndex}
																						className="border border-gray-300 px-4 py-2 text-center"
																						style={{ minWidth: '80px', textAlign: 'center' }}
																					>
																						<input
																							style={{ width: '18px', height: '18px' }}
																							type="checkbox"
																							className="custom-checkbox"
																							checked={selectedCheckboxes?.[shiftIndex]?.[dayIndex] || false}
																							onChange={() => handleCheckboxChange(shiftIndex, dayIndex)}
																						/>
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
																				style={{ fontSize: '20px', textAlign: 'center', backgroundColor: '#959E5E', border: '1px solid #6e6e6e' }}
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
														<button type="submit" style={{ backgroundColor: 'aqua !important' }} disabled={isAdd} className="btn add-button tl ltr:ml-4 rtl:mr-4">
															{isAdd ? <Loader size="sm" /> : t('setup')}
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
