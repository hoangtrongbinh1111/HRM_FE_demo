import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconBack from '@/components/Icon/IconBack';
import Select from 'react-select';
import { createPosition } from '@/services/apis/position.api';
import { Positions } from '@/services/swr/position.swr';
import { useRouter } from 'next/router';
import { Departments } from '@/services/swr/department.swr';
import { GroupPositions } from '@/services/swr/group-position.swr';
import { DropdownRole } from '@/services/swr/dropdown.swr';
import { useDebounce } from 'use-debounce';
import { loadMore } from '@/utils/commons';
import { Timekeeper } from '@/services/swr/Timekeeper.swr';
import { createTimekeeper } from '@/services/apis/timekeeper.api';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import dayjs from 'dayjs';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
interface Props {
    [key: string]: any;
}

const AddTimekeepingMachine = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [listGroupPostition, setListGroupPostition] = useState([]);
    const router = useRouter();
    const [query, setQuery] = useState<any>();
    const [queryDe, setQueryDe] = useState<any>();
    const [dataRepairDropdown, setDataRepairDropdown] = useState<any>([]);
    const [pageRepair, setPageRepair] = useState<any>(1);
    const [searchR, setSearchR] = useState<any>();
    //scroll
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [pageDepartment, setSizeDepartment] = useState<any>(1);
    const [debouncedPage] = useDebounce(pageDepartment, 500);
    const [debouncedQuery] = useDebounce(queryDe, 500);
    const [loadDe, setLoadDe] = useState(false)
    //get data
    const { data: dropdownRepair, pagination: repairPagination, isLoading: repairLoading } = DropdownRole({ page: pageRepair, search: searchR });
    const { data: departmentparents, pagination: paginationDepartment, isLoading: DepartmentLoading } = Departments({ page: debouncedPage, search: debouncedQuery?.search });
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle(`${t('add_timekeeper')}`));
    });
    const {
        data: timekeeper,
        pagination,
        mutate,
    } = Timekeeper({
        sortBy: 'id.ASC',
        ...router.query,
    });

    const SubmittedForm = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_name_timekeeper')}`),
        location: Yup.string().nullable().required(`${t('please_fill_location_timekeeper')}`),
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
        description: Yup.string(),
    });

    const { data: group_position, pagination: pagination1, mutate: mutate1 } = GroupPositions({ sortBy: 'id.ASC' });

    const options = group_position?.data?.map((item: any) => ({ value: item.id, label: item.name })) || [];
    const handleDuty = (value: any) => {
        const query = {
            ...value,
            departmentIds: value.departmentIds.map((item: any) => {
                return item.value;
            }),
        };
        createTimekeeper({
            ...query,
        })
            .then(() => {
                showMessage(`${t('create_timekeeper_success')}`, 'success');
                router.push('/hrm/timekeeper');
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
            });
    };

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
    };

    useEffect(() => {
        if (repairPagination?.page === undefined) return;
        if (repairPagination?.page === 1) {
            setDataRepairDropdown(dropdownRepair?.data);
        } else {
            setDataRepairDropdown([...dataRepairDropdown, ...dropdownRepair?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repairPagination]);
    //scroll
    const handleOnScrollBottom = () => {
        setLoadDe(true)
        if (paginationDepartment?.page < paginationDepartment?.totalPages) {
            setSizeDepartment(paginationDepartment?.page + 1);
        }
    };
    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;

        const filteredDepartments = departmentparents?.data
            // .filter((item: any) => item?.timekeeperId === null)
            .map((item: any) => ({
                value: item?.id,
                label: item?.name,
            }));

        if (paginationDepartment?.page === 1) {
            setDataDepartment(filteredDepartments);
            setLoadDe(false)
        } else {
            setDataDepartment((prevDataDepartment: any[]) => [
                ...prevDataDepartment,
                ...filteredDepartments,
            ]);
            setLoadDe(false)
        }
    }, [paginationDepartment, debouncedPage, debouncedQuery]);
    // console.log(dataDepartment);
    const handleMenuScrollToBottomRepair = () => {
        setTimeout(() => {
            setPageRepair(repairPagination?.page + 1);
        }, 1000);
    };

    const handleSearchR = (param: any) => {
        setQueryDe({ search: param });
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
                    <Link href="/hrm/timekeeper" className="text-primary hover:underline">
                        <span>{t('timekeeper')}</span>
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('add_timekeeper')}</span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">{t('add_timekeeper')}</h1>
                <Link href="/hrm/timekeeper">
                    <button type="button" className="btn btn-primary btn-sm back-button m-1">
                        <IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        <span>{t('back')}</span>
                    </button>
                </Link>
            </div>
            <Formik
                initialValues={{
                    name: '',
                    // mnCheckinFrom: '05:00',
                    // mnCheckinTo: '06:00',
                    // mnCheckoutFrom: '11:00',
                    // mnCheckoutTo: '12:00',
                    // atnCheckinFrom: '12:00',
                    // atnCheckinTo: '13:00',
                    // atnCheckoutFrom: '18:00',
                    // atnCheckoutTo: '19:00',
                    code: '',
                    isActive: true,
                    location: null,
                    description: '',
                    departmentIds: [],
                }}
                validationSchema={SubmittedForm}
                onSubmit={(values) => {
                    handleDuty(values);
                }}
            >
                {({ errors, touched, submitCount, setFieldValue, values }) => (
                    <Form className="space-y-5">
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
                                <label htmlFor="code" className="label">
                                    {' '}
                                    {t('code_timekeeper')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_timekeeper')}`} className="form-input" />
                                {submitCount ? errors.code ? <div className="mt-1 text-danger"> {errors.code} </div> : null : ''}
                            </div>
                        </div>
                        <div className="flex justify-between gap-5">
                            <div className="w-1/2">
                                <label htmlFor="departmentIds" className="label">
                                    {' '}
                                    {t('department_timekeeper')}
                                    <span style={{ color: 'red' }}> * </span>
                                </label>
                                <Select
                                    id="departmentIds"
                                    name="departmentIds"
                                    options={dataDepartment}
                                    isLoading={loadDe}
                                    onMenuOpen={() => setSizeDepartment(1)}
                                    onMenuScrollToBottom={() => handleOnScrollBottom()}
                                    maxMenuHeight={160}
                                    placeholder={`${t('choose_department_timekeeper')}`}
                                    onInputChange={(e) => handleSearchR(e)}
                                    value={values?.departmentIds}
                                    isMulti
                                    closeMenuOnSelect={false}
                                    onChange={(e) => {
                                        setFieldValue('departmentIds', e);
                                    }}
                                />
                                {submitCount && errors.departmentIds ? <div className="mt-1 text-danger"> {`${errors.departmentIds}`} </div> : null}
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="isActive" className="label">
                                    {' '}
                                    {t('isActive')} <span style={{ color: 'red' }}>* </span>
                                </label>
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
                                        {t('inactive2')}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between gap-5">
                            <div className="mb-5 w-1/2">
                                <label htmlFor="location" className="label">
                                    {' '}
                                    {t('position_timekeeper')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field autoComplete="off" name="location" type="text" id="location" placeholder={`${t('enter_position_timekeeper')}`} className="form-input" />
                                {submitCount ? errors.location ? <div className="mt-1 text-danger"> {errors.location} </div> : null : ''}
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
                        <label style={{ margin: '2px 0 -5px 0', fontSize: '15px' }} className='label'>
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
                        <div className="mb-5">
                            <label htmlFor="description" className="label">
                                {' '}
                                {t('description')}
                            </label>
                            <Field autoComplete="off" name="description" as="textarea" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
                            {submitCount ? errors.description ? <div className="mt-1 text-danger"> {errors.description} </div> : null : ''}
                        </div>
                        <div className="mt-8 flex items-center justify-end gap-8 ltr:text-right rtl:text-left">
                            <Link href="/hrm/timekeeper">
                                <button type="button" className="btn btn-outline-danger cancel-button">
                                    {t('cancel')}
                                </button>
                            </Link>
                            <button type="submit" className="btn :ml-4 add-button rtl:mr-4" disabled={disabled}>
                                {props.data !== undefined ? t('update') : t('add')}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddTimekeepingMachine;
