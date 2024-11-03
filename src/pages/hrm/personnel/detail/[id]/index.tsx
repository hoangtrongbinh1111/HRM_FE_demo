/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import { Dialog, Transition } from '@headlessui/react';
import { setPageTitle } from '@/store/themeConfigSlice';
import * as Yup from 'yup';
import { IconLoading } from '@/components/Icon/IconLoading';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Select, { GroupBase } from 'react-select';
import Link from 'next/link';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import { Departments } from '@/services/swr/department.swr';
import { Humans } from '@/services/swr/human.swr';
import { Positions } from '@/services/swr/position.swr';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconBack from '@/components/Icon/IconBack';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { detailHuman, updateHuman } from '@/services/apis/human.api';
import { removeNullProperties } from '@/utils/commons';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import dayjs from 'dayjs';
import { start } from 'nprogress';
import { Shifts } from '@/services/swr/shift.swr';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { setIsReload } from '@/store/humanListSlice';
import OvertimeHoursLog from "../../modal/OvertimeHoursLog"
import RBACWrapper from '@/@core/rbac/RBACWrapper';
interface Props {
    [key: string]: any;
}
interface list {
    value: string;
    label: string;
}
type NationOption = {
    value: string;
    label: string;
  };
const EditPersonel = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null); const router = useRouter();
    const [detail, setDetail] = useState<any>();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(`${t('detail_staff')}`));
    });
    const [images, setImages] = useState<any>([]);
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };
    const [passportDate, setPassportDate] = useState<any>();
    const maxNumber = 69;
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [query, setQuery] = useState<any>();
    const [startDate, setStartDate] = useState<any>();
    const [endDate, setEndDate] = useState<any>();
    const [typeShift, setTypeShift] = useState('0');
    const { data: departmentparents } = Departments(query);
    const [fixedOvertimeHoursLog, setOvertimeHoursLog] = useState<any>([]);
    const [viewLogModal, setViewLogModal] = useState(false);
    
    const [loadDetail, setLoadDetail] = useState(true)
    const { data: positions, isLoading: isLoadingPosition } = Positions({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100,
    });
    const departmentparent = departmentparents?.data.map((item: any) => ({
        value: item.id,
        label: item.name,
    }));
    useEffect(() => {
        dispatch(setIsReload(true));
    });
    // const defaultDepartment = departmentparent?.find((i: { value: string }) => i && i.value === detail?.departmentId)
    const { data: human1 } = Humans({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100,
    });
    const human2 = human1?.data.map((item: any) => ({
        value: item.id,
        label: item.fullName,
    }));
    const position = positions?.data.filter((item: any) => {
        return (item.value = item.id), (item.label = item.name);
    });
    const { data: shifts1 } = Shifts({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100,
    });
    const shift2 = shifts1?.data.map((item: any) => ({
        value: item.id,
        label: item.name,
    }));
    const defaultPosition = position?.find((i: { value: string }) => i && i.value === detail?.positionId);
    const SubmittedForm = Yup.object().shape({
        fullName: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_name_staff')}`),
        code: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_code')}`),
        email: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_email')}`),
    });
    const handleSearch = (param: any) => {
        setQuery({ search: param });
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
    const handleHuman = (value: any) => {
        removeNullProperties(value);
        const formdata = new FormData();
        // formdata.append("avatar", images[0].file)
        formdata.append('code', value.code);
        formdata.append('fullName', value.fullName);
        if (value?.phoneNumber !== '') formdata.append('phoneNumber', value.phoneNumber);
        if (value?.email !== '') formdata.append('email', value.email);
        if (value?.birthDay !== '') formdata.append('birthDay', value.birthDay);
        if (value?.sex !== '') formdata.append('sex', value.sex);
        if (value?.identityNumber !== '') formdata.append('identityNumber', value.identityNumber);
        if (value?.identityDate !== '') formdata.append('identityDate', value.identityDate);
        if (value?.identityPlace !== '') formdata.append('identityPlace', value.identityPlace);
        if (value?.passportNumber !== '') formdata.append('passportNumber', value.passportNumber);
        if (value?.passportDate !== '') formdata.append('passportDate', value.passportDate);
        if (value?.passportPlace !== '') formdata.append('passportPlace', value.passportPlace);
        if (value?.passportExpired !== '') formdata.append('passportExpired', value.passportExpired);
        if (value?.placeOfBirth !== '') formdata.append('placeOfBirth', value.placeOfBirth);
        if (value?.maritalStatus !== '') formdata.append('maritalStatus', value.maritalStatus);
        if (value?.departmentId !== null) formdata.append('departmentId', value.departmentId?.value);
        if (value?.positionId !== null) formdata.append('positionId', value.positionId);
        if (value?.indirectSuperior !== null) formdata.append('indirectSuperior', value.indirectSuperior?.value);
        if (value?.directSuperior !== null) formdata.append('directSuperior', value.directSuperior?.value);
        if (value?.dateOfJoin !== '') formdata.append('dateOfJoin', value.dateOfJoin);
        if (value?.taxCode !== '') formdata.append('taxCode', value.taxCode);
        if (value?.bankAccount !== '') formdata.append('bankAccount', value.bankAccount);
        if (value?.bankName !== '') formdata.append('bankName', value.bankName);
        if (value.bankBranch !== '') formdata.append('bankBranch', value.bankBranch);
        if (value.fixedOvertimeHours && value.fixedOvertimeHours !== null) formdata.append('fixedOvertimeHours', value.fixedOvertimeHours);
        if (value?.province !== '') formdata.append('province', value?.province);
        updateHuman(detail?.id, formdata)
            .then(() => {
                showMessage(`${t('update_staff_success')}`, 'success');
                window.location.href = '/hrm/personnel';
            })
            .catch(() => {
                showMessage(`${t('update_staff_error')}`, 'error');
            });
    };
    useEffect(() => {
        const id = router.query.id;
        setLoadDetail(true)
        if (id) {
            detailHuman(id)
                .then((res) => {
                    setLoadDetail(false)
                    setStartDate(res?.data?.passportDate);
                    setEndDate(res?.data?.passportExpired);
                    setDetail(res?.data);
                    setOvertimeHoursLog(res?.data?.fixedOvertimeHoursLog)
                })
                .catch((err: any) => {
                    console.log(err);
                });
        }
    }, [router]);
    const gt = [
        { value: 1, label: `${t('female')}` },
        { value: 0, label: `${t('male')}` },
    ];
    
    const nations: NationOption[] = [
        { value: 'VIET', label: `${t('Vietnam')}` },
        { value: 'LAO', label: `${t('laos')}` },
        { value: 'OTHER', label: `${t('foreign')}` },
    ];
    const { data: department1 } = Departments({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100,
    });
    const department2 = department1?.data.map((item: any) => ({
        value: item.id,
        label: item.name,
    }));
    const { data: position1 } = Positions({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100,
    });
    const position2 = position1?.data.map((item: any) => ({
        value: item.id,
        label: item.name,
    }));
    const handleOvertimeLogModal = () => {
        setViewLogModal(!viewLogModal); //
    }
    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: 'rgb(235 235 235) !important',
            borderTopLeftRadius: '0',
            borderBottomLeftRadius: '0',
            borderColor: Number(router.query.id) && 'rgb(224 230 237 / var(1))',
        }),
    };
    return (
        <div>
            {isLoadingPosition || loadDetail && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )}
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
                        <span>{t('detail_staff')}</span>
                    </li>
                </ul>
                <div className="header-page-bottom mb-4 flex justify-between pb-4">
                    <h1 className="page-title">{t('detail_staff')}</h1>
                    <div className='flex' style={{ alignItems: "center" }}>
                        <RBACWrapper permissionKey={['human:update']} type={'AND'}>

                            {
                                <Link href={`/hrm/personnel/${router?.query.id}`}>
                                    <button className="edit-page-btn btn btn-primary ltr:ml-4 rtl:mr-4 h-9">
                                        {t('edit')}
                                    </button>
                                </Link>
                            }
                        </RBACWrapper>
                        <Link href={`/hrm/personnel`}>
                            <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                                <IconBack />
                                <span>
                                    {t('back')}
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>

                <Formik
                    initialValues={{
                        code: detail ? `${detail?.code}` : '',
                        fullName: detail ? `${detail?.fullName}` : '',
                        password: detail?.password ? `${detail?.password}` : '1',
                        password_: detail?.password ? `${detail?.password}` : '1',
                        name: detail ? `${detail?.name}` : '',
                        surname: detail ? `${detail?.surname}` : '',
                        email: detail?.email ? `${detail?.email}` : '',
                        contractInfo:
                            detail?.contractInfo === '0'
                                ? { value: '0', label: `${t('Probation')}` }
                                : detail?.contractInfo === '2'
                                    ? { value: '2', label: `${t('Collaborator')}` }
                                    : { value: '1', label: `${t('official')}` },
                        anotherName: detail?.anotherName ? `${detail?.anotherName}` : '',
                        birthDay: detail?.birthDay ? `${dayjs(detail?.birthDay).format('DD-MM-YYYY')}` : '',
                        sex: detail ? gt.find((i: any) => i.value === detail?.sex) : '',
                        phoneNumber: detail?.phoneNumber ? `${detail?.phoneNumber}` : '',
                        identityNumber: detail?.identityNumber ? `${detail?.identityNumber}` : '',
                        identityDate: detail?.identityDate ? `${dayjs(detail?.identityDate).format('DD-MM-YYYY')}` : '',
                        identityPlace: detail?.identityPlace ? `${detail?.identityPlace}` : '',
                        passportNumber: detail?.passportNumber ? `${detail?.passportNumber}` : '',
                        passportDate: detail?.passportDate ? `${dayjs(detail?.passportDate).format('DD-MM-YYYY')}` : '',
                        passportExpired: detail?.passportExpired ? `${dayjs(detail?.passportExpired).format('DD-MM-YYYY')}` : '',
                        passportPlace: detail?.passportPlace ? `${detail?.passportPlace}` : '',
                        placeOfBirth: detail?.placeOfBirth ? `${detail?.placeOfBirth}` : '',
                        nation: detail ? nations.find((i: any) => i.value === detail?.nation) : '',
                        province: detail?.province ? `${detail?.province}` : '',
                        religion: detail?.religion ? `${detail?.religion}` : '',
                        maritalStatus: detail?.maritalStatus ? `${detail?.maritalStatus}` : '',
                        departmentId: detail?.departmentId ? department2?.find((i: any) => i.value === detail?.departmentId) : '',
                        positionId: detail?.positionId ? position2?.find((i: any) => i.value === detail?.positionId) : '',
                        dateOfJoin: detail?.dateOfJoin ? `${dayjs(detail?.dateOfJoin).format('DD-MM-YYYY')}` : '',
                        taxCode: detail?.taxCode ? `${detail?.taxCode}` : '',
                        bankAccount: detail?.bankAccount ? `${detail?.bankAccount}` : '',
                        bankName: detail?.bankName ? `${detail?.bankName}` : '',
                        fixedOvertimeHours: detail?.fixedOvertimeHours ? `${detail?.fixedOvertimeHours}` : null,
                        bankBranch: detail?.bankBranch ? `${detail?.bankBranch}` : '',
						isActive: detail?.account?.isActive,
                        othername: detail?.othername ? `${detail?.othername}` : '',
                        isCheckGPS: detail?.isCheckGPS ? detail?.isCheckGPS : false,
                        faceStatus: detail?.faceStatus ? detail?.faceStatus : 0,
                        userShifts: detail?.userShifts
                            ? detail?.userShifts
                                .map((i: any) => {
                                    return shift2?.find((item: any) => i.shiftId === item.value);
                                })
                                .filter((item: any) => item !== undefined)
                            : '',
                        directSuperior: detail?.directSuperior ? {
                            value: detail?.directSuperior?.id,
                            label: detail?.directSuperior?.fullName
                        } : '',
                        indirectSuperior: detail?.indirectSuperior ? human2?.find((i: any) => i.value === detail?.indirectSuperior) : '',
                    }}
                    validationSchema={SubmittedForm}
                    onSubmit={(values) => {
                        if (startDate > endDate) {
                            showMessage(`${t('update_staff_error')}`, 'error');
                        } else {
                            handleHuman(values);
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
                                            {t('general_infomation')}
                                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                                <IconCaretDown />
                                            </div>
                                        </button>
                                        <div className={`custom-content-accordion`}>
                                            <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                                <div className="space-y-2 border-[#d3d3d3] p-4 text-[13px] text-white-dark dark:border-[#1b2e4b]">
                                                    <div className="flex justify-center gap-5">
                                                        <div
                                                            className="custom-file-container"
                                                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                                            data-upload-id="myFirstImage"
                                                        >
                                                            <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                                                {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                                    <div className="upload__image-wrapper">
                                                                        {detail?.avatar ? (
                                                                            <div className="upfile_content">
                                                                                <img
                                                                                    src={`${process.env.NEXT_PUBLIC_MINIO_URL}${detail?.avatar}`}
                                                                                    alt="img"
                                                                                    className="m-auto"
                                                                                    style={{ width: '80px', height: '80px', borderRadius: '50px', objectFit: 'cover'}}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="upfile_content">
                                                                                <img
                                                                                    src="/assets/images/default.png"
                                                                                    alt="img"
                                                                                    className="m-auto"
                                                                                    style={{ width: '80px', height: '80px', borderRadius: '50px', objectFit: 'cover' }}
                                                                                />
                                                                            </div>
                                                                            // <div className="custom-uploadfile" style={{ cursor: 'pointer', border: 'none' }}>
                                                                            //     <div className="upfile_content" style={{ marginTop: imageList.length !== 0 ? '-1px' : '20px' }}>
                                                                            //         {imageList.length === 0 ? (
                                                                            //             <>
                                                                            //                 <img
                                                                            //                     src="/assets/images/default.png"
                                                                            //                     className="icon_upload"
                                                                            //                     style={{ width: '80px', height: '80px', margin: '-22px 0px', borderRadius: '50px' }}
                                                                            //                 ></img>
                                                                            //             </>
                                                                            //         ) : (
                                                                            //             <></>
                                                                            //         )}
                                                                            //         {imageList.map((image, index) => (<img key={index
                                                                            //         } src={image.dataURL}
                                                                            //             alt="img"
                                                                            //             className="m-auto"
                                                                            //             style={{ width: '80px', height: '80px', borderRadius: '50px' }}
                                                                            //         />
                                                                            //         ))}
                                                                            //     </div>
                                                                            // </div>
                                                                        )}
                                                                        &nbsp;
                                                                        <div className="label-container">
                                                                            <label className='italic' style={{ objectFit: 'contain', color: '#DC143C', fontWeight: 100, fontSize: '14px', marginBottom: '0' }}> {t('file_size')} </label>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </ImageUploading>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="code" className="label">
                                                                {' '}
                                                                {t('code_staff')}
                                                            </label>
                                                            <Field disabled autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_staff')}`} className="form-input" />
                                                            {submitCount ? errors.code ? <div className="mt-1 text-danger"> {errors.code} </div> : null : ''}
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="fullName" className="label">
                                                                {' '}
                                                                {t('surname_middle')}

                                                            </label>
                                                            <Field
                                                                disabled
                                                                autoComplete="off"
                                                                name="fullName"
                                                                type="text"
                                                                id="fullName "
                                                                placeholder={t('enter_surname_middle')}
                                                                className="form-input"
                                                            />
                                                            {submitCount ? errors.fullName ? <div className="mt-1 text-danger"> {errors.fullName} </div> : null : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="password" className="label">
                                                                {t('password')}
                                                            </label>
                                                            <Field
                                                                disabled
                                                                autoComplete="off"
                                                                name="password"
                                                                type="password"
                                                                id="password"
                                                                placeholder={`${t('enter_password')}`}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="email" className="label">
                                                                {' '}
                                                                Email
                                                            </label>
                                                            <Field disabled autoComplete="off" name="email" type="text" id="email" placeholder={t('enter_email')} className="form-input" />
                                                            {submitCount ? errors.email ? <div className="mt-1 text-danger"> {errors.email} </div> : null : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="phoneNumber" className="label">
                                                                {' '}
                                                                {t('phone_number')}
                                                            </label>
                                                            <Field
                                                                disabled
                                                                autoComplete="off"
                                                                name="phoneNumber"
                                                                type="text"
                                                                id="phoneNumber"
                                                                placeholder={t('enter_phone_number')}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* <button type="button" className="btn btn-outline-danger" onClick={() => handleCancel()}>
                                                                    {t('reset_password')}
                                                                </button> */}
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
                                                <div className="space-y-2 border-t border-[#d3d3d3] p-4 text-[13px] text-white-dark dark:border-[#1b2e4b]">
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="anotherName" className="label">
                                                                {' '}
                                                                {t('other_name')}
                                                            </label>
                                                            <Field
                                                                disabled
                                                                autoComplete="off"
                                                                name="anotherName"
                                                                type="text"
                                                                id="anotherName"
                                                                placeholder={t('enter_other_name')}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="birthDay" className="label">
                                                                {' '}
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
                                                                disabled
                                                                id="birthDay"
                                                                name="birthDay"
                                                                value={values.birthDay}
                                                                className="calender-input form-input"
                                                                placeholder={`${t('enter_date_of_birth')}`}
                                                                onChange={(e) => {
                                                                    if (e.length > 0) {
                                                                        setFieldValue('birthDay', dayjs(e[0]).format('DD-MM-YYYY'));
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="sex" className="label">
                                                                {' '}
                                                                {t('gender')}
                                                            </label>
                                                            <Select
                                                                isDisabled={true}
                                                                value={values?.sex}
                                                                id="sex"
                                                                name="sex"
                                                                options={gt}
                                                                placeholder={t('choose_gender')}
                                                                maxMenuHeight={160}
                                                                onChange={(newValue: any, actionMeta: any) => {
                                                                    setFieldValue('sex', newValue ? newValue : null);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="identityNumber" className="label">
                                                                {' '}
                                                                {t('id_number')}
                                                            </label>
                                                            <Field
                                                                disabled
                                                                autoComplete="off"
                                                                name="identityNumber"
                                                                type="number"
                                                                id="identityNumber"
                                                                placeholder={t('enter_id_number')}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="identityDate" className="label">
                                                                {' '}
                                                                {t('date_of_issue')}
                                                            </label>
                                                            <Flatpickr
                                                                disabled
                                                                options={{
                                                                    dateFormat: 'd-m-Y',
                                                                    position: 'auto left',
                                                                    locale: {
                                                                        ...chosenLocale,
                                                                    },
                                                                }}
                                                                id="identityDate"
                                                                name="identityDate"
                                                                value={values.identityDate}
                                                                onChange={(e) => {
                                                                    if (e.length > 0) {
                                                                        setFieldValue('identityDate', dayjs(e[0]).format('YYYY-MM-DD'));
                                                                    }
                                                                }}
                                                                className="calender-input form-input"
                                                                placeholder={`${t('enter_date_of_issue')}`}
                                                            />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="passportPlace" className="label">
                                                                {' '}
                                                                {t('address_issue')}
                                                            </label>
                                                            <Field
                                                                disabled
                                                                autoComplete="off"
                                                                name="identityPlace"
                                                                type="text"
                                                                id="identityPlace"
                                                                placeholder={t('enter_address_issue')}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="passportNumber" className="label">
                                                                {' '}
                                                                {t('id_passport')}
                                                            </label>
                                                            <Field
                                                                disabled
                                                                autoComplete="off"
                                                                name="passportNumber"
                                                                type="number"
                                                                id="passportNumber"
                                                                placeholder={t('enter_id_passport')}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="passportDate" className="label">
                                                                {' '}
                                                                {t('date_of_issue_passport')}
                                                            </label>
                                                            <Flatpickr
                                                                disabled
                                                                options={{
                                                                    dateFormat: 'd-m-Y',
                                                                    position: 'auto left',
                                                                    locale: {
                                                                        ...chosenLocale,
                                                                    },
                                                                }}
                                                                value={values.passportDate}
                                                                id="passportDate"
                                                                name="passportDate"
                                                                onChange={(e) => {
                                                                    if (e.length > 0) {
                                                                        setStartDate(dayjs(e[0]).format('YYYY-MM-DD'));
                                                                        setFieldValue('passportDate', dayjs(e[0]).format('YYYY-MM-DD'));
                                                                    }
                                                                }}
                                                                className="calender-input form-input"
                                                                placeholder={`${t('enter_date_of_issue_passport')}`}
                                                            />
                                                            {startDate > endDate ? <div className="mt-1 text-danger"> Vui lòng chọn ngày hết hạn sau ngày cấp </div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="passportPlace" className="label">
                                                                {' '}
                                                                {t('address_issue_passport')}
                                                            </label>
                                                            <Field
                                                                disabled
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
                                                                disabled
                                                                placeholder={'DD-MM-YYYY'}
                                                                options={{
                                                                    dateFormat: 'd-m-Y',
                                                                    position: 'auto left',
                                                                    locale: {
                                                                        ...chosenLocale,
                                                                    },
                                                                }}
                                                                value={values.passportExpired}
                                                                id="passportExpired"
                                                                name="passportExpired"
                                                                className="calender-input form-input"
                                                                onChange={(e) => {
                                                                    if (e.length > 0) {
                                                                        setEndDate(dayjs(e[0]).format('YYYY-MM-DD'));
                                                                        setFieldValue('passportExpired', dayjs(e[0]).format('YYYY-MM-DD'));
                                                                    }
                                                                }}
                                                            />
                                                            {startDate > endDate ? <div className="mt-1 text-danger"> Vui lòng chọn ngày hết hạn sau ngày cấp </div> : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="placeOfBirth" className="label">
                                                                {' '}
                                                                {t('place_of_birth')}
                                                            </label>
                                                            <Field
                                                                options={{
                                                                    dateFormat: 'd-m-Y',
                                                                    position: 'auto left',
                                                                }}
                                                                disabled
                                                                autoComplete="off"
                                                                name="placeOfBirth"
                                                                type="text"
                                                                id="placeOfBirth"
                                                                placeholder={t('enter_place_of_birth')}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="nation" className="label">
                                                                {' '}
                                                                {t('nation')}
                                                            </label>
                                                            <Select
                                                                isDisabled={true}
                                                            id="nation"
                                                            name="nation"
                                                            options={nations}
                                                            value={values.nation}
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
                                                            <Field disabled autoComplete="off" name="province" type="text" id="province" placeholder={t('enter_province')} className="form-input" />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="religion" className="label">
                                                                {' '}
                                                                {t('religion')}
                                                            </label>
                                                            <Field disabled autoComplete="off" name="religion" type="text" id="religion" placeholder={t('enter_religion')} className="form-input" />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="maritalStatus" className="label">
                                                                {' '}
                                                                {t('marital_status')}
                                                            </label>
                                                            <Field
                                                                disabled
                                                                autoComplete="off"
                                                                name="maritalStatus"
                                                                type="text"
                                                                id="maritalStatus"
                                                                placeholder={t('enter_marital_status')}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="contract" className="label">
                                                                {t('contract')}
                                                            </label>
                                                            <Select
                                                                isDisabled={true}
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
                                                                value={values?.contractInfo}
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
                                                <div className="space-y-2 border-t border-[#d3d3d3] p-4 text-[13px] text-white-dark dark:border-[#1b2e4b]">
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="departmentId" className="label">
                                                                {' '}
                                                                {t('Department_Parent')}
                                                            </label>
                                                            <Select
                                                                isDisabled={true}
                                                                value={values?.departmentId}
                                                                id="departmentId"
                                                                name="departmentId"
                                                                onInputChange={(e) => handleSearch(e)}
                                                                options={departmentparent}
                                                                placeholder={t('select_departmentparent')}
                                                                maxMenuHeight={160}
                                                                onChange={(newValue: any, actionMeta: any) => {
                                                                    setFieldValue('departmentId', newValue ? newValue : null);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="positionId" className="label">
                                                                {' '}
                                                                {t('duty')}
                                                            </label>
                                                            <Select
                                                                isDisabled={true}
                                                                value={defaultPosition}
                                                                id="positionId"
                                                                name="positionId"
                                                                placeholder={t('select_duty')}
                                                                onInputChange={(e) => handleSearch(e)}
                                                                options={position}
                                                                maxMenuHeight={160}
                                                                onChange={(newValue: any, actionMeta: any) => {
                                                                    setFieldValue('positionId', newValue ? newValue.value : null);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="directSuperior" className="label">
                                                                {' '}
                                                                {t('Manager')}{' '}
                                                            </label>
                                                            <Select
                                                                isDisabled={true}
                                                                value={values?.directSuperior}
                                                                id="directSuperior"
                                                                name="directSuperior"
                                                                onInputChange={(e) => handleSearch(e)}
                                                                options={human2}
                                                                placeholder={t('select_manager')}
                                                                maxMenuHeight={160}
                                                                onChange={(newValue: any, actionMeta: any) => {
                                                                    setFieldValue('directSuperior', newValue ? newValue : null);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="indirectSuperior" className="label">
                                                                {' '}
                                                                {t('Manager_2')}{' '}
                                                            </label>
                                                            <Select
                                                                isDisabled={true}
                                                                value={values?.indirectSuperior}
                                                                id="indirectSuperior"
                                                                name="indirectSuperior"
                                                                onInputChange={(e) => handleSearch(e)}
                                                                options={human2}
                                                                maxMenuHeight={160}
                                                                placeholder={t('select_manager_2')}
                                                                onChange={(newValue: any, actionMeta: any) => {
                                                                    setFieldValue('indirectSuperior', newValue ? newValue : null);
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
                                                                disabled
                                                                name="dateOfJoin"
                                                                id="dateOfJoin"
                                                                value={values.dateOfJoin}
                                                                options={{
                                                                    dateFormat: 'd-m-Y',
                                                                    position: 'auto left',
                                                                    locale: {
                                                                        ...chosenLocale,
                                                                    },
                                                                }}
                                                                onChange={(e) => {
                                                                    if (e.length > 0) {
                                                                        setFieldValue('dateOfJoin', dayjs(e[0]).format('YYYY-MM-DD'));
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
                                                            <Field disabled autoComplete="off" name="taxCode" type="text" id="taxCode" placeholder={t('enter_tax_code')} className="form-input" />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="bankAccount" className="label">
                                                                {' '}
                                                                {t('bank_number')}
                                                            </label>
                                                            <Field
                                                                disabled
                                                                autoComplete="off"
                                                                name="bankAccount"
                                                                type="number"
                                                                id="bankAccount"
                                                                placeholder={t('enter_bank_number')}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="bankName" className="label">
                                                                {' '}
                                                                {t('bank')}
                                                            </label>
                                                            <Field disabled autoComplete="off" name="bankName" type="text" id="bankName" placeholder={t('enter_bank')} className="form-input" />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2">
                                                            <label htmlFor="bankBranch" className="label">
                                                                {' '}
                                                                {t('branch')}
                                                            </label>
                                                            <Field disabled autoComplete="off" name="bankBranch" type="text" id="bankBranch" placeholder={t('enter_branch')} className="form-input" />
                                                        </div>
                                                        {/* <div className="mb-5 w-1/2">
                                                            <label htmlFor="userShifts" className="label">
                                                                {' '}
                                                                {t('choose_shift_')}{' '}
                                                            </label>
                                                            <Select
                                                                value={values?.userShifts}
                                                                id="userShifts"
                                                                name="userShifts"
                                                                isMulti
                                                                isDisabled={true}
                                                                closeMenuOnSelect={false}
                                                                maxMenuHeight={160}
                                                                placeholder={t('please_choose_shift')}
                                                                onChange={(newValue: any, actionMeta: any) => {
                                                                    setFieldValue('userShifts', newValue ? newValue : null);
                                                                }}
                                                            />
                                                        </div> */}
                                                          <div className="mb-5 w-1/2">
                                                            <label htmlFor="fixedOvertimeHours" className="label">
                                                                {' '}
                                                                {t('fixedOvertimeHours')}
                                                                <span
                                                                    style={{
                                                                        marginLeft: "0.2rem",
                                                                        textDecoration: "underline",
                                                                        cursor: "pointer",
                                                                        color: "red"
                                                                    }}
                                                                    onClick={() => handleOvertimeLogModal()}
                                                                >({t('view logs')} )</span>
                                                            </label>
                                                            <div className='flex'>
                                                                <Field
                                                                    disabled
                                                                    autoComplete="off"
                                                                    name="fixedOvertimeHours"
                                                                    type="number"
                                                                    id="fixedOvertimeHours"
                                                                    placeholder={t('enter_fixedOvertimeHours')}
                                                                    className="form-input ltr:rounded-r-none rtl:rounded-l-none"
                                                                />
                                                                <div className="flex items-center  justify-center font-semibold  dark:border-[#17263c]  dark:bg-[#1b2e4b]  ltr:rounded-r-md  ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0"
                                                                    style={{
                                                                        backgroundColor: 'rgb(235 235 235)'
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
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/2" style={{ display: 'flex' }}>
                                                            <label htmlFor="isCheckGPS" className="label">
                                                                {' '}
                                                                {t('status_timekeeping')}
                                                            </label>
                                                            <div className="flex" style={{ alignItems: 'center', marginLeft: '20px', marginTop: '-8px' }}>
                                                                <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                                                    <Field
                                                                        disabled
                                                                        autoComplete="off"
                                                                        type="checkbox"
                                                                        name="isCheckGPS"
                                                                        value={true}
                                                                        checked={values.isCheckGPS === true}
                                                                        className="form-checkbox disable"
                                                                        onChange={() => setFieldValue('isCheckGPS', !values?.isCheckGPS)}
                                                                    />
                                                                </label>

                                                            </div>
                                                        </div>
                                                        <div className="mb-5 w-1/2" style={{ display: 'flex' }}>
                                                            <label htmlFor="isCheckGPS" className="label">
                                                                {' '}
                                                                {t('faceStatus')}
                                                            </label>
                                                            <div className="flex" style={{ alignItems: 'center', marginLeft: '20px', marginTop: '-8px' }}>
                                                                <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                                                    <Field
                                                                        disabled
                                                                        autoComplete="off"
                                                                        type="checkbox"
                                                                        name="isCheckGPS"
                                                                        value={true}
                                                                        checked={values.faceStatus === 1}
                                                                        className="form-checkbox disable"

                                                                    />
                                                                </label>

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
														<div className="mb-5 w-1/2" style={{ display: 'flex' }}>
															<label htmlFor="isActive" className="label">
																{' '}
																{t('layoff_status')}
															</label>
															<div className="flex" style={{ alignItems: 'center', marginLeft: '20px', marginTop: '-8px' }}>
																<label style={{ marginBottom: 0, marginRight: '10px' }}>
																	<Field
                                                                    disabled
																		autoComplete="off"
																		type="checkbox"
																		name="isActive"
																		checked={values?.isActive === false}  // Điều kiện hiển thị trạng thái tích checkbox
																		onChange={() => setFieldValue('isActive', !values?.isActive)}
																		className="form-checkbox disable"
																	/>
																</label>
															</div>
														</div>
														<div className="mb-5 w-1/2"></div>
													</div>
                                                </div>
                                            </AnimateHeight>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            <OvertimeHoursLog
                openModal={viewLogModal}
                handleModal={handleOvertimeLogModal}
                data={fixedOvertimeHoursLog}
            />
        </div >
    );
};

export default EditPersonel;
