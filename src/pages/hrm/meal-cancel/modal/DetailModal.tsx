import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import { DropdownHeadOfDepartment, DropdownInventory, DropdownProducts } from '@/services/swr/dropdown.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { makeRamdomText } from '@/utils/commons';
import { AddRiceCouponDetail, EditRiceCouponDetail } from '@/services/apis/rice-coupon.api';
import { Loader } from '@mantine/core';

interface Props {
    [key: string]: any;
}

const DetailModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataHeadOfDepartmentDropdown, setDataHeadOfDepartmentDropdown] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [searchHeadOfDepartment, setSearchHeadOfDepartment] = useState<any>();
    const [isSubmit, setIsSubmit] = useState(false);

    const SubmittedForm = Yup.object().shape({
        staffId: new Yup.ObjectSchema().required(`${t('please_fill_staff')}`),
        numberOfBreakfast: Yup.string().required(`${t('please_fill_quantity')}`),
        numberOfLunches: Yup.string().required(`${t('please_fill_quantity')}`),
        numberOfDinners: Yup.string().required(`${t('please_fill_quantity')}`),
        daysIssued: Yup.string().required(`${t('please_fill_quantity')}`),
    });

    const {
        data: headOfDepartmentDropdown,
        pagination: headOfDepartmentPagination,
        isLoading: headOfDepartmentLoading,
    } = DropdownHeadOfDepartment({ page: page, departmentId: props?.departmentId, search: searchHeadOfDepartment });

    const handleRiceCoupon = (param: any) => {
        if (Number(router.query.id)) {
            setIsSubmit(true);
            const query = {
                staffId: Number(param.staffId.value),
                numberOfBreakfast: Number(param.numberOfBreakfast),
                numberOfLunches: Number(param.numberOfLunches),
                numberOfDinners: Number(param.numberOfDinners),
                daysIssued: Number(param.daysIssued),
                // price: param?.price ? param?.price : 0
            };
            if (props?.data) {
                EditRiceCouponDetail({ id: router.query.id, detailId: props?.data?.id, ...query })
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
                AddRiceCouponDetail({ id: router.query.id, ...query })
                    .then(() => {
                        handleCancel();
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
                staff: {
                    fullName: param.staffId.label,
                    id: param.staffId.value,
                },
                numberOfBreakfast: Number(param.numberOfBreakfast),
                numberOfLunches: Number(param.numberOfLunches),
                numberOfDinners: Number(param.numberOfDinners),
                daysIssued: Number(param.daysIssued),
                staffId: Number(param.staffId.value),
                // price: param?.price ? param?.price : 0
            };
            if (props?.data) {
                const filteredItems = props.listData.find((item: any) => item.id === props.data.id)
                const updatedItems = {
                    id: filteredItems.id,
                    staff: {
                        fullName: param.staffId.label,
                        id: param.staffId.value,
                    },
                    numberOfBreakfast: Number(param.numberOfBreakfast),
                    numberOfLunches: Number(param.numberOfLunches),
                    numberOfDinners: Number(param.numberOfDinners),
                    daysIssued: Number(param.daysIssued),
                    staffId: Number(param.staffId.value),
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
        props.riceCouponDetailMutate();
        // props.setData();
    };

    useEffect(() => {
        setInitialValue({
            numberOfBreakfast: props?.data ? `${props?.data?.numberOfBreakfast}` : '',
            numberOfLunches: props?.data ? `${props?.data?.numberOfLunches}` : '',
            numberOfDinners: props?.data ? `${props?.data?.numberOfDinners}` : '',
            daysIssued: props?.data ? `${props?.data?.daysIssued}` : '',
            staffId: props?.data
                ? {
                    value: `${props?.data?.staff?.id}`,
                    label: `${props?.data?.staff?.fullName}`,
                }
                : '',
            // price: props?.data ? props?.data.price : ""
        });
    }, [props?.data]);

    useEffect(() => {
        if (headOfDepartmentPagination?.page === undefined) return;
        if (headOfDepartmentPagination?.page === 1) {
            setDataHeadOfDepartmentDropdown(headOfDepartmentDropdown?.data);
        } else {
            setDataHeadOfDepartmentDropdown([...dataHeadOfDepartmentDropdown, ...headOfDepartmentDropdown?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [headOfDepartmentPagination]);

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(headOfDepartmentPagination?.page + 1);
        }, 1000);
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
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-2xl border-0 p-0 text-[#476704] dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {props.data === undefined ? t('add_detail') : t('edit_detail')}
                                </div>
                                <div>
                                    <div className="p-5">
                                        <Formik
                                            initialValues={initialValue}
                                            validationSchema={SubmittedForm}
                                            onSubmit={async (values, { resetForm }) => {
                                                await handleRiceCoupon(values);
                                                resetForm();
                                            }}
                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5">
                                                    <div className="mb-5 flex justify-between gap-4">
                                                        <div className="flex-1">
                                                            <label
                                                                className=
                                                                "label"
                                                                htmlFor="staffId">
                                                                {' '}
                                                                {t('leader')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <Select
                                                                id="staffId"
                                                                name="staffId"
                                                                placeholder={t('select_leader')}
                                                                options={dataHeadOfDepartmentDropdown}
                                                                onMenuOpen={() => setPage(1)}
                                                                onMenuScrollToBottom={handleMenuScrollToBottom}
                                                                isLoading={headOfDepartmentLoading}
                                                                maxMenuHeight={160}
                                                                value={values?.staffId}
                                                                onInputChange={(e) => setSearchHeadOfDepartment(e)}
                                                                onChange={(e) => {
                                                                    setFieldValue('staffId', e);
                                                                }}
                                                            />
                                                            {submitCount && errors.staffId ? <div className="mt-1 text-danger"> {`${errors.staffId}`} </div> : null}
                                                        </div>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label
                                                            className=
                                                            "label" htmlFor="numberOfBreakfast">
                                                            {' '}
                                                            {t('number_of_breakfast')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="numberOfBreakfast"
                                                            type="number"
                                                            id="numberOfBreakfast"
                                                            onChange={(e: any) => {
                                                                if (e.target.value > 0) setFieldValue('numberOfBreakfast', e.target.value);
                                                            }}
                                                            placeholder={`${t('enter_quantity')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.numberOfBreakfast ? <div className="mt-1 text-danger"> {`${errors.numberOfBreakfast}`} </div> : null}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label
                                                            className=
                                                            "label" htmlFor="numberOfLunches">
                                                            {' '}
                                                            {t('number_of_lunches')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="numberOfLunches"
                                                            type="number"
                                                            id="numberOfLunches"
                                                            onChange={(e: any) => {
                                                                if (e.target.value > 0) setFieldValue('numberOfLunches', e.target.value);
                                                            }}
                                                            placeholder={`${t('enter_quantity')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.numberOfLunches ? <div className="mt-1 text-danger"> {`${errors.numberOfLunches}`} </div> : null}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label
                                                            className=
                                                            "label" htmlFor="numberOfDinners">
                                                            {' '}
                                                            {t('number_of_dinners')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="numberOfDinners"
                                                            type="number"
                                                            id="numberOfDinners"
                                                            onChange={(e: any) => {
                                                                if (e.target.value > 0) setFieldValue('numberOfDinners', e.target.value);
                                                            }}
                                                            placeholder={`${t('enter_quantity')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.numberOfDinners ? <div className="mt-1 text-danger"> {`${errors.numberOfDinners}`} </div> : null}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label
                                                            className=
                                                            "label" htmlFor="daysIssued">
                                                            {' '}
                                                            {t('days_issued')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="daysIssued"
                                                            type="number"
                                                            id="daysIssued"
                                                            onChange={(e: any) => {
                                                                if (e.target.value > 0) setFieldValue('daysIssued', e.target.value);
                                                            }}
                                                            placeholder={`${t('enter_quantity')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.daysIssued ? <div className="mt-1 text-danger"> {`${errors.daysIssued}`} </div> : null}
                                                    </div>
                                                    {/* <div className="mb-5">
                                                        <label
                                                                className=
                                                                "label" htmlFor="price" > {t('price')} </label >
                                                        <Field autoComplete="off" name="price" type="number" id="price" placeholder={`${t('enter_price')}`} className="form-input" />
                                                        {submitCount && errors.price ? (
                                                            <div className="text-danger mt-1"> {`${errors.price}`} </div>
                                                        ) : null}
                                                    </div> */}
                                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button data-testId="submit-modal-btn" type="submit" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4">
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
        </Transition>
    );
};
export default DetailModal;
