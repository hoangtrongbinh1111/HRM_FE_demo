import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import 'flatpickr/dist/flatpickr.css';
import { Formik, Form, Field } from 'formik';

interface Props {
    [key: string]: any;
}

const QuantityModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();

    const handleCancel = () => {
        props.setOpenModal(false);
    };

    const handleQuantity = (param: any) => {
        props.setData(
            props.data.map((item: any) => {
                if (props.detail.value == item.value) {
                    return {
                        ...item,
                        quantity: param.quantity,
                    };
                } else return item
            })
        )
        handleCancel()
    }
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
                            <Dialog.Panel className="p-5 panel w-full max-w-[50%] overflow-hidden rounded-lg border-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div>
                                    <Formik
                                        initialValues={
                                            {
                                                quantity: props?.detail ? `${props?.detail?.quantity}` : "",
                                            }
                                        }
                                        onSubmit={values => {
                                            handleQuantity(values);
                                        }}
                                    >

                                        {({ errors, values, setFieldValue }) => (
                                            <Form className="space-y-5" >
                                                <div className="mb-5">
                                                    <label htmlFor="quantity" > {t('quantity')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off" name="quantity" type="text" id="quantity" placeholder={`${t('enter_quantity')}`} className="form-input" />
                                                    {errors.quantity ? (
                                                        <div className="text-danger mt-1"> {errors.quantity} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => handleCancel()}>
                                                        {t('cancel')}
                                                    </button>
                                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                        {t('update')}
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
export default QuantityModal;
