import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';

import { Dialog, Transition } from '@headlessui/react';

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
import IconBack from '@/components/Icon/IconBack';
import dayjs from 'dayjs';
import { removeNullProperties } from '@/utils/commons';
import { createShift } from '@/services/apis/shift.api';
import { useRouter } from 'next/router';
import moment from 'moment';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { Loader } from '@mantine/core';
// import TimeRangePicker from '@wojtekmaj/react-timerange-picker';
const TimeRangePicker = dynamic(() => import('@wojtekmaj/react-timerange-picker'), { ssr: false });

import '@wojtekmaj/react-timerange-picker/dist/TimeRangePicker.css';
import 'react-clock/dist/Clock.css';
type ValuePiece = Date | string | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];
interface Props {
    [key: string]: any;
}

const AddNewShift = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [isAdd, setIsAdd] = useState(false);
    useEffect(() => {
        dispatch(setPageTitle(`${t('add_shift')}`));
    });
    const [disabled, setDisabled] = useState(false);
    const [typeShift, setTypeShift] = useState(1); // 1: time, 0: total hours
    const router = useRouter();
    // const [value, onChange] = useState<Value>(['10:00', '11:00']);

    const baseSchema = {
        code: Yup.string().required(`${t('please_fill_code_shift')}`),
        name: Yup.string().required(`${t('please_fill_name_shift')}`),
        type: Yup.string(),
        wageRate: Yup.string().required(`${t('please_fill_work_coefficient')}`),
        note: Yup.string(),
        totalHours: Yup.number(),
        isActive: Yup.bool().required(`${t('please_fill_status')}`),
        timeAvailableOnShiftFrom: Yup.string()
            .required(`${t('please_choose_timeAvailableOnShiftFrom')}`),
        timeAvailableOnShiftTo: Yup.string()
            .required(`${t('please_choose_timeAvailableOnShiftTo')}`),
        timeAvailableOutShiftFrom: Yup.string()
            .required(`${t('please_choose_timeAvailableOutShiftFrom')}`),
        timeAvailableOutShiftTo: Yup.string()
            .required(`${t('please_choose_timeAvailableOutShiftTo')}`)
    };
    const extendedSchema = typeShift === 1 ? {
        ...baseSchema,
        startTime: Yup.string().required(`${t('please_fill_from_time')}`),
        endTime: Yup.string().required(`${t('please_fill_end_time')}`),
        // breakFrom: Yup.string().required(`${t('please_fill_break_from_time')}`),
        // breakTo: Yup.string().required(`${t('please_fill_break_end_time')}`)
    } : baseSchema;
    const SubmittedForm = Yup.object().shape(extendedSchema);
    const handleAddShift = (value: any) => {
        removeNullProperties(value);
        let dataSubmit
        if (typeShift === 0) {
            dataSubmit = {
                code: value.code,
                name: value.name,
                type: typeShift,
                wageRate: parseFloat(value.wageRate),
                totalHours: Number(value.totalHours),
                description: value.description,
                note: value.note,
                isActive: value.isActive === '1' ? true : false,
                timeAvailableOnShiftFrom: value.timeAvailableOnShiftFrom,
                timeAvailableOnShiftTo: value.timeAvailableOnShiftTo,
                timeAvailableOutShiftFrom: value.timeAvailableOutShiftFrom,
                timeAvailableOutShiftTo: value.timeAvailableOutShiftTo
            }
        } else {
            dataSubmit = {
                code: value.code,
                name: value.name,
                type: typeShift,
                wageRate: parseFloat(value.wageRate),
                totalHours: Number(value.totalHours),
                description: value.description,
                note: value.note,
                isActive: value.isActive === '1' ? true : false,
                startTime: value.startTime,
                endTime: value.endTime,
                breakFrom: value.breakFrom,
                breakTo: value.breakTo,
                timeAvailableOnShiftFrom: value.timeAvailableOnShiftFrom,
                timeAvailableOnShiftTo: value.timeAvailableOnShiftTo,
                timeAvailableOutShiftFrom: value.timeAvailableOutShiftFrom,
                timeAvailableOutShiftTo: value.timeAvailableOutShiftTo
            }
        }
        setIsAdd(true)
        createShift(dataSubmit).then(() => {
            showMessage(`${t('add_shift_success')}`, 'success');
            router.push('/hrm/shift');
        }).catch((err) => {
            setIsAdd(false)
            showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
        })
    };

    const handleChangeTypeShift = (e: any, type: number) => {
        if (e) {
            setTypeShift(type)
        }
    }

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
    };
    const countDifferentTime = (startTime: any, endTime: any) => {
        const time1 = moment(startTime, 'HH:mm');
        const time2 = moment(endTime, 'HH:mm');
        if (time1.isAfter(time2)) {
            time2.add(1, 'day');
        }

        const diff = moment.duration(time2.diff(time1));
        const hours = diff.asHours();

        const roundedHours = Math.round(hours * 100) / 100;

        return roundedHours;
        // setField
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
                    <Link href="/hrm/shift" className="text-primary hover:underline">
                        <span>{t('shift')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('add_shift')}</span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{t('add_shift')}</h1>
                <Link href="/hrm/shift">
                    <button type="button" className="btn btn-primary btn-sm m-1 back-button" >
                        <IconBack className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        <span>
                            {t('back')}
                        </span>
                    </button>
                </Link>
            </div>
            <Formik
                initialValues={{
                    code: '',
                    name: '',
                    type: typeShift ?? 1,
                    wageRate: "",
                    startTime: "",
                    endTime: "",
                    breakFrom: null,
                    breakTo: null,
                    totalHours: 0,
                    note: "",
                    isActive: '1',
                    description: "",
                    timeAvailableOnShiftFrom: "",
                    timeAvailableOnShiftTo: "",
                    timeAvailableOutShiftFrom: "",
                    timeAvailableOutShiftTo: ""
                }}
                validationSchema={SubmittedForm}
                onSubmit={(values) => {
                    handleAddShift(values);
                }}
                enableReinitialize
            >
                {({ errors, touched, submitCount, setFieldValue, values }) => (
                    <Form className="space-y-5">
                        <div className='flex justify-between gap-5'>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="type" className='label'>
                                    {' '}
                                    {t('type_shift')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
                                    <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                        <Field autoComplete="off" type="radio" name="type" value={1}
                                            checked={typeShift === 1}
                                            onChange={(e: any) => handleChangeTypeShift(e, 1)}
                                            className="form-checkbox rounded-full" />
                                        {t('shift_base_time')}
                                    </label>
                                    <label style={{ marginBottom: 0 }}>
                                        <Field autoComplete="off" type="radio" name="type" value={0}
                                            checked={typeShift === 0}
                                            onChange={(e: any) => handleChangeTypeShift(e, 0)}
                                            className="form-checkbox rounded-full" />
                                        {t('shift_base_total_time')}
                                    </label>
                                </div>
                                {submitCount ? errors.type ? <div className="mt-1 text-danger"> {errors.type} </div> : null : ''}
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="code" className='label'>
                                    {' '}
                                    {t('code_shift')} <span style={{ color: 'red' }}>* </span>
                                </label>

                                <Field autoComplete="off" name="code" type="text" id="code_shift" placeholder={`${t('fill_code_shift')}`} className="form-input" />
                                {submitCount ? errors.code ? <div className="mt-1 text-danger"> {errors.code} </div> : null : ''}
                            </div>

                        </div>

                        <div className='flex justify-between gap-5'>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="name" className='label'>
                                    {' '}
                                    {t('name_shift')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('fill_name_shift')}`} className="form-input" />
                                {submitCount ? errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null : ''}
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="wageRate" className='label'>
                                    {' '}
                                    {t('wageRate')}<span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field autoComplete="off" name="wageRate" type="text" id="wageRate" placeholder={t('fill_wage_rate')} className="form-input"
                                    onKeyDown={(e: any) => {
                                        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                                        if (allowedKeys.includes(e.key)) {
                                            return;
                                        }

                                        if (e.key === '.' && e.target.value.includes('.')) {
                                            e.preventDefault();
                                        }

                                        if (!/^\d$/.test(e.key) && e.key !== '.') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                {submitCount ? errors.wageRate ? <div className="mt-1 text-danger"> {errors.wageRate} </div> : null : ''}
                            </div>
                        </div>
                        {typeShift === 1 && <> <div className='flex justify-between gap-5'>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="from_time" className='label'>
                                    {' '}
                                    {t('from_time')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Flatpickr
                                    options={{
                                        locale: {
                                            ...chosenLocale,
                                        },
                                        enableTime: true,
                                        noCalendar: true,
                                        dateFormat: "H:i",
                                        time_24hr: true
                                    }}
                                    onChange={e => {
                                        if (e.length > 0) {
                                            setFieldValue('startTime', dayjs(e[0]).format('HH:mm'));
                                            if (values?.endTime) {
                                                setFieldValue('totalHours', countDifferentTime(dayjs(e[0]).format('HH:mm'), values?.endTime));
                                            }
                                        }
                                    }}
                                    className="form-input calender-input"
                                    placeholder={`${t('choose_from_time')}`}

                                />
                                {submitCount ? errors.startTime ? <div className="mt-1 text-danger"> {errors.startTime} </div> : null : ''}
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="endTime" className='label'>
                                    {' '}
                                    {t('end_time')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Flatpickr
                                    options={{
                                        locale: {
                                            ...chosenLocale,
                                        },
                                        enableTime: true,
                                        noCalendar: true,
                                        dateFormat: "H:i",
                                        time_24hr: true
                                    }}
                                    placeholder={`${t('choose_end_time')}`}
                                    onChange={e => {
                                        if (e.length > 0) {
                                            setFieldValue('endTime', dayjs(e[0]).format('HH:mm'));
                                            if (values?.startTime) {
                                                setFieldValue('totalHours', countDifferentTime(values?.startTime, dayjs(e[0]).format('HH:mm')));
                                            }
                                        }
                                    }}
                                    className="form-input calender-input"
                                />
                                {submitCount ? errors.endTime ? <div className="mt-1 text-danger"> {errors.endTime} </div> : null : ''}
                            </div>
                        </div>
                            {/* <div className='flex justify-between gap-5'>
                                <div className="mb-5 w-1/2">
                                    <label htmlFor="breakFrom" className='label'>
                                        {' '}
                                        {t('break_from_time')}
                                    </label>
                                    <Flatpickr
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            enableTime: true,
                                            noCalendar: true,
                                            dateFormat: "H:i",
                                            time_24hr: true
                                        }}
                                        placeholder={`${t('choose_break_from_time')}`}
                                        onChange={e => {
                                            if (e.length > 0) {
                                                setFieldValue('breakFrom', dayjs(e[0]).format('HH:mm'));
                                            }
                                        }}
                                        className="form-input calender-input"
                                    />
                                </div>
                                <div className="mb-5 w-1/2">
                                    <label htmlFor="breakTo" className='label'>
                                        {' '}
                                        {t('break_end_time')}
                                    </label>
                                    <Flatpickr
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            enableTime: true,
                                            noCalendar: true,
                                            dateFormat: "H:i",
                                            time_24hr: true
                                        }}
                                        onChange={e => {
                                            if (e.length > 0) {
                                                setFieldValue('breakTo', dayjs(e[0]).format('HH:mm'));
                                            }
                                        }}
                                        placeholder={`${t('choose_break_end_time')}`}
                                        className="form-input calender-input"
                                    />
                                </div>
                            </div> */}
                        </>}
                        {/* <div className='flex justify-between gap-5'>
                            <div className='mb-5 w-1/2'>
                                <label htmlFor="timeAvailableOnShiftFromTo" className='label'>
                                    {' '}
                                    {t('timeAvailableOnShiftFromTo')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <TimeRangePicker
                                    value={[values?.timeAvailableOnShiftFrom, values?.timeAvailableOnShiftTo]}
                                    onChange={(e: any) => {
                                        if (e?.length > 0) {
                                            setFieldValue('timeAvailableOnShiftFrom', e[0])
                                            setFieldValue('timeAvailableOnShiftTo', e[1])
                                        } else {
                                            setFieldValue('timeAvailableOnShiftFrom', "")
                                            setFieldValue('timeAvailableOnShiftTo', "")
                                        }
                                    }}
                                />
                                {submitCount ? (errors.timeAvailableOnShiftTo || errors.timeAvailableOnShiftFrom) ? <div className="mt-1 text-danger"> {`${errors.timeAvailableOnShiftTo} ${errors.timeAvailableOnShiftFrom}`} </div> : null : ''}
                            </div>
                            <div className='mb-5 w-1/2'>
                                <label htmlFor="timeAvailableOutShiftFromTo" className='label'>
                                    {' '}
                                    {t('timeAvailableOutShiftFromTo')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <TimeRangePicker
                                    value={[values?.timeAvailableOutShiftFrom, values?.timeAvailableOutShiftTo]}
                                    onChange={(e: any) => {
                                        if (e?.length > 0) {
                                            setFieldValue('timeAvailableOutShiftFrom', e[0])
                                            setFieldValue('timeAvailableOutShiftTo', e[1])
                                        } else {
                                            setFieldValue('timeAvailableOutShiftFrom', "")
                                            setFieldValue('timeAvailableOutShiftTo', "")
                                        }
                                    }}
                                />
                                {submitCount ? (errors.timeAvailableOutShiftTo || errors.timeAvailableOutShiftFrom) ? <div className="mt-1 text-danger"> {`${errors.timeAvailableOutShiftTo} ${errors.timeAvailableOutShiftFrom}`} </div> : null : ''}
                            </div>
                        </div> */}
                        <div className='flex justify-between gap-5'>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="timeAvailableOnShiftFrom" className='label'>
                                    {' '}
                                    {t('timeAvailableOnShiftFrom')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field autoComplete="off"
                                    name="timeAvailableOnShiftFrom"
                                    render={({ field }: any) => (
                                        <Flatpickr
                                            // data-enable-time
                                            options={{
                                                locale: {
                                                    ...chosenLocale,
                                                },
                                                enableTime: true,
                                                noCalendar: true,
                                                dateFormat: "H:i",
                                                time_24hr: true,
                                            }}
                                            value={moment(values?.timeAvailableOnShiftFrom, 'HH:mm:ss').format('HH:mm:ss')}
                                            onChange={(e: any) => {
                                                setFieldValue('timeAvailableOnShiftFrom', moment(e[0]).format('HH:mm'))
                                            }}
                                            className="form-input calender-input"
                                            placeholder="HH:mm"
                                        />
                                    )}
                                />

                                {submitCount ? errors.timeAvailableOnShiftFrom ? <div className="mt-1 text-danger"> {`${errors.timeAvailableOnShiftFrom}`} </div> : null : ''}
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="timeAvailableOnShiftTo" className='label'>
                                    {' '}
                                    {t('timeAvailableOnShiftTo')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field
                                    autoComplete="off"
                                    name="timeAvailableOnShiftTo"
                                    render={({ field }: any) => (
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
                                            value={moment(values?.timeAvailableOnShiftTo, 'HH:mm:ss').format('HH:mm:ss')}
                                            onChange={(e: any) => {
                                                setFieldValue('timeAvailableOnShiftTo', moment(e[0]).format('HH:mm'))
                                            }}
                                            className="form-input calender-input"
                                            placeholder="HH:mm"
                                        />
                                    )}
                                />
                                {submitCount ? errors.timeAvailableOnShiftTo ? <div className="mt-1 text-danger"> {`${errors.timeAvailableOnShiftTo}`} </div> : null : ''}
                            </div>
                        </div>
                        <div className='flex justify-between gap-5'>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="timeAvailableOutShiftFrom" className='label'>
                                    {' '}
                                    {t('timeAvailableOutShiftFrom')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field autoComplete="off"
                                    name="timeAvailableOutShiftFrom"
                                    render={({ field }: any) => (
                                        <Flatpickr
                                            // data-enable-time
                                            options={{
                                                locale: {
                                                    ...chosenLocale,
                                                },
                                                enableTime: true,
                                                noCalendar: true,
                                                dateFormat: "H:i",
                                                time_24hr: true,
                                            }}
                                            value={moment(values?.timeAvailableOutShiftFrom, 'HH:mm:ss').format('HH:mm:ss')}
                                            onChange={(e: any) => {
                                                setFieldValue('timeAvailableOutShiftFrom', moment(e[0]).format('HH:mm'))
                                            }}
                                            className="form-input calender-input"
                                            placeholder="HH:mm"
                                        />
                                    )}
                                />

                                {submitCount ? errors.timeAvailableOutShiftFrom ? <div className="mt-1 text-danger"> {`${errors.timeAvailableOutShiftFrom}`} </div> : null : ''}

                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="timeAvailableOutShiftTo" className='label'>
                                    {' '}
                                    {t('timeAvailableOutShiftTo')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field
                                    autoComplete="off"
                                    name="timeAvailableOutShiftTo"
                                    render={({ field }: any) => (
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
                                            value={moment(values?.timeAvailableOutShiftTo, 'HH:mm:ss').format('HH:mm:ss')}
                                            onChange={(e: any) => {
                                                setFieldValue('timeAvailableOutShiftTo', moment(e[0]).format('HH:mm'))
                                            }}
                                            className="form-input calender-input"
                                            placeholder="HH:mm"
                                        />
                                    )}
                                />
                                {submitCount ? errors.timeAvailableOutShiftTo ? <div className="mt-1 text-danger"> {`${errors.timeAvailableOutShiftTo}`} </div> : null : ''}
                            </div>
                        </div>
                        {/* <div className='flex justify-between gap-5'>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="description" className='label'>
                                    {' '}
                                    {t('description')}
                                </label>
                                <Field autoComplete="off" name="description" as="textarea" id="description" placeholder={t('fill_description')} className="form-input" />
                            </div>

                            <div className="mb-5 w-1/2">
                                <label htmlFor="note" className='label'>
                                    {' '}
                                    {t('note')}
                                </label>
                                <Field autoComplete="off" name="note" as="textarea" id="note" placeholder={t('fill_note')} className="form-input" />
                            </div>
                        </div> */}
                        <div className='flex justify-between gap-5'>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="totalHours" className='label'>
                                    {' '}
                                    {t('time_shift')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field
                                    autoComplete="off"
                                    name="totalHours"
                                    // disabled={true}
                                    type="number"
                                    id="totalHours"
                                    value={values?.totalHours}
                                    onChange={(e: any) => setFieldValue('totalHours', e.target.value)}
                                    placeholder={t('fill_total_time')} className="form-input" />
                                {submitCount ? errors.totalHours ? <div className="mt-1 text-danger"> {errors.totalHours} </div> : null : ''}
                            </div>

                            <div className="mb-5 w-1/2">
                                <label htmlFor="status" className='label'> {t('status')} < span style={{ color: 'red' }}>* </span></label >
                                <div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
                                    <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                        <Field type="radio" name="isActive" value='1' className="form-checkbox rounded-full" />
                                        {t('active')}
                                    </label>
                                    <label style={{ marginBottom: 0 }}>
                                        <Field type="radio" name="isActive" value='0' className="form-checkbox rounded-full" />
                                        {t('inactive')}
                                    </label>
                                </div>

                                {submitCount ? errors.isActive ? (
                                    <div className="text-danger mt-1"> {errors.isActive} </div>
                                ) : null : ''}
                            </div>


                        </div>
                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left gap-8">
                            <Link href="/hrm/shift">
                                <button type="button" className="btn btn-outline-danger cancel-button" >
                                    {/* <IconBack className="w-5 h-5 ltr:mr-2 rtl:ml-2" /> */}
                                    <span>
                                        {t('cancel')}
                                    </span>
                                </button>
                            </Link>
                            {/* <button type="button" className="btn btn-outline-dark cancel-button" onClick={() => handleCancel()}>
                                {t('cancel')}
                            </button> */}
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

export default AddNewShift;
