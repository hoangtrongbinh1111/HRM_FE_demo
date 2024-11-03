import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import { CheckWarehousingBillDetail } from '@/services/apis/warehousing-bill.api';
import { TallyReturn } from '@/services/apis/warehousing-bill-return.api';

interface Props {
    [key: string]: any;
}

const TallyModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();

    const SubmittedForm = Yup.object().shape({
        quantity: Yup.number().required(`${t('please_fill_quantity')}`),
    });

    const handleTally = (param: any) => {
        if (props?.data?.warehousingBilId) {
            TallyReturn({ id: props?.data?.warehousingBilId, detailId: props?.data?.id, ...param }).then(() => {
                handleCancel();
                showMessage(`${t('edit_success')}`, 'success');
            }).catch((err: any) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            CheckWarehousingBillDetail({ id: router.query.id, detailId: props?.data?.id, ...param }).then(() => {
                handleCancel();
                showMessage(`${t('edit_success')}`, 'success');
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
    }

    const handleCancel = () => {
        props.setOpenModal(false);
        props.orderDetailMutate();
        setInitialValue({});
    };

    useEffect(() => {
        setInitialValue({})
    }, [props?.data]);

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
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-2xl border-0 p-0 text-[#476704] dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {props.data === undefined ? t('tally') : t('tally')}
                                </div>
                                <div>
                                    <div className="p-5 pl-10 pr-10">
                                        <Formik
                                            initialValues={initialValue}
                                            validationSchema={SubmittedForm}
                                            onSubmit={async (values, { resetForm }) => {
                                                await handleTally(values)
                                                resetForm()
                                            }}
                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5" >
                                                    <div className="mb-5">
                                                        <label htmlFor="quantity" > {t('quantity')} </label >
                                                        <Field autoComplete="off"
                                                            name="quantity"
                                                            type="number"
                                                            id="quantity"
                                                            className={"form-input"}
                                                        />
                                                        {submitCount && errors.quantity ? (
                                                            <div className="text-danger mt-1"> {`${errors.quantity}`} </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="p-[15px] flex items-center justify-center ltr:text-right rtl:text-left">
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button data-testId="btn-quantity" type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button">
                                                            {props.data !== undefined ? t('save') : t('save')}
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
export default TallyModal;
