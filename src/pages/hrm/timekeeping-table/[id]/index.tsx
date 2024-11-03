import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Select from 'react-select';
import Link from 'next/link';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import { ProductCategorys, Providers } from '@/services/swr/product.swr';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconBack from '@/components/Icon/IconBack';
import timekeeping_fake from '../timekeeping_fake.json';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import list_departments from '../../department/department_list.json';
import list_personnels from '../../personnel/personnel_list.json';
import list_duty from "../../duty/duty_list.json";
import { setIsReload } from '@/store/timekeepingTableSlice';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
interface Props {
    [key: string]: any;
}

const EditPersonel = ({ ...props }: Props) => {
    const router = useRouter();
    const [detail, setDetail] = useState<any>();
    const [images, setImages] = useState<any>([]);
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };
    const dispatch = useDispatch();
    const timekeepingTable = useSelector((state: IRootState) => state.timekeepingTable);
    const [listDepartment, setListDepartment] = useState<any>();
    const [listPersons, setListPersons] = useState<any>();
    const [listDuty, setListDuty] = useState<any>([]);
    const maxNumber = 69;
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [query, setQuery] = useState<any>();

    const [typeShift, setTypeShift] = useState("0"); // 0: time, 1: total hours
    const { data: departmentparents } = ProductCategorys(query);
    const { data: manages } = Providers(query);
    useEffect(() => {
        dispatch(setIsReload(true));
    });
    useEffect(() => {
        const list_temp_department = list_departments?.map((department: any) => {
            return {
                value: department.id,
                label: department.name
            }
        })
        setListDepartment(list_temp_department);
        const list_temp_person = list_personnels?.map((person: any) => {
            return {
                value: person.code,
                label: person.name
            }
        })
        setListPersons(list_temp_person);
        const list_temp_duty = list_duty?.map((person: any) => {
            return {
                value: person.code,
                label: person.name
            }
        })
        setListDuty(list_temp_duty);
    }, [])
    const departmentparent = departmentparents?.data.filter((item: any) => {
        return (
            item.value = item.id,
            item.label = item.name,
            delete item.createdAt
        )
    })

    const manage = manages?.data.filter((item: any) => {
        return (
            item.value = item.id,
            item.label = item.name
        )
    })
    const SubmittedForm = Yup.object().shape({
        name: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_name_department')}`),
        code: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_departmentCode')}`),
        abbreviated: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_abbreviated_name')}`),
    });
    const handleSearch = (param: any) => {
        setQuery({ search: param });
    }
    const handleWarehouse = (value: any) => {
        if (props?.data) {
            const reNew = props.totalData.filter((item: any) => item.id !== props.data.id);
            reNew.push({
                id: props.data.id,
                name: value.name,
                code: value.code,
                status: value.status,
            });
            localStorage.setItem('staffList', JSON.stringify(reNew));
            props.setGetStorge(reNew);
            props.setOpenModal(false);
            props.setData(undefined);
            showMessage(`${t('edit_staff_success')}`, 'success');
        } else {
            const reNew = props.totalData;
            reNew.push({
                id: Number(props?.totalData[props?.totalData?.length - 1].id) + 1,
                name: value.name,
                code: value.code,
                status: value.status,
            });
            localStorage.setItem('staffList', JSON.stringify(reNew));
            props.setGetStorge(props.totalData);
            props.setOpenModal(false);
            props.setData(undefined);
            showMessage(`${t('add_staff_success')}`, 'success');
        }
    };

    const handleChangeTypeShift = (e: any) => {
        setTypeShift(e);
    }
    const [active, setActive] = useState<string>('1');
    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };
    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
    };
    useEffect(() => {
        if (Number(router.query.id)) {
            const detailData = timekeeping_fake?.find(d => d.id === Number(router.query.id));
            setDetail(detailData);
        }
    }, [router])

    return (

        <div className="p-5">
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{t('timekeeping_table_detail')}</h1>
                <Link href="/hrm/timekeeping-table">
                    <button type="button" className="btn btn-primary btn-sm m-1 back-button" >
                        <IconBack className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                        <span>
                            {t('back')}
                        </span>
                    </button>
                </Link>
            </div>
            <Formik
                initialValues={{
                    name: detail ? `${detail?.name}` : '',
                    code: detail ? `${detail?.code}` : '',
                    standard_working_hours: detail ? `${detail?.standard_working_hours}` : '',
                    regular_workday_hours: detail ? `${detail?.regular_workday_hours}` : '',
                    non_working_day_hours: detail ? `${detail?.non_working_day_hours}` : '',
                    holiday_hours: detail ? `${detail?.holiday_hours}` : '',
                    overtime_with_pay: detail ? `${detail?.overtime_with_pay}` : '',
                    leave_of_absence: detail ? `${detail?.leave_of_absence}` : '',
                    holiday_leave: detail ? `${detail?.holiday_leave}` : '',
                    business_trip: detail ? `${detail?.business_trip}` : '',
                    total_hours_worked: detail ? `${detail?.total_hours_worked}` : '',

                }}
                validationSchema={SubmittedForm}
                onSubmit={() => { }}
                enableReinitialize
            >
                {({ errors, touched, values, setFieldValue, submitCount }) => (
                    <Form className="space-y-5">
                        <div className="mb-5">

                            <div className="space-y-2 font-semibold">
                                <div className="rounded">
                                    <div className={`custom-content-accordion`}>

                                        <div className="space-y-2 border-[#d3d3d3] p-4 text-[13px] text-white-dark dark:border-[#1b2e4b]">
                                            <div className='flex justify-between gap-5'>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="code" className='label'>
                                                        {' '}
                                                        {t('code_staff')}
                                                    </label>
                                                    <Field autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_staff')}`} className="form-input" disabled />
                                                </div>

                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="name" className='label'>
                                                        {' '}
                                                        {t('name_staff')}
                                                    </label>
                                                    <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_staff')}`} className="form-input" disabled />
                                                </div>
                                            </div>
                                            <div className='flex justify-between gap-5'>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="standard_working_hours" className='label'>
                                                        {' '}
                                                        Số công chuẩn
                                                    </label>
                                                    <Field autoComplete="off" name="standard_working_hours" type="text" id="standard_working_hours" className="form-input" disabled />
                                                </div>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="regular_workday_hours" className='label'>
                                                        {' '}
                                                        Công ngày thường
                                                    </label>
                                                    <Field autoComplete="off" name="regular_workday_hours" type="text" id="regular_workday_hours" className="form-input" disabled />

                                                </div>
                                            </div>
                                            <div className='flex justify-between gap-5'>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="non_working_day_hours" className='label'>
                                                        {' '}
                                                        Công ngày nghỉ
                                                    </label>
                                                    <Field autoComplete="off" name="non_working_day_hours" type="text" id="non_working_day_hours" className="form-input" disabled />

                                                </div>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="holiday_hours" className='label'>
                                                        {' '}
                                                        Công ngày lễ
                                                    </label>
                                                    <Field autoComplete="off" name="holiday_hours" type="text" id="holiday_hours" className="form-input" disabled />
                                                </div>
                                            </div>
                                            <div className='flex justify-between gap-5'>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="overtime_with_pay" className='label'>
                                                        {' '}
                                                        Làm thêm giờ hưởng lương
                                                    </label>
                                                    <Field autoComplete="off" name="overtime_with_pay" type="text" id="overtime_with_pay" className="form-input" disabled />

                                                </div>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="leave_of_absence" className='label'>
                                                        {' '}
                                                        Nghỉ phép
                                                    </label>
                                                    <Field autoComplete="off" name="leave_of_absence" type="text" id="leave_of_absence" className="form-input" disabled />
                                                </div>
                                            </div>
                                            <div className='flex justify-between gap-5'>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="holiday_leave" className='label'>
                                                        {' '}
                                                        Nghỉ lễ
                                                    </label>
                                                    <Field autoComplete="off" name="holiday_leave" type="text" id="holiday_leave" className="form-input" disabled />
                                                </div>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="business_trip" className='label'>
                                                        {' '}
                                                        Công tác
                                                    </label>
                                                    <Field autoComplete="off" name="business_trip" type="text" id="business_trip" className="form-input" disabled />

                                                </div>
                                            </div>
                                            <div className='flex justify-between gap-5'>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="total_hours_worked" className='label'>
                                                        {' '}
                                                        {t('Real totalWork')}
                                                    </label>
                                                    <Field autoComplete="off" name="total_hours_worked" type="text" id="total_hours_worked" className="form-input" disabled />
                                                </div>

                                            </div>
                                        </div>
                                        {/* <button type="button" className="btn btn-outline-danger" onClick={() => handleCancel()}>
                                                                   {t('reset_password')}
                                                               </button> */}
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left gap-8">
                            <button type="button" className="btn btn-outline-dark cancel-button" onClick={() => handleCancel()}>
                                Từ chối
                            </button>
                            <button type="submit" className="btn :ml-4 rtl:mr-4 add-button" disabled={disabled} onClick={() => {
                                if (Object.keys(touched).length !== 0 && Object.keys(errors).length === 0) {
                                    handleWarehouse(values);
                                }
                            }}>
                                Phê duyệt
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>

        </div>

    );
};

export default EditPersonel;
