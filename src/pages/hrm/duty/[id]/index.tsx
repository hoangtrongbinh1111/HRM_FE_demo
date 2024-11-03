import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';

import { IconLoading } from '@/components/Icon/IconLoading';
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
import { Positions } from '@/services/swr/position.swr';
import { detailPosition, updatePosition } from '@/services/apis/position.api';
import { listAllGroupPositon } from '@/services/apis/group-position.api';
import { GroupPositions } from '@/services/swr/group-position.swr';
import { DropdownRole } from '@/services/swr/dropdown.swr';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { Loader } from '@mantine/core';
interface Props {
    [key: string]: any;
}
const DetailDuty = ({ ...props }: Props) => {
    const router = useRouter();
    const [detail, setDetail] = useState<any>();
    const [listGroupPostition, setListGroupPostition] = useState([]);
    const id = Number(router.query.id);
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [dataRepairDropdown, setDataRepairDropdown] = useState<any>([]);
    const [pageRepair, setPageRepair] = useState<any>(1);
    const [searchR, setSearchR] = useState<any>();
    const dispatch = useDispatch();
    const [isAdd, setIsAdd] = useState(false);
    const [loadDetail, setLoadDetail] = useState(true)
    useEffect(() => {
        dispatch(setPageTitle(`${t('edit_duty')}`));
    });
    //get data
    const { data: dropdownRepair, pagination: repairPagination, isLoading: repairLoading } = DropdownRole({ page: pageRepair, search: searchR })

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
        level: Yup.number().required(`${t('please_fill_level')}`)
    });
    useEffect(() => {
        const id = router.query.id
        setLoadDetail(true)
        if (id) {
            detailPosition(id).then((res) => {
                setLoadDetail(false)
                setDetail(res?.data)
            }).catch((err: any) => {
                console.log(err)
            });
        }
    }, [router])
    const { data: group_position, pagination: pagination1, mutate: mutate1 } = GroupPositions({ sortBy: 'id.ASC', ...router.query });
    const { data: role1 } = DropdownRole({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100,
    });
    const role2 = role1?.data.map((item: any) => ({
        value: item.id,
        label: item.name,
    }));
    const options = group_position?.data?.map((item: any) => ({ value: item.id, label: item.name })) || [];
    const defaultGroup = options.find((i: { value: string }) => i && i.value === detail?.positionGroupId);
    const handleDuty = (value: any) => {
        removeNullProperties(value);
        let dataSubmit: any = {
            name: value.name,
            description: value.description,
            isActive: value.isActive,
            positionGroupId: parseInt(value.positionGroupId),
            code: value.code,
            roleIds: value.roleIds.map((item: any) => { return item.value }),
            level: value.level,
        }
        setIsAdd(true)
        updatePosition(detail?.id, dataSubmit).then(() => {
            showMessage(`${t('update_duty_success')}`, 'success');
            mutate1();
            router.push(`/hrm/duty?page=${router?.query?.page}&perPage=${router?.query?.perPage}`);
        }).catch(() => {
            setIsAdd(false)
            showMessage(`${t('update_duty_error')}`, 'error');
        })
    }
    useEffect(() => {
        if (repairPagination?.page === undefined) return;
        if (repairPagination?.page === 1) {
            setDataRepairDropdown(dropdownRepair?.data)
        } else {
            setDataRepairDropdown([...dataRepairDropdown, ...dropdownRepair?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div>
            {(loadDetail) && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
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
                        <span>{t('edit_duty')}</span>
                    </li>
                </ul>
                <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                    <h1 className='page-title'>{t('edit_duty')}</h1>
                    <Link href={`/hrm/duty?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                        <button type="button" className="btn btn-primary btn-sm m-1 back-button" >
                            <IconBack className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                            <span>
                                {t('back')}
                            </span>
                        </button>
                    </Link>
                </div>
                {detail?.id !== undefined && <Formik
                    initialValues={
                        {
                            name: detail ? `${detail?.name}` : "",
                            code: detail ? `${detail?.code}` : "",
                            isActive: detail ? detail?.isActive : true,
                            positionGroupId: detail ? detail?.positionGroupId : null,
                            description: detail ? detail?.description : "",
                            roleIds: detail ? detail?.roles?.map((item: any) => {
                                return (
                                    {
                                        label: item.name,
                                        value: item.id
                                    }
                                )
                            }) : "",
                            level: detail ? detail.level : "",
                        }
                    }
                    validationSchema={SubmittedForm}
                    onSubmit={values => {
                        handleDuty(values);
                    }}
                    enableReinitialize
                >
                    {({ errors, touched, submitCount, values, setFieldValue }) => (
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
                                    <label htmlFor="groupPosition" className='label'> {t('duty_group')} < span style={{ color: 'red' }}>* </span></label >
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
                                        <div className="text-danger mt-1"> {`${errors.positionGroupId}`} </div>
                                    ) : null : ''}
                                </div>
                                <div className="mb-5 w-1/2">
                                    <label htmlFor="isActive" className='label'> {t('status')} <span style={{ color: 'red' }}>*</span></label>
                                    <div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
                                        <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                            <Field
                                                autoComplete="off"
                                                type="radio"
                                                name="isActive"
                                                value={true}
                                                checked={values.isActive === true}
                                                className="form-checkbox rounded-full"
                                                onChange={() => setFieldValue('isActive', true)}
                                            />
                                            {t('active')}
                                        </label>
                                        <label style={{ marginBottom: 0 }}>
                                            <Field
                                                autoComplete="off"
                                                type="radio"
                                                name="isActive"
                                                value={false}
                                                checked={values.isActive === false}
                                                className="form-checkbox rounded-full"
                                                onChange={() => setFieldValue('isActive', false)}
                                            />
                                            {t('inactive')}
                                        </label>
                                    </div>
                                    {/* {submitCount && errors.isActive && typeof errors.isActive === 'string' && (
                                        <div className="text-danger mt-1">{errors.isActive}</div>
                                    )} */}

                                </div>

                            </div>
                            <div className='flex justify-between gap-5'>
                                <div className="w-1/2">
                                    <label htmlFor="roleIds" className='label'> {t('role')} </label >
                                    <Select
                                        id='roleIds'
                                        name='roleIds'
                                        options={dataRepairDropdown}
                                        onMenuOpen={() => setPageRepair(1)}
                                        onMenuScrollToBottom={handleMenuScrollToBottomRepair}
                                        maxMenuHeight={160}
                                        closeMenuOnSelect={false}
                                        placeholder={`${t('please_choose_roleIds')}`}
                                        onInputChange={(e) => handleSearchR(e)}
                                        value={values?.roleIds}
                                        isMulti
                                        onChange={e => {
                                            setFieldValue('roleIds', e);

                                        }}
                                    />
                                    {submitCount && errors.roleIds ? (
                                        <div className="text-danger mt-1"> {`${errors.roleIds}`} </div>
                                    ) : null}
                                </div>
                                <div className="w-1/2">
                                    <label htmlFor="level" className='label'> {t('description_level')}< span style={{ color: 'red' }}>* </span> </label >
                                    <Field autoComplete="off" name="level" type="number" id="level" placeholder={`${t('level')}`} className="form-input" />
                                    {submitCount ? errors.level ? (
                                        <div className="text-danger mt-1"> {`${errors.level}`} </div>
                                    ) : null : ''}
                                </div>
                            </div>
                            <div className="mb-5">
                                <label htmlFor="description" className='label'> {t('description')}</label >
                                <Field autoComplete="off" name="description" as="textarea" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
                                {submitCount ? errors.description ? (
                                    <div className="text-danger mt-1"> {`${errors.description}`} </div>
                                ) : null : ''}
                            </div>
                            <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left gap-8">
                                <Link href={`/hrm/duty?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                                    <button type="button" className="btn btn-outline-danger cancel-button" >
                                        {t('cancel')}
                                    </button>
                                </Link>
                                <button type="submit" className="btn :ml-4 rtl:mr-4 add-button" disabled={disabled || isAdd}>
                                    {isAdd ? <Loader size="sm" /> : t('update')}
                                </button>
                            </div>

                        </Form>
                    )}
                </Formik>}

            </div >
        </div>

    );
};

export default DetailDuty;
