import { useEffect, Fragment, useState, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import { DropdownInventory, DropdownProducts } from '@/services/swr/dropdown.swr';
import { AddStocktakeDetail, EditStocktakeDetail } from '@/services/apis/stocktake.api';
import { GetProduct, GetQuantity } from '@/services/apis/product.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const DetailModal = ({ ...props }: Props) => {

    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataProductDropdown, setDataProductDropdown] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [data, setData] = useState<any>([]);
    const SubmittedForm = Yup.object().shape({
        productId: new Yup.ObjectSchema().required(`${t('please_fill_product')}`),
    });
    const { data: productDropdown, pagination: productPagination, isLoading: productLoading } = DropdownInventory({ page: page, warehouseId: props?.warehouseId });

    const handleStocktake = (param: any) => {
        if (Number(param.quantity) > (Number(param.inventory) || 0)) {
            showMessage(`Số lượng không hợp lệ`, 'error');
        } else {
            const query = {
                productId: Number(param.productId.value),
                openingQuantity: param?.openingQuantity || 0
            };
            if (Number(router.query.id)) {
                if (props?.data) {
                    EditStocktakeDetail({ id: router.query.id, itemId: props?.data?.id, ...query }).then(() => {
                        props.stocktakeDetailMutate();
                        handleCancel();
                        showMessage(`${t('edit_success')}`, 'success');
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    });
                } else {
                    AddStocktakeDetail({ id: router.query.id, ...query }).then(() => {
                        props.stocktakeDetailMutate();
                        handleCancel();
                        showMessage(`${t('create_success')}`, 'success');
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    });
                }
            } else {
                const query = {
                    productId: Number(param.productId.value),
                    openingQuantity: param?.openingQuantity || 0,
                    inventory: Number(param.inventory),
                    ...data
                };
                if (props?.data?.id) {
                    const filteredItems = props.listData.filter((item: any) => item.productId !== props.data.id)
                    props.setListData([...filteredItems, query])
                    props.setData(query);
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
    };

    useEffect(() => {
        if (Number(props?.data?.id))
            handleProduct(props?.data?.id);
    }, [props?.data?.id])

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData();
        setData(undefined);
        // setInitialValue({});
    };

    const handleQuantity = (param: any, setFieldValue: any) => {
        GetQuantity({ id: param.value }).then((res) => {
            setFieldValue('inventory', res.data)
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    useEffect(() => {
        setInitialValue({
            productId: props?.data ? {
                value: `${props?.data?.product?.id || props.data.productId}`,
                label: `${props?.data?.product?.name || props.data.name}`
            } : "",
            openingQuantity: props?.data ? props.data.openingQuantity : "",
            inventory: props?.data?.inventory ? `${props?.data?.inventory}` : props?.data?.replacementPart ? `${props?.data?.replacementPart.quantity}` : ""
        })
    }, [props?.data, router]);

    useEffect(() => {
        if (productPagination?.page === undefined) return;
        if (productPagination?.page === 1) {
            setDataProductDropdown(productDropdown?.data)
        } else {
            setDataProductDropdown([...dataProductDropdown, ...productDropdown?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productPagination])

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(productPagination?.page + 1);
        }, 1000);
    }

    const handleProduct = (id: any) => {
        GetProduct({ id: id }).then((res) => {
            setData(res.data);
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
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
                            <Dialog.Panel className="panel w-full max-w-[700px] overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {props.data ? t('edit_product') : t('add_product_list')}
                                </div>
                                <div className="p-5 pl-10 pr-10">
                                    <Formik
                                        initialValues={initialValue}
                                        validationSchema={SubmittedForm}
                                        onSubmit={values => {
                                            handleStocktake(values);
                                        }}
                                        enableReinitialize
                                    >
                                        {({ errors, values, setFieldValue, submitCount }) => (
                                            <Form className="space-y-5" >
                                                <div className="mb-5 flex justify-between gap-4">
                                                    <div className="flex-1">
                                                        <label htmlFor="productId" > {t('product')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Select
                                                            id='productId'
                                                            name='productId'
                                                            options={dataProductDropdown}
                                                            onMenuOpen={() => setPage(1)}
                                                            onMenuScrollToBottom={handleMenuScrollToBottom}
                                                            isLoading={productLoading}
                                                            maxMenuHeight={140}
                                                            value={values.productId}
                                                            onChange={e => {
                                                                setFieldValue('productId', e)
                                                                handleProduct(e?.value);
                                                                handleQuantity(e, setFieldValue);
                                                            }}
                                                        />
                                                        {submitCount && errors.productId ? (
                                                            <div className="text-danger mt-1"> {`${errors.productId}`} </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="inventory" > {t('inventory_number')} </label >
                                                    <Field
                                                        autoComplete="off"
                                                        name="inventory"
                                                        type="number"
                                                        id="inventory"
                                                        className={"form-input bg-[#f2f2f2]"}
                                                        disabled={true}
                                                    />
                                                    {submitCount && errors.inventory ? (
                                                        <div className="text-danger mt-1"> {`${errors.inventory}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className="">
                                                    <label htmlFor="openingQuantity" > {t('opening_quantity')}</label >
                                                    <Field autoComplete="off"
                                                        name="openingQuantity"
                                                        type="number"
                                                        id="openingQuantity"
                                                        placeholder={`${t('enter_quantity')}`}
                                                        className="form-input"
                                                    />
                                                    {submitCount && errors.openingQuantity ? (
                                                        <div className="text-danger mt-1"> {`${errors.openingQuantity}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className="p-[15px] flex items-center justify-center ltr:text-right rtl:text-left">
                                                    <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                        {t('cancel')}
                                                    </button>
                                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button">
                                                        {router.query.id !== "create" ? t('update') : t('add_new')}
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
export default DetailModal;
