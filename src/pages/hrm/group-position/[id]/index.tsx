import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import IconArrowLeft from '@/components/Icon/IconArrowLeft';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconBack from '@/components/Icon/IconBack';
import duty_list from '../duty_list.json';
import Select from "react-select";
import { removeNullProperties } from '@/utils/commons';
import { C } from '@fullcalendar/core/internal-common';
import { detailGroupPositon, updateGroupPositon } from '@/services/apis/group-position.api';
import { GroupPositions } from '@/services/swr/group-position.swr';
interface Props {
    [key: string]: any;
}
const DetailGroupPosition = ({ ...props }: Props) => {
    const router = useRouter();
    const [detail, setDetail] = useState<any>();
    const id = Number(router.query.id);
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().min(2, 'Too Short!').required(`${t('please_fill_name_group_position')}`),
        isManager: Yup.string().required(`${t('please_fill_status')}`)
    });

    const { data: group_position, pagination, mutate } = GroupPositions({ sortBy: 'id.ASC', ...router.query });

    useEffect(() => {
        const id = router.query.id
        if (id) {
            detailGroupPositon(id).then((res) => {
                setDetail(res?.data)
            }).catch((err: any) => {
                console.log(err)
            });
        }
    }, [router])
    const handleGroupPosition = (value: any) => {
        removeNullProperties(value);
        let dataSubmit
        dataSubmit = {
            name: value.name,
            description: value.description,
            isManager: parseInt(value.isManager)
        }
        updateGroupPositon(detail?.id, dataSubmit).then(() => {
            showMessage(`${t('update_group_position_success')}`, 'success');
            mutate();
        }).catch(() => {
            showMessage(`${t('update_group_position_error')}`, 'error');
        })
    }

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
                    <span>{t('edit_group_position')}</span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{t('edit_group_position')}</h1>
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
                        name: detail ? `${detail?.name}` : "",
                        description: detail ? `${detail?.description}` : "",
                        isManager: detail ? `${detail?.isManager}` : 1,
                    }
                }
                validationSchema={SubmittedForm}
                onSubmit={values => {
                    handleGroupPosition(values);
                }}
                enableReinitialize
            >
                {({ errors, touched, submitCount, values, setFieldValue }) => (
                    <Form className="space-y-5" >
                        <div className="flex justify-between gap-5">
                            <div className="mb-5 w-1/2">
                                <label htmlFor="name" className='label'> {t('name_group_position')} < span style={{ color: 'red' }}>* </span></label >
                                <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_group_position')}`} className="form-input" />
                                {submitCount ? errors.name ? (
                                    <div className="text-danger mt-1"> {errors.name} </div>
                                ) : null : ''}
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
                            <Field autoComplete="off" name="description" as="textarea" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
                            {submitCount ? errors.description ? (
                                <div className="text-danger mt-1"> {errors.description} </div>
                            ) : null : ''}
                        </div>
                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left gap-8">
                            <Link href="/hrm/group-position">
                                <button type="button" className="btn btn-outline-danger cancel-button">
                                    {t('cancel')}
                                </button>
                            </Link>
                            <button type="submit" className="btn :ml-4 rtl:mr-4 add-button" disabled={disabled}>
                                {t('update')}
                            </button>
                        </div>

                    </Form>
                )}
            </Formik>

        </div>
    );
};

export default DetailGroupPosition;
