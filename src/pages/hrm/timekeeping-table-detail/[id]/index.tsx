import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import AnimateHeight from 'react-animate-height';
import Link from 'next/link';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import IconBack from '@/components/Icon/IconBack';
import DetailModal from '../modal/DetailModal';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { useProfile } from '@/services/swr/profile.swr';
import dayjs from 'dayjs';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import { TimekeepingDetails } from '@/services/swr/timekeeping.swr';
import { GetTimekeeping } from '@/services/apis/timekeeping.api';
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
import { setIsReload } from '@/store/timekeepingTableSlice';
import { IRootState } from '@/store';

interface Props {
    [key: string]: any;
}

const DetailPage = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const timekeepingTable = useSelector((state: IRootState) => state.timekeepingTable);
    const { t } = useTranslation();
    const router = useRouter();
    const { month, year } = router.query;
    const [dataDetail, setDataDetail] = useState<any>();
    const [listDataDetail, setListDataDetail] = useState<any>();
    const [openModal, setOpenModal] = useState(false);
    const [query, setQuery] = useState<any>({});
    const [active, setActive] = useState<any>([1, 2]);
    const [initialValue, setInitialValue] = useState<any>();
    const [data, setData] = useState<any>();
    const formRef = useRef<any>();
    useEffect(() => {
        dispatch(setIsReload(true));
    });
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [loadingSave, setLoadingSave] = useState(false);
    const { data: userData } = useProfile();
    // get data
    const { data: timekeepingDetails, pagination, mutate, isLoading } = TimekeepingDetails({ ...query });

    useEffect(() => {
        dispatch(setPageTitle(`${t('timekeeping')}`));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(timekeepingDetails?.data);
        }
    }, [timekeepingDetails?.data, router]);
    const handleChangePage = (page: number, pageSize: number) => {
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: page,
                    perPage: pageSize,
                },
            },
            undefined,
            { shallow: true },
        );
        return pageSize;
    };
    useEffect(() => {
        if (Number(router.query.id)) {
            handleData();
            setQuery({ id: router.query.id, ...router.query });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const handleData = () => {
        setLoadingSave(true);
        GetTimekeeping({ id: router.query.id })
            .then((res) => {
                setData(res.data);
                setLoadingSave(false);
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
                setLoadingSave(false);
            });
    };

    useEffect(() => {
        setInitialValue({
            name: data ? data?.staff?.fullName : "",
            position: data ? data?.staff?.position?.name : "",
            department: data ? data?.staff?.department?.name : "",
            requestDate: data ? data?.createdAt : new Date(),
            weekdayWork: data ? data?.weekdayWork : null,
            extraWork: data ? data?.extraWork : null,
            holidayWork: data ? data?.holidayWork : null,
            dayOffWork: data ? data?.dayOffWork : null,
            bussinessWork: data ? data?.bussinessWork : null,
            totalWork: data ? data?.totalWork : null,
            // "status": 0,
        });
    }, [data, router]);

    const SubmittedForm = Yup.object().shape({
        moneyTotal: Yup.string()
            .matches(/^[\d,]+$/, `${t('please_fill_valid_number')}`)
            .required(`${t('please_fill_money_number')}`),
    });

    const handleEdit = (data: any) => {
        setDataDetail(data);
        setOpenModal(true);
    };

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: Number(router.query.id) ? 'rgb(235 235 235) !important' : 'white !important',
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            borderColor: Number(router.query.id) && 'rgb(224 230 237 / var(1))',
        }),
    };

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'time',
            title: `${t('time')}`,
            sortable: false,
            render: (records: any, index: any) => <span>{dayjs(records?.time).format('DD-MM-YYYY')}</span>,
        },
        {
            accessor: 'weekdayWork',
            title: `${t('weekdayWork')}`,
            sortable: false
        },
        {
            accessor: 'extraWork',
            title: `${t('extraWork')}`,
            sortable: false
        },
        {
            accessor: 'holidayWork',
            title: `${t('holidayWork')}`,
            sortable: false
        },
        {
            accessor: 'dayOffWork',
            title: `${t('dayOffWork')}`,
            sortable: false
        },
        {
            accessor: 'bussinessWork',
            title: `${t('bussinessWork')}`,
            sortable: false
        },
        {
            accessor: 'totalWork',
            title: `${t('totalWork')}`,
            sortable: false
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="mx-auto flex w-max items-center gap-2">
                    <RBACWrapper
                        permissionKey={['timekeepingStaff:update']}
                        type={'OR'}>
                        <button className="button-detail" type="button" onClick={() => handleEdit(records)}>
                            <IconNewEdit /> <span>{`${t('edit')}`}</span>
                        </button>
                    </RBACWrapper>
                </div>
            ),
        },
    ];

    const columnHistorys = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'action',
            title: `${t('action_type')}`,
            render: ({ action }: any) => <span>{action === 'FORWARD' || action === 'SUBMIT' ? 'Trình ký' : action === 'REJECT' ? 'Từ chối' : 'Duyệt'}</span>,
            sortable: false,
        },
        {
            accessor: 'approver',
            title: `${t('executor')}`,
            render: ({ approver }: any) => <span>{approver?.fullName}</span>,
            sortable: false,
        },
        {
            accessor: 'submittedAt',
            title: `${t('exe_day')}`,
            render: ({ submittedAt }: any) => <span>{moment(submittedAt).format('DD/MM/YYYY hh:mm:ss')}</span>,
            sortable: false,
        },
        { accessor: 'comment', title: `${t('description')}`, sortable: false },
    ];

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };
    const RenturnError = (param: any) => {
        if (Object.keys(param?.errors || {}).length > 0 && param?.submitCount > 0) {
            showMessage(`${t('please_add_infomation')}`, 'error');
        }
        return <></>;
    };

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit();
        }
    };

    return (
        <div>
            {(isLoading || loadingSave) && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )}
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">
                    {t('timekeeping_table_detail_info')} <span className='uppercase' style={{ color: "red" }}>{data?.staff?.fullName}</span> - {month}/{year}
                </h1>
                <div className="flex" style={{ alignItems: 'center' }}>
                    <Link href="/hrm/timekeeping-table">
                        <div className="btn btn-primary btn-sm back-button m-1 h-9">
                            <IconBack />
                            <span>{t('back')}</span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="mb-5">
                <div className="font-semibold">
                    <div className="rounded">
                        <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(1)}>
                            {t('timekeeping_staff_infomation')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`mb-2 ${active.includes(1) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                <Formik
                                    initialValues={initialValue}
                                    validationSchema={SubmittedForm}
                                    onSubmit={(values: any) => {

                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5">
                                            <div className="p-4">
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="name" className="label">
                                                            {' '}
                                                            {t('name_staff')}
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="name" id="name" className="form-input"></Field>
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="position" className="label">
                                                            {' '}
                                                            {t('duty')}
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="position" id="position" className="form-input"></Field>
                                                    </div>
                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="department" className="label">
                                                            {' '}
                                                            {t('department')}
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="department" id="department" className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="requestDate" className="label">
                                                            {' '}
                                                            {t('submitday')}
                                                        </label>
                                                        <Flatpickr
                                                            name="requestDate"
                                                            disabled
                                                            options={{
                                                                enableTime: false,
                                                                dateFormat: 'd-m-Y',
                                                            }}
                                                            value={dayjs(values?.requestDate).format('DD-MM-YYYY')}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('choose_submit_day')}`}
                                                        />
                                                        {submitCount ? errors.requestDate ? <div className="mt-1 text-danger"> {`${errors.requestDate}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="bussinessWork">
                                                            {' '}
                                                            {t('bussinessWork')}
                                                        </label>
                                                        <Field
                                                            disabled
                                                            autoComplete="off" name="bussinessWork" type="number" id="bussinessWork" placeholder={`${t('enter_bussinessWork')}`} className="form-input" />
                                                        {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.bussinessWork}`} </div> : null : ''}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="enter_dayOffWork">
                                                            {' '}
                                                            {t('dayOffWork')}
                                                        </label>
                                                        <Field
                                                            disabled
                                                            autoComplete="off" name="dayOffWork" type="number" id="dayOffWork" placeholder={`${t('enter_dayOffWork')}`} className="form-input" />
                                                        {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.enter_dayOffWork}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="holidayWork">
                                                            {' '}
                                                            {t('holidayWork')}
                                                        </label>
                                                        <Field autoComplete="off"
                                                            disabled
                                                            name="holidayWork" type="number" id="holidayWork" placeholder={`${t('enter_holidayWork')}`} className="form-input" />
                                                        {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.enter_holidayWork}`} </div> : null : ''}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="weekdayWork">
                                                            {' '}
                                                            {t('weekdayWork')}
                                                        </label>
                                                        <Field
                                                            disabled
                                                            autoComplete="off" name="weekdayWork" type="number" id="weekdayWork" placeholder={`${t('enter_weekdayWork')}`} className="form-input" />
                                                        {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.enter_weekdayWork}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="extraWork">
                                                            {' '}
                                                            {t('extraWork')}
                                                        </label>
                                                        <Field
                                                            disabled
                                                            autoComplete="off" name="extraWork" type="number" id="extraWork" placeholder={`${t('enter_extraWork')}`} className="form-input" />
                                                        {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.enter_extraWork}`} </div> : null : ''}
                                                    </div>
                                                    <div className="w-1/2">
                                                        <label htmlFor="totalWork">
                                                            {' '}
                                                            {t('totalWork')}
                                                        </label>
                                                        <Field autoComplete="off" name="totalWork"
                                                            disabled
                                                            type="number" id="totalWork" placeholder={`${t('enter_totalWork')}`} className="form-input" />
                                                        {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {`${errors.enter_totalWork}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </Form>
                                    )}
                                </Formik>
                            </AnimateHeight>
                        </div>
                    </div>
                    <div className="rounded">
                        <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(2)}>
                            {t('detail_timekeeping_staff')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(2) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`${active.includes(2) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(2) ? 'auto' : 0}>
                                <div className="p-4">
                                    <div className="datatables">
                                        <DataTable
                                            highlightOnHover
                                            className="whitespace-nowrap table-hover custom_table"
                                            records={listDataDetail}
                                            columns={columns}
                                            totalRecords={pagination?.totalRecords}
                                            recordsPerPage={pagination?.perPage}
                                            page={pagination?.page}
                                            onPageChange={(p) => handleChangePage(p, pagination?.perPage)}
                                            recordsPerPageOptions={PAGE_SIZES}
                                            onRecordsPerPageChange={e => handleChangePage(pagination?.page, e)}
                                            sortStatus={sortStatus}
                                            onSortStatusChange={setSortStatus}
                                            minHeight={200}
                                            paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`}
                                        />
                                    </div>
                                </div>
                                <DetailModal
                                    openModal={openModal}
                                    setOpenModal={setOpenModal}
                                    data={dataDetail}
                                    setData={setData}
                                    mutate={mutate}
                                    setLoadingSave={setLoadingSave}
                                    handleData={handleData}
                                />
                            </AnimateHeight>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
export default DetailPage;
