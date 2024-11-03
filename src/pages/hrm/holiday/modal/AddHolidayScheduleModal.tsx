import IconX from '@/components/Icon/IconX';
import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';

interface Props {
    [key: string]: any;
}

const getEmployeeOptions = () => {
    const now = new Date();
    const getMonth = (dt: Date, add: number = 0) => {
        let month = dt.getMonth() + 1 + add;
        const str = (month < 10 ? '0' + month : month).toString();
        return str;
        // return dt.getMonth() < 10 ? '0' + month : month;
    };
    return [
        {
            id: 1,
            user: 'Bountafaibounnheuang',
            title: 'Tết dương',
            start: now.getFullYear() + '-' + getMonth(now) + '-01T14:30:00',
            end: now.getFullYear() + '-' + getMonth(now) + '-01T15:30:00',
            // className: 'danger',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 2,
            user: 'Khampa Sirt',
            title: 'Tết nguyên đán',
            start: now.getFullYear() + '-' + getMonth(now) + '-07T19:30:00',
            end: now.getFullYear() + '-' + getMonth(now) + '-08T14:30:00',
            // className: 'primary',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 3,
            user: 'Xaypayou',
            title: 'Giỗ tổ',
            start: now.getFullYear() + '-' + getMonth(now) + '-17T14:30:00',
            end: now.getFullYear() + '-' + getMonth(now) + '-18T14:30:00',
            // className: 'info',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 4,
            user: 'Suok Thi Da',
            title: 'Quốc khánh',
            start: now.getFullYear() + '-' + getMonth(now) + '-12T10:30:00',
            end: now.getFullYear() + '-' + getMonth(now) + '-13T10:30:00',
            // className: 'danger',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 5,
            user: 'Bount Yo',
            title: 'Lễ 5',
            start: now.getFullYear() + '-' + getMonth(now) + '-12T15:00:00',
            end: now.getFullYear() + '-' + getMonth(now) + '-13T15:00:00',
            // className: 'info',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 6,
            user: 'Khăm sa vẳn',
            title: 'Lễ 6',
            start: now.getFullYear() + '-' + getMonth(now) + '-12T21:30:00',
            end: now.getFullYear() + '-' + getMonth(now) + '-13T21:30:00',
            // className: 'success',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 7,
            user: 'Toukta',
            title: 'Lễ 7',
            start: now.getFullYear() + '-' + getMonth(now) + '-12T05:30:00',
            end: now.getFullYear() + '-' + getMonth(now) + '-13T05:30:00',
            // className: 'info',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 8,
            user: 'Phoutchana',
            title: 'Lễ 8',
            start: now.getFullYear() + '-' + getMonth(now) + '-12T20:00:00',
            end: now.getFullYear() + '-' + getMonth(now) + '-13T20:00:00',
            // className: 'danger',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 9,
            user: 'Sitthiphone',
            title: 'Lễ 9',
            start: now.getFullYear() + '-' + getMonth(now) + '-27T20:00:00',
            end: now.getFullYear() + '-' + getMonth(now) + '-28T20:00:00',
            // className: 'success',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 10,
            user: 'Khăm Pheng',
            title: 'Lễ 10',
            start: now.getFullYear() + '-' + getMonth(now, 1) + '-24T08:12:14',
            end: now.getFullYear() + '-' + getMonth(now, 1) + '-27T22:20:20',
            // className: 'danger',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 11,
            user: 'Vi lay phone',
            title: 'Lễ 11',
            start: now.getFullYear() + '-' + getMonth(now, -1) + '-13T08:12:14',
            end: now.getFullYear() + '-' + getMonth(now, -1) + '-16T22:20:20',
            // className: 'primary',
            description: 'Chi tiết về ngày lễ',
        },
        {
            id: 13,
            user: 'Seng phệt',
            title: 'Lễ 13',
            start: now.getFullYear() + '-' + getMonth(now, 1) + '-15T08:12:14',
            end: now.getFullYear() + '-' + getMonth(now, 1) + '-18T22:20:20',
            // className: 'primary',
            description: 'Chi tiết về ngày lễ',
        },
    ].map((work) => ({
        value: work.user,
        label: work.user,
    }));
};

const AddWorkScheduleModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const SubmittedForm = Yup.object().shape({
        user: Yup.string().required(`${t('please_select_the_staff')}`),
        title: Yup.string().required(`${t('please_fill_title_holiday_schedule')}`),
        start: Yup.date().required(`${t('please_fill_holiday_start_date')}`),
        end: Yup.date().required(`${t('please_fill_holiday_end_date')}`),
    });
    const { isAddHolidayScheduleModal, setIsAddHolidayScheduleModal, params, minStartDate, minEndDate, saveHolidaySchedule, handleDelete } = props;
    return (
        <Transition appear show={isAddHolidayScheduleModal ?? false} as={Fragment}>
            <Dialog as="div" onClose={() => setIsAddHolidayScheduleModal(false)} open={isAddHolidayScheduleModal} className="relative z-50">
                <Transition.Child as={Fragment} enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
                    <Dialog.Overlay className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    onClick={() => setIsAddHolidayScheduleModal(false)}
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                    {params?.id ? 'Sửa lịch nghỉ lễ' : 'Thêm lịch nghỉ lễ'}
                                </div>
                                <div className="p-5">
                                    <Formik
                                        initialValues={{
                                            id: params ? `${params?.id}` : '',
                                            user: params ? `${params?.user}` : '',
                                            title: params ? `${params?.title}` : '',
                                            start: params ? `${params?.start}` : '',
                                            end: params ? `${params?.end}` : '',
                                            description: params ? `${params?.description}` : '',
                                        }}
                                        validationSchema={SubmittedForm}
                                        onSubmit={(values) => {
                                            saveHolidaySchedule(values);
                                        }}
                                    >
                                        {({ errors, touched }) => (
                                            <Form className="space-y-5">
                                                <div className="mb-3">
                                                    <label htmlFor="user">
                                                        Nhân viên
                                                        <span style={{ color: 'red' }}> *</span>
                                                    </label>
                                                    <Field autoComplete="off" as="select" name="user" id="user" className="form-input">
                                                        <option value="">{`${t('Choose staff')}`}</option>
                                                        {getEmployeeOptions().map((employee) => (
                                                            <option key={employee.value} value={employee.value}>
                                                                {employee.label}
                                                            </option>
                                                        ))}
                                                    </Field>
                                                    {errors.user ? <div className="mt-1 text-danger"> {errors.user} </div> : null}
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="title">
                                                        {t('holiday_title')}
                                                        <span style={{ color: 'red' }}> *</span>
                                                    </label>
                                                    <Field autoComplete="off" name="title" type="text" id="title" placeholder={t('fill_holiday_title')} className="form-input" />
                                                    {errors.title ? <div className="mt-1 text-danger"> {errors.title} </div> : null}
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="dateStart">
                                                        {t('start time')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field
                                                        autoComplete="off" id="start" type="datetime-local" name="start" className="form-input" placeholder={t('start time')}
                                                        min={minStartDate}
                                                    />
                                                    {errors.start ? <div className="mt-1 text-danger"> {errors.start} </div> : null}
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="dateEnd">
                                                        {t('end time')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" id="end" type="datetime-local" name="end" className="form-input" placeholder={t('end time')} min={minEndDate} />
                                                    {errors.end ? <div className="mt-1 text-danger"> {errors.end} </div> : null}
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="description">Mô tả ngày lễ</label>
                                                    <Field autoComplete="off" id="description" as="textarea" rows="5" name="description" className="form-input" placeholder="Nhập mô tả ngày lễ" />
                                                </div>
                                                <div>
                                                    <div className="!mt-8 flex items-center justify-end">
                                                        <button type="button" className="btn btn-outline-danger" onClick={() => setIsAddHolidayScheduleModal(false)}>
                                                            Cancel
                                                        </button>
                                                        {params?.id && (
                                                            <button type="button" className="btn btn-outline-warning ltr:ml-4 rtl:mr-4" onClick={() => handleDelete(params)}>
                                                                Remove
                                                            </button>
                                                        )}
                                                        <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                            {params?.id ? 'Update' : 'Create'}
                                                        </button>
                                                    </div>
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

export default AddWorkScheduleModal;
