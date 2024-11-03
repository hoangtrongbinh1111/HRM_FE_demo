import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { Dialog, Transition } from '@headlessui/react';

import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { dateFormatDay, showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Select, { GroupBase, SingleValue } from 'react-select';
import Link from 'next/link';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconBack from '@/components/Icon/IconBack';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { Departments } from '@/services/swr/department.swr';
import { Humans } from '@/services/swr/human.swr';
import { Positions } from '@/services/swr/position.swr';
import { createHuman } from '@/services/apis/human.api';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useDebounce } from 'use-debounce';
// import provinces from './provinces'
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import IconNewEye from '@/components/Icon/IconNewEye';
import { loadMore } from '@/utils/commons';
import Search from '@/pages/elements/search';
import { Shifts } from '@/services/swr/shift.swr';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { setPageTitle } from '@/store/themeConfigSlice';
import { Loader } from '@mantine/core';
interface Props {
    [key: string]: any;
}
type NationOption = {
    value: string;
    label: string;
  };
const AddNewPersonel = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(`${t('add_staff')}`));
    });
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const [startDate, setStartDate] = useState<any>();
    const [endDate, setEndDate] = useState<any>();
    const [images, setImages] = useState<any>([]);
    const router = useRouter();
    
    const [isAdd, setIsAdd]= useState(false);
    //scroll
    const [queryDirect, setQueryDirect] = useState<any>();
    const [queryShift, setQueryShift] = useState<any>();
    const [queryDepartment, setQueryDepartment] = useState<any>();
    const [queryPosition, setQueryPosition] = useState<any>();
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [pageDepartment, setSizeDepartment] = useState<any>(1);
    const [debouncedPage] = useDebounce(pageDepartment, 500);
    const [debouncedQuery] = useDebounce(queryDepartment, 500);
    const [dataPosition, setDataPosition] = useState<any>([]);
    const [pagePosition, setSizePosition] = useState<any>(1);
    const [debouncedPagePosition] = useDebounce(pagePosition, 500);
    const [debouncedQueryPosition] = useDebounce(queryPosition, 500);
    const [dataDirectSuperior, setDataDirectSuperior] = useState<any>([]);
    const [pageDirectSuperior, setSizeDirectSuperior] = useState<any>(1);
    const [debouncedPageDirectSuperior] = useDebounce(pageDirectSuperior, 500);
    const [debouncedQueryDirectSuperior] = useDebounce(queryDirect, 500);
    const [dataShift, setDataShift] = useState<any>([]);
    const [pageShift, setSizeShift] = useState<any>(1);
    const [debouncedPageShift] = useDebounce(pageShift, 500);
    const [debouncedQueryShift] = useDebounce(queryShift, 500);
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };
    const maxNumber = 69;
    const { data: departmentparents, pagination: paginationDepartment, isLoading: DepartmentLoading } = Departments({ page: debouncedPage, search: debouncedQuery?.search });

   
    const nations: NationOption[] = [
        { value: 'VIET', label: `${t('Vietnam')}` },
        { value: 'LAO', label: `${t('laos')}` },
        { value: 'OTHER', label: `${t('foreign')}` },
    ];
    const findNationOption = (value: string): NationOption | undefined => {
        return nations.find(option => option.value === value);
      };
    const { data: manages, pagination: paginationDirectSuperior } = Humans({
        sortBy: 'id.ASC',
        page: debouncedPageDirectSuperior,
        perPage: 10,
        search: debouncedQueryDirectSuperior?.search,
    });

    const { data: positions, pagination: paginationPosition } = Positions({
        sortBy: 'id.ASC',
        page: debouncedPagePosition,
        perPage: 10,
        search: debouncedQueryPosition?.search,
    });
    const { data: shifts, pagination: paginationShift } = Shifts({
        sortBy: 'id.ASC',
        page: debouncedPageShift,
        perPage: 10,
        search: debouncedQueryShift?.search,
    });
    /////////////
    const handleOnScrollBottom = () => {
        setLoadDepartment(true);
        setTimeout(() => {
            setSizeDepartment(paginationDepartment?.page + 1);
        }, 1000);
    };
    const handleOnScrollBottomPosition = () => {
        setLoadPosition(true);
        setTimeout(() => {
            setSizePosition(paginationPosition?.page + 1);
        }, 1000);
    };
    const handleOnScrollBottomDirectSuperior = () => {
        setLoadHuman(true);
        setTimeout(() => {
            setSizeDirectSuperior(paginationDirectSuperior?.page + 1);
        }, 1000);
    };
    const handleOnScrollBottomShift = () => {
        setLoadShift(true);
        setTimeout(() => {
            setSizeShift(paginationShift?.page + 1);
        }, 1000);
    };
    const [loadHuman, setLoadHuman] = useState(false);
    const [loadPosition, setLoadPosition] = useState(false);
    const [loadDepartment, setLoadDepartment] = useState(false);
    const [loadShift, setLoadShift] = useState(false);
    /////////////////
    useEffect(() => {
        loadMore(departmentparents, dataDepartment, paginationDepartment, setDataDepartment, 'id', 'name', setLoadDepartment);
    }, [paginationDepartment, debouncedPage, debouncedQuery]);
    useEffect(() => {
        loadMore(positions, dataPosition, paginationPosition, setDataPosition, 'id', 'name', setLoadPosition);
    }, [paginationPosition, debouncedPagePosition, debouncedQueryPosition]);
    useEffect(() => {
        loadMore(manages, dataDirectSuperior, paginationDirectSuperior, setDataDirectSuperior, 'id', 'fullName', setLoadHuman);
    }, [paginationDirectSuperior, debouncedPageDirectSuperior, debouncedQueryDirectSuperior]);
    useEffect(() => {
        loadMore(shifts, dataShift, paginationShift, setDataShift, 'id', 'name', setLoadShift);
    }, [paginationShift, debouncedPageShift, debouncedQueryShift]);
    /////////////////
    const handleSearchDepartment = (param: any) => {
        setQueryDepartment({ search: param });
    };
    const handleSearchPosition = (param: any) => {
        setQueryPosition({ search: param });
    };
    const handleSearchDirect = (param: any) => {
        setQueryDirect({ search: param });
    };
    const handleSearchShift = (param: any) => {
        setQueryShift({ search: param });
    };
    /////----------endscroll---------------
    const SubmittedForm = Yup.object().shape({
        fullName: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_name_staff')}`),
        code: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_code')}`),
        // email: Yup.string()
        //     .email(`${t('error_email')}`)
        //     .required(`${t('please_fill_email')}`)
        //     .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email must be a valid Gmail address'),
        positionId: Yup.object()
            .nullable()
            .required(`${t('please_choose_duty')}`),
        password: Yup.string().required(`${t('please_enter_password')}`),
        password_: Yup.string().oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp'),
    });
    const handleWarehouse = (value: any) => {
        setLoading(true);
        const kq = value?.shiftIds ? value?.shiftIds?.map((i: any) => i.value).join(',') : '';
        const formdata = new FormData();
        formdata.append('code', value.code);
        formdata.append('fullName', value.fullName);
        formdata.append('password', value.password);
        if (images[0]) formdata.append('avatar', images[0].file);
        if (value.phoneNumber !== '') formdata.append('phoneNumber', value.phoneNumber);
        if (value.email !== '') formdata.append('email', value.email);
        if (value?.birthDay !== '') formdata.append('birthDay', dateFormatDay(value.birthDay));
        if (value.sex !== null) formdata.append('sex', value.sex.value);
        if (value.identityNumber !== '') formdata.append('identityNumber', value.identityNumber);
        if (value.identityPlace !== '') formdata.append('identityPlace', value.identityPlace);
        if (value.passportNumber !== '') formdata.append('passportNumber', value.passportNumber);
        if (value.passportDate !== '') formdata.append('passportDate', dateFormatDay(value.passportDate));
        if (value.passportPlace !== '') formdata.append('passportPlace', value.passportPlace);
        if (value.passportExpired !== '') formdata.append('passportExpired', dateFormatDay(value.passportExpired));
        if (value.placeOfBirth !== '') formdata.append('placeOfBirth', value.placeOfBirth);
        if (value.maritalStatus !== '') formdata.append('maritalStatus', value.maritalStatus);
        if (value.departmentId !== null) formdata.append('departmentId', value.departmentId.value);
        if (value.positionId !== null) formdata.append('positionId', value.positionId.value);
        if (value.indirectSuperior !== null) formdata.append('indirectSuperior', value.indirectSuperior.value);
        if (value.directSuperior !== null) formdata.append('directSuperior', value.directSuperior.value);
        if (value.dateOfJoin !== '') formdata.append('dateOfJoin', dateFormatDay(value.dateOfJoin));
        if (value.taxCode !== '') formdata.append('taxCode', value.taxCode);
        if (value.bankAccount !== '') formdata.append('bankAccount', value.bankAccount);
        if (value.bankName !== '') formdata.append('bankName', value.bankName);
        if (value.bankBranch !== '') formdata.append('bankBranch', value.bankBranch);
        if (value.nation?.value !== undefined) formdata.append('nation', value.nation.value);
        if (value.fixedOvertimeHours && value.fixedOvertimeHours !== null) formdata.append('fixedOvertimeHours', value.fixedOvertimeHours);
        if (value.religion !== '') formdata.append('religion', value.religion);
        if (value.anotherName !== '') formdata.append('anotherName', value.anotherName);
        if (value.identityDate !== '') formdata.append('identityDate', dateFormatDay(value.identityDate));
        if (value.contractInfo !== '') formdata.append('contractInfo', value.contractInfo.value);
        if (value.province !== '') formdata.append('province', value?.province);
        const isCheckGPS = value.isCheckGPS === true ? '1' : '0';
        formdata.append('isCheckGPS', isCheckGPS);
        if (kq !== '') formdata.append('shiftIds', kq);
        setIsAdd(true)
        createHuman(formdata)
            .then((res) => {
                setLoading(false);
                showMessage(`${t('add_staff_success')}`, 'success');
                router.push('/hrm/personnel');
            })
            .catch((err) => {
                setLoading(false);
                setIsAdd(false)
                showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
            });
    };
    const [active, setActive] = useState<any>([1, 2, 3]);
    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };
    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
    };

    return (
        <div className="p-5">
            <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <Link href="/hrm/personnel" className="text-primary hover:underline">
                        <span>{t('staff_list')}</span>
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('add_staff')}</span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">{t('add_staff')}</h1>
                <Link href="/hrm/personnel">
                    <button type="button" className="btn btn-primary btn-sm back-button m-1">
                        <IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        <span>{t('back')}</span>
                    </button>
                </Link>
            </div>
            <Formik
                initialValues={{
                    code: props?.data ? `${props?.data?.code}` : '',
                    avatar: props?.data ? `${props?.data?.avatar}` : '',
                    password: props?.data ? `${props?.data?.password}` : '1',
                    password_: props?.data ? `${props?.data?.password_}` : '1',
                    fullName: props?.data ? `${props?.data?.fullName}` : '',
                    surname: props?.data ? `${props?.data?.surname}` : '',
                    email: props?.data ? `${props?.data?.email}` : '',
                    phoneNumber: props?.data ? `${props?.data?.phoneNumber}` : '',
                    anotherName: props?.data ? `${props?.data?.anotherName}` : '',
                    birthDay: props?.data ? `${props?.data?.birthDay}` : '',
                    sex: props?.data ? props?.data?.sex : null,
                    identityNumber: props?.data ? `${props?.data?.identityNumber}` : '',
                    identityDate: props?.data ? `${props?.data?.identityDate}` : '',
                    identityPlace: props?.data ? `${props?.data?.identityPlace}` : '',
                    passportNumber: props?.data ? `${props?.data?.passportNumber}` : '',
                    passportDate: props?.data ? `${props?.data?.passportDate}` : '',
                    passportExpired: props?.data ? `${props?.data?.passportExpired}` : '',
                    passportPlace: props?.data ? `${props?.data?.passportPlace}` : '',
                    placeOfBirth: props?.data ? `${props?.data?.placeOfBirth}` : '',                   
                    nation: props?.data ? `${props?.data?.nation}` : '',
                    fixedOvertimeHours: props?.data ? `${props?.data?.fixedOvertimeHours}` : null,
                    province: props?.data ? `${props?.data?.province}` : '',
                    religion: props?.data ? `${props?.data?.religion}` : '',
                    maritalStatus: props?.data ? `${props?.data?.maritalStatus}` : '',
                    departmentId: props?.data ? props?.data?.departmentId : null,
                    positionId: props?.data ? props?.data?.positionId : null,
                    indirectSuperior: props?.data ? props?.data?.indirectSuperior : null,
                    directSuperior: props?.data ? props?.data?.directSuperior : null,
                    dateOfJoin: props?.data ? props?.data?.dateOfJoin : '',
                    taxCode: props?.data ? `${props?.data?.taxCode}` : '',
                    bankAccount: props?.data ? `${props?.data?.bankAccount}` : '',
                    bankName: props?.data ? `${props?.data?.bankName}` : '',
                    bankBranch: props?.data ? `${props?.data?.bankBranch}` : '',
                    shift: props?.data ? `${props?.data?.shift}` : '',
                    isActive: props?.data ? `${props?.data?.isActive}` : true,
                    othername: props?.data ? `${props?.data?.othername}` : '',
                    contractInfo: props?.data ? `${props?.data?.contractInfo}` : '',
                    shiftIds: props?.data ? `${props?.data?.shiftIds}` : '',
                    isCheckGPS: false
                }}
                validationSchema={SubmittedForm}
                onSubmit={(values: any) => {
                    if (startDate && startDate > endDate && endDate) {
                        showMessage(`${t('add_staff_error')}`, 'error');
                    } else {
                        handleWarehouse(values);
                    }
                }}
                enableReinitialize
            >
                {({ errors, touched, values, setFieldValue, submitCount }) => (
                    <Form className="space-y-5">
                        <div className="mb-5">
                            <div className="space-y-2 font-semibold">
                                <div className="rounded">
                                    <button type="button" className={`custom-accordion flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(1)}>
                                        {t('general_infomation')}{' '}
                                        <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                            <IconCaretDown />
                                        </div>
                                    </button>
                                    <div className={`custom-content-accordion`}>
                                        <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                            <div className="space-y-2 border-[#d3d3d3] p-4 text-[13px] dark:border-[#1b2e4b]">
                                                <div className="flex justify-center gap-5">
                                                    <div
                                                        className="custom-file-container gap-5 mb-3"
                                                        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
                                                        data-upload-id="myFirstImage"
                                                    >
                                                        <ImageUploading acceptType={['jpg']} value={images} onChange={onChange} maxNumber={maxNumber}>
                                                            {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                                <>
                                                                    <div className="upload__image-wrapper">
                                                                        <div
                                                                            className="custom-uploadfile"
                                                                            style={{ cursor: 'pointer', border: imageList.length === 0 ? '' : 'none' }}
                                                                            onClick={onImageUpload}
                                                                        >
                                                                            <div className="upfile_content" style={{ marginTop: imageList.length !== 0 ? '-1px' : '20px' }}>
                                                                                {imageList.length === 0 ? (
                                                                                    <>
                                                                                        <img src="/assets/images/uploadfile.png" className="icon_upload"></img>
                                                                                        {t('upload')}
                                                                                    </>
                                                                                ) : (
                                                                                    <></>
                                                                                )}
                                                                                {imageList.map((image, index) => (
                                                                                    <img
                                                                                        key={index}
                                                                                        src={image.dataURL}
                                                                                        alt="img"
                                                                                        id="avatar"
                                                                                        className="m-auto"
                                                                                        style={{ width: '80px', height: '80px', borderRadius: '50px' }}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="label-container">
                                                                        <label className='italic' style={{ color: '#DC143C', fontWeight: 100, fontSize: '14px', marginBottom: '0' }}> {t('file_size')} </label>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </ImageUploading>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="code" className="label">
                                                            {t('code_staff')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_staff')}`} className="form-input" />
                                                        {submitCount ? errors.code ? <div className="mt-1 text-danger"> {`${errors.code}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="fullName" className="label">
                                                            {t('surname_middle')}
                                                            <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" name="fullName" type="text" id="fullName" placeholder={t('enter_surname_middle')} className="form-input" />
                                                        {submitCount ? errors.fullName ? <div className="mt-1 text-danger"> {`${errors.fullName}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="password" className="label">
                                                            {t('password')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="password"
                                                            type="password"
                                                            id="password"
                                                            placeholder={`${t('enter_password')}`}
                                                            className="password-input form-control rounded-0 form-input"
                                                        />
                                                        {submitCount ? errors.password ? <div className="mt-1 text-danger"> {`${errors.password}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="password_" className="label">
                                                            {t('password_')}
                                                            <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" name="password_" type="password" id="password_" placeholder={t('enter_password_')} className="form-input" />
                                                        {errors.password_ ? <div className="mt-1 text-danger"> {`${errors.password_}`} </div> : null}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="email" className="label">
                                                            Email
                                                        </label>
                                                        <Field autoComplete="off" name="email" type="text" id="email" placeholder={t('enter_email')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="phoneNumber" className="label">
                                                            {t('phone_number')}
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="phoneNumber"
                                                            id="phoneNumber"
                                                            placeholder={t('enter_phone_number')}
                                                            className="form-input"
                                                            onInput={(e: any) => {
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                e.target.value = value.slice(0, 10);
                                                            }}
                                                            onChange={(e: any) => {
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                setFieldValue('phoneNumber', value.slice(0, 10));
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </AnimateHeight>
                                    </div>
                                </div>
                                <div className="rounded">
                                    <button type="button" className={`custom-accordion flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(2)}>
                                        {t('personal_information')}
                                        <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(2) ? 'rotate-180' : ''}`}>
                                            <IconCaretDown />
                                        </div>
                                    </button>
                                    <div className={`custom-content-accordion`}>
                                        <AnimateHeight duration={300} height={active.includes(2) ? 'auto' : 0}>
                                            <div className="space-y-2 border-t border-[#d3d3d3] p-4 text-[13px] dark:border-[#1b2e4b]">
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="anotherName" className="label">
                                                            {t('other_name')}
                                                        </label>
                                                        <Field autoComplete="off" name="anotherName" type="text" id="anotherName" placeholder={t('enter_other_name')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="birthDay" className="label">
                                                            {t('date_of_birth')}
                                                        </label>
                                                        <Flatpickr
                                                            options={{
                                                                dateFormat: 'd-m-Y',
                                                                position: 'auto left',
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                            }}
                                                            value={values.birthDay}
                                                            onChange={(e) => {
                                                                if (e.length > 0) {
                                                                    setFieldValue('birthDay', dayjs(e[0]).format('DD-MM-YYYY'));
                                                                }
                                                            }}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('enter_date_of_birth')}`}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="sex" className="label">
                                                            {t('gender')}
                                                        </label>
                                                        <Select
                                                            id="sex"
                                                            name="sex"
                                                            options={[
                                                                {
                                                                    value: 0,
                                                                    label: `${t('male')}`,
                                                                },
                                                                {
                                                                    value: 1,
                                                                    label: `${t('female')}`,
                                                                },
                                                            ]}
                                                            value={values.sex}
                                                            placeholder={`${t('choose_gender')}`}
                                                            maxMenuHeight={160}
                                                            onChange={(e) => {
                                                                setFieldValue('sex', e);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="identityNumber" className="label">
                                                            {t('id_number')}
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="identityNumber"
                                                            id="identityNumber"
                                                            placeholder={t('enter_id_number')}
                                                            className="form-input"
                                                            onInput={(e: any) => {
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                e.target.value = value.slice(0, 12); // Limit to 12 digits
                                                            }}
                                                            onChange={(e: any) => {
                                                                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                                setFieldValue('identityNumber', value);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="identityDate" className="label">
                                                            {t('date_of_issue')}
                                                        </label>
                                                        <Flatpickr
                                                            options={{
                                                                dateFormat: 'd-m-Y',
                                                                position: 'auto left',
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                            }}
                                                            value={values.identityDate}
                                                            onChange={(e) => {
                                                                if (e.length > 0) {
                                                                    setFieldValue('identityDate', dayjs(e[0]).format('DD-MM-YYYY'));
                                                                }
                                                            }}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('enter_date_of_issue')}`}
                                                        />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="identityPlace" className="label">
                                                            {t('address_issue')}
                                                        </label>
                                                        <Field autoComplete="off" name="identityPlace" type="text" id="identityPlace" placeholder={t('enter_address_issue')} className="form-input" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="passportNumber" className="label">
                                                            {t('id_passport')}
                                                        </label>
                                                        <Field autoComplete="off" name="passportNumber" type="text" id="passportNumber" placeholder={t('enter_id_passport')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="passportDate" className="label">
                                                            {t('date_of_issue_passport')}
                                                        </label>
                                                        <Flatpickr
                                                            options={{
                                                                dateFormat: 'd-m-Y',
                                                                position: 'auto left',
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                            }}
                                                            value={values.passportDate}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('enter_date_of_issue_passport')}`}
                                                            onChange={(e) => {
                                                                if (e.length > 0) {
                                                                    setStartDate(dayjs(e[0]).format('YYYY-MM-DD'));
                                                                    setFieldValue('passportDate', dayjs(e[0]).format('DD-MM-YYYY'));
                                                                }
                                                            }}
                                                        />
                                                        {startDate >= endDate ? <div className="mt-1 text-danger"> Vui lòng chọn ngày hết hạn sau ngày cấp </div> : ''}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="passportPlace" className="label">
                                                            {t('address_issue_passport')}
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="passportPlace"
                                                            type="text"
                                                            id="passportPlace"
                                                            placeholder={t('enter_address_issue_passport')}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="passportExpired" className="label">
                                                            {' '}
                                                            {t('date_end_passport')}
                                                        </label>
                                                        <Flatpickr
                                                            options={{
                                                                dateFormat: 'd-m-Y',
                                                                position: 'auto left',
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                            }}
                                                            value={values.passportExpired}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('enter_date_end_passport')}`}
                                                            onChange={(e) => {
                                                                if (e.length > 0) {
                                                                    setEndDate(dayjs(e[0]).format('YYYY-MM-DD'));
                                                                    setFieldValue('passportExpired', dayjs(e[0]).format('DD-MM-YYYY'));
                                                                }
                                                            }}
                                                        />
                                                        {startDate >= endDate ? <div className="mt-1 text-danger"> Vui lòng chọn ngày hết hạn sau ngày cấp </div> : ''}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="placeOfBirth" className="label">
                                                            {t('place_of_birth')}
                                                        </label>
                                                        <Field autoComplete="off" name="placeOfBirth" type="text" id="placeOfBirth" placeholder={t('enter_place_of_birth')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="nation" className="label">
                                                            {t('nation')}
                                                        </label>
                                                        <Select
                                                            id="nation"
                                                            name="nation"
                                                            options={nations} // Truyền đúng kiểu options dưới dạng {value, label}
                                                            value={typeof values.nation === 'string' ? findNationOption(values.nation) : values.nation}
                                                            placeholder={`${t('enter_nation')}`}
                                                            maxMenuHeight={160}
                                                            onChange={(e) => {
                                                                setFieldValue('nation', e);
                                                            }}
                                                        />
                                                        </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="province" className="label">
                                                            {t('province')}
                                                        </label>
                                                        <Field autoComplete="off" name="province" type="text" id="province" placeholder={t('enter_province')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="religion" className="label">
                                                            {t('religion')}
                                                        </label>
                                                        <Field autoComplete="off" name="religion" type="text" id="religion" placeholder={t('enter_religion')} className="form-input" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="maritalStatus" className="label">
                                                            {t('marital_status')}
                                                        </label>
                                                        <Field autoComplete="off" name="maritalStatus" type="text" id="maritalStatus" placeholder={t('enter_marital_status')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="contractInfo" className="label">
                                                            {t('contract')}
                                                        </label>
                                                        <Select
                                                            id="contractInfo"
                                                            name="contractInfo"
                                                            options={[
                                                                {
                                                                    value: '0',
                                                                    label: `${t('Probation')}`,
                                                                },
                                                                {
                                                                    value: '1',
                                                                    label: `${t('official')}`,
                                                                },
                                                                {
                                                                    value: '2',
                                                                    label: `${t('Collaborator')}`,
                                                                },
                                                            ]}
                                                            placeholder={`${t('choose_status')}`}
                                                            maxMenuHeight={160}
                                                            onChange={(e) => {
                                                                setFieldValue('contractInfo', e);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </AnimateHeight>
                                    </div>
                                </div>
                                <div className="rounded">
                                    <button type="button" className={`custom-accordion flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(3)}>
                                        {t('other_information')}
                                        <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(3) ? 'rotate-180' : ''}`}>
                                            <IconCaretDown />
                                        </div>
                                    </button>
                                    <div className={`custom-content-accordion`}>
                                        <AnimateHeight duration={300} height={active.includes(3) ? 'auto' : 0}>
                                            <div className="space-y-2 border-t border-[#d3d3d3] p-4 text-[13px] dark:border-[#1b2e4b]">
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="departmentId" className="label">
                                                            {' '}
                                                            {t('Department_Parent')}
                                                        </label>
                                                        <Select
                                                            id="departmentId"
                                                            name="departmentId"
                                                            placeholder={t('select_departmentparent')}
                                                            onInputChange={(e) => handleSearchDepartment(e)}
                                                            options={dataDepartment}
                                                            isLoading={loadDepartment}
                                                            onMenuOpen={() => setSizeDepartment(1)}
                                                            onMenuScrollToBottom={() => handleOnScrollBottom()}
                                                            maxMenuHeight={160}
                                                            value={values.departmentId}
                                                            onChange={(e) => {
                                                                setFieldValue('departmentId', e);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="positionId" className="label">
                                                            {' '}
                                                            {t('duty')}
                                                            <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Select
                                                            id="positionId"
                                                            name="positionId"
                                                            placeholder={t('select_duty')}
                                                            onInputChange={(e) => handleSearchPosition(e)}
                                                            options={dataPosition}
                                                            onMenuOpen={() => setSizePosition(1)}
                                                            isLoading={loadPosition}
                                                            onMenuScrollToBottom={() => handleOnScrollBottomPosition()}
                                                            maxMenuHeight={160}
                                                            value={values.positionId}
                                                            onChange={(e) => {
                                                                setFieldValue('positionId', e);
                                                            }}
                                                        />

                                                        {submitCount ? errors.positionId ? <div className="mt-1 text-danger"> {`${errors.positionId}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="directSuperior" className="label">
                                                            {' '}
                                                            {t('Manager')}{' '}
                                                        </label>
                                                        <Select
                                                            id="directSuperior"
                                                            name="directSuperior"
                                                            onInputChange={(e) => handleSearchDirect(e)}
                                                            options={dataDirectSuperior}
                                                            onMenuOpen={() => setSizeDirectSuperior(1)}
                                                            isLoading={loadHuman}
                                                            onMenuScrollToBottom={() => handleOnScrollBottomDirectSuperior()}
                                                            placeholder={t('select_manager')}
                                                            maxMenuHeight={160}
                                                            value={values.directSuperior}
                                                            onChange={(e) => {
                                                                setFieldValue('directSuperior', e);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="indirectSuperior" className="label">
                                                            {' '}
                                                            {t('Manager_2')}{' '}
                                                        </label>
                                                        <Select
                                                            id="indirectSuperior"
                                                            name="indirectSuperior"
                                                            onInputChange={(e) => handleSearchDirect(e)}
                                                            options={dataDirectSuperior}
                                                            onMenuOpen={() => setSizeDirectSuperior(1)}
                                                            onMenuScrollToBottom={() => handleOnScrollBottomDirectSuperior()}
                                                            maxMenuHeight={160}
                                                            value={values.indirectSuperior}
                                                            placeholder={t('select_manager_2')}
                                                            onChange={(e) => {
                                                                setFieldValue('indirectSuperior', e);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="dateOfJoin" className="label">
                                                            {' '}
                                                            {t('date_join')}
                                                        </label>

                                                        <Flatpickr
                                                            options={{
                                                                dateFormat: 'd-m-Y',
                                                                position: 'auto left',
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                            }}
                                                            value={values.dateOfJoin}
                                                            onChange={(e) => {
                                                                if (e.length > 0) {
                                                                    setFieldValue('dateOfJoin', dayjs(e[0]).format('DD-MM-YYYY'));
                                                                }
                                                            }}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('enter_date_join')}`}
                                                        />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="taxCode" className="label">
                                                            {' '}
                                                            {t('tax_code')}
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="taxCode"
                                                            id="taxCode"
                                                            placeholder={t('enter_tax_code')}
                                                            onInput={(e: any) => {
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                e.target.value = value.slice(0, 10);
                                                            }}
                                                            onChange={(e: any) => {
                                                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                                setFieldValue('taxCode', value);
                                                            }}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="bankAccount" className="label">
                                                            {' '}
                                                            {t('bank_number')}
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="bankAccount"
                                                            id="bankAccount"
                                                            placeholder={t('enter_bank_number')}
                                                            className="form-input"
                                                            onInput={(e: any) => {
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                e.target.value = value.slice(0, 10);
                                                            }}
                                                            onChange={(e: any) => {
                                                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                                setFieldValue('bankAccount', value);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="bankName" className="label">
                                                            {' '}
                                                            {t('bank')}
                                                        </label>
                                                        <Field autoComplete="off" name="bankName" type="text" id="bankName" placeholder={t('enter_bank')} className="form-input" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="bankBranch" className="label">
                                                            {' '}
                                                            {t('branch')}
                                                        </label>
                                                        <Field autoComplete="off" name="bankBranch" type="text" id="bankBranch" placeholder={t('enter_branch')} className="form-input" />
                                                    </div>
                                                    {/* <div className="mb-5 w-1/2">
                                                        <label htmlFor="shiftIds" className="label">
                                                            {' '}
                                                            {t('choose_shift_')}{' '}
                                                        </label>
                                                        <Select
                                                            value={values?.shiftIds}
                                                            id="shiftIds"
                                                            name="shiftIds"
                                                            onInputChange={(e) => handleSearchShift(e)}
                                                            options={dataShift}
                                                            onMenuOpen={() => setSizeShift(1)}
                                                            isLoading={loadShift}
                                                            onMenuScrollToBottom={() => handleOnScrollBottomShift()}
                                                            isMulti
                                                            closeMenuOnSelect={false}
                                                            maxMenuHeight={160}
                                                            placeholder={t('please_choose_shift')}
                                                            onChange={(newValue: any, actionMeta: any) => {
                                                                setFieldValue('shiftIds', newValue ? newValue : null);
                                                            }}
                                                        />
                                                    </div> */}
                                                </div>
                                                <div className="flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="bankBranch" className="label">
                                                            {' '}
                                                            {t('fixedOvertimeHours')}
                                                        </label>
                                                        <div className='flex'>
                                                            <Field autoComplete="off" name="fixedOvertimeHours" type="number" id="fixedOvertimeHours" placeholder={t('enter_fixedOvertimeHours')} className="form-input ltr:rounded-r-none rtl:rounded-l-none" />
                                                            <div className="flex  items-center justify-center  font-semibold  dark:border-[#17263c]  dark:bg-[#1b2e4b]  ltr:rounded-r-md ltr:border-l-0  rtl:rounded-l-md rtl:border-r-0"
                                                                style={{
                                                                    backgroundColor: 'white',
                                                                    border: '0.5px solid rgba(224, 230, 237, 1)',
                                                                    borderTopLeftRadius: '0',
                                                                    borderBottomLeftRadius: '0',

                                                                }}
                                                            >
                                                                <span style={{
                                                                    width: "40px",
                                                                    textAlign: "center"
                                                                }}>
                                                                    {t('hours')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div className="mb-5 w-1/2" style={{ display: 'flex', alignItems: "center" }}>
                                                        <label htmlFor="isCheckGPS" className="label">
                                                            {' '}
                                                            {t('status_timekeeping')}
                                                        </label>
                                                        <div className="flex" style={{ alignItems: 'center', marginLeft: '20px', }}>
                                                            <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                                                <Field
                                                                    autoComplete="off"
                                                                    type="checkbox"
                                                                    name="isCheckGPS"
                                                                    value={true}
                                                                    checked={values.isCheckGPS === true}
                                                                    className="form-checkbox "
                                                                    onChange={() => setFieldValue('isCheckGPS', !values?.isCheckGPS)}
                                                                />
                                                            </label>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </AnimateHeight>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end gap-8 ltr:text-right rtl:text-left">
                            <Link href="/hrm/personnel">
                                <button type="button" className="btn btn-outline-danger cancel-button">
                                    {t('cancel')}
                                </button>
                            </Link>
                            <button type="submit" className="btn :ml-4 add-button rtl:mr-4" disabled={isAdd}>
                                {loading ? <Loader size="sm" /> : t('add')}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddNewPersonel;
