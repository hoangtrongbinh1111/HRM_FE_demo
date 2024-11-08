import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import Select, { components } from 'react-select';
import { ProductCategorys, Providers } from '@/services/swr/product.swr';


interface Props {
	[key: string]: any;
}

const DepartmentModal = ({ ...props }: Props) => {
	const { t } = useTranslation();
	const [disabled, setDisabled] = useState(false);
	const [query, setQuery] = useState<any>();

	const { data: departmentparents } = ProductCategorys(query);
	const { data: manages } = Providers(query);
	const SubmittedForm = Yup.object().shape({
		name: Yup.string()
			.min(2, 'Too Short!')
			.required(`${t('please_fill_name_department')}`),
		code: Yup.string()
			.min(2, 'Too Short!')
			.required(`${t('please_fill_departmentCode')}`),
		abbreviated: Yup.string()
			.min(2, 'Too Short!')
			.required(`${t('please_fill_abbreviated_name')}`),
	});
	const handleSearch = (param: any) => {
		setQuery({ search: param });
	}
	const departmentparent = departmentparents?.data.filter((item: any) => {
		return (
			item.value = item.id,
			item.label = item.name,
			delete item.createdAt
		)
	})

	const manage = manages?.data.filter((item: any) => {
		return (
			item.value = item.id,
			item.label = item.name
		)
	})
	const handleDepartment = (value: any) => {
		if (props?.data) {
			const reNew = props.totalData.filter((item: any) => item.id !== props.data.id);
			reNew.push({
				id: props.data.id,
				name: value.name,
				code: value.code,
			});
			localStorage.setItem('departmentList', JSON.stringify(reNew));
			props.setGetStorge(reNew);
			props.setOpenModal(false);
			props.setData(undefined);
			showMessage(`${t('edit_department_success')}`, 'success');
		} else {
			const reNew = props.totalData;
			reNew.push({
				id: Number(props?.totalData[props?.totalData?.length - 1].id) + 1,
				name: value.name,
				code: value.code,
				status: value.status,
			});
			localStorage.setItem('departmentList', JSON.stringify(reNew));
			props.setGetStorge(props.totalData);
			props.setOpenModal(false);
			props.setData(undefined);
			showMessage(`${t('add_department_success')}`, 'success');
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
									{props.data !== undefined ? `${t('edit_department')}` : `${t('add_department')}`}
								</div>
								<div className="p-5">
									<Formik
										initialValues={{
											name: props?.data ? `${props?.data?.name}` : '',
											code: props?.data ? `${props?.data?.code}` : '',
											abbreviated: props?.data ? `${props?.data?.abbreviated}` : '',
											manageId: props?.data ? {
												value: `${props?.data?.manage.id}`,
												label: `${props?.data?.manage.name}`
											} : "",
											departmentparentId: props?.data ? {
												value: `${props?.data?.departmentparent.id}`,
												label: `${props?.data?.departmentparent.name}`
											} : "",
										}}
										validationSchema={SubmittedForm}
										onSubmit={(values) => {
											handleDepartment(values);
										}}
									>
										{({ errors, values, setFieldValue }) => (
											<Form className="space-y-5">
												<div className="mb-5">
													<label htmlFor="name">
														{' '}
														{t('name_department')} <span style={{ color: 'red' }}>* </span>
													</label>
													<Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_department')}`} className="form-input" />
													{errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null}
												</div>
												<div className="mb-5">
													<label htmlFor="code">
														{' '}
														{t('code_department')} <span style={{ color: 'red' }}>* </span>
													</label>
													<Field autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_department')}`} className="form-input" />
													{errors.code ? <div className="mt-1 text-danger"> {errors.code} </div> : null}
												</div>
												<div className="mb-5">
													<label htmlFor="code">
														{' '}
														{t('Abbreviated_name')} <span style={{ color: 'red' }}>* </span>
													</label>
													<Field autoComplete="off" name="abbreviated" type="text" id="abbreviated" placeholder={`${t('enter_abbreviated_name')}`} className="form-input" />
													{errors.abbreviated ? <div className="mt-1 text-danger"> {errors.abbreviated} </div> : null}
												</div>
												<div className="mb-5">
													<label htmlFor="departmentparentId" > {t('Department_Parent')} < span style={{ color: 'red' }}>* </span></label >
													<Select
														id='unidepartmentparentIdtId'
														name='departmentparentId'
														onInputChange={e => handleSearch(e)}
														options={departmentparent}
														maxMenuHeight={160}
														value={values.departmentparentId}
														onChange={e => {
															setFieldValue('departmentparentId', e)
														}}
													/>
													{errors.departmentparentId ? (
														<div className="text-danger mt-1"> {errors.departmentparentId} </div>
													) : null}
												</div>
												<div className="mb-5">
													<label htmlFor="manageId" > {t('Manager')} < span style={{ color: 'red' }}>* </span></label >
													<Select
														id='manageId'
														name='manageId'
														onInputChange={e => handleSearch(e)}
														options={manage}
														maxMenuHeight={160}
														value={values.manageId}
														onChange={e => {
															setFieldValue('manageId', e)
														}}
													/>
													{errors.manageId ? (
														<div className="text-danger mt-1"> {errors.manageId} </div>
													) : null}
												</div>
												<div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
													<button type="button" className="btn btn-outline-danger" onClick={() => handleCancel()}>
														Cancel
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

export default DepartmentModal;
