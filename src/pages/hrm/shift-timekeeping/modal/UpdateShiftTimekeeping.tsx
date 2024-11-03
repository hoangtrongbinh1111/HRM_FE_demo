import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { UpdateShiftTimekeeping } from '@/services/apis/shift-timekeeping.api';

// import { useEffect, Fragment, useState } from 'react';
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
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import moment from 'moment';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
import { Loader } from '@mantine/core';

type ValuePiece = Date | string | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];
interface Props {
    [key: string]: any;
}

const DetailModal = ({ ...props }: Props) => {
    // info
    const [loading, setLoading] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    useEffect(() => {

    }, [props?.info]);

    const SubmittedForm = Yup.object().shape({
        startTime: Yup.string().required(`${t('please_choose_from_day')}`),
        endTime: Yup.string().required(`${t('please_choose_end_day')}`),
        description: Yup.string().required(`${t('please_fill_reason')}`)
    })
    function createISOString(time: string, fullDay: string): string {
        const dateTime = `${fullDay}T${time}`;
        const momentObj = moment(dateTime, 'YYYY-MM-DDTHH:mm');
        return momentObj.toISOString();
    }
    const handleRequestOvertime = (param: any) => {
        setLoading(true);
        const query = {
            startTime: createISOString(param?.startTime, props?.selectedCell?.date?.fullDay),
            endTime: createISOString(param?.endTime, props?.selectedCell?.date?.fullDay),
            // status: props?.info?.status,
            description: param?.description
        };
        UpdateShiftTimekeeping(props?.info?.id, query).then(() => {
            handleCancel();
            showMessage(`${t('edit_success')}`, 'success');
            props?.getData();
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        }).finally(() => {
            setLoading(false);
        });
    }
    const handleCancel = () => {
        props.handleCancel();
    };

    useEffect(() => {
        setInitialValue({
            startTime: props?.shiftInfo?.startTime,
            endTime: props?.shiftInfo?.endTime,
            description: ""
        })
    }, [props?.info]);
    return (
        <Transition appear show={props.openModal ?? false} as={Fragment}>
            <Dialog as="div" open={props.openModal} onClose={() => props.handleCancel()} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-2xl border-0 p-0 text-[#476704] dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {t('Update ShifTimekeeping')} {dayjs(props?.selectedCell?.date?.fullDay, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                                </div>
                                <div>
                                    <div className="pl-10 pr-10 p-5">
                                        <Formik
                                            initialValues={initialValue}
                                            validationSchema={SubmittedForm}
                                            onSubmit={values => {
                                                handleRequestOvertime(values);
                                            }}

                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5" >
                                                    <div className="mb-5">
                                                        <label htmlFor="startTime" className='label'>
                                                            {' '}
                                                            {t('register_from_date')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            // disabled
                                                            options={{
                                                                locale: { ...chosenLocale },
                                                                enableTime: true,
                                                                noCalendar: true,
                                                                dateFormat: "H:i",
                                                                time_24hr: true,
                                                                allowInput: true, // Cho phép nhập trực tiếp
                                                            }}
                                                            value={values?.startTime}
                                                            onChange={(e: any) => {
                                                                if (e.length > 0) {
                                                                    setFieldValue('startTime', dayjs(e[0]).format('HH:mm'))
                                                                }
                                                            }}
                                                            className="form-input calender-input"
                                                            placeholder={`${t('choose_register_start_date')}`}
                                                        />
                                                        {submitCount ? errors.startTime ? <div className="mt-1 text-danger"> {`${errors.startTime}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="endTime" className='label'>
                                                            {' '}
                                                            {t('register_end_date')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            // disabled
                                                            options={{
                                                                locale: { ...chosenLocale },
                                                                enableTime: true,
                                                                noCalendar: true,
                                                                dateFormat: "H:i",
                                                                time_24hr: true,
                                                                allowInput: true, // Cho phép nhập trực tiếp
                                                            }}
                                                            onChange={(e: any) => {
                                                                if (e.length > 0) {
                                                                    setFieldValue('endTime', dayjs(e[0]).format('HH:mm'))
                                                                }
                                                            }}
                                                            value={values?.endTime}
                                                            className="form-input calender-input"
                                                            placeholder={`${t('choose_register_end_date')}`}
                                                        />
                                                        {submitCount ? errors.endTime ? <div className="mt-1 text-danger"> {`${errors.endTime}`} </div> : null : ''}
                                                        {/* {submitCount ? dayjs(values?.startTime).isAfter(values.startTime) ? <div className="mt-1 text-danger"> {`${t('endtime_must_after_starttime')}`} </div> : null : ""} */}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="name" className="label">
                                                            {' '}
                                                            {t('reason')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" name="description" as="textarea" id="description" placeholder={`${t('enter_description')}`} className="form-input" />
                                                        {submitCount ? errors.description ? <div className="mt-1 text-danger"> {`${errors.description}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button
                                                            data-testId="submit-modal-btn"
                                                            type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button"
                                                            disabled={loading}
                                                        >
                                                            {
                                                                loading ? <Loader size="sm" /> : t('update')
                                                            }
                                                        </button>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>

                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
export default DetailModal;
