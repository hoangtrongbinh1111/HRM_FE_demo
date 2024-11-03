import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import { AddTravelPaperDetail, EditTravelPaperDetail } from '@/services/apis/travel-paper.api';
import { DropdownInventory, DropdownProducts } from '@/services/swr/dropdown.swr';
import { GetQuantity } from '@/services/apis/product.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { makeRamdomText } from '@/utils/commons';
import { formatNumber, moneyToNumber, moneyToText } from '@/utils/commons';
import { useProfile } from '@/services/swr/profile.swr';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import dayjs from 'dayjs';
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
    const [dataProductDropdown, setDataProductDropdown] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [searchProduct, setSearchProduct] = useState<any>();
    const { data: userData } = useProfile();
    const SubmittedForm = Yup.object().shape({
        startDay: Yup.date().required(`${t('please_choose_from_day')}`),
        endDay: Yup.date().required(`${t('please_choose_end_day')}`).when('startDay', (startDay, schema) => {
            return startDay && schema.min(startDay, `${t('endtime_must_after_starttime')}`);
        }),
        departure: Yup.string().required(`${t('please_fill_departure')}`),
        vehicle: Yup.string().required(`${t('please_fill_vehicle')}`),
        destination: Yup.string().required(`${t('please_fill_destination')}`),
    });
    const [isSubmit, setIsSubmit] = useState(false);

    const handleTravelPaper = (param: any) => {
        if (Number(router.query.id)) {
            setIsSubmit(true);
            const query = {
                startDay: dayjs(param?.startDay).format('YYYY-MM-DD'),
                endDay: dayjs(param?.endDay).format('YYYY-MM-DD'),
                departure: param?.departure,
                vehicle: param?.vehicle,
                destination: param?.destination,
            };
            if (props?.data) {
                EditTravelPaperDetail({ id: router.query.id, detailId: props?.data?.id, ...query }).then(() => {
                    handleCancel();
                    showMessage(`${t('edit_success')}`, 'success');
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                }).finally(() => {
                    setIsSubmit(false);
                });
            } else {
                AddTravelPaperDetail({ id: router.query.id, ...query }).then(() => {
                    handleCancel();
                    showMessage(`${t('create_success')}`, 'success');
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                }).finally(() => {
                    setIsSubmit(false);
                });
            }
        } else {
            const query = {
                id: makeRamdomText(3),
                startDay: dayjs(param?.startDay).format('YYYY-MM-DD'),
                endDay: dayjs(param?.endDay).format('YYYY-MM-DD'),
                departure: param?.departure,
                vehicle: param?.vehicle,
                destination: param?.destination,
            };
            if (props?.data) {
                const filteredItems = props.listData.find((item: any) => item.id === props.data.id)
                const updatedItems = {
                    id: filteredItems.id,
                    startDay: dayjs(param?.startDay).format('YYYY-MM-DD'),
                    endDay: dayjs(param?.endDay).format('YYYY-MM-DD'),
                    departure: param?.departure,
                    vehicle: param?.vehicle,
                    destination: param?.destination,
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
                    props.setListData([...props.listData, query])
                    handleCancel();
                } else {
                    props.setListData([query])
                    handleCancel();
                }
            }
        }
    }
    const handleCancel = () => {
        props.setOpenModal(false);
        props.travelPaperDetailMutate();
        // props.setData();
    };

    useEffect(() => {
        setInitialValue({
            startDay: props?.data ? props?.data?.startDay : "",
            endDay: props?.data ? props?.data?.endDay : "",
            departure: props?.data ? props?.data?.departure : "",
            vehicle: props?.data ? props?.data?.vehicle : "",
            destination: props?.data ? props?.data?.destination : "",
        })
    }, [props?.data]);

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
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-2xl border-0 p-0 text-[#476704] dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {props.data === undefined ? t('add_detail') : t('edit_detail')}
                                </div>
                                <div>
                                    <div className="pl-10 pr-10 p-5">
                                        <Formik
                                            initialValues={initialValue}
                                            validationSchema={SubmittedForm}
                                            onSubmit={async (values, { resetForm }) => {
                                                await handleTravelPaper(values)
                                                // resetForm()
                                            }}
                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5" >
                                                    <div className="mb-5">
                                                        <label htmlFor="startDay" className='label'>
                                                            {' '}
                                                            {t('register_from_date')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off"
                                                            name="startDay"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    // data-enable-time
                                                                    options={{
                                                                        locale: {
                                                                            ...chosenLocale,
                                                                        },
                                                                        // enableTime: true,
                                                                        dateFormat: "d-m-Y",
                                                                        // time_24hr: true,
                                                                    }}
                                                                    value={dayjs(values?.startDay).format('DD-MM-YYYY')}
                                                                    onChange={(e: any) => {
                                                                        setFieldValue('startDay', e[0])
                                                                    }}
                                                                    className="form-input calender-input"
                                                                    placeholder={`${t('choose_register_start_date')}`}
                                                                />
                                                            )}
                                                        />

                                                        {submitCount ? errors.startDay ? <div className="mt-1 text-danger"> {`${errors.startDay}`} </div> : null : ''}
                                                        {submitCount ? dayjs(values?.startDay).isAfter(values.startDay) ? <div className="mt-1 text-danger"> {`${t('starttime_must_before_endtime')}`} </div> : null : ""}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="endDay" className='label'>
                                                            {' '}
                                                            {t('register_end_date')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="endDay"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    // data-enable-time
                                                                    options={{
                                                                        locale: {
                                                                            ...chosenLocale,
                                                                        },
                                                                        // enableTime: true,
                                                                        dateFormat: "d-m-Y",
                                                                        // time_24hr: true,
                                                                    }}
                                                                    value={dayjs(values?.endDay).format('DD-MM-YYYY')}
                                                                    onChange={(e: any) => {
                                                                        setFieldValue('endDay', e[0]);
                                                                    }}
                                                                    className="form-input calender-input"
                                                                    placeholder={`${t('choose_register_end_date')}`}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount ? errors.endDay ? <div className="mt-1 text-danger"> {`${errors.endDay}`} </div> : null : ''}
                                                        {submitCount ? dayjs(values?.startDay).isAfter(values.startDay) ? <div className="mt-1 text-danger"> {`${t('endtime_must_after_starttime')}`} </div> : null : ""}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label className="label" htmlFor="departure" > {t('departure')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field autoComplete="off"
                                                            name="departure"
                                                            type="text"
                                                            id="departure"
                                                            placeholder={`${t('enter_departure')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.departure ? (
                                                            <div className="text-danger mt-1"> {`${errors.departure}`} </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label className="label" htmlFor="destination" > {t('destination')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field autoComplete="off"
                                                            name="destination"
                                                            type="text"
                                                            id="destination"
                                                            placeholder={`${t('enter_destination')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.destination ? (
                                                            <div className="text-danger mt-1"> {`${errors.destination}`} </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="mb-5">
                                                        <label className="label" htmlFor="vehicle" > {t('vehicle')} < span style={{ color: 'red' }}>* </span></label >
                                                        <Field autoComplete="off"
                                                            name="vehicle"
                                                            type="text"
                                                            id="vehicle"
                                                            placeholder={`${t('enter_vehicle')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.vehicle ? (
                                                            <div className="text-danger mt-1"> {`${errors.vehicle}`} </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button data-testId="submit-modal-btn" type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button">
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
