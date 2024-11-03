import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Select, { StylesConfig } from 'react-select';
import Link from 'next/link';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import { Humans } from '@/services/swr/human.swr';
import { Departments } from '@/services/swr/department.swr';

import IconBack from '@/components/Icon/IconBack';
import { createDepartment } from '@/services/apis/department.api';
import { useRouter } from 'next/router';
import { useDebounce } from 'use-debounce';
import { loadMore } from '@/utils/commons';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { listHumanNonDepartment } from '@/services/apis/human.api';
import { useProfile } from '@/services/swr/profile.swr';
import { DropdownDepartment, DropdownSuperior } from '@/services/swr/dropdown.swr';

interface Props {
    [key: string]: any;
}

const AddNewDepartment = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(`${t('add_department')}`));
    });
    const [disabled, setDisabled] = useState(false);
    const [query, setQuery] = useState<any>();
    const router = useRouter();
    const [manage, setManage] = useState();
    const [typeShift, setTypeShift] = useState('0'); // 0: time, 1: total hours/
    //scroll

    const [loadDepartment, setLoadDepartment] = useState(false);
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [pageDepartment, setSizeDepartment] = useState<any>(1);
    const [debouncedPage] = useDebounce(pageDepartment, 500);
    const [debouncedQuery] = useDebounce(query, 500);
    const [dataSuperiorDropdown, setDataSuperiorDropdown] = useState<any>([]);
    const [dataDirectDropdown, setDataDirectDropdown] = useState<any>([]);
    const [dataProxyDropdown, setDataProxyDropdown] = useState<any>([]);

    const [page, setPage] = useState(1);
    const [pageDirect, setPageDirect] = useState(1);
    const [pageProxy, setPageProxy] = useState(1);

    const [searchSuperior, setSearchSuperior] = useState<any>();
    const [searchDirect, setSearchDirect] = useState<any>();
    const [searchProxy, setSearchProxy] = useState<any>();

    const [departmentId, setDepartmentId] = useState<any>();
    const { data: userData } = useProfile();
    const [isAdd, setIsAdd] = useState(false);
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, perPage: 100 });

    const [isHigh, setIsHigh] = useState<any>('false');
    const { data: superiorDropdown, pagination: superiorPagination, isLoading: superiorLoading } = DropdownSuperior({ page: page, search: searchSuperior, departmentId: departmentId });
    const { data: directDropdown, pagination: directPagination, isLoading: directLoading } = DropdownSuperior({ page: pageDirect, search: searchDirect, departmentId: departmentId });
    const { data: proxyDropdown, pagination: proxyPagination, isLoading: proxyLoading } = DropdownSuperior({ page: pageProxy, search: searchProxy, departmentId: departmentId });

    useEffect(() => {
        listHumanNonDepartment({
            page: 1,
            perPage: 100,
        })
            .then((res) => {
                const kq = res?.data?.map((i: any) => ({
                    value: i.id,
                    label: i.fullName,
                }));
                setManage(kq);
            })
            .catch((e) => {
                console.log(e);
            });
    }, []);
    const SubmittedForm = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_name_department')}`),
        code: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_departmentCode')}`),
    });

    useEffect(() => {
        if (superiorPagination?.page === undefined) return;
        if (superiorPagination?.page === 1) {
            if (isHigh === 'true') {
                setDataSuperiorDropdown(superiorDropdown?.data);
            } else {
                const dataSuperior = superiorDropdown?.data?.filter((item: any) => item.value !== userData?.data?.id);
                setDataSuperiorDropdown(dataSuperior);
            }
        } else {
            const dataSuperior = [...dataSuperiorDropdown, ...superiorDropdown?.data];
            if (isHigh === 'true') {
                setDataSuperiorDropdown(dataSuperior);
            } else {
                setDataSuperiorDropdown(dataSuperior?.filter((item: any) => item.value !== userData?.data?.id));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [superiorPagination]);

    useEffect(() => {
        if (directPagination?.page === undefined) return;
        if (directPagination?.page === 1) {
            if (isHigh === 'true') {
                setDataDirectDropdown(directDropdown?.data);
            } else {
                const dataDirect = directDropdown?.data?.filter((item: any) => item.value !== userData?.data?.id);
                setDataDirectDropdown(dataDirect);
            }
        } else {
            const dataDirect = [...dataDirectDropdown, ...directDropdown?.data];
            if (isHigh === 'true') {
                setDataDirectDropdown(dataDirect);
            } else {
                setDataDirectDropdown(dataDirect?.filter((item: any) => item.value !== userData?.data?.id));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [directPagination]);

    useEffect(() => {
        if (proxyPagination?.page === undefined) return;
        if (proxyPagination?.page === 1) {
            if (isHigh === 'true') {
                setDataProxyDropdown(proxyDropdown?.data);
            } else {
                const dataProxy = proxyDropdown?.data?.filter((item: any) => item.value !== userData?.data?.id);
                setDataProxyDropdown(dataProxy);
            }
        } else {
            const dataProxy = [...dataProxyDropdown, ...proxyDropdown?.data];
            if (isHigh === 'true') {
                setDataProxyDropdown(dataProxy);
            } else {
                setDataProxyDropdown(dataProxy?.filter((item: any) => item.value !== userData?.data?.id));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proxyPagination]);

    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data);
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
        }
    }, [departmentId]);

    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data);
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationDepartment]);

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(superiorPagination?.page + 1);
        }, 1000);
    };
    const handleMenuDirectScrollToBottom = () => {
        setTimeout(() => {
            setPageDirect(directPagination?.page + 1);
        }, 1000);
    };
    const handleMenuProxyScrollToBottom = () => {
        setTimeout(() => {
            setPageProxy(proxyPagination?.page + 1);
        }, 1000);
    };
    const handleDepartment = (value: any) => {
        const departmentData: any = {};

        if (value?.code) departmentData.code = value.code;
        if (value?.name) departmentData.name = value.name;
        if (value?.abbreviation) departmentData.abbreviation = value.abbreviation;
        if (value?.description) departmentData.description = value.description;
        if (value?.parentId?.value) departmentData.parentId = value.parentId.value;
        if (value?.headOfDepartmentId?.value) departmentData.headOfDepartmentId = value.headOfDepartmentId.value;
        if (value?.directSignatoryId?.value) departmentData.directSignatoryId = value.directSignatoryId.value;
        if (value?.proxyId?.value) departmentData.proxyId = value.proxyId.value;

        setIsAdd(true)
        createDepartment(departmentData)
            .then(() => {
                showMessage(`${t('add_department_success')}`, 'success');
                setIsAdd(false)
                router.push('/hrm/department');
            })
            .catch((err) => {
                setIsAdd(false)
                showMessage(err?.response?.data?.message ? err?.response?.data?.message : `${t('add_department_error')}`, 'error');
            });
    };
    const customStyles: StylesConfig<any, false> = {
        menuPortal: (base: any) => ({
            ...base,
            zIndex: 9999,
        }),
    };
    return (
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
                    <span>{t('add_department')}</span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">{t('add_department')}</h1>
                <Link href="/hrm/department">
                    <button type="button" className="btn btn-primary btn-sm back-button m-1">
                        <IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        <span>{t('back')}</span>
                    </button>
                </Link>
            </div>
            <Formik
                initialValues={{
                    name: props?.data ? `${props?.data?.name}` : '',
                    code: props?.data ? `${props?.data?.code}` : '',
                    description: props?.data ? `${props?.data?.description}` : '',
                    abbreviation: props?.data ? `${props?.data?.abbreviation}` : '',
                    headOfDepartmentId: props?.data ? props?.data?.headOfDepartmentId : null,
                    parentId: props?.data ? props?.data?.parentId : null,
                    proxyId: props?.data ? props?.data?.proxyId : null,
                    directSignatoryId: props?.data ? props?.data?.directSignatoryId : null
                }}
                validationSchema={SubmittedForm}
                onSubmit={(values) => {
                    handleDepartment(values);
                }}
            >
                {({ errors, values, setFieldValue, submitCount }) => (
                    <Form className="space-y-5">
                        <div className="mb-5">
                            <label htmlFor="name" className="label">
                                {' '}
                                {t('name_department')} <span style={{ color: 'red' }}>* </span>
                            </label>
                            <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_department')}`} className="form-input" />
                            {submitCount ? errors?.name ? <div className="mt-1 text-danger"> {`${errors.name}`} </div> : null : ''}
                        </div>
                        <div className="flex justify-between gap-5">
                            <div className="mb-5 w-1/2">
                                <label htmlFor="code" className="label">
                                    {' '}
                                    {t('code_department')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_department')}`} className="form-input" />
                                {submitCount ? errors?.code ? <div className="mt-1 text-danger"> {`${errors?.code}`} </div> : null : ''}
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="abbreviation" className="label">
                                    {' '}
                                    {t('Abbreviated_name')}
                                </label>
                                <Field autoComplete="off" name="abbreviation" type="text" id="abbreviation" placeholder={`${t('enter_abbreviated_name')}`} className="form-input" />
                            </div>
                        </div>
                        <div className="flex justify-between gap-5">
                            <div className="mb-5 w-1/2">
                                <label htmlFor="parentId" className="label">
                                    {' '}
                                    {t('Department_Parent')}
                                </label>
                                <Select
                                    id="parentId"
                                    name="parentId"
                                    placeholder={t('select_departmentparent')}
                                    options={dataDepartment}
                                    maxMenuHeight={160}
                                    value={dataDepartment.find((e: any) => e.value === departmentId)}
                                    onMenuOpen={() => setPage(1)}
                                    onMenuScrollToBottom={handleMenuScrollToBottom}
                                    isLoading={isLoadingDepartment}
                                    onChange={(e) => {
                                        setFieldValue('parentId', e);
                                        setDepartmentId(e?.value);
                                    }}
                                    styles={customStyles}
                                />
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="headOfDepartmentId" className="label">
                                    {' '}
                                    {t('Manager')}
                                </label>
                                <Select
                                    id="headOfDepartmentId"
                                    name="headOfDepartmentId"
                                    options={dataSuperiorDropdown.map((i: any) => ({ label: `${i.label} - ${i.position_name}`, value: i.value }))}
                                    onMenuOpen={() => setPage(1)}
                                    onMenuScrollToBottom={handleMenuScrollToBottom}
                                    placeholder={t('select_manager')}
                                    maxMenuHeight={160}
                                    isLoading={superiorLoading}
                                    value={values?.headOfDepartmentId}
                                    onInputChange={(e) => setSearchSuperior(e)}
                                    onChange={(e) => {
                                        setFieldValue('headOfDepartmentId', e);
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
                        <div className="flex justify-between gap-5">
                            <div className="mb-5 w-1/2">
                                <label htmlFor="directSignatoryId" className="label">
                                    {' '}
                                    {t('directSignatory')}
                                </label>
                                <Select
                                    id="directSignatoryId"
                                    name="directSignatoryId"
                                    options={dataDirectDropdown.map((i: any) => ({ label: `${i.label} - ${i.position_name}`, value: i.value }))}
                                    onMenuOpen={() => setPage(1)}
                                    onMenuScrollToBottom={handleMenuDirectScrollToBottom}
                                    placeholder={t('select_directSignatory')}
                                    maxMenuHeight={160}
                                    isLoading={directLoading}
                                    value={values?.directSignatoryId}
                                    onInputChange={(e) => setSearchDirect(e)}
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
                                    id="proxyId"
                                    name="proxyId"
                                    options={dataProxyDropdown.map((i: any) => ({ label: `${i.label} - ${i.position_name}`, value: i.value }))}
                                    onMenuOpen={() => setPage(1)}
                                    onMenuScrollToBottom={handleMenuProxyScrollToBottom}
                                    placeholder={t('select_proxySignatory')}
                                    maxMenuHeight={160}
                                    isLoading={proxyLoading}
                                    value={values?.proxyId}
                                    onInputChange={(e) => setSearchProxy(e)}
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
                            <label htmlFor="description" className="label">
                                {' '}
                                {t('description')}
                            </label>
                            <Field autoComplete="off" name="description" as="textarea" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
                        </div>
                        <div className="mt-8 flex items-center justify-end gap-8 ltr:text-right rtl:text-left">
                            <Link href="/hrm/department">
                                <button type="button" className="btn btn-outline-danger cancel-button">
                                    {t('cancel')}
                                </button>
                            </Link>
                            <button type="submit" className="btn :ml-4 add-button rtl:mr-4" disabled={isAdd}>
                                {t('add')}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddNewDepartment;
