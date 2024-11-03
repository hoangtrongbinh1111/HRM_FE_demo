import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import Select, { components } from 'react-select';
import { DropdownProductCategorys, DropdownProviders, DropdownUnits } from '@/services/swr/dropdown.swr';
import { CreateProduct, EditProduct } from '@/services/apis/product.api';

interface Props {
    [key: string]: any;
}

const ProductModal = ({ ...props }: Props) => {

    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [pageCategory, setSizeCategory] = useState<any>(1);
    const [pageUnit, setSizeUnit] = useState<any>(1);
    const [dataCategoryDropdown, setDataCategoryDropdown] = useState<any>([]);
    const [dataUnitDropdown, setDataUnitDropdown] = useState<any>([]);

    //get data
    const { data: categorys, pagination: paginationCategory, isLoading: CategoryLoading } = DropdownProductCategorys({ page: pageCategory });
    const { data: units, pagination: paginationUnit, isLoading: UnitLoading } = DropdownUnits({ page: pageUnit });

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().min(2, 'Too Short!').required(`${t('please_fill_name_product')}`),
        code: Yup.string().min(2, 'Too Short!').required(`${t('please_fill_productCode')}`),
        unitId: new Yup.ObjectSchema().required(`${t('please_fill_unit')}`),
        providerId: new Yup.ObjectSchema().required(`${t('please_fill_provider')}`),
        categoryId: new Yup.ObjectSchema().required(`${t('please_fill_category')}`)
    });
    const handleProduct = (param: any) => {
        const query = {
            "name": param.name,
            "code": param.code,
            "unitId": param.unitId.value,
            "description": param.description,
            "categoryId": param.categoryId.value
        }
        if (props?.data) {
            EditProduct({ id: props.data.id, ...query }).then(() => {
                props.productMutate();
                handleCancel();
                showMessage(`${t('edit_product_success')}`, 'success');
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            CreateProduct(query).then(() => {
                props.productMutate();
                handleCancel();
                showMessage(`${t('create_product_success')}`, 'success');
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
    }

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
    };
    useEffect(() => {
        if (paginationCategory?.page === undefined) return;
        if (paginationCategory?.page === 1) {
            setDataCategoryDropdown(categorys?.data)
        } else {
            setDataCategoryDropdown([...dataCategoryDropdown, ...categorys?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationCategory])

    useEffect(() => {
        if (paginationUnit?.page === undefined) return;
        if (paginationUnit?.page === 1) {
            setDataUnitDropdown(units?.data)
        } else {
            setDataUnitDropdown([...dataUnitDropdown, ...units?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationUnit])

    const handleMenuScrollToBottomCategory = () => {
        setTimeout(() => {
            setSizeCategory(paginationCategory?.page + 1);
        }, 1000);
    }

    const handleMenuScrollToBottomUnit = () => {
        setTimeout(() => {
            setSizeUnit(paginationUnit?.page + 1);
        }, 1000);
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
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {props.data !== undefined ? t('edit_product') : t('add_product')}
                                </div>
                                <div className="p-5">
                                    <Formik
                                        initialValues={
                                            {
                                                name: props?.data ? `${props?.data?.name}` : "",
                                                code: props?.data ? `${props?.data?.code}` : "",
                                                unitId: props?.data ? {
                                                    value: `${props?.data?.unit.id}`,
                                                    label: `${props?.data?.unit.name}`
                                                } : "",
                                                description: props?.data ? `${props?.data?.description}` : "",
                                                categoryId: props?.data ? {
                                                    value: `${props?.data?.category.id}`,
                                                    label: `${props?.data?.category.name}`
                                                } : "",
                                                providerId: props?.data ? {
                                                    value: `${props?.data?.provider?.id}`,
                                                    label: `${props?.data?.provider?.name}`
                                                } : ""
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
                                                    <label htmlFor="name" > {t('name')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name')}`} className="form-input" />
                                                    {errors.name ? (
                                                        <div className="text-danger mt-1"> {errors.name} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="code" > {t('code')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code')}`} className="form-input" />
                                                    {errors.code ? (
                                                        <div className="text-danger mt-1"> {errors.code} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="unitId" > {t('unit')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Select
                                                        id='unitId'
                                                        name='unitId'
                                                        options={dataUnitDropdown}
                                                        onMenuOpen={() => setSizeUnit(1)}
                                                        onMenuScrollToBottom={handleMenuScrollToBottomUnit}
                                                        maxMenuHeight={160}
                                                        value={values.unitId}
                                                        isLoading={UnitLoading}
                                                        onChange={e => {
                                                            setFieldValue('unitId', e)
                                                        }}
                                                    />
                                                    {errors.unitId ? (
                                                        <div className="text-danger mt-1"> {errors.code} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="categoryId" > {t('category')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Select
                                                        id='categoryId'
                                                        name='categoryId'
                                                        options={dataCategoryDropdown}
                                                        onMenuOpen={() => setSizeCategory(1)}
                                                        onMenuScrollToBottom={handleMenuScrollToBottomCategory}
                                                        isLoading={CategoryLoading}
                                                        maxMenuHeight={160}
                                                        value={values.categoryId}
                                                        onChange={e => {
                                                            setFieldValue('categoryId', e)
                                                        }}
                                                    />
                                                    {errors.categoryId ? (
                                                        <div className="text-danger mt-1"> {errors.categoryId} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="description" > {t('description')} </label >
                                                    <Field autoComplete="off" name="description" type="text" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
                                                    {errors.description ? (
                                                        <div className="text-danger mt-1"> {errors.description} </div>
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

export default ProductModal;
