import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { StylesConfig } from 'react-select';
import { DropdownSuperior, DropdownUsers } from '@/services/swr/dropdown.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { LeavingLateEarlyForward } from '@/services/apis/leaving-late-early.api';
import { DropdownDepartment } from '@/services/swr/dropdown.swr';
import { useProfile } from '@/services/swr/profile.swr';

interface Props {
    [key: string]: any;
}

const ApprovalModal = ({ ...props }: Props) => {
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

    const [isHigh, setIsHigh] = useState<any>('false');

    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, perPage: 100 });

    const { data: superiorDropdown, pagination: superiorPagination, isLoading: superiorLoading } = DropdownUsers({ page: page, search: searchSuperior, departmentId: departmentId });

    const handleProposal = (param: any) => {
        props?.setUsersParticipate(param?.approverId);
        props.setOpenModal(false);
    };
    const handleCancel = () => {
        props.setOpenModal(false);
    };
    const customStyles: StylesConfig<any, false> = {
        menuPortal: (base: any) => ({
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

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(superiorPagination?.page + 1);
        }, 1000);
    };

    const formRef = useRef<any>();

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit();
            // formRef.current.setFieldValue('approverId', props?.usersParticipate);
        }
    };

    return (
        <Transition appear show={props.openModal ?? false} as={Fragment}>
            <Dialog as="div" open={props.openModal} onClose={() => { props.setOpenModal(false) }} className="relative z-50">
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
                                    onClick={() => { props.setOpenModal(false) }}
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
                                                            <label htmlFor="departmentId">{t('choose_department')}</label>
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
                                                                    setDepartmentId(e?.value);
                                                                }}
                                                                menuPortalTarget={document.body} // Hiển thị menu bên ngoài form
                                                                styles={customStyles}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mb-5 flex justify-between gap-4">
                                                        <div className="flex-1">
                                                            <label htmlFor="approverId">
                                                                {t('usersParticipate')}
                                                                <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Select
                                                                id="approverId"
                                                                name="approverId"
                                                                options={dataSuperiorDropdown.map((i: any) => ({ label: `${i.label} - ${i.position_name}`, value: i.value }))}
                                                                onMenuOpen={() => setPage(1)}
                                                                onMenuScrollToBottom={handleMenuScrollToBottom}
                                                                placeholder={t('choose_human')}
                                                                maxMenuHeight={160}
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

                                                            {submitCount && errors.approverId ? <div className="mt-1 text-danger">{`${errors.approverId}`}</div> : null}
                                                        </div>
                                                    </div>
                                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button data-testId="submit-modal-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleSubmit()}>
                                                            {t('save')}
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
export default ApprovalModal;
