import { useState, Fragment, useTransition } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import IconX from '@/components/Icon/IconX';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { useTranslation } from 'react-i18next';
import 'flatpickr/dist/plugins/monthSelect/style.css';
import monthSelectPlugin, { Config } from 'flatpickr/dist/plugins/monthSelect';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import dayjs from 'dayjs';
import { UpdateTimekeepingByMonth } from '@/services/apis/timekeeping.api';
import { showMessage } from '@/@core/utils';
import { UpdateTimekeepingByDay } from '@/services/apis/timekeeping-staff.api';
import { Loader } from '@mantine/core';
import moment from 'moment';
import { formatDate2, formatEndDate, formatStartDate, toDateString } from '@/utils/commons';
interface Props {
    [key: string]: any;
}
const monthSelectConfig: Partial<Config> = {
    shorthand: true, //defaults to false
    dateFormat: 'm/Y', //defaults to "F Y"
    theme: 'light', // defaults to "light"
};

const UpdateTimkeeping = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const [selectedOption, setSelectedOption] = useState('month'); // Default is month
    const { t } = useTranslation();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(`${currentMonth}/${currentYear}`)
    const [selectedDate, setSelectedDate] = useState(`${dayjs(new Date()).format('DD-MM-YYYY')}`)
    const [selectedEndDate, setSelectedEndDate] = useState(`${dayjs(new Date()).format('DD-MM-YYYY')}`)
    const [loading, setLoading] = useState(false)
    const handleChangeMonth = (month: any) => {
        setSelectedMonth(month)
    }
    const handleChangeDate = (date: any) => {
        setSelectedDate(formatStartDate(dayjs(date[0])))
        setSelectedEndDate(formatStartDate(dayjs(date[1])))
    }
    const initialValues = {
        bussinessWork: '',
        dayOffWork: '',
        holidayWork: '',
        weekdayWork: '',
        extraWork: '',
        timekeepingValue: '', // This will store the month or day based on selection
    };

    const validationSchema = Yup.object().shape({

    });
    const handleUpdateTimekeeing = () => {
        const onSuccess = () => {
            showMessage(`${t('update_timekeeping_success')}`, 'success');
            setLoading(false);
            props?.mutate();
            props?.setOpenModal(false);
        };

        const onError = (err: any) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
            setLoading(false);
            props?.setOpenModal(false);
        };

        setLoading(true);

        if (selectedOption === 'month') {
            const [month, year] = selectedMonth?.split('/');
            UpdateTimekeepingByMonth(month, year).then(onSuccess).catch(onError);
        } else {
            const startDate = dayjs(selectedDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
            const endDate = dayjs(selectedEndDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
            UpdateTimekeepingByDay(startDate, endDate)
                .then((res: any) => {
                    if (res?.result === true) {
                        showMessage(`${t('update_timekeeping_success')}`, 'success');
                        setLoading(false);
                        props?.mutate();
                    } else {
                        showMessage(`${res?.message}`, 'error');
                        setLoading(false)
                    }
                    props?.setOpenModal(false);
                })
                .catch(onError);
        }
    }
    return (
        <Transition appear show={props.openModal ?? false} as={Fragment}>
            <Dialog as="div" open={props.openModal} onClose={() => props.setOpenModal(false)} className="relative z-50">
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
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => props.setOpenModal(false)}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {t('update_timekeeping')}
                                </div>
                                <div className="p-5">
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={(values) => {
                                            handleUpdateTimekeeing()
                                        }}
                                        enableReinitialize
                                    >
                                        {({ errors, touched }) => (
                                            <Form className="space-y-5">
                                                <div className="mb-5">
                                                    <label htmlFor="updateType">
                                                        {' '}
                                                        {t('update_timekeeping_by')}
                                                        {' '}
                                                        <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <div className="flex space-x-4">
                                                        <label>
                                                            <Field
                                                                type="radio"
                                                                name="updateType"
                                                                value="month"
                                                                checked={selectedOption === 'month'}
                                                                onChange={() => setSelectedOption('month')}
                                                            />
                                                            {' '}
                                                            {t('month')}

                                                        </label>
                                                        <label>
                                                            <Field
                                                                type="radio"
                                                                name="updateType"
                                                                value="day"
                                                                checked={selectedOption === 'day'}
                                                                onChange={() => setSelectedOption('day')}
                                                            />
                                                            {' '}
                                                            {t('day')}
                                                        </label>
                                                    </div>
                                                </div>
                                                {selectedOption === 'month' ? (
                                                    <div className="mb-5">
                                                        <label htmlFor="timekeepingMonth">
                                                            {t('select month')} <span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <Flatpickr
                                                            key={`month-${selectedMonth}`}  // Thêm key để buộc render lại
                                                            name="timekeepingMonth"
                                                            options={{
                                                                defaultDate: selectedMonth,
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                plugins: [monthSelectPlugin(monthSelectConfig)]
                                                            }}
                                                            placeholder={`${t('choose_month')}`}
                                                            onChange={(selectedDates, dateStr, instance) => {
                                                                handleChangeMonth(dateStr);
                                                            }}
                                                            className="form-input calender-input"
                                                        />
                                                        {errors.timekeepingValue && touched.timekeepingValue ? (
                                                            <div className="mt-1 text-danger">{errors.timekeepingValue}</div>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <div className="mb-5">
                                                        <label htmlFor="timekeepingDay">
                                                            {t('select day')} <span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <Flatpickr
                                                            // key={`day-${selectedDate}`}  // Thêm key để buộc render lại
                                                            name="timekeepingDay"
                                                            options={{
                                                                defaultDate: [`${selectedDate}`, `${selectedEndDate}`],
                                                                enableTime: false,
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                mode: 'range',
                                                                dateFormat: 'd-m-Y',
                                                            }}
                                                            onChange={(e) => {
                                                                handleChangeDate(e);
                                                            }}
                                                            className="form-input calender-input"
                                                            placeholder={`${t('DD-MM-YYYY')}`}
                                                        />
                                                        {errors.timekeepingValue && touched.timekeepingValue ? (
                                                            <div className="mt-1 text-danger">{errors.timekeepingValue}</div>
                                                        ) : null}
                                                    </div>
                                                )}
                                                {/* Other form fields */}
                                                <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger cancel-button"
                                                        onClick={() => props.setOpenModal(false)}
                                                    >
                                                        {t('cancel')}
                                                    </button>
                                                    <RBACWrapper
                                                        permissionKey={['timekeepingStaff:update']}
                                                        type="OR"
                                                    >
                                                        <button
                                                            data-testId="submit-modal-btn"
                                                            type="submit"
                                                            disabled={loading}
                                                            className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button"
                                                        >

                                                            {
                                                                loading ? <Loader size="sm" /> : t('update')
                                                            }
                                                        </button>
                                                    </RBACWrapper>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default UpdateTimkeeping;
