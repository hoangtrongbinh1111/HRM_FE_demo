import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { CreateWarehouse, EditWarehouse } from '@/services/apis/warehouse.api';
import { DropdownWarehouseTypes } from '@/services/swr/dropdown.swr';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import WarehouseTypeModal from './WarehouseTypeModal';

interface Props {
    [key: string]: any;
}

const WarehouseModal = ({ ...props }: Props) => {

    const { t } = useTranslation();
    const [openModal, setOpenModal] = useState(false);
    const [page, setPage] = useState(1);

    // get data
    const SubmittedForm = Yup.object().shape({
        name: Yup.string().min(2, 'Too Short!').required(`${t('please_fill_name_warehouse')}`),
        code: Yup.string().min(2, 'Too Short!').required(`${t('please_fill_warehouseCode')}`),
        // typeId: new Yup.ObjectSchema().required(`${t('please_fill_type')}`)
    });

    const handleWarehouse = (param: any) => {
        const query = {
            name: param.name,
            code: param.code,
            typeId: param.typeId.value,
            description: param.description
        }
        if (props?.data) {
            EditWarehouse({ id: props.data.id, ...query }).then(() => {
                props.warehouseMutate();
                handleCancel();
                showMessage(`${t('edit_warehouse_success')}`, 'success');
            }).catch((err) => {
                showMessage(`${t('edit_warehouse_error')}`, 'error');
            });
        } else {
            CreateWarehouse(query).then(() => {
                props.warehouseMutate();
                handleCancel();
                showMessage(`${t('create_warehouse_success')}`, 'success');
            }).catch((err) => {
                showMessage(`${t('create_warehouse_error')}`, 'error');
            });
        }
    }

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData();
    };

    const SelectMenuButton = (props: any) => {
        return (
            <components.MenuList  {...props}>
                <div style={{ borderBottom: '0.5px solid' }}>
                    <button
                        type='button'
                        className="btn btn-primary ltr:ml-1"
                        style={{ marginBottom: '5px' }}
                        onClick={e => setOpenModal(true)}
                    >
                        {'Add new type'}
                    </button>
                </div>
                {props.children}
            </components.MenuList >
        )
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
                                    {props.data !== undefined ? t('edit_warehouse') : t('add_warehouse')}
                                </div>
                                <div className="p-5">
                                    <Formik
                                        initialValues={
                                            {
                                                name: props?.data ? `${props?.data?.name}` : "",
                                                code: props?.data ? `${props?.data?.code}` : "",
                                                // typeId: props?.data ? {
                                                //     value: `${props?.data?.type.id}`,
                                                //     label: `${props?.data?.type.name}`
                                                // } : "",
                                                description: props?.data ? `${props?.data?.description}` : ""
                                            }
                                        }
                                        validationSchema={SubmittedForm}
                                        onSubmit={values => {
                                            handleWarehouse(values);
                                        }}
                                    >

                                        {({ errors, setFieldValue, values }) => (
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
                                                    <label htmlFor="description" > {t('description')} </label >
                                                    <Field autoComplete="off" name="description" type="text" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
                                                    {errors.description ? (
                                                        <div className="text-danger mt-1"> {errors.description} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left ">
                                                    <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                        {t('cancel')}
                                                    </button>
                                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button">
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
                <WarehouseTypeModal
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                />
            </Dialog>
        </Transition>
    );
};

export default WarehouseModal;
