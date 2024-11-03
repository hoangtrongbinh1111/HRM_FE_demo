import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';

interface Props {
	[key: string]: any;
}

const AssetModal = ({ ...props }: Props) => {
	const { t } = useTranslation();
	const [disabled, setDisabled] = useState(false);

	const SubmittedForm = Yup.object().shape({
		quantity: Yup.number().required(`${t('please_fill_asset_quantity')}`),
		name: Yup.string()
		.required(`${t('please_fill_name_asset')}`),
	});

	const handleDepartment = (value: any) => {
		if (props?.data) {
			const reNew = props.totalData.filter((item: any) => item.id !== props.data.id);
			reNew.push({
				id: props.data.id,
				quantity: value.quantity,
				name: value.name,
			});
			localStorage.setItem('assetList', JSON.stringify(reNew));
			props.setGetStorge(reNew);
			props.setOpenModal(false);
			props.setData(undefined);
			showMessage(`${t('edit_asset_success')}`, 'success');
		} else {
			const reNew = props.totalData;
			reNew.push({
				id: Number(props?.totalData[props?.totalData?.length - 1].id) + 1,
				quantity: value.quantity,
				name: value.name,
			});
			localStorage.setItem('assetList', JSON.stringify(reNew));
			props.setGetStorge(props.totalData);
			props.setOpenModal(false);
			props.setData(undefined);
			showMessage(`${t('add_asset_success')}`, 'success');
		}
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
							<Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
								<button
									type="button"
									onClick={() => handleCancel()}
									className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
								>
									<IconX />
								</button>
								<div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
									{props.data !== undefined ? `${t('edit_asset')}` : `${t('add_asset')}`}
								</div>
								<div className="p-5">
									<Formik
										initialValues={{
											quantity: props?.data ? `${props?.data?.quantity}` : '',
											name: props?.data ? `${props?.data?.name}` : '',
										}}
										validationSchema={SubmittedForm}
										onSubmit={(values) => {
											handleDepartment(values);
										}}
									>
										{({ errors, touched }) => (
											<Form className="space-y-5">
												<div className="mb-5">
													<label htmlFor="name">
														{' '}
														{t('name_asset')} <span style={{ color: 'red' }}>* </span>
													</label>
													<Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_asset')}`} className="form-input" />
													{errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null}
												</div>
												<div className="mb-5">
													<label htmlFor="quantity">
														{' '}
														{t('quantity_asset')} <span style={{ color: 'red' }}>* </span>
													</label>
													<Field autoComplete="off" name="quantity" type="number" id="quantity" placeholder={`${t('enter_quantity_asset')}`} className="form-input" />
													{errors.quantity ? <div className="mt-1 text-danger"> {errors.quantity} </div> : null}
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

export default AssetModal;
