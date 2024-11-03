import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconBack from '@/components/Icon/IconBack';
import Select from "react-select";
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
import dayjs from "dayjs";
import { createPosition } from '@/services/apis/position.api';
import { Positions } from '@/services/swr/position.swr';
import { useRouter } from 'next/router';
import { Humans } from '@/services/swr/human.swr';
import { GroupPositions } from '@/services/swr/group-position.swr';
import { DropdownRole } from '@/services/swr/dropdown.swr';
import { useDebounce } from 'use-debounce';
import { loadMore } from '@/utils/commons';
import { Timekeeper } from '@/services/swr/Timekeeper.swr';
import { createTimekeeper } from '@/services/apis/timekeeper.api';
import { createHistoryTimekeeping } from '@/services/apis/historyTimekeeping.api';
interface Props {
    [key: string]: any;
}

const AddHistory = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const router = useRouter();
    const [query, setQuery] = useState<any>();
    const [dataRepairDropdown, setDataRepairDropdown] = useState<any>([]);
    const [pageRepair, setPageRepair] = useState<any>(1);
    const [searchR, setSearchR] = useState<any>();
    //scroll
    const [dataHuman, setDataHuman] = useState<any>([]);
    const [pageHuman, setSizeHuman] = useState<any>(1);
    const [debouncedPage] = useDebounce(pageHuman, 500);
    const [debouncedQuery] = useDebounce(query, 500);
    const [dataTimekeeper, setDataTimekeeper] = useState<any>([]);
    const [pageTimekeeper, setSizeTimekeeper] = useState<any>(1);
    const [loadHuman, setLoadHuman] = useState(false)
    const [loadTimeKeeper, setTimeKeeper] = useState(false)
    //get data
    const { data: dropdownRepair, pagination: repairPagination, isLoading: repairLoading } = DropdownRole({ page: pageRepair, search: searchR })
    const { data: humans, pagination: paginationHuman } = Humans({ page: debouncedPage, search: debouncedQuery?.search });

    const { data: timekeepers, pagination: paginationTimekeeper, mutate } = Timekeeper({
        sortBy: 'id.ASC',
        ...router.query
    });
    const { data: group_position, pagination: pagination1, mutate: mutate1 } = GroupPositions({ sortBy: 'id.ASC' });

    const SubmittedForm = Yup.object().shape({
        staffId: Yup.string().required(`${t('please_fill_name_timekeeper')}`),
        timesheet: Yup.string().required(`${t('please_choose_timesheet')}`),
        address: Yup.string().required(`${t('please_choose_address')}`),
    });
    const handleDuty = (value: any) => {
        createHistoryTimekeeping({
            ...value,
            lat: parseInt(value?.lat),
            lon: parseInt(value?.lon),
            staffId: value?.staffId,

        }).then(() => {
            showMessage(`${t('create_timekeeping_history_success')}`, 'success');
            router.push('/hrm/timekeeping-history');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
        });
    }
    useEffect(() => {
        if (repairPagination?.page === undefined) return;
        if (repairPagination?.page === 1) {
            setDataRepairDropdown(dropdownRepair?.data)
        } else {
            setDataRepairDropdown([...dataRepairDropdown, ...dropdownRepair?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repairPagination]);
    //scroll
    const handleOnScrollBottom = () => {
        setLoadHuman(true)
        if (paginationHuman?.page < paginationHuman?.totalPages) {
            setSizeHuman(paginationHuman?.page + 1);
        }
    };
    const handleOnScrollBottom2 = () => {
        if (paginationTimekeeper?.page < paginationTimekeeper?.totalPages) {
            setSizeHuman(paginationTimekeeper?.page + 1);
        }
    };
    useEffect(() => {
        loadMore(humans, dataHuman, paginationHuman, setDataHuman, 'id', 'fullName', setLoadHuman)
    }, [paginationHuman, debouncedPage, debouncedQuery])
    const handleSearchR = (param: any) => {
        setSearchR(param)
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
                    <Link href="/hrm/timekeeping-history" className="text-primary hover:underline">
                        <span>{t('timekeeping-history')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('add_timekeeping')}</span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{t('add_timekeeping')}</h1>
                <Link href="/hrm/timekeeping-history">
                    <button type="button" className="btn btn-primary btn-sm m-1 back-button" >
                        <IconBack className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        <span>
                            {t('back')}
                        </span>
                    </button>
                </Link>
            </div>
            <Formik
                initialValues={
                    {
                        lat: "",
                        lon: "",
                        address: '',
                        timesheet: '',
                        staffId: "",
                    }
                }
                validationSchema={SubmittedForm}
                onSubmit={values => {
                    handleDuty(values);
                }}
            >
                {({ errors, touched, submitCount, setFieldValue, values }) => (
                    <Form className="space-y-5" >
                        <div className="flex justify-between gap-5">
                            <div className="w-1/2">
                                <label htmlFor="staffId" className='label'> {t('human_timekeeping')}< span style={{ color: 'red' }}> * </span></label >
                                <Select
                                    id='staffId'
                                    name='staffId'
                                    options={dataHuman}
                                    onMenuOpen={() => setSizeHuman(1)}
                                    onMenuScrollToBottom={() => handleOnScrollBottom()}
                                    isLoading={loadHuman}
                                    maxMenuHeight={160}
                                    placeholder={`${t('human_timekeeping')}`}
                                    onInputChange={(e) => handleSearchR(e)}
                                    onChange={(selectedOption: any) => {
                                        const assigneeId = selectedOption ? selectedOption.value : '';
                                        setFieldValue('staffId', assigneeId);
                                    }}
                                />
                                {submitCount && errors.staffId ? (
                                    <div className="text-danger mt-1"> {`${errors.staffId}`} </div>
                                ) : null}
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="address" className='label'> {t('address')} < span style={{ color: 'red' }}>* </span></label >
                                <Field autoComplete="off" name="address" type="text" id="address" placeholder={`${t('enter_address')}`} className="form-input" />
                                {submitCount ? errors.address ? (
                                    <div className="text-danger mt-1"> {errors.address} </div>
                                ) : null : ''}
                            </div>
                        </div>
                        <div className="flex justify-between gap-5">
                            <div className="mb-5 w-1/2">
                                <label htmlFor="lat" className='label'> {t('lat')} </label >
                                <Field autoComplete="off" name="lat" type="number" id="lat" placeholder={`${t('enter_lat')}`} className="form-input" />
                                {submitCount ? errors.lat ? (
                                    <div className="text-danger mt-1"> {errors.lat} </div>
                                ) : null : ''}
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="lon" className='label'> {t('lon')} </label >
                                <Field autoComplete="off" name="lon" type="number" id="lon" placeholder={`${t('enter_lon')}`} className="form-input" />
                                {submitCount ? errors.lon ? (
                                    <div className="text-danger mt-1"> {errors.lon} </div>
                                ) : null : ''}
                            </div>

                        </div>
                        <div className="flex justify-between gap-5">
                            <div className="mb-5 w-1/2">
                                <label htmlFor="timesheet">
                                    {t('timesheet')}<span style={{ color: 'red' }}>* </span>
                                </label>
                                <Flatpickr
                                    options={{
                                        locale: {
                                            ...chosenLocale,
                                        },
                                        enableTime: true,
                                        dateFormat: "d-m-Y H:i",
                                        time_24hr: true

                                    }}
                                    onChange={(e: any) => {
                                        if (e?.length > 0) {
                                            setFieldValue("timesheet", dayjs(e[0]).toISOString());
                                        }
                                    }}
                                    placeholder={`${t('choose_timesheet')}`}
                                    className="form-input calender-input"
                                />
                                {submitCount ? errors.timesheet ? <div className="mt-1 text-danger"> {errors.timesheet} </div> : null : ''}

                            </div>

                        </div>
                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left gap-8">
                            <Link href="/hrm/timekeeping-history">
                                <button type="button" className="btn btn-outline-danger cancel-button" >
                                    {t('cancel')}
                                </button>
                            </Link>
                            <button type="submit" className="btn :ml-4 rtl:mr-4 add-button" disabled={disabled}>
                                {props.data !== undefined ? t('update') : t('add')}
                            </button>
                        </div>

                    </Form>
                )}
            </Formik>

        </div>
    );
};

export default AddHistory;
