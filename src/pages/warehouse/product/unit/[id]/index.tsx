import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { CreateUnit, EditUnit, GetUnit } from '@/services/apis/product.api';
import Link from 'next/link';
import IconBackward from '@/components/Icon/IconBackward';
import { useRouter } from 'next/router';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const UnitModal = ({ ...props }: Props) => {

    const router = useRouter();
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [data, setData] = useState<any>();

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().min(2, 'Too Short!').required(`${t('please_fill_name')}`)
    });

    const handleUnit = (param: any) => {
        if (data) {
            EditUnit({ id: data.id, ...param }).then(() => {
                handleCancel();
                showMessage(`${t('edit_unit_success')}`, 'success');
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            CreateUnit(param).then(() => {
                handleCancel();
                showMessage(`${t('create_unit_success')}`, 'success');
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
    }

    const handleCancel = () => {
        router.push('/warehouse/product/unit')
    };

    useEffect(() => {
        if (Number(router.query.id)) {
            GetUnit({ id: Number(router.query.id) }).then((res) => {
                setData(res.data)
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            })
        }
    }, [router])

    return (
        <div>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{data !== undefined ? t('edit_unit') : t('add_unit')}</h1>
                <Link href="/warehouse/product/unit">
                    <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                        <IconBackward />
                        <span>
                            {t('back')}
                        </span>
                    </div>
                </Link>
            </div>
            <div className="p-5">
                <Formik
                    initialValues={
                        {
                            name: data?.name ? `${data?.name}` : "",
                            description: data?.description ? `${data?.description}` : ""

                        }
                    }
                    validationSchema={SubmittedForm}
                    onSubmit={values => {
                        handleUnit(values);
                    }}
                    enableReinitialize
                >

                    {({ errors, touched, submitCount }) => (
                        <Form className="space-y-5" >
                            <div className='flex justify-between gap-5'>
                                <div className="w-1/2">
                                    <label htmlFor="name" > {t('dvt_name')} < span style={{ color: 'red' }}>* </span></label >
                                    <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name')}`} className="form-input" />
                                    {submitCount && errors.name ? (
                                        <div className="text-danger mt-1"> {errors.name} </div>
                                    ) : null}
                                </div>
                                <div className="w-1/2">
                                    <label htmlFor="description" > {t('description')} </label >
                                    <Field autoComplete="off" name="description" type="text" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
                                    {submitCount && errors.description ? (
                                        <div className="text-danger mt-1"> {errors.description} </div>
                                    ) : null}
                                </div>
                            </div>
                            <RBACWrapper permissionKey={['unit:create', 'unit:update']} type={'OR'}>
                                <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                    <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                        {t('cancel')}
                                    </button>
                                    <button data-testId="submit-btn" type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" disabled={disabled}>
                                        {data !== undefined ? t('update') : t('add')}
                                    </button>
                                </div>
                            </RBACWrapper>
                        </Form>
                    )}
                </Formik>

            </div>
        </div>
    );
};

export default UnitModal;
