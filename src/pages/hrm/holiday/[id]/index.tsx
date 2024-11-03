import IconX from '@/components/Icon/IconX';
import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import IconBack from '@/components/Icon/IconBack';
import Link from 'next/link';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { listAllHuman } from '@/services/apis/human.api';
import { createHoliday, deleteHoliday, detailHoliday, updateHoliday } from '@/services/apis/holiday';
import dayjs from "dayjs";
import { showMessage } from '@/@core/utils';
import { useDebounce } from 'use-debounce';
import { loadMore } from '@/utils/commons';
import { Humans } from '@/services/swr/human.swr';
import { useRouter } from 'next/router';
import { Departments } from '@/services/swr/department.swr';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { IconLoading } from '@/components/Icon/IconLoading';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { Holidays } from '@/services/swr/holiday.swr';
import Swal from 'sweetalert2';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Loader } from '@mantine/core';
import { Lao } from "@/utils/lao"
import { IRootState } from '@/store';
import { clearDate } from '@/store/calendarSlice';
interface Props {
    [key: string]: any;
}
interface Human {
    value: number;
    label: string;
}
interface User {
    id: number;
    fullName: string;
}
const AddWorkScheduleModal = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const selectedDate = useSelector((state: IRootState) => state.calendar);
    const [isAdd, setIsAdd]= useState(false);
    const [loadDetail, setLoadDetail] = useState(true)

    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const [queryHuman, setQueryHuman] = useState<any>();
    const router = useRouter();
    //scroll
    const [loadHuman, setLoadHuman] = useState(false)

    const [dataHuman, setDataHuman] = useState<any>([]);
    const [pageHuman, setSizeHuman] = useState<any>(1);
    const [debouncedPageHuman] = useDebounce(pageHuman, 500);
    const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
    const [queryDepartment, setQueryDepartment] = useState<any>();
    const [loadDepartment, setLoadDepartment] = useState(false);
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [initialValue, setInitialValue] = useState<any>();

    const [pageDepartment, setSizeDepartment] = useState<any>(1);
    const [debouncedPage] = useDebounce(pageDepartment, 500);
    const [debouncedQuery] = useDebounce(queryDepartment, 500);
    const [query, setQuery] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>();
    const { data: departmentparents, pagination: paginationDepartment, isLoading: DepartmentLoading } = Departments({ page: debouncedPage, search: debouncedQuery?.search });
    const [disable, setDisable] = useState<any>(false);
    const dispatch = useDispatch();

    const { data: manages, pagination: paginationHuman } = Humans({
        sortBy: 'id.ASC',
        page: debouncedPageHuman,
        perPage: 10,
        search: debouncedQueryHuman?.search
    });
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_holiday')}` : (data ? t('update_holiday') : t('add_holiday'))));
    });
    useEffect(() => {
        if (Number(router.query.id)) {
            handleData();
            setQuery({ id: router.query.id, ...router.query })
        }
        if (router.query.id === "create") {
            setIsLoading(false);
        }

        setDisable(router.query.status === "true" ? true : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router])

    const handleData = () => {
        setLoadDetail(true)
        if (Number(router.query.id)) {
            detailHoliday(router.query.id).then((res: any) => {
                setLoadDetail(false)
                setData(res.data);
                setIsLoading(false);
            }).catch((err: any) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
    }

    const handleOnScrollBottomHuman = () => {
        setLoadHuman(true)
        if (paginationHuman?.page < paginationHuman?.totalPages) {
            setSizeHuman(paginationHuman?.page + 1);
        }
    };
    useEffect(() => {
        loadMore(departmentparents, dataDepartment, paginationDepartment, setDataDepartment, 'id', 'name', setLoadDepartment);
    }, [paginationDepartment, debouncedPage, debouncedQuery]);
    useEffect(() => {
        loadMore(manages, dataHuman, paginationHuman, setDataHuman, 'id', 'fullName', setLoadHuman);
    }, [paginationHuman, debouncedPageHuman, debouncedQueryHuman]);
    useEffect(() => {
        setInitialValue({
            users: data && data?.type === "HUMAN" ? t2 : [0],
            title: data ? `${data?.title}` : '',
            startDay: data ? data?.startDay : selectedDate?.startDate,
            endDay: data ? data?.endDay : selectedDate?.endDate,
            location: data ? `${data?.location}` : '',
            description: data?.description ? `${data?.description}` : '',
            // departments: data ? data.departments : [0],
            type: data ? `${data?.type}` : 'ALL',
            departments: data?.departments
                ? data?.departments?.map((i: any) => ({
                    value: i?.id,
                    label: i?.name,
                }))
                : [0],
        });
    }, [data, router]);
    const handleSearchDepartment = (param: any) => {
        setQueryDepartment({ search: param });
    };
    const handleSearchHuman = (param: any) => {
        setQueryHuman({ search: param });
    };
    ///////////////////
    const { t } = useTranslation();
    const SubmittedForm = Yup.object().shape({
        type: Yup.string().required(),
        title: Yup.string().required(`${t('please_fill_title_holiday_schedule')}`),
        startDay: Yup.date().typeError(`${t('please_fill_work_start_date')}`),
        endDay: Yup.date().typeError(`${t('please_fill_work_end_date')}`),
        description: Yup.string()
        // users: Yup.array()
        //     .min(1, `${t('please_select_the_staff')}`)
        //     .required(`${t('please_select_the_staff')}`),
        // departments: Yup.array()
        //     .min(1, `${t('please_select_the_staff')}`)
        //     .required(`${t('please_select_the_staff')}`),
    });
    const { isAddWorkScheduleModal, setIsAddWokScheduleModal, params, minStartDate, minEndDate, saveWorkSchedule } = props;
    const { data: holiday, pagination, mutate } = Holidays({ sortBy: 'id.ASC', ...router.query });

    const handleAddWorkSchedule = (value: any) => {
        setIsAdd(true)
        if (router.query.id === "create") {
            const user = value.users.map((i: any) => i.value)
            const department = value.departments.map((i: any) => i.value)
            createHoliday({
                ...value,
                users: user[0] ? user : [0],
                departments: department[0] ? department : [0],
            }).then(() => {
                showMessage(`${t('add_holiday_success')}`, 'success');
                dispatch(clearDate());
                router.push(`/hrm/holiday`);
            }).catch((err: any) => {
                setIsAdd(false)
                showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
                dispatch(clearDate());
            });
        } else {
            updateHoliday(router.query.id, {
                ...value,
                users: data?.users,
                departments: data?.departments,
            }).then(() => {
                showMessage(`${t('update_holiday_success')}`, 'success');
                router.push(`/hrm/holiday?page=${router?.query?.page}&perPage=${router?.query?.perPage}`);
            }).catch((err: any) => {
                setIsAdd(false)
                showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
            });
        }

    }
    const handleOnScrollBottom = () => {
        setLoadDepartment(true);
        setTimeout(() => {
            setSizeDepartment(paginationDepartment?.page + 1);
        }, 1000);
    };
    const { data: dataHuman2 } = Humans({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 200,
    });
    const t2 = data?.users?.map((user: User) => {
        return dataHuman2?.data?.filter((human: any) => user?.id === human?.id).map((human: any) => ({
            ...human,
            label: human?.fullName,
            value: human?.id
        }));
    }).flat();
    const handleDelete = (data: any) => {
        const swalDeletes = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary',
                cancelButton: 'btn btn-danger ltr:mr-3 rtl:ml-3',
                popup: 'confirm-popup confirm-delete',
            },
            imageUrl: '/assets/images/delete_popup.png',
            buttonsStyling: false,
        });
        swalDeletes
            .fire({
                title: `${t('delete_holiday')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data?.title}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    deleteHoliday(data?.id)
                        .then(() => {
                            showMessage(`${t('delete_holiday_schedule_success')}`, 'success');
                            mutate();
                            router.push(`/hrm/holiday?page=${router?.query?.page}&perPage=${router?.query?.perPage}`);
                        })
                        .catch(() => {
                            showMessage(`${t('delete_holiday_schedule_error')}`, 'error');
                        });
                }
            });
    };
    return (
        <div className="p-5">
              {(isLoading || loadDetail) && data && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <Link href="/hrm/holiday" className="text-primary hover:underline">
                        <span>{t('holiday')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_holiday') : t('add_holiday'))}
                        {
                            disable && t('detail_holiday')
                        }
                    </span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>
                    {!disable && (data ? t('update_holiday') : t('add_holiday'))}
                    {
                        disable && t('detail_holiday')
                    }
                </h1>
                <div className='flex' style={{ alignItems: "center" }}>
                    {
                        disable && <RBACWrapper
                            permissionKey={[
                                'holiday:update'
                            ]}
                            type={'AND'}>
                            <Link href={`/hrm/holiday/${router?.query.id}`}>
                                <button className="edit-page-btn btn btn-primary ltr:ml-4 rtl:mr-4 h-9">
                                    {t('edit')}
                                </button>
                            </Link>
                        </RBACWrapper>
                    }
                    <Link href="/hrm/holiday">
                        <div className="btn btn-primary btn-sm back-button m-1 h-9">
                            <IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                            <span>{t('back')}</span>
                        </div>
                    </Link>
                </div>
            </div>
            <Formik
                initialValues={initialValue}
                validationSchema={SubmittedForm}
                onSubmit={(values) => {
                    handleAddWorkSchedule(values);
                }}
                enableReinitialize
            >
                {({ errors, touched, submitCount, setFieldValue, values }) => (
                    <Form className="space-y-5">
                        <div className="mb-3 flex gap-2">
                            <div className="flex-1">
                                <label htmlFor="title">
                                    {t('holiday_title')}
                                    <span style={{ color: 'red' }}> *</span>
                                </label>
                                <Field
                                    disabled={disable}
                                    autoComplete="off"
                                    name="title"
                                    type="text"
                                    id="title"
                                    placeholder={t('fill_holiday_title')}
                                    className="form-input"
                                />
                                {submitCount ? errors.title ? <div className="mt-1 text-danger"> {`${errors.title}`} </div> : null : ''}
                            </div>
                        </div>

                        <div className="mb-3 flex gap-2">
                            <div className='flex-1'>
                                <label htmlFor="startDay">
                                    {t('from_time')}<span style={{ color: 'red' }}>* </span>
                                </label>
                                <Flatpickr
                                    disabled={disable}
                                    options={{
                                        enableTime: true,
                                        dateFormat: "d-m-Y H:i",
                                        time_24hr: true,
                                        locale: {
                                            ...chosenLocale,
                                        },
                                    }}
                                    value={dayjs(values?.startDay).format('DD-MM-YYYY HH:mm')}
                                    onChange={(e: any) => {
                                        if (e?.length > 0) {
                                            setFieldValue("startDay", dayjs(e[0]).toISOString());
                                        }
                                    }}
                                    placeholder={`${t('choose_from_time')}`}
                                    className="form-input calender-input"
                                />
                                {submitCount ? errors.startDay ? <div className="mt-1 text-danger"> {`${errors.startDay}`} </div> : null : ''}
                            </div>
                            <div className='flex-1'>
                                <label htmlFor="endDay">
                                    {t('end_time')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Flatpickr
                                    disabled={disable}
                                    options={{
                                        enableTime: true,
                                        dateFormat: "d-m-Y H:i",
                                        time_24hr: true,
                                        locale: {
                                            ...chosenLocale,
                                        },
                                    }}
                                    value={dayjs(values?.endDay).format('DD-MM-YYYY HH:mm')}

                                    placeholder={`${t('choose_end_time')}`}
                                    onChange={(e: any) => {
                                        if (e?.length > 0) {
                                            setFieldValue("endDay", dayjs(e[0]).toISOString());
                                        }
                                    }}
                                    className="form-input calender-input"
                                />
                                {submitCount ? errors.endDay ? <div className="mt-1 text-danger"> {`${errors.endDay}`} </div> : null : ''}
                            </div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description">{t('description')}</label>
                            <Field
                                disabled={disable}
                                autoComplete="off" id="description" as="textarea" rows="2" name="description" className="form-input" placeholder={t('fill_description')} />
                        </div>
                        <div className="flex">
                            <div className="w-1/2 mb-3">
                                <label htmlFor="type">
                                    {t('participants')}
                                    <span style={{ color: 'red' }}> *</span>
                                </label>
                                <div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
                                    <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                        <Field
                                            disabled={router.query.id !== "create"}
                                            autoComplete="off"
                                            type="radio"
                                            name="type"
                                            value={true}
                                            checked={values?.type === "ALL"}
                                            className="form-checkbox rounded-full"
                                            onChange={(e: any) => {
                                                if (e.target.checked) {
                                                    setFieldValue('type', "ALL");
                                                } else {
                                                    setFieldValue('type', "HUMAN");
                                                }
                                            }}
                                        />
                                        {t('allHuman')}
                                    </label>
                                    <label style={{ marginBottom: 0 }}>
                                        <Field
                                            disabled={router.query.id !== "create"}
                                            autoComplete="off"
                                            type="radio"
                                            name="type"
                                            value={false}
                                            checked={values?.type === "HUMAN"}
                                            className="form-checkbox rounded-full"
                                            onChange={(e: any) => {
                                                if (e.target.checked) {
                                                    setFieldValue('type', "HUMAN");
                                                } else {
                                                    setFieldValue('type', "ALL");
                                                }
                                            }}
                                        />
                                        {t('choose_human')}
                                    </label>
                                </div>
                            </div>

                        </div>
                        {
                            values?.type === "HUMAN" && <div className="flex justify-between gap-5" style={{ marginTop: '10px' }}>
                                <div className="mb-5 w-1/2">
                                    <label htmlFor="departments">
                                        {' '}
                                        {t('departmentParticipate')}
                                    </label>
                                    <Select
                                        isDisabled={router.query.id !== "create"}
                                        id="departments"
                                        name="departments"
                                        placeholder={t('choose_department')}
                                        onInputChange={(e) => handleSearchDepartment(e)}
                                        options={dataDepartment}
                                        // isDisabled={true}
                                        isLoading={loadDepartment}
                                        onMenuOpen={() => setSizeDepartment(1)}
                                        onMenuScrollToBottom={() => handleOnScrollBottom()}
                                        maxMenuHeight={160}
                                        isMulti
                                        closeMenuOnSelect={false}
                                        value={values.departments}
                                        onChange={(e) => {
                                            setFieldValue('departments', e);
                                        }}
                                    />
                                </div>
                                <div className="mb-5 w-1/2">
                                    <label htmlFor="users">
                                        {' '}
                                        {t('usersParticipate')}
                                    </label>
                                    <Select
                                        isDisabled={router.query.id !== "create"}
                                        value={values?.users}
                                        id="users"
                                        name="users"
                                        options={dataHuman}
                                        onInputChange={(e) => handleSearchHuman(e)}
                                        onMenuOpen={() => setSizeHuman(1)}
                                        onMenuScrollToBottom={() => handleOnScrollBottomHuman()}
                                        isLoading={loadHuman}
                                        isMulti
                                        closeMenuOnSelect={false}
                                        isSearchable
                                        defaultInputValue={t2}
                                        placeholder={`${t('choose_participants')}`}
                                        onChange={(e) => {
                                            setFieldValue('users', e);
                                        }}
                                    />
                                </div>
                            </div>
                        }
                        <div className="!mt-8 flex items-center justify-end">
                            <Link href="/hrm/holiday">
                                {
                                    !disable && <button type="button" className="btn btn-outline-danger cancel-button">
                                        {t('cancel')}
                                    </button>
                                }
                            </Link>
                            {
                                disable && <RBACWrapper
                                    permissionKey={[
                                        'holiday:remove'
                                    ]}
                                    type={'AND'}
                                >
                                    <button type="button" className="btn btn-outline-danger ltr:ml-4 rtl:mr-4" onClick={() => handleDelete(data)}>
                                        {t('delete')}
                                    </button>
                                </RBACWrapper>
                            }
                            {
                                !disable && <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => console.log(errors)}>
                                  {isAdd ? <Loader size="sm" /> :  data ? t('update') : t('add')}
                                </button>
                            }

                        </div>
                    </Form>
                )}
            </Formik>
        </div>

    );
};

export default AddWorkScheduleModal;
