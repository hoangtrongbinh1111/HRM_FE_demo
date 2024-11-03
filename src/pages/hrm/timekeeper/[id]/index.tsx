import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { showMessage } from '@/@core/utils';
import IconBack from '@/components/Icon/IconBack';
import { IconLoading } from '@/components/Icon/IconLoading';
import { detailTimekeeper, updateTimekeeper } from '@/services/apis/timekeeper.api';
import { AllDepartment, Departments } from '@/services/swr/department.swr';
import { IRootState } from '@/store';
import { setPageTitle } from '@/store/themeConfigSlice';
import { removeNullProperties } from '@/utils/commons';
import { Lao } from '@/utils/lao';
import { Checkbox, Loader } from '@mantine/core';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import { Field, Form, Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'use-debounce';
import * as Yup from 'yup';
import { DropdownUsers } from '@/services/swr/dropdown.swr';
import Select, { components, CSSObjectWithLabel } from 'react-select';

interface Props {
    [key: string]: any;
}
const DetailTimekeeper = ({ ...props }: Props) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle(`${t('edit_timekeeper')}`));
    });
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;
    const router = useRouter();
    const [detail, setDetail] = useState<any>();
    const [listGroupPostition, setListGroupPostition] = useState([]);
    const id = Number(router.query.id);
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [dataRepairDropdown, setDataRepairDropdown] = useState<any>([]);
    const [pageRepair, setPageRepair] = useState<any>(1);
    const [searchR, setSearchR] = useState<any>();
    const [load, setLoad] = useState<any>(false);
    const [loadDetail, setLoadDetail] = useState(true)
    //scroll

    const [queryDe, setQueryDe] = useState<any>();
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [pageDepartment, setSizeDepartment] = useState<any>(1);
    const [debouncedPage] = useDebounce(pageDepartment, 500);
    const [debouncedQuery] = useDebounce(queryDe, 500);
    const [loadDe, setLoadDe] = useState(false);
    const { data: departmentparents, pagination: paginationDepartment, isLoading } = AllDepartment();
    const [dataUserDropdown, setDataUserDropdown] = useState<any>([]);
    const [pageUser, setPageUser] = useState(1);
    const [searchUser, setSearchUser] = useState<any>();


    const { data: userDropdown, pagination: userPagination, isLoading: userLoading } = DropdownUsers({ page: pageUser, search: searchUser });

    useEffect(() => {
        if (userPagination?.page === undefined) return;
        if (userPagination?.page === 1) {
            setDataUserDropdown(userDropdown?.data.map((item: any) => {
                return {
                    label: item.label + ' - ' + item.code,
                    value: item.value
                }
            }));
        } else {
            setDataUserDropdown([...dataUserDropdown, ...userDropdown?.data.map((item: any) => {
                return {
                    label: item.label + ' - ' + item.code,
                    value: item.value
                }
            })])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userPagination])

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPageUser(userPagination?.page + 1);
        }, 1000);
    }
    const handleOnScrollBottom = () => {
        setLoadDe(true);
        if (paginationDepartment?.page < paginationDepartment?.totalPages) {
            setSizeDepartment(paginationDepartment?.page + 1);
        }
    };
    const handleSearchR = (param: any) => {
        setQueryDe({ search: param });
    };
    useEffect(() => {
        // if (paginationDepartment?.page === undefined) return;
        const filteredDepartments = departmentparents?.data?.[0]?.map((item: any) => ({
            value: item?.id,
            label: item?.name,
        })) || [];
        if (paginationDepartment?.page === 1) {
            setDataDepartment(filteredDepartments);
            setLoadDe(false);
        } else {
            setDataDepartment((prevDataDepartment: any[]) => [...prevDataDepartment, ...filteredDepartments]);
            setLoadDe(false);
        }
    }, [paginationDepartment, departmentparents?.data]);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_name_timekeeper')}`),
        location: Yup.string()
            .nullable()
            .required(`${t('please_fill_location_timekeeper')}`),
        code: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_timekeeperCode')}`),
        departmentIds: Yup.array()
            .nullable()
            .test('is-department-ids-filled', `${t('please_fill_department_timekeeper')}`, function (value) {
                if (!value || value.length === 0) {
                    return false; // Trả về false nếu mảng rỗng hoặc không tồn tại
                }
                return true;
            }),
        isActive: Yup.bool().required(`${t('please_fill_isActive')}`),
    });
    useEffect(() => {
        const id = router.query.id;
        if (id) {
            detailTimekeeper(id)
                .then((res) => {
                    setLoadDetail(false)
                    setDetail(res?.data);
                })
                .catch((err: any) => {
                    console.log(err);
                });
        }
    }, [router]);

    const handleDuty = (value: any) => {
        removeNullProperties(value);
        let dataSubmit: any = {
            ...value,
            name: value.name,
            description: value.description,
            isActive: value.isActive,
            location: value.location,
            code: value.code,
            departmentIds: value.departmentIds.map((item: any) => {
                return item.value;
            }),
            userIds: value?.userIds ? value?.userIds?.map((item: any) => {
                return item.value;
            }) : [],
        };
        updateTimekeeper(detail?.id, dataSubmit)
            .then(() => {
                showMessage(`${t('update_timekeeper_success')}`, 'success');
                router.push(`/hrm/timekeeper?page=${router?.query?.page}&perPage=${router?.query?.perPage}`);
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
            }).finally(() => {
                setLoad(false)
            })
    };

    return (
        <div>
            {(isLoading || loadDetail) && (
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
                        <Link href="/hrm/timekeeper" className="text-primary hover:underline">
                            <span>{t('timekeeper')}</span>
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{t('edit_timekeeper')}</span>
                    </li>
                </ul>
                <div className="header-page-bottom mb-4 flex justify-between pb-4">
                    <h1 className="page-title">{t('edit_timekeeper')}</h1>
                    <Link href={`/hrm/timekeeper?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
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
                            location: detail ? `${detail?.location}` : '',
                            description: detail ? detail?.description : '',
                            departmentIds: detail
                                ? detail?.departmentTimekeepers?.map((item: any) => {
                                    return {
                                        label: item?.department.name,
                                        value: item?.department.id,
                                    };
                                })
                                : '',

                            userIds: detail?.users.length > 0
                                ? detail?.users?.map((item: any) => {
                                    return {
                                        label: item?.fullName + ' - ' + item?.code,
                                        value: item?.id,
                                    };
                                })
                                : '',
                            isActive: detail ? detail?.isActive : '',
                        }}
                        validationSchema={SubmittedForm}
                        onSubmit={(values) => {
                            setLoad(true);
                            handleDuty(values);
                        }}
                        enableReinitialize
                    >
                        {({ errors, touched, submitCount, values, setFieldValue }) => (
                            <Form className="space-y-5">
                                <div className="flex justify-between gap-5">
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="code" className="label">
                                            {' '}
                                            {t('code_timekeeper')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Field disabled autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_timekeeper')}`} className="form-input" />
                                        {submitCount ? errors.code ? <div className="mt-1 text-danger"> {errors.code} </div> : null : ''}
                                    </div>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="status" className="label">
                                            {' '}
                                            {t('status')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
                                            <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                                <Field
                                                    disabled
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
                                                    disabled
                                                    autoComplete="off"
                                                    type="radio"
                                                    name="isActive"
                                                    value={false}
                                                    checked={values.isActive === false}
                                                    className="form-checkbox rounded-full"
                                                    onChange={() => setFieldValue('isActive', false)}
                                                />
                                                {t('inactive2')}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between gap-5">
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="name" className="label">
                                            {' '}
                                            {t('name_timekeeper')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_timekeeper')}`} className="form-input" />
                                        {submitCount ? errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null : ''}
                                    </div>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="location" className="label">
                                            {' '}
                                            {t('position_timekeeper')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Field autoComplete="off" name="location" type="text" id="location" placeholder={`${t('enter_position_timekeeper')}`} className="form-input" />
                                        {submitCount ? errors.location ? <div className="mt-1 text-danger"> {errors.location} </div> : null : ''}
                                    </div>
                                </div>
                                <div className="flex justify-between gap-5">
                                    <div className="flex-1">
                                        <label htmlFor="userIds" className="label"> {t('staff')} </label>
                                        <Select
                                            id="userIds"
                                            options={dataUserDropdown}
                                            maxMenuHeight={160}
                                            name="userIds"
                                            value={values.userIds}
                                            onInputChange={(e) => setSearchUser(e)}
                                            onMenuOpen={() => setPageUser(1)}
                                            onMenuScrollToBottom={handleMenuScrollToBottom}
                                            onChange={e => setFieldValue('userIds', e)}
                                            isMulti
                                            // closeMenuOnSelect={false}
                                            // hideSelectedOptions={false}
                                            isLoading={userLoading}
                                        />
                                        {errors.userIds ? (
                                            <div className="text-danger mt-1"> {`${errors.userIds}`} </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex justify-between gap-5">
                                    <div className="">
                                        <label htmlFor="departmentIds" className="label">
                                            {' '}
                                            {t('department_timekeeper')} <span style={{ color: 'red' }}> * </span>
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 250, marginBottom: 8 }}>
                                            <Checkbox
                                                onChange={(e) => {
                                                    if (e.target.checked) setFieldValue('departmentIds', dataDepartment);
                                                    else setFieldValue('departmentIds', []);
                                                }}
                                                checked={values?.departmentIds?.length === dataDepartment?.length}
                                            />
                                            <span>{t('choose_all_department_timekeeper')}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                            {dataDepartment?.map((item: any) => {
                                                return (
                                                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 250 }}>
                                                        <Checkbox
                                                            style={{ cursor: 'pointer' }}
                                                            onChange={(e) => {
                                                                let data = [...values?.departmentIds];
                                                                const checked = e.target.checked;
                                                                data = data.filter((i: any) => i.value !== item?.value);
                                                                if (checked) data.push(item);
                                                                setFieldValue('departmentIds', data);
                                                            }}
                                                            checked={values?.departmentIds?.some((i: any) => i.value === item?.value)}
                                                        />
                                                        <span>{item?.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/*
										<Select
											id="departmentIds"
											name="departmentIds"
											options={dataDepartment}
											isLoading={loadDe}
											onMenuOpen={() => setSizeDepartment(1)}
											onMenuScrollToBottom={() => handleOnScrollBottom()}
											maxMenuHeight={300}
											placeholder={`${t('choose_department_timekeeper')}`}
											onInputChange={(e) => handleSearchR(e)}
											value={values?.departmentIds}
											isMulti
											closeMenuOnSelect={false}
											onChange={(e) => {
												setFieldValue('departmentIds', e);
											}}
										/> */}
                                        {submitCount && errors.departmentIds ? <div className="mt-1 text-danger"> {`${errors.departmentIds}`} </div> : null}
                                    </div>
                                </div>
                                {/* <label style={{ margin: '2px 0 -5px 0', fontSize: '15px' }} className='label'>
                                Ca sáng
                            </label>
                            <div className="flex justify-between gap-5">
                                <div className="mb-5 w-1/4">
                                    <label htmlFor="mnCheckinFrom" className='label'>
                                        {t('start_checkin_am')} <span style={{ color: 'red' }}> * </span>
                                    </label>
                                    <Flatpickr
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            enableTime: true,
                                            noCalendar: true,
                                            dateFormat: "H:i",
                                            time_24hr: true,
                                        }}
                                        onChange={(e) => {
                                            if (e.length > 0) {
                                                setFieldValue('mnCheckinFrom', dayjs(e[0]).format('HH:mm'));
                                            }
                                        }}
                                        value={values?.mnCheckinFrom}
                                        id="mnCheckinFrom"
                                        name="mnCheckinFrom"
                                        placeholder={`${t('choose_from_time')}`}
                                        className="calender-input form-input"
                                    />
                                    {submitCount ? errors.mnCheckinFrom ? <div className="mt-1 text-danger"> {errors.mnCheckinFrom} </div> : null : ''}
                                </div>
                                <div className="mb-5 w-1/4">
                                    <label htmlFor="mnCheckinTo" className='label'>
                                        {t('end_checkin_am')} <span style={{ color: 'red' }}> * </span>
                                    </label>
                                    <Flatpickr
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            enableTime: true,
                                            noCalendar: true,
                                            dateFormat: "H:i",
                                            time_24hr: true,
                                        }}
                                        onChange={(e) => {
                                            if (e.length > 0) {
                                                setFieldValue('mnCheckinTo', dayjs(e[0]).format('HH:mm'));
                                            }
                                        }}
                                        value={values?.mnCheckinTo}
                                        id="mnCheckinTo"
                                        name="mnCheckinTo"
                                        placeholder={`${t('choose_from_time')}`}
                                        className="calender-input form-input"
                                    />
                                    {submitCount ? errors.mnCheckinTo ? <div className="mt-1 text-danger"> {errors.mnCheckinTo} </div> : null : ''}
                                </div>
                                <div className="mb-5 w-1/4">
                                    <label htmlFor="mnCheckoutFrom" className='label'>
                                        {t('start_checkout_am')} <span style={{ color: 'red' }}> * </span>

                                    </label>
                                    <Flatpickr
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            enableTime: true,
                                            noCalendar: true,
                                            dateFormat: "H:i",
                                            time_24hr: true,
                                        }}
                                        onChange={(e) => {
                                            if (e.length > 0) {
                                                setFieldValue('mnCheckoutFrom', dayjs(e[0]).format('HH:mm'));
                                            }
                                        }}
                                        value={values?.mnCheckoutFrom}
                                        id="mnCheckoutFrom"
                                        name="mnCheckoutFrom"
                                        placeholder={`${t('choose_from_time')}`}
                                        className="calender-input form-input"
                                    />
                                    {submitCount ? errors.mnCheckoutFrom ? <div className="mt-1 text-danger"> {errors.mnCheckoutFrom} </div> : null : ''}
                                </div>
                                <div className="mb-5 w-1/4">
                                    <label htmlFor="mnCheckoutTo" className='label'>
                                        {t('end_checkout_am')} <span style={{ color: 'red' }}> * </span>

                                    </label>
                                    <Flatpickr
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            enableTime: true,
                                            noCalendar: true,
                                            dateFormat: "H:i",
                                            time_24hr: true,
                                        }}
                                        onChange={(e) => {
                                            if (e.length > 0) {
                                                setFieldValue('mnCheckoutTo', dayjs(e[0]).format('HH:mm'));
                                            }
                                        }}
                                        value={values?.mnCheckoutTo}
                                        id="mnCheckoutTo"
                                        name="mnCheckoutTo"
                                        placeholder={`${t('choose_from_time')}`}
                                        className="calender-input form-input"
                                    />
                                    {submitCount ? errors.mnCheckoutTo ? <div className="mt-1 text-danger"> {errors.mnCheckoutTo} </div> : null : ''}
                                </div>
                            </div>
                            <label htmlFor="location" style={{ margin: '2px 0 -5px 0', fontSize: '15px' }} className='label'>
                                Ca chiều
                            </label>
                            <div className="flex justify-between gap-5">
                                <div className="mb-5 w-1/4">
                                    <label htmlFor="atnCheckinFrom" className='label'>
                                        {t('start_checkin_pm')} <span style={{ color: 'red' }}> * </span>
                                    </label>
                                    <Flatpickr
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            enableTime: true,
                                            noCalendar: true,
                                            dateFormat: "H:i",
                                            time_24hr: true,
                                        }}
                                        onChange={(e) => {
                                            if (e.length > 0) {
                                                setFieldValue('atnCheckinFrom', dayjs(e[0]).format('HH:mm'));
                                            }
                                        }}
                                        value={values?.atnCheckinFrom}
                                        id="atnCheckinFrom"
                                        name="atnCheckinFrom"
                                        placeholder={`${t('choose_from_time')}`}
                                        className="calender-input form-input"
                                    />
                                    {submitCount ? errors.atnCheckinFrom ? <div className="mt-1 text-danger"> {errors.atnCheckinFrom} </div> : null : ''}
                                </div>
                                <div className="mb-5 w-1/4">
                                    <label htmlFor="atnCheckinTo" className='label'>
                                        {t('end_checkin_pm')} <span style={{ color: 'red' }}> * </span>
                                    </label>
                                    <Flatpickr
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            enableTime: true,
                                            noCalendar: true,
                                            dateFormat: "H:i",
                                            time_24hr: true,
                                        }}
                                        onChange={(e) => {
                                            if (e.length > 0) {
                                                setFieldValue('atnCheckinTo', dayjs(e[0]).format('HH:mm'));
                                            }
                                        }}
                                        value={values?.atnCheckinTo}
                                        id="atnCheckinTo"
                                        name="atnCheckinTo"
                                        placeholder={`${t('choose_from_time')}`}
                                        className="calender-input form-input"
                                    />
                                    {submitCount ? errors.atnCheckinTo ? <div className="mt-1 text-danger"> {errors.atnCheckinTo} </div> : null : ''}
                                </div>
                                <div className="mb-5 w-1/4">
                                    <label htmlFor="atnCheckoutFrom" className='label'>
                                        {t('start_checkout_pm')} <span style={{ color: 'red' }}> * </span>

                                    </label>
                                    <Flatpickr
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            enableTime: true,
                                            noCalendar: true,
                                            dateFormat: "H:i",
                                            time_24hr: true,
                                        }}
                                        onChange={(e) => {
                                            if (e.length > 0) {
                                                setFieldValue('atnCheckoutFrom', dayjs(e[0]).format('HH:mm'));
                                            }
                                        }}
                                        value={values?.atnCheckoutFrom}
                                        id="atnCheckoutFrom"
                                        name="atnCheckoutFrom"
                                        placeholder={`${t('choose_from_time')}`}
                                        className="calender-input form-input"
                                    />
                                    {submitCount ? errors.atnCheckoutFrom ? <div className="mt-1 text-danger"> {errors.atnCheckoutFrom} </div> : null : ''}
                                </div>
                                <div className="mb-5 w-1/4">
                                    <label htmlFor="atnCheckoutTo" className='label'>
                                        {t('end_checkout_pm')} <span style={{ color: 'red' }}> * </span>

                                    </label>
                                    <Flatpickr
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            enableTime: true,
                                            noCalendar: true,
                                            dateFormat: "H:i",
                                            time_24hr: true,
                                        }}
                                        onChange={(e) => {
                                            if (e.length > 0) {
                                                setFieldValue('atnCheckoutTo', dayjs(e[0]).format('HH:mm'));
                                            }
                                        }}
                                        value={values?.atnCheckoutTo}
                                        id="atnCheckoutTo"
                                        name="atnCheckoutTo"
                                        placeholder={`${t('choose_from_time')}`}
                                        className="calender-input form-input"
                                    />
                                    {submitCount ? errors.atnCheckoutTo ? <div className="mt-1 text-danger"> {errors.atnCheckoutTo} </div> : null : ''}
                                </div>
                            </div> */}
                                {/* <div className="mb-5">
									<label htmlFor="description" className="label">
										{' '}
										{t('description')}
									</label>
									<Field autoComplete="off" name="description" as="textarea" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
									{submitCount ? errors.description ? <div className="mt-1 text-danger"> {`${errors.description}`} </div> : null : ''}
								</div> */}
                                <div className="mt-8 flex items-center justify-end gap-8 ltr:text-right rtl:text-left">
                                    <Link href={`/hrm/timekeeper?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                                        <button type="button" className="btn btn-outline-danger cancel-button" disabled={load}>
                                            {t('cancel')}
                                        </button>
                                    </Link>
                                    {
                                        load === true ?
                                            <span>
                                                <button type="submit" className="btn :ml-4 add-button rtl:mr-4" disabled={load}>
                                                    <Loader size="xs" color='#000' className='rtl:ml-2' />
                                                    {t('update')}
                                                </button>
                                            </span>
                                            :
                                            <button type="submit" className="btn :ml-4 add-button rtl:mr-4" disabled={disabled}>
                                                {t('update')}
                                            </button>
                                    }
                                </div>
                                <div className='flex justify-end text-[red]'>
                                    {t("warning_precces")}
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </div >
    );
};

export default DetailTimekeeper;
