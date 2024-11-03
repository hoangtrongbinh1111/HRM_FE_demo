import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import { Dialog, Transition } from '@headlessui/react';

import { IconLoading } from '@/components/Icon/IconLoading';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Select from 'react-select';
import Link from 'next/link';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import { ProductCategorys, Providers } from '@/services/swr/product.swr';
import IconBack from '@/components/Icon/IconBack';

import { removeNullProperties } from '@/utils/commons';
import { Humans } from '@/services/swr/human.swr';
import { Departments } from '@/services/swr/department.swr';
import { detailDepartment, updateDepartment } from '@/services/apis/department.api';
import { useDispatch } from 'react-redux';

import { listHumanNonDepartment } from '@/services/apis/human.api';
import { setPageTitle } from '@/store/themeConfigSlice';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
interface Props {
    [key: string]: any;
}

const EditDepartment = ({ ...props }: Props) => {
    const router = useRouter();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(`${t('detail_department')}`));
    });
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [query, setQuery] = useState<any>();
    const [detail, setDetail] = useState<any>();

    const [loadDetail, setLoadDetail] = useState(false)
    const [manage, setManage] = useState()
    // const { data: manages } = Humans(query);

    // const manage = manages?.data.filter((item: any) => {
    //     return (
    //         item.value = item.id,
    //         item.label = item.fullName
    //     )
    // })

    useEffect(() => {
        listHumanNonDepartment({
            page: 1,
            perPage: 100
        })
            .then((res) => {
                const kq = res?.data?.map((i: any) => ({
                    value: i.id,
                    label: i.fullName
                }))
                setManage(kq)
            })
            .catch((e) => {
                console.log(e)
            })
    }, [])
    const { data: manages } = Humans({
        page: 1,
        perPage: 100,
    });

    const manage2 = manages?.data.filter((item: any) => {
        if (!item.departmentId) return (item.value = item.id), (item.label = item.fullName);
    });
    const defaultManage = manage2?.find((i: { value: string }) => i && i.value === detail?.headOfDepartmentId);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_name_department')}`),
        code: Yup.string().required(`${t('please_fill_departmentCode')}`),
        abbreviation: Yup.string().required(`${t('please_fill_departmentName')}`),
        description: Yup.string(),
        headOfDepartmentId: Yup.number().typeError(`${t('please_fill_manager')}`),
        // parentId: Yup.number().typeError(`${t('please_fill_parent_department')}`),
    });
    const handleSearch = (param: any) => {
        setQuery({ search: param });
    };
    const handleDepartment = (value: any) => {
        removeNullProperties(value);
        let dataSubmit;
        dataSubmit = {
            name: value.name,
            description: value.description,
            code: value.code,
            abbreviation: value.abbreviation,
            headOfDepartmentId: value.headOfDepartmentId ? value.headOfDepartmentId : defaultManage?.value,
            avatarId: value.avatarId,
        };
        updateDepartment(detail?.id, dataSubmit)
            .then(() => {
                showMessage(`${t('edit_department_success')}`, 'success');
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
            });
    };

    useEffect(() => {
        const id = router.query.id;
        if (Number(router.query.id)) {
            setLoadDetail(true)
            detailDepartment(Number(router.query.id))
                .then((res) => {
                    setDetail(res.data);
                    setLoadDetail(false)
                })
                .catch((err) => console.log(err));
        }

    }, [router]);
    return (
        <div>
            {loadDetail && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )}
            <div className="p-5">
                <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/hrm/dashboard" className="text-primary hover:underline">
                            {t('dashboard')}
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <Link href="/hrm/department" className="text-primary hover:underline">
                            <span>{t('department_list')}</span>
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{t('detail_department')}</span>
                    </li>
                </ul>
                <div className="header-page-bottom mb-4 flex justify-between pb-4">
                    <h1 className="page-title">{t('detail_department')}</h1>
                    <div className='flex' style={{ alignItems: "center" }}>
                        <RBACWrapper permissionKey={['department:update']} type={'AND'}>
                            {
                                <Link href={`/hrm/department/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                                    <button className="edit-page-btn btn btn-primary ltr:ml-4 rtl:mr-4 h-9">
                                        {t('edit')}
                                    </button>
                                </Link>
                            }
                        </RBACWrapper>
                        <Link href={`/hrm/department?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                            <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                                <IconBack />
                                <span>
                                    {t('back')}
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
                {detail?.id !== undefined && (
                    <Formik
                        initialValues={{
                            name: detail ? `${detail?.name}` : '',
                            code: detail ? `${detail?.code}` : '',
                            description: detail ? `${detail?.description}` : '',
                            abbreviation: detail ? `${detail?.abbreviation}` : '',
                            headOfDepartmentId: detail?.data ? detail?.data?.headOfDepartmentId : '',
                            parentId: detail?.parent?.id ? { value: detail?.parent?.id, label: detail?.parent?.name } : '',
                            proxyId: detail?.proxy?.id ? { value: detail?.proxy?.id, label: detail?.proxy?.fullName } : '',
                            directSignatoryId: detail?.directSignatory?.id ? { value: detail?.directSignatory?.id, label: detail?.directSignatory?.fullName } : '',

                        }}
                        validationSchema={SubmittedForm}
                        onSubmit={(values) => {
                            handleDepartment(values);
                        }}
                        enableReinitialize
                    >
                        {({ errors, touched, submitCount, values, setFieldValue }) => (
                            <Form className="space-y-5">
                                <div className="mb-5">
                                    <label htmlFor="name" className="label">
                                        {' '}
                                        {t('name_department')} <span style={{ color: 'red' }}>* </span>
                                    </label>
                                    <Field autoComplete="off" disabled name="name" type="text" id="name" placeholder={`${t('enter_name_department')}`} className="form-input" />
                                    {submitCount ? errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null : ''}
                                </div>
                                <div className="flex justify-between gap-5">
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="code" className="label">
                                            {' '}
                                            {t('code_department')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Field autoComplete="off" disabled name="code" type="text" id="code" placeholder={`${t('enter_code_department')}`} className="form-input" />
                                        {submitCount ? errors.code ? <div className="mt-1 text-danger"> {errors.code} </div> : null : ''}
                                    </div>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="abbreviation" className="label">
                                            {' '}
                                            {t('Abbreviated_name')}
                                        </label>
                                        <Field autoComplete="off" disabled name="abbreviation" type="text" id="abbreviation" placeholder={`${t('enter_abbreviated_name')}`} className="form-input" />
                                        {submitCount ? errors.abbreviation ? <div className="mt-1 text-danger"> {errors.abbreviation} </div> : null : ''}
                                    </div>
                                </div>

                                <div className="flex justify-between gap-5">
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="parentId" className="label">
                                            {' '}
                                            {t('Department_Parent')}
                                        </label>
                                        <Select
                                            // isDisabled={detail?.parent === null}
                                            isDisabled
                                            value={values.parentId}
                                            id="parentId"
                                            name="parentId"
                                            placeholder={t('select_departmentparent')}
                                            onInputChange={(e) => handleSearch(e)}
                                            maxMenuHeight={160}
                                            onChange={(newValue: any, actionMeta: any) => {
                                                setFieldValue('parentId', newValue ? newValue.value : null);
                                            }}
                                        />
                                        {submitCount ? errors.parentId ? <div className="mt-1 text-danger"> {`${errors.parentId}`} </div> : null : ''}
                                    </div>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="headOfDepartmentId" className="label">
                                            {' '}
                                            {t('Manager')}
                                        </label>
                                        <Select
                                            isDisabled
                                            defaultValue={defaultManage}
                                            id="headOfDepartmentId"
                                            name="headOfDepartmentId"
                                            placeholder={t('select_manager')}
                                            onInputChange={(e) => handleSearch(e)}
                                            options={manage}
                                            maxMenuHeight={160}
                                            onChange={(newValue: any, actionMeta: any) => {
                                                setFieldValue('headOfDepartmentId', newValue ? newValue.value : null);
                                            }}
                                        />
                                        {submitCount ? errors.headOfDepartmentId ? <div className="mt-1 text-danger"> {`${errors.headOfDepartmentId}`} </div> : null : ''}
                                    </div>
                                </div>
                                <div className="flex justify-between gap-5">
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="directSignatoryId" className="label">
                                            {' '}
                                            {t('directSignatory')}
                                        </label>
                                        <Select
                                            isDisabled
                                            id="directSignatoryId"
                                            name="directSignatoryId"
                                            placeholder={t('select_directSignatory')}
                                            maxMenuHeight={160}
                                            value={values?.directSignatoryId}
                                            onChange={(e) => {
                                                setFieldValue('directSignatoryId', e);
                                            }}
                                            styles={{
                                                menuPortal: (base: any) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                    </div>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="proxyId" className="label">
                                            {' '}
                                            {t('proxySignatory')}
                                        </label>
                                        <Select
                                            isDisabled
                                            id="proxyId"
                                            name="proxyId"
                                            placeholder={t('select_proxySignatory')}
                                            maxMenuHeight={160}
                                            value={values?.proxyId}
                                            onChange={(e) => {
                                                setFieldValue('proxyId', e);
                                            }}
                                            styles={{
                                                menuPortal: (base: any) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="name" className="label">
                                        {' '}
                                        {t('description')}
                                    </label>
                                    <Field autoComplete="off" disabled name="description" as="textarea" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
                                </div>

                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </div>
    );
};

export default EditDepartment;
