import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import Flatpickr from 'react-flatpickr';
import { DropdownUsers } from '@/services/swr/dropdown.swr';
import { makeRamdomText } from '@/utils/commons';
import { AddTrackingLogDetail, EditTrackingLogDetail } from '@/services/apis/tracking-log.api';
import dayjs from 'dayjs';
import moment from 'moment';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
interface Props {
    [key: string]: any;
}
import { Loader } from '@mantine/core';

const DetailModal = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataStaffDropdown, setDataStaffDropdown] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [searchStaff, setSearchStaff] = useState<any>();
    const [isSubmit, setIsSubmit] = useState(false);

    const SubmittedForm = Yup.object().shape({
        staffId: new Yup.ObjectSchema().required(`${t('please_fill_staff')}`),
        enterTime: Yup.string().required(`${t('please_fill_enter_time')}`),
        exitTime: Yup.string().required(`${t('please_fill_exit_time')}`).test('misMatched', `${t('exit_time_must_be_after_entry_time')}`, (value, testContext) => {
            if (value && testContext.parent.enterTime > value) return false
            return true
        })
    });

    const { data: staffDropdown, pagination: staffPagination, isLoading: staffLoading } = DropdownUsers({ page: page, search: searchStaff });

    const handleTrackingLog = (param: any) => {
        if (Number(router.query.id)) {
            setIsSubmit(true);
            const query = {
                staffId: Number(param.staffId.value),
                enterTime: param.enterTime,
                exitTime: param.exitTime,
                content: param.content,
                // price: param?.price ? param?.price : 0
            };
            if (props?.data) {
                EditTrackingLogDetail({ id: router.query.id, detailId: props?.data?.id, ...query })
                    .then(() => {
                        handleCancel();
                        showMessage(`${t('edit_success')}`, 'success');
                    })
                    .catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    }).finally(() => {
                        setIsSubmit(false);
                    });
            } else {
                AddTrackingLogDetail({ id: router.query.id, ...query })
                    .then(() => {
                        handleCancel();
                        showMessage(`${t('create_success')}`, 'success');
                    })
                    .catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    }).finally(() => {
                        setIsSubmit(false);
                    });
            }
        } else {
            const query = {
                id: makeRamdomText(3),
                staff: {
                    fullName: param.staffId.label,
                    id: param.staffId.value,
                    department: { name: param.staffId.department },
                },
                staffId: Number(param.staffId.value),
                enterTime: param.enterTime,
                exitTime: param.exitTime,
                content: param.content,
                // price: param?.price ? param?.price : 0
            };
            if (props?.data) {
                const filteredItems = props.listData.find((item: any) => item.id === props.data.id)
                const updatedItems = {
                    id: filteredItems.id,
                    staff: {
                        fullName: param.staffId.label,
                        id: param.staffId.value,
                        department: { name: param.staffId.department },
                    },
                    staffId: Number(param.staffId.value),
                    enterTime: param.enterTime,
                    exitTime: param.exitTime,
                    content: param.content,
                }
                const temp_list = props.listData.map((item: any) => {
                    if (item.id !== props.data.id) {
                        return item
                    } else {
                        return updatedItems
                    }
                })
                props.setListData(temp_list)
                props.setData(updatedItems);
                handleCancel();
            } else {
                if (props.listData && props.listData.length > 0) {
                    props.setListData([...props.listData, query]);
                    handleCancel();
                } else {
                    props.setListData([query]);
                    handleCancel();
                }
            }
        }
    };

    const handleCancel = () => {
        props.setOpenModal(false);
        props.trackingLogDetailMutate();
        // props.setData();
    };

    useEffect(() => {
        setInitialValue({
            staffId: props?.data
                ? {
                    value: `${props?.data?.staff?.id}`,
                    label: `${props?.data?.staff?.fullName}`,
                }
                : '',
            enterTime: props?.data ? new Date(props?.data?.enterTime) : "",
            exitTime: props?.data ? new Date(props?.data?.exitTime) : "",
            content: props?.data ? `${props?.data?.content}` : '',
            // price: props?.data ? props?.data.price : ""
        });
    }, [props?.data]);

    useEffect(() => {
        if (staffPagination?.page === undefined) return;
        if (staffPagination?.page === 1) {
            setDataStaffDropdown(staffDropdown?.data);
        } else {
            setDataStaffDropdown([...dataStaffDropdown, ...staffDropdown?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffPagination]);

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(staffPagination?.page + 1);
        }, 1000);
    };

    return (
        <Transition appear show={props.openModal ?? false} as={Fragment}>
            <Dialog as="div" open={props.openModal} onClose={() => props.setOpenModal(false)} className="relative z-50">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {props.data === undefined ? t('add_detail') : t('edit_detail')}
                                </div>
                                <div>
                                    <div className="p-5">
                                        <Formik
                                            initialValues={initialValue}
                                            validationSchema={SubmittedForm}
                                            onSubmit={async (values, { resetForm }) => {

                                                await handleTrackingLog(values);
                                                resetForm();
                                            }}
                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5">
                                                    <div className="mb-5 flex justify-between gap-4">
                                                        <div className="flex-1">
                                                            <label className='label' htmlFor="staffId">
                                                                {' '}
                                                                {t('staff')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <Select
                                                                id="staffId"
                                                                name="staffId"
                                                                placeholder={t('choose_staff')}
                                                                options={dataStaffDropdown.map((item: any) => {
                                                                    return {
                                                                        value: item.value,
                                                                        label: item.label,
                                                                        department: item.department_name
                                                                    }
                                                                })}
                                                                onMenuOpen={() => setPage(1)}
                                                                onMenuScrollToBottom={handleMenuScrollToBottom}
                                                                isLoading={staffLoading}
                                                                maxMenuHeight={160}
                                                                value={values?.staffId}
                                                                onInputChange={(e) => setSearchStaff(e)}
                                                                onChange={(e) => {
                                                                    setFieldValue('staffId', e);
                                                                }}
                                                            />
                                                            {submitCount && errors.staffId ? <div className="mt-1 text-danger"> {`${errors.staffId}`} </div> : null}
                                                        </div>
                                                    </div>
                                                    {/* <div className="mb-5">
                                                        <label className='label' htmlFor="price" > {t('price')} </label >
                                                        <Field autoComplete="off" name="price" type="number" id="price" placeholder={`${t('enter_price')}`} className="form-input" />
                                                        {submitCount && errors.price ? (
                                                            <div className="text-danger mt-1"> {`${errors.price}`} </div>
                                                        ) : null}
                                                    </div> */}
                                                    <div className="mb-5">
                                                        <label className='label' htmlFor="enter_time">
                                                            {t('enter_time')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            options={{
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                enableTime: true,
                                                                noCalendar: true,
                                                                dateFormat: 'H:i',
                                                                time_24hr: true,
                                                            }}
                                                            onChange={(e) => {
                                                                if (e.length > 0) {
                                                                    setFieldValue('enterTime', new Date(e[0]));
                                                                }
                                                            }}
                                                            value={values.enterTime}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('choose_enter_time')}`}
                                                        />
                                                        {submitCount ? errors.enterTime ? <div className="mt-1 text-danger"> {`${errors.enterTime}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label className='label' htmlFor="exit_time">
                                                            {t('exit_time')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            options={{
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                enableTime: true,
                                                                noCalendar: true,
                                                                dateFormat: 'H:i',
                                                                time_24hr: true,
                                                            }}
                                                            placeholder={`${t('choose_exit_time')}`}
                                                            onChange={(e) => {
                                                                if (e.length > 0) {
                                                                    setFieldValue('exitTime', new Date(e[0]));
                                                                }
                                                            }}
                                                            value={values.exitTime}
                                                            className="calender-input form-input"
                                                        />
                                                        {submitCount ? errors.exitTime ? <div className="mt-1 text-danger"> {`${errors.exitTime}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label className='label' htmlFor="content"> {t('content')} </label>
                                                        <Field autoComplete="off" name="content" as="textarea" id="content" placeholder={`${t('enter_content')}`} className="form-input" />
                                                        {errors.content ? <div className="mt-1 text-danger"> {`${errors.content}`} </div> : null}
                                                    </div>
                                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button data-testId="submit-modal-btn" type="submit" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4">
                                                            {isSubmit ? <Loader size="sm" /> : `${props.data !== undefined ? t('update') : t('add_new')}`}
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
