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
import { Positions } from '@/services/swr/position.swr';
import { useRouter } from 'next/router';
import { values } from 'lodash';
import { listAllGroupPositon } from '@/services/apis/group-position.api';
import { GroupPositions } from '@/services/swr/group-position.swr';
import { DropdownRole } from '@/services/swr/dropdown.swr';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { Loader } from '@mantine/core';
interface Props {
    [key: string]: any;
}

const AddNewDuty = ({ ...props }: Props) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle(`${t('add_duty')}`));
    });
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [listGroupPostition, setListGroupPostition] = useState([]);
    const router = useRouter();
    const [dataRepairDropdown, setDataRepairDropdown] = useState<any>([]);
    const [pageRepair, setPageRepair] = useState<any>(1);
    const [searchR, setSearchR] = useState<any>();
    const [isAdd, setIsAdd]= useState(false);

    //get data
    const { data: dropdownRepair, pagination: repairPagination } = DropdownRole({ page: pageRepair, search: searchR })

    useEffect(() => {
        listAllGroupPositon({
            page: 1,
            perPage: 100
        }).then((res) => {
            setListGroupPostition(res.data?.map((group: any) => {
                return {
                    value: group.id,
                    label: group.name
                }
            }));
        }).catch((err) => {
            console.log(err)
        })
    }, [])

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().min(2, 'Too Short!').required(`${t('please_fill_name_duty')}`),
        code: Yup.string().min(2, 'Too Short!').required(`${t('please_fill_dutyCode')}`),
        positionGroupId: Yup.number().typeError(`${t('please_fill_group_position')}`),
        isActive: Yup.bool().required(`${t('please_fill_status')}`),
        description: Yup.string(),
        level: Yup.number().required(`${t('please_fill_level')}`)
    });
    const { data: group_position, pagination: pagination1, mutate: mutate1 } = GroupPositions({ sortBy: 'id.ASC' });
    const handleDuty = (value: any) => {
        const query = {
            ...value,
            roleIds: value.roleIds.map((item: any) => { return item.value }),
        }
        setIsAdd(true)
        createPosition({
            ...query
        }).then(() => {
            showMessage(`${t('create_duty_success')}`, 'success');
            router.push('/hrm/duty')
        }).catch((err) => {
            setIsAdd(false)
            showMessage(`${t('create_duty_error')}`, 'error');
        });
    }

    useEffect(() => {
        if (repairPagination?.page === undefined) return;
        if (repairPagination?.page === 1) {
            setDataRepairDropdown(dropdownRepair?.data)
        } else {
            setDataRepairDropdown([...dataRepairDropdown, ...dropdownRepair?.data])
        }
    }, [repairPagination]);

    const handleMenuScrollToBottomRepair = () => {
        setTimeout(() => {
            setPageRepair(repairPagination?.page + 1);
        }, 1000);
    }

    const handleSearchR = (param: any) => {
        setSearchR(param)
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
                    <Link href="/hrm/duty" className="text-primary hover:underline">
                        <span>{t('duty_list')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('add_duty')}</span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{t('add_duty')}</h1>
                <Link href="/hrm/duty">
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
                        name: "",
                        code: "",
                        isActive: true,
                        positionGroupId: null,
                        description: "",
                        roleIds: [],
                        level: ""
                    }
                }
                validationSchema={SubmittedForm}
                onSubmit={values => {
                    handleDuty(values);
                }}
            >
                {({ errors, touched, submitCount, setFieldValue, values }) => (
                    <Form className="space-y-5" >
                        <div className="flex justify-between gap-5">
                            <div className="mb-5 w-1/2">
                                <label htmlFor="name" className='label'> {t('name_duty')} < span style={{ color: 'red' }}>* </span></label >
                                <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_duty')}`} className="form-input" />
                                {submitCount ? errors.name ? (
                                    <div className="text-danger mt-1"> {errors.name} </div>
                                ) : null : ''}
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="code" className='label'> {t('code_duty')} < span style={{ color: 'red' }}>* </span></label >
                                <Field autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_duty')}`} className="form-input" />
                                {submitCount ? errors.code ? (
                                    <div className="text-danger mt-1"> {errors.code} </div>
                                ) : null : ''}
                            </div>
                        </div>
                        <div className="flex justify-between gap-5">
                            <div className="mb-5 w-1/2">
                                <label htmlFor="groupPosition" className='label'> {t('group_position')} < span style={{ color: 'red' }}>* </span></label >
                                <Field autoComplete="off"
                                    name="groupPosition"
                                    render={({ field }: any) => (
                                        <>
                                            <Select
                                                {...field}
                                                options={listGroupPostition}
                                                value={listGroupPostition?.find((e: any) => e.value === values.positionGroupId)}
                                                isSearchable
                                                placeholder={`${t('choose_group_duty')}`}
                                                onChange={(e: any) => {
                                                    setFieldValue('positionGroupId', e.value)
                                                }}
                                            />

                                        </>
                                    )}
                                />
                                {submitCount ? errors.positionGroupId ? (
                                    <div className="text-danger mt-1"> {errors.positionGroupId} </div>
                                ) : null : ''}
                            </div>


                            <div className="mb-5 w-1/2">
                                <label htmlFor="isActive" className='label'> {t('isActive')} < span style={{ color: 'red' }}>* </span></label >
                                <div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
                                    <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                        <Field autoComplete="off" type="radio" name="isActive" value={true} checked={values.isActive === true} className="form-checkbox rounded-full" onChange={() => setFieldValue('isActive', true)} />
                                        {t('active')}
                                    </label>
                                    <label style={{ marginBottom: 0 }}>
                                        <Field autoComplete="off" type="radio" name="isActive" value={false} checked={values.isActive === false} className="form-checkbox rounded-full" onChange={() => setFieldValue('isActive', false)} />
                                        {t('inactive')}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-between gap-5'>
                            <div className="w-1/2">
                                <label htmlFor="roleIds" className='label'> {t('role')}</label >
                                <Select
                                    id='roleIds'
                                    name='roleIds'
                                    options={dataRepairDropdown}
                                    onMenuOpen={() => setPageRepair(1)}
                                    onMenuScrollToBottom={handleMenuScrollToBottomRepair}
                                    maxMenuHeight={160}
                                    placeholder={`${t('please_choose_roleIds')}`}
                                    onInputChange={(e) => handleSearchR(e)}
                                    value={values?.roleIds}
                                    isMulti
                                    closeMenuOnSelect={false}
                                    onChange={e => {
                                        setFieldValue('roleIds', e);

                                    }}
                                />
                                {submitCount && errors.roleIds ? (
                                    <div className="text-danger mt-1"> {`${errors.roleIds}`} </div>
                                ) : null}
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="level" className='label'> {t('level')} < span style={{ color: 'red' }}> * </span></label >
                                <Field autoComplete="off" name="level" type="number" id="level" placeholder={`${t('level')}`} className="form-input" />
                                {submitCount ? errors.level ? (
                                    <div className="text-danger mt-1"> {errors.level} </div>
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
                            <Link href="/hrm/duty">
                                <button type="button" className="btn btn-outline-danger cancel-button" >
                                    {t('cancel')}
                                </button>
                            </Link>
                            <button type="submit" className="btn :ml-4 rtl:mr-4 add-button" disabled={isAdd}>
                            {isAdd ? <Loader size="sm" /> : t('add')}
                            </button>
                        </div>

                    </Form>
                )}
            </Formik>

        </div>
    );
};

export default AddNewDuty;
