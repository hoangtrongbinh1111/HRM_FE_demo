import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';

import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
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
import shift from '../../shift.json';
import Personnel from '../../personnel';
import { detailShift } from '@/services/apis/shift.api';
import moment from 'moment';
import dayjs from 'dayjs';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { IconLoading } from '@/components/Icon/IconLoading';
const TimeRangePicker = dynamic(() => import('@wojtekmaj/react-timerange-picker'), { ssr: false });

import '@wojtekmaj/react-timerange-picker/dist/TimeRangePicker.css';
import 'react-clock/dist/Clock.css';
interface Props {
    [key: string]: any;
}

const AddNewShift = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(`${t('detail_shift')}`));
    });
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const router = useRouter();
    const [loadDetail, setLoadDetail] = useState(true)
    const [detail, setDetail] = useState<any>();
    const [typeShift, setTypeShift] = useState(1); // 0: time, 1: total hours
    useEffect(() => {
        const id = router.query.id;
        setLoadDetail(true)
        if (id) {
            detailShift(id)
                .then((res) => {
                    setLoadDetail(false)
                    setDetail(res?.data);
                    setTypeShift(res?.data?.type);
                })
                .catch((err: any) => {
                    console.log(err);
                });
        }
    }, [router]);

    const handleChangeTypeShift = (e: any, type: number) => {
        if (e) {
            setTypeShift(type)
        }
        // setTypeShift(e);
    }
    const baseSchema = {
        code: Yup.string().required(`${t('please_fill_code_shift')}`),
        name: Yup.string().required(`${t('please_fill_name_shift')}`),
        type: Yup.string(),
        wageRate: Yup.number().typeError(`${t('please_fill_wageRate')}`),
        totalHours: Yup.number().typeError(`${t('please_fill_total_time')}`),
        description: Yup.string().required(`${t('please_fill_description')}`),
        note: Yup.string(),
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

    const extendedSchema = typeShift === 0 ? {
        ...baseSchema,
        startTime: Yup.string().required(`${t('please_fill_from_time')}`),
        endTime: Yup.string().required(`${t('please_fill_end_time')}`),
        breakFrom: Yup.string().required(`${t('please_fill_break_from_time')}`),
        breakTo: Yup.string().required(`${t('please_fill_break_end_time')}`)
    } : baseSchema;
    const SubmittedForm = Yup.object().shape(extendedSchema);
    return (
        <div>
            {loadDetail && (
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
                        <Link href="/hrm/shift" className="text-primary hover:underline">
                            <span>{t('shift')}</span>
                        </Link>

                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{t('detail_shift')}</span>
                    </li>
                </ul>
                <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                    <h1 className='page-title'>{t('detail_shift')}</h1>
                    <div className='flex justify-end'>
                        <RBACWrapper permissionKey={['shift:update']} type={'AND'}>

                            <Link
                                style={{
                                    display: "flex",
                                    alignItems: "center"
                                }}
                                href={`/hrm/shift/${router?.query.id}?page=${router?.query?.pageL}&perPage=${router?.query?.perPage}`}>
                                <button className="edit-page-btn btn btn-primary ltr:ml-4 rtl:mr-4">
                                    {t('edit')}
                                </button>
                            </Link>
                        </RBACWrapper>
                        <Link href={`/hrm/shift?page=${router?.query?.pageL}&perPage=${router?.query?.perPage}`}>
                            <button type="button" className="btn btn-primary btn-sm m-1 back-button" >
                                <IconBack className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                <span>
                                    {t('back')}
                                </span>
                            </button>
                        </Link>
                    </div>
                </div>
                <div className='header-page-bottom pb-4 mb-4'>
                    <Formik
                        initialValues={{
                            code: detail?.code,
                            name: detail?.name,
                            type: detail?.type,
                            wageRate: detail?.wageRate,
                            startTime: detail?.startTime ? moment(detail?.startTime, 'HH:mm:ss').format('HH:mm') : "",
                            endTime: detail?.endTime ? moment(detail?.endTime, 'HH:mm:ss').format('HH:mm') : "",
                            breakFrom: detail?.breakFrom ? moment(detail?.breakFrom, 'HH:mm:ss').format('HH:mm') : "",
                            breakTo: detail?.breakTo ? moment(detail?.breakTo, 'HH:mm:ss').format('HH:mm') : "",
                            totalHours: detail?.totalHours,
                            note: detail?.note,
                            isActive: detail?.isActive,
                            description: detail?.description,
                            timeAvailableOnShiftFrom: detail?.timeAvailableOnShiftFrom ? moment(detail?.timeAvailableOnShiftFrom, 'HH:mm:ss').format('HH:mm') : "",
                            timeAvailableOnShiftTo: detail?.timeAvailableOnShiftTo ? moment(detail?.timeAvailableOnShiftTo, 'HH:mm:ss').format('HH:mm') : "",
                            timeAvailableOutShiftFrom: detail?.timeAvailableOutShiftFrom ? moment(detail?.timeAvailableOutShiftFrom, 'HH:mm:ss').format('HH:mm') : "",
                            timeAvailableOutShiftTo: detail?.timeAvailableOutShiftTo ? moment(detail?.timeAvailableOutShiftTo, 'HH:mm:ss').format('HH:mm') : "",

                        }}
                        enableReinitialize
                        validationSchema={SubmittedForm}
                        onSubmit={() => {

                        }}
                    >
                        {({ errors, touched, submitCount, values }) => (
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
                                                    checked={detail?.type === 1}
                                                    className="form-checkbox rounded-full" />
                                                {t('shift_base_time')}
                                            </label>
                                            <label style={{ marginBottom: 0 }}>
                                                <Field autoComplete="off" disabled type="radio" name="type" value={0}
                                                    checked={typeShift === 0}
                                                    className="form-checkbox rounded-full" />
                                                {t('shift_base_total_time')}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="code" className='label'>
                                            {' '}
                                            {t('code_shift')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Field autoComplete="off" disabled name="code" type="text" id="code" placeholder={`${t('fill_code_shift')}`} className="form-input" />
                                    </div>

                                </div>
                                <div className='flex justify-between gap-5'>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="name" className='label'>
                                            {' '}
                                            {t('name_shift')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Field autoComplete="off" disabled name="name" type="text" id="name" placeholder={`${t('fill_name_shift')}`} className="form-input" />
                                    </div>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="wageRate" className='label'>
                                            {' '}
                                            {t('work_coefficient')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Field autoComplete="off" disabled name="wageRate" type="number" id="wageRate" placeholder="" className="form-input" />
                                    </div>
                                </div>
                                {typeShift === 1 && <> <div className='flex justify-between gap-5'>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="startTime" className='label'>
                                            {' '}
                                            {t('from_time')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Flatpickr
                                            disabled
                                            options={{
                                                locale: {
                                                    ...chosenLocale,
                                                },
                                                enableTime: true,
                                                noCalendar: true,
                                                dateFormat: "H:i",
                                                time_24hr: true,
                                            }}
                                            value={moment(values?.startTime, 'HH:mm:ss').format('HH:mm:ss')}
                                            className="form-input calender-input"
                                            placeholder={`${t('choose_from_time')}`}
                                        />
                                    </div>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="endTime" className='label'>
                                            {' '}
                                            {t('end_time')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Flatpickr
                                            disabled
                                            options={{
                                                locale: {
                                                    ...chosenLocale,
                                                },
                                                enableTime: true,
                                                noCalendar: true,
                                                dateFormat: "H:i",
                                                time_24hr: true,
                                            }}
                                            value={moment(values?.endTime, 'HH:mm:ss').format('HH:mm:ss')}
                                            className="form-input calender-input"
                                            placeholder={`${t('choose_end_time')}`}
                                        />
                                    </div>
                                </div>
                                    {/* <div className='flex justify-between gap-5'>
                                        <div className="mb-5 w-1/2">
                                            <label htmlFor="breakFrom" className='label'>
                                                {' '}
                                                {t('break_from_time')}
                                            </label>
                                            <Flatpickr
                                                disabled
                                                options={{
                                                    locale: {
                                                        ...chosenLocale,
                                                    },
                                                    enableTime: true,
                                                    noCalendar: true,
                                                    dateFormat: "H:i",
                                                    time_24hr: true,
                                                }}
                                                value={moment(values?.breakFrom, 'HH:mm:ss').format('HH:mm:ss')}
                                                className="form-input calender-input"
                                                placeholder={`${t('choose_break_from_time')}`}
                                            />
                                        </div>
                                        <div className="mb-5 w-1/2">
                                            <label htmlFor="breakTo" className='label'>
                                                {' '}
                                                {t('break_end_time')}
                                            </label>
                                            <Flatpickr
                                                disabled
                                                options={{
                                                    locale: {
                                                        ...chosenLocale,
                                                    },
                                                    enableTime: true,
                                                    noCalendar: true,
                                                    dateFormat: "H:i",
                                                    time_24hr: true,
                                                }}
                                                value={moment(values?.breakTo, 'HH:mm:ss').format('HH:mm:ss')}
                                                className="form-input calender-input"
                                                placeholder={`${t('choose_break_end_time')}`}
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
                                            disabled
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
                                            disabled
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
                                                    disabled
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
                                                    disabled
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
                                                    disabled
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
                                                    disabled
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

                                                    className="form-input calender-input"
                                                    placeholder="HH:mm"
                                                />
                                            )}
                                        />
                                        {submitCount ? errors.timeAvailableOutShiftTo ? <div className="mt-1 text-danger"> {`${errors.timeAvailableOutShiftTo}`} </div> : null : ''}
                                    </div>
                                </div>
                                <div className='flex justify-between gap-5'>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="totalHours" className='label'>
                                            {' '}
                                            {t('time_shift')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Field autoComplete="off" disabled name="totalHours" type="number" id="totalHours" placeholder={t('fill_total_time')} className="form-input" />
                                    </div>
                                    <div className="mb-5 w-1/2">
                                        <label htmlFor="isActive" className='label'> {t('status')} < span style={{ color: 'red' }}>* </span></label >
                                        <div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
                                            <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                                <Field autoComplete="off" disabled type="radio" name="isActive" value={true} className="form-checkbox rounded-full" />
                                                {t('active')}
                                            </label>
                                            <label style={{ marginBottom: 0 }}>
                                                <Field autoComplete="off" disabled type="radio" name="isActive" value={false} className="form-checkbox rounded-full" />
                                                {t('inactive')}
                                            </label>
                                        </div>
                                    </div>


                                </div>
                                {/* <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left gap-8">
                            <button type="button" className="btn btn-outline-dark cancel-button" onClick={() => handleCancel()}>
                                {t('cancel')}
                            </button>
                            <button type="submit" className="btn :ml-4 rtl:mr-4 add-button" disabled={disabled}>
                                {t('update')}
                            </button>
                        </div> */}
                            </Form>
                        )}
                    </Formik>
                </div>
                <div>
                    <h1 className='page-title'>{t('list_staff_by_shift')}</h1>
                    <Personnel id={router.query.id} />
                </div>
            </div>
        </div>

    );
};

export default AddNewShift;
