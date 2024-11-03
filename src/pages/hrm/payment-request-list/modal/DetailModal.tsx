import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import { AddPaymentRequestListDetail, EditPaymentRequestListDetail } from '@/services/apis/payment-request-list.api';
import { DropdownInventory, DropdownProducts } from '@/services/swr/dropdown.swr';
import { GetQuantity } from '@/services/apis/product.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { makeRamdomText } from '@/utils/commons';
import dayjs from 'dayjs';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { useProfile } from '@/services/swr/profile.swr';
import { formatNumber, moneyToNumber, moneyToText } from '@/utils/commons';
import { MONEY } from '@/utils/constants';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { Loader } from '@mantine/core';

interface Props {
    [key: string]: any;
}

const DetailModal = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const { data: userData } = useProfile();
    const SubmittedForm = Yup.object().shape({
        content: Yup.string().required(`${t('please_fill_content_payment')}`),
        comment: Yup.string().required(`${t('please_fill_comment')}`),
        spendingDay: Yup.date().required(`${t('please_choose_spending_day')}`),
        money: Yup.string()
            .matches(/^[\d,]+$/, `${t('please_fill_valid_number')}`)
            .required(`${t('please_fill_money')}`),
        // moneyUnit:
    });
    const [isSubmit, setIsSubmit] = useState(false);

    const handlePaymentRequestList = (param: any) => {
        if (Number(router.query.id)) {
            setIsSubmit(true);
            const query = {
                ...param,
                money: moneyToNumber(param.money),
                spendingDay: dayjs(param.spendingDay).format('YYYY-MM-DD'),
            };
            if (props?.data) {
                EditPaymentRequestListDetail({ id: router.query.id, detailId: props?.data?.id, ...query })
                    .then(() => {
                        handleCancel();
                        showMessage(`${t('edit_success')}`, 'success');
                    })
                    .catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    }).finally(() => {
                        setIsSubmit(false);
                    });
            } else {
                AddPaymentRequestListDetail({ id: router.query.id, ...query })
                    .then(() => {
                        handleCancel();
                        showMessage(`${t('create_success')}`, 'success');
                    })
                    .catch((err) => {
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
                money: moneyToNumber(param.money),
                spendingDay: dayjs(param.spendingDay).format('YYYY-MM-DD'),
            };
            if (props?.data) {
                const filteredItems = props.listData.find((item: any) => item.id === props.data.id)
                const updatedItems = {
                    id: filteredItems.id,
                    ...param,
                    money: moneyToNumber(param.money),
                    spendingDay: dayjs(param.spendingDay).format('YYYY-MM-DD'),
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
                    props.setListData([...props.listData, query]);
                    handleCancel();
                } else {
                    props.setListData([query]);
                    handleCancel();
                }
            }
        }
    };
    const handleCancel = () => {
        props.setOpenModal(false);
        props.paymentRequestListDetailMutate();
        // props.setData();
    };
    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: 'white !important',
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            borderColor: Number(router.query.id) && 'rgb(224 230 237 / var(1))',
        }),
    };
    useEffect(() => {
        setInitialValue({
            comment: props?.data ? `${props?.data?.comment}` : '',
            content: props?.data ? `${props?.data?.content}` : '',
            money: props?.data ? `${props?.data?.money}` : '',
            spendingDay: props?.data ? `${props?.data?.spendingDay}` : "",
            moneyUnit: MONEY?.find((e: any) => e.value === props?.moneyType),
        });
    }, [props?.data, props?.moneyType]);

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
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-2xl border-0 p-0 text-[#476704] dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">
                                    {props.data === undefined ? t('add_detail') : t('edit_detail')}
                                </div>
                                <div>
                                    <div className="p-5 pl-10 pr-10">
                                        <Formik
                                            initialValues={initialValue}
                                            validationSchema={SubmittedForm}
                                            onSubmit={async (values, { resetForm }) => {
                                                await handlePaymentRequestList(values);
                                                resetForm();
                                            }}
                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5">
                                                    <div className="mb-5">
                                                        <label className="label" htmlFor="spendingDay">
                                                            {' '}
                                                            {t('spendingDay')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="spendingDay"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    data-enable-time
                                                                    options={{
                                                                        // enableTime: true,
                                                                        dateFormat: 'd-m-Y',
                                                                        locale: {
                                                                            ...chosenLocale,
                                                                        },
                                                                        // time_24hr: true,
                                                                    }}
                                                                    value={dayjs(values?.spendingDay).format('DD-MM-YYYY')}
                                                                    onChange={(e: any) => {
                                                                        setFieldValue('spendingDay', dayjs(e[0]).format('YYYY-MM-DD'));
                                                                    }}
                                                                    className="calender-input form-input"
                                                                    placeholder={`${t('choose_register_end_date')}`}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount ? errors.spendingDay ? <div className="mt-1 text-danger"> {`${errors.spendingDay}`} </div> : null : ''}
                                                        {submitCount ? (
                                                            dayjs(values?.spendingDay).isAfter(values.spendingDay) ? (
                                                                <div className="mt-1 text-danger"> {`${t('endtime_must_after_starttime')}`} </div>
                                                            ) : null
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label className="label" htmlFor="content">
                                                            {' '}
                                                            {t('content')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="content"
                                                            as="textarea"
                                                            id="content"
                                                            placeholder={`${t('enter_confirm_portal_Detail_content')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.content ? <div className="mt-1 text-danger"> {`${errors.content}`} </div> : null}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label className="label" htmlFor="comment">
                                                            {' '}
                                                            {t('comment')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" name="comment" as="textarea" id="comment" placeholder={`${t('enter_description')}`} className="form-input" />
                                                        {submitCount && errors.comment ? <div className="mt-1 text-danger"> {`${errors.comment}`} </div> : null}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label className="label" htmlFor="money">
                                                            {' '}
                                                            {t('money')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <div className="flex">
                                                            <Field
                                                                autoComplete="off"
                                                                name="money"
                                                                type="text"
                                                                id="money"
                                                                // value={formatNumber(moneyToNumber(values.money))}
                                                                value={formatNumber(values.money)}
                                                                onChange={(e: any) => {
                                                                    setFieldValue('money', moneyToNumber(e.target.value));
                                                                }}
                                                                placeholder={`${t('enter_total_advance_money_number')}`}
                                                                className="form-input ltr:rounded-r-none rtl:rounded-l-none"
                                                            />
                                                            <div className="flex items-center justify-center font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0">
                                                                <label className={`relative mb-0 h-4 w-24 ${Number(router.query.id) && 'cursor-pointer'}`}>
                                                                    <Select
                                                                        id="moneyUnit"
                                                                        name="moneyUnit"
                                                                        options={MONEY}
                                                                        value={values?.moneyUnit}
                                                                        styles={customStyles}
                                                                        className="absolute -top-[11px]"
                                                                        isDisabled
                                                                        onChange={(e) => {
                                                                            setFieldValue('moneyUnit', e);
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>

                                                        {values.money && <div className="mt-1 text-primary">{moneyToText(moneyToNumber(values.money), values.moneyUnit?.value)}</div>}
                                                        {submitCount && errors.money ? <div className="mt-1 text-danger"> {`${errors.money}`} </div> : null}
                                                    </div>
                                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button data-testId="submit-modal-btn" type="submit" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4">
                                                            {isSubmit ? <Loader size="sm" /> : `${isSubmit ? <Loader size="sm" /> : `${isSubmit ? <Loader size="sm" /> : `${props.data !== undefined ? t('update') : t('add_new')}`}`}`}
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
export default DetailModal;
