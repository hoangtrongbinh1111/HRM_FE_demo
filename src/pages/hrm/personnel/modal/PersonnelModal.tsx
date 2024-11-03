import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '@/components/Icon/IconCaretDown';

interface Props {
	[key: string]: any;
}

const PersonnelModal = ({ ...props }: Props) => {
	const { t } = useTranslation();
	const [disabled, setDisabled] = useState(false);

	const SubmittedForm = Yup.object().shape({
		name: Yup.string()
			.min(2, 'Too Short!')
			.required(`${t('please_fill_name_staff')}`),
		code: Yup.string()
			.min(2, 'Too Short!')
			.required(`${t('please_fill_staffCode')}`),
	});

	const handleWarehouse = (value: any) => {
		if (props?.data) {
			const reNew = props.totalData.filter((item: any) => item.id !== props.data.id);
			reNew.push({
				id: props.data.id,
				name: value.name,
				code: value.code,
				status: value.status,
			});
			localStorage.setItem('staffList', JSON.stringify(reNew));
			props.setGetStorge(reNew);
			props.setOpenModal(false);
			props.setData(undefined);
			showMessage(`${t('edit_staff_success')}`, 'success');
		} else {
			const reNew = props.totalData;
			reNew.push({
				id: Number(props?.totalData[props?.totalData?.length - 1].id) + 1,
				name: value.name,
				code: value.code,
				status: value.status,
			});
			localStorage.setItem('staffList', JSON.stringify(reNew));
			props.setGetStorge(props.totalData);
			props.setOpenModal(false);
			props.setData(undefined);
			showMessage(`${t('add_staff_success')}`, 'success');
		}
	};
	const [active, setActive] = useState<string>('1');
	const togglePara = (value: string) => {
		setActive((oldValue) => {
			return oldValue === value ? '' : value;
		});
	};
	const handleCancel = () => {
		props.setOpenModal(false);
		props.setData(undefined);
	};
	return (
		<Transition appear show={props.openModal ?? false} as={Fragment}>
			<Dialog as="div" open={props.openModal} onClose={() => props.setOpenModal(false)} className="relative z-50">
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
							<Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark" style={{ maxWidth: '60%' }}>
								<button
									type="button"
									onClick={() => handleCancel()}
									className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
								>
									<IconX />
								</button>
								<div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
									{props.data !== undefined ? `${t('edit_staff')}` : `${t('add_staff')}`}
								</div>
								<div className="p-5">
									<Formik
										initialValues={{
											name: props?.data ? `${props?.data?.name}` : '',
											code: props?.data ? `${props?.data?.code}` : '',
											surname: props?.data ? `${props?.data?.surname}` : '',
											email: props?.data ? `${props?.data?.email}` : '',
											phone: props?.data ? `${props?.data?.phone}` : '',
											userName: props?.data ? `${props?.data?.userName}` : '',
											othername: props?.data ? `${props?.data?.othername}` : '',
											dateofbirth: props?.data ? `${props?.data?.dateofbirth}` : '',
											sex: props?.data ? `${props?.data?.sex}` : '',
											IDnumber: props?.data ? `${props?.data?.IDnumber}` : '',
											dateissue: props?.data ? `${props?.data?.dateissue}` : '',

										}}
										validationSchema={SubmittedForm}
										onSubmit={(values) => {
											handleWarehouse(values);
										}}
									>
										{({ errors, touched }) => (
											<Form className="space-y-5">
												<div className="mb-5">
													<div className="space-y-2 font-semibold">
														<div className="rounded border border-[#d3d3d3] dark:border-[#1b2e4b]">
															<button
																type="button"
																className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] ${active === '1' ? '!text-primary' : ''}`}
																onClick={() => togglePara('1')}
															>
																{t('general_infomation')}                                        <div className={`ltr:ml-auto rtl:mr-auto ${active === '1' ? 'rotate-180' : ''}`}>
																	<IconCaretDown />
																</div>
															</button>
															<div>
																<AnimateHeight duration={300} height={active === '1' ? 'auto' : 0}>
																	<div className="space-y-2 border-[#d3d3d3] p-4 text-[13px] text-white-dark dark:border-[#1b2e4b]">
																		<div className='flex justify-between gap-5'>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="code">
																					{' '}
																					{t('code_staff')} <span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_staff')}`} className="form-input" />
																				{errors.code ? <div className="mt-1 text-danger"> {errors.code} </div> : null}
																			</div>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="name">
																					{' '}
																					{t('name_staff')} <span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_staff')}`} className="form-input" />
																				{errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null}
																			</div>
																		</div>
																		<div className='flex justify-between gap-5'>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="surname">
																					{' '}
																					{t('surname_middle')} <span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="surname" type="text" id="surname" placeholder={t('enter_surname_middle')} className="form-input" />
																				{errors.surname ? <div className="mt-1 text-danger"> {errors.surname} </div> : null}
																			</div>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="email">
																					{' '}
																					Email <span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="email" type="text" id="email" placeholder={t('enter_email')} className="form-input" />
																				{errors.email ? <div className="mt-1 text-danger"> {errors.email} </div> : null}
																			</div>
																		</div>
																		<div className='flex justify-between gap-5'>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="phone">
																					{' '}
																					{t('phone_number')} <span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="phone" type="text" id="phone" placeholder={t('enter_phone_number')} className="form-input" />
																				{errors.phone ? <div className="mt-1 text-danger"> {errors.phone} </div> : null}
																			</div>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="userName">
																					{' '}
																					{t('username')}<span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="userName" type="text" id="userName" placeholder={t('enter_user_name')} className="form-input" />
																				{errors.userName ? <div className="mt-1 text-danger"> {errors.userName} </div> : null}
																			</div>
																		</div>
																	</div>
																	{/* <button type="button" className="btn btn-outline-danger" onClick={() => handleCancel()}>
																		{t('reset_password')}
																	</button> */}
																</AnimateHeight>
															</div>
														</div>
														<div className="rounded border border-[#d3d3d3] dark:border-[#1b2e4b]">
															<button
																type="button"
																className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] ${active === '2' ? '!text-primary' : ''}`}
																onClick={() => togglePara('2')}
															>
																{t('personal_information')}
																<div className={`ltr:ml-auto rtl:mr-auto ${active === '2' ? 'rotate-180' : ''}`}>
																	<IconCaretDown />
																</div>
															</button>
															<div>
																<AnimateHeight duration={300} height={active === '2' ? 'auto' : 0}>
																	<div className="space-y-2 border-t border-[#d3d3d3] p-4 text-[13px] text-white-dark dark:border-[#1b2e4b]">
																		<div className='flex justify-between gap-5'>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="othername">
																					{' '}
																					{t('other_name')}<span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="othername" type="text" id="othername" placeholder={t('enter_other_name')} className="form-input" />
																				{errors.othername ? <div className="mt-1 text-danger"> {errors.othername} </div> : null}
																			</div>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="dateofbirth">
																					{' '}
																					{t('date_of_birth')} <span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="dateofbirth" type="text" id="dateofbirth" placeholder={t('enter_date_of_birth')} className="form-input" />
																				{errors.dateofbirth ? <div className="mt-1 text-danger"> {errors.dateofbirth} </div> : null}
																			</div>
																		</div>
																		<div className='flex justify-between gap-5'>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="sex">
																					{' '}
																					{t('gender')} <span style={{ color: 'red' }}>* </span>
																				</label>
																				<select className="form-select w-100">
																					<option>{t('male')}</option>
																					<option>{t('female')}</option>
																				</select>
																				{errors.sex ? <div className="mt-1 text-danger"> {errors.sex} </div> : null}
																			</div>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="IDnumber">
																					{' '}
																					{t('id_number')} <span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="IDnumber" type="text" id="IDnumber" placeholder={t('enter_id_number')} className="form-input" />
																				{errors.IDnumber ? <div className="mt-1 text-danger"> {errors.IDnumber} </div> : null}
																			</div>
																		</div>
																		<div className='flex justify-between gap-5'>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="dateissue">
																					{' '}
																					{t('date_of_issue')}<span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="dateissue" type="text" id="dateissue" placeholder={t('enter_date_of_issue')} className="form-input" />
																				{errors.dateissue ? <div className="mt-1 text-danger"> {errors.dateissue} </div> : null}
																			</div>
																			<div className="mb-5 w-1/2">
																				<label htmlFor="IDnumber">
																					{' '}
																					{t('address_issue')}<span style={{ color: 'red' }}>* </span>
																				</label>
																				<Field autoComplete="off" name="IDnumber" type="text" id="IDnumber" placeholder={t('enter_address_issue')} className="form-input" />
																				{errors.IDnumber ? <div className="mt-1 text-danger"> {errors.IDnumber} </div> : null}
																			</div>
																		</div>
																	</div>
																</AnimateHeight>
															</div>
														</div>

													</div>
												</div>

												<div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
													<button type="button" className="btn btn-outline-danger" onClick={() => handleCancel()}>
														{t('cancel')}
													</button>
													<button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" disabled={disabled}>
														{props.data !== undefined ? t('update') : t('add')}
													</button>
												</div>
											</Form>
										)}
									</Formik>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default PersonnelModal;
