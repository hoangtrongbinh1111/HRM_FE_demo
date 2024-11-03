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
import { makeRamdomText } from '@/utils/commons';
import dayjs from 'dayjs';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { useProfile } from '@/services/swr/profile.swr';
import { formatNumber, moneyToNumber, moneyToText } from '@/utils/commons';
interface Props {
    [key: string]: any;
}
import { Loader } from '@mantine/core';

const DetailModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataProductDropdown, setDataProductDropdown] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [searchProduct, setSearchProduct] = useState<any>();
    const { data: userData } = useProfile();
    const SubmittedForm = Yup.object().shape({
        content: Yup.string().required(`${t("please_fill_confirm_portal_content")}`),
        vehicle: Yup.string().required(`${t("please_fill_vehicle")}`),
        comment: Yup.string().required(`${t("please_fill_comment")}`),
    });

    const [isSubmit, setIsSubmit] = useState(false);

    const handleConfirmPortal = (param: any) => {
        if (Number(router.query.id)) {
            setIsSubmit(true);
            const query = {
                ...param,
                staffId: props?.data?.staffId ?? userData?.data?.id
            };
            if (props?.data) {
                EditConfirmPortalDetail({ id: router.query.id, detailId: props?.data?.id, ...query }).then(() => {
                    handleCancel();
                    showMessage(`${t('edit_success')}`, 'success');
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                }).finally(() => {
                    setIsSubmit(false);
                });
            } else {
                AddConfirmPortalDetail({ id: router.query.id, ...query }).then(() => {
                    handleCancel();
                    showMessage(`${t('create_success')}`, 'success');
                }).catch((err) => {
                    console.log(err);
                    showMessage(`${err?.response?.data?.message}`, 'error');
                }).finally(() => {
                    setIsSubmit(false);
                });
            }
        } else {
            const query = {
                ...param,
                id: makeRamdomText(3),
                staffId: props?.data?.staffId ?? userData?.data?.id
            };
            if (props?.data) {
                const filteredItems = props.listData.find((item: any) => item.id === props.data.id)
                const updatedItems = {
                    id: filteredItems.id,
                    ...param,
                    staffId: props?.data?.staffId ?? userData?.data?.id
                }
                const temp_list = props.listData.map((item: any) => {
                    if (item.id !== props.data.id) {
                        return item
                    } else {
                        return updatedItems
                    }
                })
                props.setListData(temp_list)
                props.setData(updatedItems);
                handleCancel();
            } else {
                if (props.listData && props.listData.length > 0) {
                    props.setListData([...props.listData, query])
                    handleCancel();
                } else {
                    props.setListData([query])
                    handleCancel();
                }
            }
        }
    }
    const handleCancel = () => {
        props.setOpenModal(false);
        props.confirmPortalDetailMutate();
        // props.setData();
    };

    useEffect(() => {
        setInitialValue({
            comment: props?.data ? `${props?.data?.comment}` : '',
            content: props?.data ? `${props?.data?.content}` : '',
            vehicle: props?.data ? `${props?.data?.vehicle}` : '',
        })
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
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {props.data === undefined ? t('add_detail') : t('edit_detail')}
                                </div>
                                <div>
                                    <div className="pl-10 pr-10 p-5">
                                        <Formik
                                            initialValues={initialValue}
                                            validationSchema={SubmittedForm}
                                            onSubmit={async (values, { resetForm }) => {
                                                await handleConfirmPortal(values)
                                                resetForm()
                                            }}
                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5" >
                                                    <div className="mb-5">
                                                        <label htmlFor="content" > {t('content')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field autoComplete="off"
                                                            name="content"
                                                            as="textarea"
                                                            id="content"
                                                            placeholder={`${t('enter_confirm_portal_Detail_content')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.content ? (
                                                            <div className="text-danger mt-1"> {`${errors.content}`} </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="vehicle" > {t('vehicle')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field autoComplete="off"
                                                            name="vehicle"
                                                            type="text"
                                                            id="vehicle"
                                                            placeholder={`${t('enter_vehicle')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.vehicle ? (
                                                            <div className="text-danger mt-1"> {`${errors.vehicle}`} </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="comment" > {t('comment')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field autoComplete="off"
                                                            name="comment"
                                                            as="textarea"
                                                            id="comment"
                                                            placeholder={`${t('enter_description')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.comment ? (
                                                            <div className="text-danger mt-1"> {`${errors.comment}`} </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button data-testId="submit-modal-btn" type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button">
                                                            {isSubmit ? <Loader size="sm" /> : `${props.data !== undefined ? t('update') : t('add_new')}`}
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
        </Transition >
    );
};
export default DetailModal;
