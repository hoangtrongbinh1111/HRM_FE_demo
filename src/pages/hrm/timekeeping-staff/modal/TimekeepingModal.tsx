import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { EditTimekeepingStaff } from '@/services/apis/timekeeping-staff.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const TimekeepingModal = ({ ...props }: Props) => {

    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [initialValue, setInitialValue] = useState<any>();
    const SubmittedForm = Yup.object().shape({
        weekdayWork: Yup.number()
            .min(0, `${t('please_fill_exact_format_number')}`)
            .typeError(`${t('please_fill_weekdayWork')}`),
        extraWork: Yup.number()
            .min(0, `${t('please_fill_exact_format_number')}`)
            .typeError(`${t('please_fill_extraWork')}`),
        holidayWork: Yup.number()
            .min(0, `${t('please_fill_exact_format_number')}`)
            .typeError(`${t('please_fill_holidayWork')}`),
        dayOffWork: Yup.number()
            .min(0, `${t('please_fill_exact_format_number')}`)
            .typeError(`${t('please_fill_dayOffWork')}`),
        bussinessWork: Yup.number()
            .min(0, `${t('please_fill_exact_format_number')}`)
            .typeError(`${t('please_fill_bussinessWork')}`)
    });
    useEffect(() => {
        setInitialValue({
            weekdayWork: props?.data ? props?.data?.weekdayWork : 0,
            extraWork: props?.data ? props?.data?.extraWork : 0,
            holidayWork: props?.data ? props?.data?.holidayWork : 0,
            dayOffWork: props?.data ? props?.data?.dayOffWork : 0,
            bussinessWork: props?.data ? props?.data?.bussinessWork : 0
        })
    }, [props?.data]);

    const handleUpdateTimekeeping = (value: any) => {
        if (props?.data) {
            const dataSubmit = {
                id: props.data.id,
                ...value
            }
            EditTimekeepingStaff(dataSubmit).then((res: any) => {
                showMessage(`${t('edit_timekeeping_success')}`, 'success');
                props.mutate()
                handleCancel();
            }).catch((err: any) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
    }

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
    };

    const handleDelete = () => {
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
                title: `${t('delete_timekeeping')}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {

                }
            });
    };

    return (
        <Transition appear show={props.openModal ?? false} as={Fragment}>
            <Dialog as="div" open={props.openModal} onClose={() => props.setOpenModal(false)} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
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
                                Thiết lập ca theo thời gian
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {props.data !== undefined ? `${t('edit_timekeeping')} ngày` : `${t('add_timekeeping')} ngày`}
                                </div>
                                <div className="p-5">
                                    <Formik
                                        initialValues={initialValue}
                                        validationSchema={SubmittedForm}
                                        onSubmit={values => {
                                            handleUpdateTimekeeping(values);
                                        }}
                                        enableReinitialize

                                    >

                                        {({ errors, touched, submitCount }) => (
                                            <Form className="space-y-5" >
                                                <div className="mb-5">
                                                    <label htmlFor="bussinessWork">
                                                        {' '}
                                                        {t('bussinessWork')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" name="bussinessWork" type="number" id="bussinessWork" placeholder={`${t('enter_bussinessWork')}`} className="form-input" />
                                                    {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.bussinessWork}`} </div> : null : ''}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="dayOffWork">
                                                        {' '}
                                                        {t('dayOffWork')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" name="dayOffWork" type="number" id="dayOffWork" placeholder={`${t('enter_dayOffWork')}`} className="form-input" />
                                                    {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.enter_dayOffWork}`} </div> : null : ''}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="holidayWork">
                                                        {' '}
                                                        {t('holidayWork')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" name="holidayWork" type="number" id="holidayWork" placeholder={`${t('enter_holidayWork')}`} className="form-input" />
                                                    {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.enter_holidayWork}`} </div> : null : ''}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="weekdayWork">
                                                        {' '}
                                                        {t('weekdayWork')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" name="weekdayWork" type="number" id="weekdayWork" placeholder={`${t('enter_weekdayWork')}`} className="form-input" />
                                                    {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.enter_weekdayWork}`} </div> : null : ''}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="extraWork">
                                                        {' '}
                                                        {t('extraWork')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" name="extraWork" type="number" id="extraWork" placeholder={`${t('enter_extraWork')}`} className="form-input" />
                                                    {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.enter_extraWork}`} </div> : null : ''}
                                                </div>
                                                <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                    <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                        {t('cancel')}
                                                    </button>
                                                    <RBACWrapper
                                                        permissionKey={[
                                                            'timekeepingStaff:update',
                                                        ]}
                                                        type={'OR'}>
                                                        <button data-testId="submit-modal-btn" type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button">
                                                            {props.data !== undefined ? t('update') : t('add_new')}
                                                        </button>
                                                    </RBACWrapper>
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
        </Transition >
    );
};

export default TimekeepingModal;
