import { useEffect, Fragment, useState, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik, useFormikContext } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';

interface Props {
    [key: string]: any;
}

const ImportModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataSelect, setDataSelect] = useState<any>();

    const SubmittedForm = Yup.object().shape({
        quantity: Yup.string().required(`${t('please_fill_quantity')}`)
    });

    const handleImport = (value: any) => {
        if (props?.data) {
            const reNew = props.totalData.filter((item: any) => item.id !== props.data.id);
            reNew.push({
                id: Number(props?.totalData[props?.totalData?.length - 1].id) + 1,
                idSelect: value.id,
                name: dataSelect.find((item: any) => item.id == value.name).name,
                code: value.code,
                status: value.status
            });
            localStorage.setItem('importList', JSON.stringify(reNew));
            props.setGetStorge(reNew);
            props.setOpenModal(false);
            props.setData(undefined);
            setInitialValue({});
            showMessage(`${t('edit_import_success')}`, 'success');
        } else {
            const reNew = props.totalData;
            reNew.push({
                id: Number(props?.totalData[props?.totalData?.length - 1].id) + 1,
                idSelect: value.id,
                name: dataSelect.find((item: any) => item.id == value.name).name,
                code: value.code,
                status: value.status
            })
            localStorage.setItem('importList', JSON.stringify(reNew));
            props.setGetStorge(reNew);
            props.setOpenModal(false);
            props.setData(undefined);
            setInitialValue({});
            showMessage(`${t('create_import_success')}`, 'success')
        }
    }

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
        setInitialValue({});
    };

    useEffect(() => {
        setDataSelect(JSON.parse(localStorage.getItem("dutyList") || ""));
        setInitialValue({
            name: props?.data ? `${props?.data?.idSelect}` : "",
            code: props?.data ? `${props?.data?.code}` : "",
            status: props?.data ? `${props?.data?.status}` : ""
        })
    }, [props?.data, router]);

    const handleData = (param: any) => {
        const search = dataSelect.filter((item: any) => item.id == param.target.value);
        setInitialValue({
            ...initialValue,
            name: search[0]?.id,
            code: search[0]?.code
        })

    }

    const handlePrice = (param: any) => {
        setInitialValue({
            ...initialValue,
            totalAmount: (Number(param.target.value) * Number(initialValue?.unitPrice)),
            quantity: Number(param.target.value),
            status: "pending"
        })
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
                                    {props.data !== undefined ? 'Edit Import' : 'Add Import'}
                                </div>
                                <div className="p-5">
                                    <Formik
                                        initialValues={initialValue}
                                        validationSchema={SubmittedForm}
                                        onSubmit={values => {
                                            handleImport(values);
                                        }}
                                        enableReinitialize
                                    >

                                        {({ errors, setFieldValue }) => (
                                            <Form className="space-y-5" >
                                                <div className="mb-5">
                                                    <label htmlFor="name" > {t('name_duty')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off"
                                                        as="select"
                                                        name="name"
                                                        id="name"
                                                        className="form-input"
                                                        onChange={(e: any) => { handleData(e); }}
                                                    >
                                                        <option>---</option>
                                                        {
                                                            dataSelect?.map((item: any, index: any) =>
                                                                <option key={index} value={item.id}>{item.name}</option>
                                                            )
                                                        }
                                                    </Field>
                                                    {errors.name ? (
                                                        <div className="text-danger mt-1"> {`${errors.name}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="code" > {t('code_duty')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_duty')}`} className="form-input" />
                                                    {errors.code ? (
                                                        <div className="text-danger mt-1"> {`${errors.code}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="unit" > {t('unit')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off" name="unit" type="text" id="code" placeholder={`${t('enter_unit_duty')}`} className="form-input" />
                                                    {errors.unit ? (
                                                        <div className="text-danger mt-1"> {`${errors.code}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="quantity" > {t('quantity')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off"
                                                        name="quantity"
                                                        type="text"
                                                        id="quantity"
                                                        placeholder={`${t('enter_quantity_duty')}`}
                                                        className="form-input"
                                                        onChange={(e: any) => {
                                                            handlePrice(e);
                                                        }}
                                                    />
                                                    {errors.quantity ? (
                                                        <div className="text-danger mt-1"> {`${errors.quantity}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="unitPrice" > {t('unit_price')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off"
                                                        name="unitPrice"
                                                        type="text"
                                                        id="unitPrice"
                                                        placeholder={`${t('enter_unit_price')}`}
                                                        className="form-input"
                                                    />
                                                    {errors.unitPrice ? (
                                                        <div className="text-danger mt-1"> {`${errors.unitPrice}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="totalAmount" > {t('total_amount')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field autoComplete="off" name="totalAmount" type="text" id="code" placeholder={`${t('enter_total_amount')}`} className="form-input" />
                                                    {errors.totalAmount ? (
                                                        <div className="text-danger mt-1"> {`{errors.totalAmount}`} </div>
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

export default ImportModal;
