import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import { AddRequestAdvancePaymentDetail, EditRequestAdvancePaymentDetail } from '@/services/apis/request-advance-payment.api';
import { DropdownInventory, DropdownProducts } from '@/services/swr/dropdown.swr';
import { GetQuantity } from '@/services/apis/product.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { makeRamdomText } from '@/utils/commons';
import { formatNumber, moneyToNumber, moneyToText } from '@/utils/commons';
import { MONEY } from '@/utils/constants';
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
    const [isTouch, setIsTouch] = useState(false);
    const SubmittedForm = Yup.object().shape({
        content: Yup.string().required(`${t('please_fill_content')}`),
        unit: Yup.string().required(`${t('please_advance_fill_unit')}`),
        quantity: Yup.string().required(`${t('please_fill_quantity')}`),
        unitPrice: Yup.string().required(`${t('please_advance_fill_unitPrice')}`),
        // moneyTotal: Yup.string()
        //     .matches(/^[\d,]+$/, `${t('please_fill_valid_number')}`)
        //     .required(`${t('please_fill_total_money')}`),
    });

    const { data: productDropdown, pagination: productPagination, isLoading: productLoading } = DropdownInventory({ page: page, warehouseId: props?.warehouseId, search: searchProduct });
    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: 'white !important',
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            borderColor: Number(router.query.id) && 'rgb(224 230 237 / var(1))',
        }),
    };
    const [isSubmit, setIsSubmit] = useState(false);

    const handleRequestAdvancePayment = (param: any) => {
        if (Number(router.query.id)) {
            setIsSubmit(true);
            const query = {
                unitPrice: moneyToNumber(param?.unitPrice),
                moneyTotal: String(param?.moneyTotal),
                quantity: parseInt(param?.quantity),
                content: param?.content,
                unit: param?.unit,
            };
            if (props?.data) {
                EditRequestAdvancePaymentDetail({ id: router.query.id, detailId: props?.data?.id, ...query })
                    .then(() => {
                        handleCancel();
                        showMessage(`${t('edit_success')}`, 'success');
                        props.requestAdvancePaymentDetailMutate();
                    })
                    .catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    }).finally(() => {
                        setIsSubmit(false);
                    });
            } else {
                AddRequestAdvancePaymentDetail({ id: router.query.id, ...query })
                    .then(() => {
                        handleCancel();
                        props.requestAdvancePaymentDetailMutate();
                        showMessage(`${t('create_success')}`, 'success');
                    })
                    .catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    }).finally(() => {
                        setIsSubmit(false);
                    });
            }
        } else {
            const query = {
                id: makeRamdomText(3),
                unitPrice: moneyToNumber(param?.unitPrice),
                moneyTotal: (param?.moneyTotal),
                quantity: parseInt(param?.quantity),
                content: param?.content,
                unit: param?.unit,
            };
            if (props?.data) {
                const filteredItems = props.listData.find((item: any) => item.id === props.data.id)
                const updatedItems = {
                    id: filteredItems.id,
                    unitPrice: (param?.unitPrice),
                    moneyTotal: (param?.moneyTotal),
                    quantity: parseInt(param?.quantity),
                    content: param?.content,
                    unit: param?.unit,
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
        props.requestAdvancePaymentDetailMutate();
        // props.setData();
    };

    useEffect(() => {
        setInitialValue({
            content: props?.data ? `${props?.data?.content}` : '',
            unit: props?.data ? `${props?.data?.unit}` : '',
            quantity: props?.data ? `${props?.data?.quantity}` : '',
            unitPrice: props?.data ? `${props?.data?.unitPrice}` : '',
            moneyTotal: props?.data ? `${props?.data?.moneyTotal}` : '',
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
                                                await handleRequestAdvancePayment(values);
                                                resetForm();
                                            }}
                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount, touched, setValues }) => {
                                                return (
                                                    <Form className="space-y-5">
                                                        <div className="mb-5">
                                                            <label htmlFor="content">
                                                                {' '}
                                                                {t('content')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <Field
                                                                autoComplete="off"
                                                                name="content"
                                                                type="text"
                                                                id="content"
                                                                placeholder={`${t('enter_content')}`}
                                                                className="form-input"
                                                            />
                                                            {submitCount && errors.content ? <div className="mt-1 text-danger"> {`${errors.content}`} </div> : null}
                                                        </div>
                                                        <div className="mb-5">
                                                            <label htmlFor="quantity">
                                                                {' '}
                                                                {t('quantity')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <Field
                                                                autoComplete="off"
                                                                name="quantity"
                                                                type="text" id="quantity"
                                                                placeholder={`${t('enter_quantity')}`}
                                                                className="form-input"
                                                                onChange={(e: any) => {
                                                                    let value = '';
                                                                    String(values.unitPrice).split(",").map((item: any) => value += item);
                                                                    setFieldValue('quantity', e.target.value)
                                                                    setFieldValue('moneyTotal', Number(e.target.value) * Number(value || 0))
                                                                }}
                                                            />
                                                            {submitCount && errors.quantity ? <div className="mt-1 text-danger"> {`${errors.quantity}`} </div> : null}
                                                        </div>

                                                        <div className="mb-5">
                                                            <label htmlFor="unit">
                                                                {' '}
                                                                {t('unit')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <Field
                                                                autoComplete="off"
                                                                name="unit"
                                                                type="text"
                                                                id="unit"
                                                                placeholder={`${t('enter_payment_unit')}`}
                                                                className="form-input"
                                                            />
                                                            {submitCount && errors.unit ? <div className="mt-1 text-danger"> {`${errors.unit}`} </div> : null}
                                                        </div>
                                                        <div className="mb-5">
                                                            <label htmlFor="unitPrice">
                                                                {' '}
                                                                {t('unitPrice')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <div className='flex'>
                                                                <Field
                                                                    autoComplete="off"
                                                                    name="unitPrice"
                                                                    type="text"
                                                                    id="unitPrice"
                                                                    value={formatNumber(moneyToNumber(values.unitPrice))}
                                                                    placeholder={`${t('enter_unit_price')}`}
                                                                    className="form-input ltr:rounded-r-none rtl:rounded-l-none"
                                                                    onChange={(e: any) => {
                                                                        let value = '';
                                                                        e.target.value.split(",").map((item: any) => value += item);
                                                                        setFieldValue('unitPrice', e.target.value)
                                                                        setFieldValue('moneyTotal', Number(value) * Number(values.quantity || 0))
                                                                    }}
                                                                />
                                                                <div className="flex items-center justify-center font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0">
                                                                    <label className={`relative mb-0 h-4 w-24 ${Number(router.query.id) && 'cursor-pointer'}`}>
                                                                        <Select
                                                                            id="moneyUnit"
                                                                            name="moneyUnit"
                                                                            options={MONEY}
                                                                            value={values?.moneyUnit}
                                                                            styles={customStyles}
                                                                            isDisabled
                                                                            className="absolute -top-[11px]"
                                                                            onChange={(e) => {
                                                                                setFieldValue('moneyUnit', e);
                                                                            }}
                                                                        />
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            {values.unitPrice && <div className="mt-1 text-primary">{moneyToText(moneyToNumber(values.unitPrice), values?.moneyUnit.value)}</div>}
                                                            {submitCount && errors.unitPrice ? <div className="mt-1 text-danger"> {`${errors.unitPrice}`} </div> : null}
                                                        </div>
                                                        <div className="mb-5">
                                                            <label htmlFor="moneyTotal">
                                                                {' '}
                                                                {t('moneyTotal')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <Field
                                                                autoComplete="off"
                                                                name="moneyTotal"
                                                                type="text"
                                                                value={formatNumber((values.moneyTotal))}
                                                                id="moneyTotal"
                                                                placeholder={`${t('enter_total_advance_money_number')}`}
                                                                className="form-input"
                                                                disabled
                                                            />
                                                            {values.moneyTotal && <div className="mt-1 text-primary">{moneyToText((values.moneyTotal), values?.moneyUnit.value)}</div>}
                                                            {submitCount && errors.moneyTotal ? <div className="mt-1 text-danger"> {`${errors.moneyTotal}`} </div> : null}
                                                        </div>
                                                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                            <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                                {t('cancel')}
                                                            </button>
                                                            <button data-testId="submit-modal-btn" type="submit" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4">
                                                                {isSubmit ? <Loader size="sm" /> : `${props.data !== undefined ? t('update') : t('add_new')}`}
                                                            </button>
                                                        </div>
                                                    </Form>
                                                );
                                            }}
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
