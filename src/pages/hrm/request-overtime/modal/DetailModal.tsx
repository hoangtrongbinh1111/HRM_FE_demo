import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import { AddRequestOvertimeDetail, EditRequestOvertimeDetail } from '@/services/apis/request-overtime.api';
import { DropdownInventory, DropdownProducts } from '@/services/swr/dropdown.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { loadMore, makeRamdomText } from '@/utils/commons';
import { formatNumber, moneyToNumber, moneyToText } from '@/utils/commons';
import { useProfile } from '@/services/swr/profile.swr';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import dayjs from 'dayjs';
import moment from 'moment';
import { useDebounce } from 'use-debounce';
import { Humans } from '@/services/swr/human.swr';
import { DropdownUsers } from '@/services/swr/dropdown.swr';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { Loader } from '@mantine/core';

interface Props {
    [key: string]: any;
}
interface User {
    id: number;
    fullName: string;
}

interface Human {
    value: number;
    label: string;
}
const DetailModal = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const { data: userData } = useProfile();
    const [loadHuman, setLoadHuman] = useState(false)
    const [queryHuman, setQueryHuman] = useState<any>();
    const [dataHuman, setDataHuman] = useState<any>([]);
    const [pageHuman, setSizeHuman] = useState<any>(1);
    const [debouncedPageHuman] = useDebounce(pageHuman, 500);
    const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
    const [dataStaffDropdown, setDataStaffDropdown] = useState<any>([]);
    const [searchStaff, setSearchStaff] = useState<any>();
    const [page, setPage] = useState(1);
    const { data: staffDropdown, pagination: staffPagination, isLoading: staffLoading } = DropdownUsers({
        page: debouncedPageHuman,
        perPage: 10,
        departmentId: props?.departmentId,
        search: debouncedQueryHuman?.search,
    });
    useEffect(() => {
        if (staffPagination?.page === undefined) return;
        if (staffPagination?.page === 1) {
            setDataStaffDropdown(staffDropdown?.data);
        } else {
            setDataStaffDropdown([...dataStaffDropdown, ...staffDropdown?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffPagination]);
    const handleOnScrollBottomHuman = () => {
        setLoadHuman(true);
        if (staffPagination?.page < staffPagination?.totalPages) {
            setSizeHuman(staffPagination?.page + 1);
        }
    };
    useEffect(() => {
        loadMore(staffDropdown, dataHuman, staffPagination, setDataHuman, 'id', 'fullName', setLoadHuman);
    }, [staffPagination, debouncedPageHuman, debouncedQueryHuman]);

    const SubmittedForm = Yup.object().shape({
        startTime: Yup.string()
            .required(`${t('please_choose_from_day')}`),
        endTime: Yup.string()
            .required(`${t('please_choose_end_day')}`)
            .test("is-greater", `${t('endtime_must_after_starttime')}`, function (value) {
                const { startTime, endTime } = this.parent;
                const startTimeMoment = moment(startTime, 'HH:mm:ss');
                const endTimeMoment = moment(endTime, 'HH:mm:ss');
                return endTimeMoment.isSameOrAfter(startTimeMoment);
            }),
        staffId: Yup.object().shape({
            value: Yup.number()
                .typeError(''),
            label: Yup.string().required()
        }).typeError(`${t('please_choose_staff')}`)
    })
    const [isSubmit, setIsSubmit] = useState(false);

    const handleRequestOvertime = (param: any) => {
        if (Number(router.query.id)) {
            setIsSubmit(true);
            const query = {
                startTime: param?.startTime,
                endTime: param?.endTime,
                staffId: param?.staffId?.value
            };
            if (props?.data) {
                EditRequestOvertimeDetail({ id: router.query.id, detailId: props?.data?.id, ...query }).then(() => {
                    handleCancel();
                    showMessage(`${t('edit_success')}`, 'success');
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                }).finally(() => {
                    setIsSubmit(false);
                });
            } else {
                AddRequestOvertimeDetail({ id: router.query.id, ...query }).then(() => {
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
                startTime: param?.startTime,
                endTime: param?.endTime,
                staffId: param?.staffId?.value,
                staffName: param?.staffId?.label
            };
            if (props?.data) {
                const filteredItems = props.listData.find((item: any) => item.id === props.data.id)
                const updatedItems = {
                    id: filteredItems.id,
                    startTime: param?.startTime,
                    endTime: param?.endTime,
                    staffId: param?.staffId?.id,
                    staffName: param?.staffId?.label
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
        props.requestOvertimeDetailMutate();
        // props.setData();
    };
    const { data: dataHuman2 } = Humans({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 200,
    });
    const t2 = {
        ...dataHuman2?.data?.find((human: any) => props?.data?.staffId === human?.id),
        label: `${dataHuman2?.data?.find((human: any) => props?.data?.staffId === human?.id)?.fullName} - ${dataHuman2?.data?.find((human: any) => props?.data?.staffId === human?.id)?.department?.name}`,
        value: dataHuman2?.data?.find((human: any) => props?.data?.staffId === human?.id)?.id
    };
    useEffect(() => {
        setInitialValue({
            startTime: props?.data ? moment(props?.data?.startTime, 'HH:mm:ss').format('HH:mm:ss') : "",
            endTime: props?.data ? moment(props?.data?.endTime, 'HH:mm:ss').format('HH:mm:ss') : "",
            staffId: props?.data ? t2 : null
        })
    }, [props?.data]);
    const handleSearchHuman = (param: any) => {
        setQueryHuman({ search: param });
    };

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
                                            onSubmit={values => {
                                                handleRequestOvertime(values);
                                            }}
                                            // onSubmit={async (values, { resetForm }) => {
                                            //     await handleRequestOvertime(values)
                                            //     // resetForm()
                                            // }}
                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5" >
                                                    <div className="mb-5">
                                                        <label htmlFor="staff" className='label'>
                                                            {' '}
                                                            {t('staff')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Select
                                                            value={values?.staffId}
                                                            id="staffId"
                                                            name="staffId"
                                                            closeMenuOnSelect={true}
                                                            options={dataStaffDropdown.map((item: any) => {
                                                                return {
                                                                    value: item.value,
                                                                    label: `${item.label} - ${item.department_name}`,
                                                                    department: item.department_name
                                                                }
                                                            })}
                                                            onInputChange={(e) => handleSearchHuman(e)}
                                                            onMenuOpen={() => setPage(1)}
                                                            onMenuScrollToBottom={() => handleOnScrollBottomHuman()}
                                                            isLoading={staffLoading}
                                                            placeholder={`${t('choose_staff')}`}
                                                            isSearchable
                                                            maxMenuHeight={160}
                                                            onChange={(e) => {
                                                                setFieldValue('staffId', e);
                                                            }}
                                                        />
                                                        {submitCount && errors.staffId ? (
                                                            <div className="text-danger mt-1"> {`${errors.staffId}`} </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="mb-5" id="startTimeOT">
                                                        <label htmlFor="startTime" className='label'>
                                                            {' '}
                                                            {t('register_from_date')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="startTime"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    {...field}
                                                                    options={{
                                                                        static: true,
                                                                        enableTime: true,
                                                                        noCalendar: true,
                                                                        dateFormat: 'H:i',
                                                                        time_24hr: true,
                                                                        // locale: {
                                                                        //     ...chosenLocale,
                                                                        // },
                                                                    }}
                                                                    value={moment(values?.startTime, 'HH:mm:ss').format('HH:mm:ss')}
                                                                    onChange={(e: any) => {
                                                                        setFieldValue('startTime', moment(e[0]).format('HH:mm:ss'));
                                                                    }}
                                                                    className="calender-input form-input"
                                                                    placeholder={`${t('choose_register_start_date')}`}
                                                                />
                                                            )}
                                                        />

                                                        {submitCount ? errors.startTime ? <div className="mt-1 text-danger"> {`${errors.startTime}`} </div> : null : ''}
                                                        {submitCount ? dayjs(values?.startTime).isAfter(values.startTime) ? <div className="mt-1 text-danger"> {`${t('starttime_must_before_endtime')}`} </div> : null : ""}
                                                    </div>
                                                    <div className="mb-5" id="endTimeOT">
                                                        <label htmlFor="endTime" className='label'>
                                                            {' '}
                                                            {t('register_end_date')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            style={{ width: "100%" }}
                                                            autoComplete="off"
                                                            name="endTime"
                                                            render={({ field }: any) => (
                                                                <Flatpickr
                                                                    {...field}
                                                                    options={{
                                                                        static: true,
                                                                        enableTime: true,
                                                                        noCalendar: true,
                                                                        dateFormat: 'H:i',
                                                                        time_24hr: true,
                                                                        // locale: {
                                                                        //     ...chosenLocale,
                                                                        // },
                                                                    }}
                                                                    value={moment(values?.endTime, 'HH:mm:ss').format('HH:mm:ss')}
                                                                    onChange={(e: any) => {
                                                                        setFieldValue('endTime', moment(e[0]).format('HH:mm:ss'));
                                                                    }}
                                                                    className="calender-input form-input"
                                                                    placeholder={`${t('choose_register_end_date')}`}
                                                                />
                                                            )}
                                                        />
                                                        {submitCount ? errors.endTime ? <div className="mt-1 text-danger"> {`${errors.endTime}`} </div> : null : ''}
                                                        {submitCount ? dayjs(values?.startTime).isAfter(values.startTime) ? <div className="mt-1 text-danger"> {`${t('endtime_must_after_starttime')}`} </div> : null : ""}
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
