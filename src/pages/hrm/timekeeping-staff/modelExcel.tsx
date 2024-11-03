import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { downloadFile, showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components, StylesConfig, GroupBase, OptionProps, CSSObjectWithLabel } from 'react-select';
import { DropdownSuperior } from '@/services/swr/dropdown.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { LeavingLateEarlyForward } from '@/services/apis/leaving-late-early.api';
import { DropdownDepartment } from '@/services/swr/dropdown.swr';
import { useProfile } from '@/services/swr/profile.swr';

interface Props {
	[key: string]: any;
}

const ModalExcel = ({ ...props }: Props) => {
	const { t } = useTranslation();
	const router = useRouter();
	const [initialValue, setInitialValue] = useState<any>();
	const [dataSuperiorDropdown, setDataSuperiorDropdown] = useState<any>([]);
	const [page, setPage] = useState(1);
	const [searchSuperior, setSearchSuperior] = useState<any>();
	const [dataDepartment, setDataDepartment] = useState<any>([]);
	const [departmentId, setDepartmentId] = useState<any>();
	const { data: userData } = useProfile();
	const SubmittedForm = Yup.object().shape({
		// approverId: new Yup.ObjectSchema().required(`${t('please_fill_approver')}`),
	});
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

	const [isHigh, setIsHigh] = useState<any>('false');

	const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, perPage: 10 });

	const handleProposal = (param: any) => {
		props?.setUsersParticipate(param?.approverId);
		props.setOpenModal(false);
	};
	const handleCancel = () => {
		setDepartmentId([])
		props.setOpenModal(false);
	};
    const customStyles: StylesConfig<any, false> = {
        menuPortal: (base : any) => ({
          ...base,
          zIndex: 9999,
        }),
      };
	useEffect(() => {
		setInitialValue({
			approverId: props?.usersParticipate,
		});
	}, [props?.usersParticipate]);

	useEffect(() => {
		if (paginationDepartment?.page === undefined) return;
		if (paginationDepartment?.page === 1) {
			setDataDepartment(dropdownDepartment?.data);
		} else {
			setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paginationDepartment]);

	const handleMenuScrollToBottom = () => {
		setTimeout(() => {
			setPage(paginationDepartment?.page + 1);
		}, 1000);
	};

	const formRef = useRef<any>();

	const handleExportFile = () => {
        if (departmentId?.length === 0) {
            showMessage(`${t('please_select_department')}`, 'warning');
            return;
        } else {
            const stringQuery = new URLSearchParams({
                month: (router.query.month ?? currentMonth).toString(),
                year: (router.query.year ?? currentYear).toString(),
            });

            if (Array.isArray(departmentId)) {
                departmentId.forEach(departmentId => {
                    stringQuery.append('departmentIds', departmentId?.value);
                });
            }
            downloadFile("timekeeping_staff.xlsx", `/timekeeping-staff/export?${stringQuery}`).finally(() => {
				setDepartmentId([])
				props?.setOpenModal(false)
            })
        }
    }

	return (
		<Transition appear show={props.openModal ?? false} as={Fragment}>
			<Dialog as="div" open={props.openModal} onClose={() => {props.setOpenModal(false)}} className="relative z-50">
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
							<Dialog.Panel className="panel w-full max-w-[700px] overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
								<button
									type="button"
									onClick={() => {props.setOpenModal(false)}}
									className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
								>
									<IconX />
								</button>
								<div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">
									{/* {props.data === undefined ? t('add_detail') : t('edit_detail')} */}
								</div>
								<div>
									<div className="p-5">
										<Formik
											initialValues={initialValue}
											validationSchema={SubmittedForm}
											onSubmit={async (values, { resetForm }) => {
												await handleProposal(values);
												resetForm();
											}}
											innerRef={formRef}
											enableReinitialize
										>
											{({ errors, values, setFieldValue, submitCount }) => (
												<Form className="space-y-5">
													<div className="mb-5 flex justify-between gap-4">
														<div className="flex-1">
															<label htmlFor="departmentId">{t('choose_department_export')}</label>
															<Select
																id="departmentId"
																name="departmentId"
																placeholder={t('choose_department')}
																options={dataDepartment}
																maxMenuHeight={160}
																value={departmentId}
																onMenuOpen={() => setPage(1)}
																onMenuScrollToBottom={handleMenuScrollToBottom}
																isLoading={isLoadingDepartment}
																onChange={(e) => {
																	setDepartmentId(e);
																}}
																isMulti
																closeMenuOnSelect={false}
																menuPortalTarget={document.body} // Hiển thị menu bên ngoài form
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

																	multiValueLabel: (base: any, { index }) => ({
																		...base,
																		display: 'block',
																	}),
																}}
															/>
														</div>
													</div>
													<div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
														<button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
															{t('cancel')}
														</button>
														<button data-testId="submit-modal-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleExportFile()}>
															{t('export_file')}
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
export default ModalExcel;
