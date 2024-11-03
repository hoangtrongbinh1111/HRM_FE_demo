import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconBack from '@/components/Icon/IconBack';
import Select from "react-select";
import { createPosition } from '@/services/apis/position.api';
import { createGroupPositon } from '@/services/apis/group-position.api';
interface Props {
    [key: string]: any;
}
const AddNewGroupPositon = ({ ...props }: Props) => {

    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().min(2, 'Too Short!').required(`${t('please_fill_group_position')}`)
    });

    const handleDuty = (value: any) => {
        createGroupPositon({
            ...value,
            isManager: parseInt(value?.isManager)
        }).then(() => {
            showMessage(`${t('create_group_position_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${t('create_group_position_error')}`, 'error');
        });
    }

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
    };
    return (
        <div className="p-5">
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <Link href="/hrm/group-position" className="text-primary hover:underline">
                        <span>{t('group_position')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('add_duty')}</span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{t('add_duty')}</h1>
                <Link href="/hrm/group-position">
                    <button type="button" className="btn btn-primary btn-sm m-1 back-button" >
                        <IconBack className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        <span>
                            {t('back')}
                        </span>
                    </button>
                </Link>
            </div>
            <Formik
                initialValues={
                    {
                        name: props?.data ? `${props?.data?.name}` : "",
                        description: props?.data ? `${props?.data?.description}` : "",
                        isManager: 0,
                    }
                }
                validationSchema={SubmittedForm}
                onSubmit={(values) => {
                    handleDuty(values);
                }}
            >
                {({ errors, touched, submitCount, setFieldValue }) => (
                    <Form className="space-y-5" >
                        <div className="flex justify-between gap-5">
                            <div className="mb-5 w-1/2">
                                <label htmlFor="name" className='label'>
                                    {' '}
                                    {t('name_group_position')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_group_position')}`} className="form-input" />
                                {submitCount ? errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null : ''}
                            </div>

                            <div className="mb-5 w-1/2">
                                <label htmlFor="isManager" className='label'> {t('isManager')} < span style={{ color: 'red' }}>* </span></label >
                                <div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
                                    <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                        <Field autoComplete="off" type="radio" name="isManager" value="1" className="form-checkbox rounded-full" />
                                        {t('active')}
                                    </label>
                                    <label style={{ marginBottom: 0 }}>
                                        <Field autoComplete="off" type="radio" name="isManager" value="0" className="form-checkbox rounded-full" />
                                        {t('inactive')}
                                    </label>
                                </div>

                                {submitCount ? errors.isManager ? (
                                    <div className="text-danger mt-1"> {errors.isManager} </div>
                                ) : null : ''}
                            </div>
                        </div>
                        <div className="mb-5">
                            <label htmlFor="description" className='label'> {t('description')}</label >
                            <Field autoComplete="off" name="description" as="textarea" id="description" placeholder={`${t('description')}`} className="form-input" />
                        </div>
                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left gap-8">
                            <Link href="/hrm/group-position">

                                <button type="button" className="btn btn-outline-danger cancel-button">
                                    {t('cancel')}
                                </button>
                            </Link>
                            <button type="submit" className="btn :ml-4 rtl:mr-4 add-button" disabled={disabled}>
                                {props.data !== undefined ? t('update') : t('add')}
                            </button>

                        </div>
                    </Form>
                )}
            </Formik>

        </div>
    );
};

export default AddNewGroupPositon;
