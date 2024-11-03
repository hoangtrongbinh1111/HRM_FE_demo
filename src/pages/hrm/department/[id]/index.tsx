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
import Select, { StylesConfig } from 'react-select';
import Link from 'next/link';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import { ProductCategorys, Providers } from '@/services/swr/product.swr';
import IconBack from '@/components/Icon/IconBack';

import { Loader } from '@mantine/core';
import { removeNullProperties } from '@/utils/commons';
import { Humans } from '@/services/swr/human.swr';
import { Departments } from '@/services/swr/department.swr';
import { listHumanNonDepartment } from '@/services/apis/human.api';
import { detailDepartment, updateDepartment } from '@/services/apis/department.api';
import { useDebounce } from 'use-debounce';
import { loadMore } from '@/utils/commons';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DropdownDepartment, DropdownSuperior } from '@/services/swr/dropdown.swr';
import { useProfile } from '@/services/swr/profile.swr';
interface Props {
    [key: string]: any;
}

const EditDepartment = ({ ...props }: Props) => {
    const router = useRouter();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(`${t('edit_department')}`));
    });
    const { t } = useTranslation();
    const [query, setQuery] = useState<any>();
    const [detail, setDetail] = useState<any>();
    const [manage, setManage] = useState();
    const [isAdd, setIsAdd] = useState(false);
    const [loadDetail, setLoadDetail] = useState(false)

    const { data: departmentparent1, isLoading } = Departments({
        page: 1,
        perPage: 100,
    });
    //scroll

    const [loadDepartment, setLoadDepartment] = useState(false);
    const [dataDepartment, setDataDepartment] = useState<any[]>([]);
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
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, perPage: 100 });

    const [isHigh, setIsHigh] = useState<any>('false');
    const { data: superiorDropdown, pagination: superiorPagination, isLoading: superiorLoading } = DropdownSuperior({ page: page, search: searchSuperior, departmentId: departmentId });
    const { data: directDropdown, pagination: directPagination, isLoading: directLoading } = DropdownSuperior({ page: pageDirect, search: searchDirect, departmentId: departmentId });
    const { data: proxyDropdown, pagination: proxyPagination, isLoading: proxyLoading } = DropdownSuperior({ page: pageProxy, search: searchProxy, departmentId: departmentId });
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
    const handleOnScrollBottom = () => {
        setLoadDepartment(true);
        if (paginationDepartment?.page < paginationDepartment?.totalPages) {
            setSizeDepartment(paginationDepartment?.page + 1);
        }
    };
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
    const { data: manages } = Humans({
        page: 1,
        perPage: 100,
    });

    const manage2 = manages?.data?.filter((item: any) => {
        if (!item.departmentId) return (item.value = item.id), (item.label = item.fullName);
    });
    const defaultManage = manage2?.find((i: { value: string }) => i && i.value === detail?.headOfDepartmentId);
    const departmentparent2 = departmentparent1?.data?.filter((item: any) => {
        return (item.value = item.id), (item.label = item.name);
    });
    const SubmittedForm = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_name_department')}`),
        code: Yup.string().required(`${t('please_fill_departmentCode')}`),
    });

    const handleDepartment = (value: any) => {
        removeNullProperties(value);
        let dataSubmit = {
            name: value?.name,
            description: value?.description,
            code: value?.code,
            abbreviation: value?.abbreviation,
            headOfDepartmentId: value?.headOfDepartmentId ? value.headOfDepartmentId?.value : defaultManage?.value,
            avatarId: value?.avatarId,
            ...(value?.parentId && { parentId: value?.parentId?.value }),
            ...(value?.directSignatoryId && { directSignatoryId: value?.directSignatoryId?.value }),
            ...(value?.proxyId && { proxyId: value?.proxyId?.value })
        };

        setIsAdd(true);
        updateDepartment(detail?.id, dataSubmit)
            .then(() => {
                showMessage(`${t('edit_department_success')}`, 'success');
                router.push('/hrm/department');
            })
            .catch((err) => {
                setIsAdd(false);
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
    const customStyles: StylesConfig<any, false> = {
        menuPortal: (base: any) => ({
            ...base,
            zIndex: 9999,
        }),
    };
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
                        <span>{t('edit_department')}</span>
                    </li>
                </ul>
                <div className="header-page-bottom mb-4 flex justify-between pb-4">
                    <h1 className="page-title">{t('edit_department')}</h1>
                    <Link href={`/hrm/department?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                        <button type="button" className="btn btn-primary btn-sm back-button m-1">
                            <IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                            <span>{t('back')}</span>
                        </button>
                    </Link>
                </div>
                {detail?.id !== undefined && (
                    <Formik
                        initialValues={{
                            name: detail ? `${detail?.name}` : '',
                            code: detail ? `${detail?.code}` : '',
                            description: detail?.description ? `${detail?.description}` : '',
                            abbreviation: detail?.abbreviation ? `${detail?.abbreviation}` : '',
                            headOfDepartmentId: detail?.headOfDepartmentId ? { value: detail?.headOfDepartmentId, label: detail?.headOfDepartment?.fullName } : '',
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
                                        {submitCount ? errors.code ? <div className="mt-1 text-danger"> {errors.code} </div> : null : ''}
                                    </div>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="abbreviation" className="label">
                                            {' '}
                                            {t('Abbreviated_name')}
                                        </label>
                                        <Field autoComplete="off" name="abbreviation" type="text" id="abbreviation" placeholder={`${t('enter_abbreviated_name')}`} className="form-input" />
                                        {submitCount ? errors?.abbreviation ? <div className="mt-1 text-danger"> {`${errors?.abbreviation}`} </div> : null : ''}
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
                                            value={values?.parentId}
                                            onMenuOpen={() => setPage(1)}
                                            onMenuScrollToBottom={handleMenuScrollToBottom}
                                            isLoading={isLoadingDepartment}
                                            onChange={(e) => {
                                                setFieldValue('parentId', e);
                                                setDepartmentId(e?.value);
                                            }}
                                            styles={customStyles}
                                        />
                                        {submitCount ? errors.parentId ? <div className="mt-1 text-danger"> {`${errors.parentId}`} </div> : null : ''}
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
                                                setFieldValue('approverId', e);
                                            }}
                                            styles={{
                                                menuPortal: (base: any) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
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
                                    <label htmlFor="name" className="label">
                                        {' '}
                                        {t('description')}
                                    </label>
                                    <Field autoComplete="off" name="description" as="textarea" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
                                </div>
                                <div className="mt-8 flex items-center justify-end gap-8 ltr:text-right rtl:text-left">
                                    <Link href={`/hrm/department?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`}>
                                        <button type="button" className="btn btn-outline-danger cancel-button">
                                            {t('cancel')}
                                        </button>
                                    </Link>
                                    <button type="submit" className="btn :ml-4 add-button rtl:mr-4" disabled={isAdd}>
                                        {isAdd ? <Loader size="sm" /> : t('update')}
                                    </button>
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
