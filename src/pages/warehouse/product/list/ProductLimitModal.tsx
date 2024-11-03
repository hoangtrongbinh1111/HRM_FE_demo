import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { LimitProduct } from '@/services/apis/product.api';

interface Props {
    [key: string]: any;
}

const ProductLimitModal = ({ ...props }: Props) => {

    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);

    const SubmittedForm = Yup.object().shape({
        minQuantity: Yup.string().required(`${t('please_fill_min')}`),
        maxQuantity: Yup.string().required(`${t('please_fill_max')}`),
    });

    const handleProduct = (param: any) => {
        const query = {
            "minQuantity": param.minQuantity,
            "maxQuantity": param.maxQuantity
        }
        LimitProduct({ id: props.data.id, ...query }).then(() => {
            handleCancel();
            props.productMutate();
            showMessage(`${t('edit_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
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
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {t('limit_product')}
                                </div>
                                <div className="p-5">
                                    <Formik
                                        initialValues={
                                            {
                                                minQuantity: "",
                                                maxQuantity: ""
                                            }
                                        }
                                        validationSchema={SubmittedForm}
                                        onSubmit={values => {
                                            handleProduct(values);
                                        }}
                                    >

                                        {({ errors, values, setFieldValue }) => (
                                            <Form className="space-y-5" >
                                                <div className="mb-5">
                                                    <label htmlFor="minQuantity" > {t('min_quantity')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off" name="minQuantity" type="number" id="minQuantity" placeholder={`${t('enter_min_quantity')}`} className="form-input" />
                                                    {errors.minQuantity ? (
                                                        <div className="text-danger mt-1"> {errors.minQuantity} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="maxQuantity" > {t('max_quantity')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off" name="maxQuantity" type="number" id="maxQuantity" placeholder={`${t('enter_max_quantity')}`} className="form-input" />
                                                    {errors.maxQuantity ? (
                                                        <div className="text-danger mt-1"> {errors.maxQuantity} </div>
                                                    ) : null}
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

export default ProductLimitModal;
