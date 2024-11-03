import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { RepairDetails } from '@/services/swr/repair.swr';
import { GetRepair } from '@/services/apis/repair.api';
import { Field, Form, Formik } from 'formik';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import { DropdownUsers } from '@/services/swr/dropdown.swr';
import Select from 'react-select';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import moment from 'moment';
import IconX from '@/components/Icon/IconX';
import { Transition, Dialog } from '@headlessui/react';

interface Props {
    [key: string]: any;
}

const HistoryModal = ({ ...props }: Props) => {

    const { t } = useTranslation();
    const router = useRouter();

    const [data, setData] = useState<any>();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataUserDropdown, setDataUserDropdown] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [active, setActive] = useState<any>([1, 2]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const formRef = useRef<any>();

    // get data
    const { data: repairDetails, pagination, mutate, isLoading } = RepairDetails({ id: props.id });
    const { data: users, pagination: paginationUser, isLoading: userLoading } = DropdownUsers({ page: page });

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'replacementPart',
            title: `${t('name_product')}`,
            render: ({ replacementPart }: any) => <span>{replacementPart?.name}</span>,
            sortable: false
        },
        { accessor: 'quantity', title: `${t('quantity')}`, sortable: false },
        { accessor: 'brokenPart', title: `${t('broken_part')}`, sortable: false },
        { accessor: 'description', title: `${t('notes')}`, sortable: false },
    ]

    const handleCancel = () => {
        props.setOpenModal(false);
    };

    useEffect(() => {
        setInitialValue({
            vehicleRegistrationNumber: data ? `${data?.vehicle?.registrationNumber}` : "",
            repairById: data ? {
                value: `${data?.repairBy?.id}`,
                label: `${data?.repairBy?.fullName}`
            } : "",
            description: data ? `${data?.description}` : "",
            damageLevel: data ? `${data?.damageLevel}` : "",
            personRequest: data?.createdBy ? data?.createdBy.fullName : JSON.parse(localStorage.getItem('profile') || "").fullName,
            timeRequest: data?.createdAt ? data?.createdAt : moment().format("YYYY-MM-DD hh:mm"),
            customerName: data ? `${data?.customerName}` : ""
        })
    }, [data]);

    useEffect(() => {
        if (paginationUser?.page === undefined) return;
        if (paginationUser?.page === 1) {
            setDataUserDropdown(users?.data)
        } else {
            setDataUserDropdown([...dataUserDropdown, ...users?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationUser])

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(paginationUser?.page + 1);
        }, 1000);
    }

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    }

    useEffect(() => {
        if (Number(props.id)) {
            GetRepair({ id: props.id }).then((res) => {
                setData(res.data);
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.id]);

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

                <div className="fixed inset-0 overflow-y-auto min-w-[1000px]">
                    <div className="flex min-h-full w-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel min-w-full max-w-lg overflow-hidden rounded-2xl border-0 p-0 text-[#476704] dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {t('repair_history')}
                                </div>
                                <div className="mb-5 p-5">
                                    <div className="font-semibold">
                                        <div className="rounded">
                                            <button
                                                type="button"
                                                className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                                onClick={() => handleActive(1)}
                                            >
                                                {t('repair_infomation')}
                                                <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>
                                            <div className={`mb-2 ${active.includes(1) ? 'custom-content-accordion' : ''}`}>
                                                <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                                    <Formik
                                                        initialValues={initialValue}
                                                        validationSchema={{}}
                                                        onSubmit={values => { }}
                                                        enableReinitialize
                                                        innerRef={formRef}
                                                    >

                                                        {({ errors, values, submitCount, setFieldValue }) => (
                                                            <Form className="space-y-5" >
                                                                <div className='p-4'>
                                                                    <div className='flex justify-between gap-5 mt-5 mb-5'>
                                                                        <div className="w-1/2">
                                                                            <label htmlFor="personRequest" className='label'> {t('person_request')} < span style={{ color: 'red' }}>* </span></label >
                                                                            <Field
                                                                                autoComplete="off"
                                                                                name="personRequest"
                                                                                type="text"
                                                                                id="personRequest"
                                                                                placeholder={`${t('enter_code')}`}
                                                                                className={true ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                                disabled={true}
                                                                            />
                                                                            {submitCount && errors.personRequest ? (
                                                                                <div className="text-danger mt-1"> {`${errors.personRequest}`} </div>
                                                                            ) : null}
                                                                        </div>
                                                                        <div className="w-1/2">
                                                                            <label htmlFor="timeRequest" className='label'> {t('time_request')} < span style={{ color: 'red' }}>* </span></label >
                                                                            <Field
                                                                                autoComplete="off"
                                                                                name="timeRequest"
                                                                                render={({ field }: any) => (
                                                                                    <Flatpickr
                                                                                        data-enable-time
                                                                                        options={{
                                                                                            enableTime: true,
                                                                                            dateFormat: 'd/m/Y H:i'
                                                                                        }}
                                                                                        value={moment().format("DD/MM/YYYY hh:mm")}
                                                                                        className={true ? "form-input bg-[#f2f2f2] calender-input" : "form-input calender-input"}
                                                                                        disabled={true}
                                                                                    />
                                                                                )}
                                                                            />
                                                                            {submitCount && errors.estimatedDeliveryDate ? (
                                                                                <div className="text-danger mt-1"> {`${errors.estimatedDeliveryDate}`} </div>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex justify-between gap-5 mt-5'>
                                                                        <div className="w-1/2">
                                                                            <label htmlFor="repairById" className='label' > {t('repair_by_id')} < span style={{ color: 'red' }}>* </span></label >
                                                                            <Select
                                                                                id='repairById'
                                                                                name='repairById'
                                                                                options={dataUserDropdown}
                                                                                maxMenuHeight={160}
                                                                                value={values?.repairById}
                                                                                onMenuOpen={() => setPage(1)}
                                                                                onMenuScrollToBottom={handleMenuScrollToBottom}
                                                                                isLoading={userLoading}
                                                                                onChange={e => {
                                                                                    setFieldValue('repairById', e)
                                                                                }}
                                                                                isDisabled={true}
                                                                            />
                                                                            {submitCount && errors.repairById ? (
                                                                                <div className="text-danger mt-1"> {`${errors.repairById}`} </div>
                                                                            ) : null}
                                                                        </div>
                                                                        <div className="w-1/2">
                                                                            <label htmlFor="type" className='label'> {t('vehicle_registration_number')} < span style={{ color: 'red' }}>* </span></label >
                                                                            <Field
                                                                                autoComplete="off"
                                                                                name="vehicleRegistrationNumber"
                                                                                type="text"
                                                                                id="vehicleRegistrationNumber"
                                                                                placeholder={`${t('enter_type')}`}
                                                                                className={true ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                                disabled={true}
                                                                            />
                                                                            {submitCount && errors.vehicleRegistrationNumber ? (
                                                                                <div className="text-danger mt-1"> {`${errors.vehicleRegistrationNumber}`} </div>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex justify-between gap-5 mt-5'>
                                                                        <div className="w-1/2">
                                                                            <label htmlFor="customerName" className='label'> {t('name_customer')} < span style={{ color: 'red' }}>* </span></label >
                                                                            <Field
                                                                                autoComplete="off"
                                                                                name="customerName"
                                                                                type="text"
                                                                                id="customerName"
                                                                                placeholder={`${t('enter_name_customer')}`}
                                                                                className={true ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                                disabled={true}
                                                                            />
                                                                            {submitCount && errors.customerName ? (
                                                                                <div className="text-danger mt-1"> {`${errors.customerName}`} </div>
                                                                            ) : null}
                                                                        </div>
                                                                        <div className='w-1/2'></div>
                                                                    </div>
                                                                    <div className='mt-5'>
                                                                        <label htmlFor="description" className='label'> {t('description')}</label >
                                                                        <Field
                                                                            autoComplete="off"
                                                                            name="description"
                                                                            as="textarea"
                                                                            id="description"
                                                                            placeholder={`${t('enter_description')}`}
                                                                            className={true ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                            disabled={true}
                                                                        />
                                                                        {submitCount && errors.description ? (
                                                                            <div className="text-danger mt-1"> {`${errors.description}`} </div>
                                                                        ) : null}
                                                                    </div>
                                                                    <div className='mt-5'>
                                                                        <label htmlFor="damageLevel" className='label'> {t('damage_level')} </label >
                                                                        <Field
                                                                            autoComplete="off"
                                                                            name="damageLevel"
                                                                            as="textarea"
                                                                            id="damageLevel"
                                                                            className={true ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                            disabled={true}
                                                                            placeholder={`${t('enter_damage_level')}`}
                                                                        />
                                                                        {submitCount && errors.damageLevel ? (
                                                                            <div className="text-danger mt-1"> {`${errors.damageLevel}`} </div>
                                                                        ) : null}
                                                                    </div>
                                                                    <div className='mt-5'>
                                                                        <label htmlFor="attachedImage" className='label'> {t('attached_image')} </label >
                                                                        <Field
                                                                            autoComplete="off"
                                                                            name="attachedImage"
                                                                            type="file"
                                                                            id="attachedImage"
                                                                            className={true ? "form-input bg-[#f2f2f2]" : "form-input"}
                                                                            disabled={true}
                                                                        />
                                                                        {submitCount && errors.attachedImage ? (
                                                                            <div className="text-danger mt-1"> {`${errors.attachedImage}`} </div>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </Form>
                                                        )}
                                                    </Formik >
                                                </AnimateHeight>
                                            </div>
                                        </div>
                                        <div className="rounded mb-2">
                                            <button
                                                type="button"
                                                className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                                                onClick={() => handleActive(2)}
                                            >
                                                {t('repair_detail')}
                                                <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(2) ? 'rotate-180' : ''}`}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>
                                            <div className={`${active.includes(2) ? 'custom-content-accordion' : ''}`}>
                                                <AnimateHeight duration={300} height={active.includes(2) ? 'auto' : 0}>
                                                    <div className='p-4'>
                                                        <div className="datatables">
                                                            <DataTable
                                                                highlightOnHover
                                                                className="whitespace-nowrap table-hover"
                                                                records={repairDetails?.data}
                                                                columns={columns}
                                                                // recordsPerPageOptions={PAGE_SIZES}
                                                                // onRecordsPerPageChange={e => handleChangePage(pagination?.page, e)}
                                                                sortStatus={sortStatus}
                                                                onSortStatusChange={setSortStatus}
                                                                minHeight={200}
                                                            />
                                                        </div>
                                                    </div>
                                                </AnimateHeight>
                                            </div>
                                        </div>
                                    </div>
                                </div >
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
export default HistoryModal;
