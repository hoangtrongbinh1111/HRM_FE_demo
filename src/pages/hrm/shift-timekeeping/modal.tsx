import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import { AddConfirmPortalDetail, EditConfirmPortalDetail } from '@/services/apis/confirm-portal.api';
import { DropdownInventory, DropdownProducts } from '@/services/swr/dropdown.swr';
import { GetQuantity } from '@/services/apis/product.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import dayjs from 'dayjs';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from '@/store';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import { Lao } from '@/utils/lao';
import { useSelector } from 'react-redux';
import { useProfile } from '@/services/swr/profile.swr';
import { formatNumber, moneyToNumber, moneyToText, convertDateFormat } from '@/utils/commons';
interface Props {
	[key: string]: any;
}
interface WorkdayInfo {
	weekdayWork: string;
	extraWork: string;
	holidayWork: string;
	dayOffWork: string;
	bussinessWork: string;
}
import { loadMore } from '@/utils/commons';
import { useDebounce } from 'use-debounce';
import { Humans } from '@/services/swr/human.swr';
import { GetCalculation } from '@/services/apis/timekeeping.api';

const Modal = ({ ...props }: Props) => {
	const themeConfig = useSelector((state: IRootState) => state.themeConfig);
	const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;
	const { t } = useTranslation();
	const router = useRouter();
	const [initialValue, setInitialValue] = useState<any>();
	const [dataProductDropdown, setDataProductDropdown] = useState<any>([]);
	const [openCal, setOpenCal] = useState(false);
	const [comment, setComment] = useState();
	const [res, setRes] = useState<WorkdayInfo[]>([]);
	const [search, setSearch] = useState('');

	const today = new Date();

	const [queryHuman, setQueryHuman] = useState<any>();
	const [dataHuman, setDataHuman] = useState<any>([]);
	const [pageHuman, setSizeHuman] = useState<any>(1);
	const [debouncedPageHuman] = useDebounce(pageHuman, 500);
	const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
	const [loadHuman, setLoadHuman] = useState(false);
	const { data: manages, pagination: paginationHuman } = Humans({
		sortBy: 'id.ASC',
		page: debouncedPageHuman,
		perPage: 10,
		search: debouncedQueryHuman?.search,
	});
	const handleSearchHuman = (param: any) => {
		setQueryHuman({ search: param });
	};
	const handleOnScrollBottomHuman = () => {
		setLoadHuman(true);
		if (paginationHuman?.page < paginationHuman?.totalPages) {
			setSizeHuman(paginationHuman?.page + 1);
		}
	};
	useEffect(() => {
		loadMore(manages, dataHuman, paginationHuman, setDataHuman, 'id', 'fullName', setLoadHuman);
	}, [paginationHuman, debouncedPageHuman, debouncedQueryHuman]);
	const handleDuty = (value: any) => {
		GetCalculation({
			id: value?.id?.value,
			time: convertDateFormat(value.time),
		})
			.then((res) => {
				setOpenCal(true);
				setRes(res?.data);
				setComment(res?.data?.comment);
				setInitialValue({
					id: value.id,
					time: value.time,
				});
				showMessage(`${t('Calculate timekeeping successfull')}`, 'success');
			})
			.catch((err) => {
				showMessage(`${t('create_duty_error')}`, 'error');
			});
	};
	const handleSearch = (param: any) => {
		setSearch(param);
		router.replace({
			pathname: router.pathname,
			query: {
				...router.query,
				search: param,
			},
		});
	};
	useEffect(() => {
		setInitialValue({
			id: '',
			time: dayjs(today).format('DD-MM-YYYY'),
		});
	}, [props?.open]);
	return (
		<Transition appear show={props.open ?? false} as={Fragment}>
			<Dialog as="div" open={props.open} onClose={() => props.setOpen(false)} className="relative z-50">
				<Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
					<div className="fixed inset-0 bg-[black]/60" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-screen items-center justify-center px-4 py-8">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-2xl border-0 p-0 text-[#476704] dark:text-white-dark">
								<button
									onClick={() => {
										setOpenCal(false);
										props.setOpen(false);
									}}
									type="button"
									className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
								>
									<IconX />
								</button>
								<div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">{t('Calculate timekeeping')}</div>
								<div>
									<div className="py-10 pl-10 pr-10">
										<Formik
											initialValues={initialValue}
											onSubmit={(values) => {
												handleDuty(values);
											}}
											enableReinitialize
										>
											{({ errors, values, setFieldValue, submitCount }) => (
												<Form className="space-y-5">
													<div className="mb-5">
														<label htmlFor="id" className="label">
															Người chấm công
														</label>
														<Select
															// isDisabled={openCal}
															id="id"
															name="id"
															options={dataHuman}
															onInputChange={(e) => handleSearchHuman(e)}
															onMenuOpen={() => setSizeHuman(1)}
															isLoading={loadHuman}
															onMenuScrollToBottom={() => handleOnScrollBottomHuman()}
															maxMenuHeight={160}
															value={values.id}
															placeholder="Người chấm công"
															onChange={(e) => {
																setFieldValue('id', e);
																handleSearch(e.target?.value);
															}}
														/>
														{submitCount && errors.id ? <div className="mt-1 text-danger"> {`${errors.id}`} </div> : null}
													</div>
													<div className="mb-5">
														<label htmlFor="time" className="label">
															Ngày chấm công <span style={{ color: 'red' }}>*</span>
														</label>
														<Flatpickr
															options={{
																locale: {
																	...chosenLocale,
																},
																dateFormat: 'd-m-Y',
																position: 'auto left',
																defaultDate: today, // Đặt ngày mặc định là ngày hiện tại
															}}
															// disabled={openCal}
															value={values.time || today} // Nếu values.dateOfJoin không có, sử dụng ngày hiện tại
															onChange={(e) => {
																if (e.length > 0) {
																	setFieldValue('time', dayjs(e[0]).format('DD-MM-YYYY'));
																}
															}}
															className="calender-input form-input"
															placeholder="Ngày chấm công"
														/>
													</div>
													{openCal && (
														<>
															<div className="mb-5" style={{ display: 'flex' }}>
																<label htmlFor="code" style={{ fontSize: '14px' }}>
																	Công thường
																</label>
																<p style={{ paddingLeft: '50px' }}>{res[0]?.weekdayWork}</p>
															</div>
															<div className="mb-5" style={{ display: 'flex' }}>
																<label htmlFor="code" style={{ fontSize: '14px' }}>
																	{t('extraWork')}
																</label>
																<p style={{ paddingLeft: '35px' }}>{res[0]?.extraWork}</p>
															</div>
															<div className="mb-5" style={{ display: 'flex' }}>
																<label htmlFor="code" style={{ fontSize: '14px' }}>
																	Công ngày nghỉ lễ
																</label>
																<p style={{ paddingLeft: '16px' }}>{res[0]?.holidayWork}</p>
															</div>
															<div className="mb-5" style={{ display: 'flex' }}>
																<label htmlFor="code" style={{ fontSize: '14px' }}>
																	Công nghỉ phép
																</label>
																<p style={{ paddingLeft: '31px' }}>{res[0]?.dayOffWork}</p>
															</div>
															<div className="mb-5" style={{ display: 'flex' }}>
																<label htmlFor="code" style={{ fontSize: '14px' }}>
																	Công công tác
																</label>
																<p style={{ paddingLeft: '40px' }}>{res[0]?.bussinessWork}</p>
															</div>
															<div className="mb-5" style={{ display: 'flex' }}>
																<label htmlFor="code" style={{ fontSize: '14px' }}>
																	Lý do:
																</label>
																<p style={{ paddingLeft: '40px', color: 'black' }}>{comment}</p>
															</div>
														</>
													)}

													<div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
														<button
															type="button"
															className="btn btn-outline-danger cancel-button"
															onClick={() => {
																setOpenCal(false);
																props.setOpen(false);
															}}
														>
															{t('cancel')}
														</button>
														<button data-testId="submit-modal-btn" type="submit" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4">
															{t('Calculate timekeeping')}
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
export default Modal;
