import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

import { Dialog, Transition } from '@headlessui/react';

import { IconLoading } from '@/components/Icon/IconLoading';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { dateFormatDay, showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Select from 'react-select';
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
import { loadMore, removeNullProperties, toDateString } from '@/utils/commons';
import { useDebounce } from 'use-debounce';

import IconPencilPaper from '@/components/Icon/IconPencilPaper';
import IconCoffee from '@/components/Icon/IconCoffee';
import IconCalendar from '@/components/Icon/IconCalendar';
import IconMail from '@/components/Icon/IconMail';
import IconPhone from '@/components/Icon/IconPhone';
import IconMapPin from '@/components/Icon/IconMapPin';
// import provinces from '../provinces';
import dayjs from 'dayjs';
import { start } from 'nprogress';
import { Label } from '@headlessui/react/dist/components/label/label';
import { Shifts } from '@/services/swr/shift.swr';
import OvertimeHoursLog from "../../modal/OvertimeHoursLog"

interface Props {
    [key: string]: any;
}
interface list {
    value: string;
    label: string;
}
const DetailPersonel = ({ ...props }: Props) => {
    const router = useRouter();
    const [query, setQuery] = useState<any>('');
    const [detail, setDetail] = useState<any>();

    const [images, setImages] = useState<any>([]);
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };
    const [passportDate, setPassportDate] = useState<any>();
    const maxNumber = 69;
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [defaultPosition, setdefaultPosition] = useState<any>([]);
    const [startDate, setStartDate] = useState<any>();
    const [endDate, setEndDate] = useState<any>();
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
    const [checkbox, setCheckox] = useState();
    const { data: departmentparents, pagination: paginationDepartment, isLoading: DepartmentLoading } = Departments({ page: debouncedPage, search: debouncedQuery?.search });
    const [fixedOvertimeHoursLog, setOvertimeHoursLog] = useState<any>([]);
    const [viewLogModal, setViewLogModal] = useState(false);
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
    useEffect(() => {
        if (paginationPosition?.page === undefined) return;
        if (paginationPosition?.page === 1) {
            setDataPosition(
                positions?.data.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                })),
            );
        } else {
            setDataPosition([
                ...dataPosition,
                ...positions?.data.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                })),
            ]);
        }
    }, [paginationPosition, debouncedPage, debouncedQuery]);
    //--------------setData--------------------
    const { data: shifts1 } = Shifts({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100,
    });
    const shift2 = shifts1?.data.map((item: any) => ({
        value: item.id,
        label: item.name,
    }));
    const { data: department1 } = Departments({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100,
    });
    const department2 = department1?.data.map((item: any) => ({
        value: item.id,
        label: item.name,
    }));
    const { data: human1 } = Humans({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100,
    });
    const human2 = human1?.data.map((item: any) => ({
        value: item.id,
        label: item.fullName,
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
    ///////////////////////////
    const SubmittedForm = Yup.object().shape({
        fullName: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_name_staff')}`),
        code: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_code')}`),
        password: Yup.string().required(`${t('please_enter_password')}`),
        password_: Yup.string()
            .required('Vui lòng nhập lại mật khẩu')
            .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp'),
    });
    const handleSearch = (param: any) => {
        setQuery(param);
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

        formdata.append('code', value.code);
        formdata.append('fullName', value.fullName);
        if (value.password !== 'nullll') {
            formdata.append('password', value.password);
        }
        if (images[0]) formdata.append('avatar', images[0].file);
        if (value?.phoneNumber !== '') formdata.append('phoneNumber', value.phoneNumber);
        if (value?.email !== '') formdata.append('email', value.email);
        if (value?.birthDay !== '') formdata.append('birthDay', dateFormatDay(value.birthDay));
        if (value?.sex !== undefined) formdata.append('sex', value.sex?.value);
        if (value?.nation !== '') formdata.append('nation', value.nation);
        if (value?.religion !== '') formdata.append('religion', value.religion);
        if (value?.anotherName !== '') formdata.append('anotherName', value.anotherName);
        if (value?.identityNumber !== '') formdata.append('identityNumber', value.identityNumber);
        if (value?.identityDate !== '') formdata.append('identityDate', dateFormatDay(value.identityDate));
        if (value?.identityPlace !== '') formdata.append('identityPlace', value.identityPlace);
        if (value?.passportNumber !== '') formdata.append('passportNumber', value.passportNumber);
        if (value?.passportDate !== '') formdata.append('passportDate', dateFormatDay(value.passportDate));
        if (value?.passportPlace !== '') formdata.append('passportPlace', value.passportPlace);
        if (value?.passportExpired !== '') formdata.append('passportExpired', dateFormatDay(value.passportExpired));
        if (value?.placeOfBirth !== '') formdata.append('placeOfBirth', value.placeOfBirth);
        if (value?.maritalStatus !== '') formdata.append('maritalStatus', value.maritalStatus);
        if (value?.departmentId?.value !== undefined) formdata.append('departmentId', value.departmentId?.value);
        if (value?.positionId !== '') formdata.append('positionId', value.positionId?.value);
        if (value?.indirectSuperior?.value !== undefined) formdata.append('indirectSuperior', value.indirectSuperior?.value);
        if (value?.directSuperior?.value !== undefined) formdata.append('directSuperior', value.directSuperior?.value);
        if (value?.contractInfo?.value !== undefined) formdata.append('contractInfo', value.contractInfo?.value);
        if (value?.dateOfJoin !== '') formdata.append('dateOfJoin', dateFormatDay(value.dateOfJoin));
        if (value?.taxCode !== '') formdata.append('taxCode', value.taxCode);
        if (value?.bankAccount !== '') formdata.append('bankAccount', value.bankAccount);
        if (value?.bankName !== '') formdata.append('bankName', value.bankName);
        if (value.bankBranch !== '') formdata.append('bankBranch', value.bankBranch);
        if (value?.province !== '') formdata.append('province', value?.province);
        if (value.fixedOvertimeHours && value.fixedOvertimeHours !== null) formdata.append('fixedOvertimeHours', value.fixedOvertimeHours);
        if (value?.isCheckGPS !== '0') {
            formdata.append('isCheckGPS', '1');
        } else {
            formdata.append('isCheckGPS', '0');
        }
        if (value.userShifts !== '') formdata.append('shiftIds', value?.userShifts?.map((i: any) => i.value).join(','));
        updateHuman(detail?.id, formdata)
            .then(() => {
                showMessage(`${t('update_staff_success')}`, 'success');
                router.push('/hrm/personnel');
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
            });
    };
    useEffect(() => {
        const id = router.query.id;
        if (id) {
            detailHuman(id)
                .then((res) => {
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
        { value: 0, label: `${t('male')}` },
        { value: 1, label: `${t('female')}` },
    ];
    const handleOvertimeLogModal = () => {
        setViewLogModal(!viewLogModal); //
    }
    return (
        <div>
            <div className="p-5">
                <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/hrm/dashboard" className="text-primary hover:underline">
                            {t('dashboard')}
                        </Link>
                    </li>

                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{`${t('profile')}`}</span>
                    </li>
                </ul>

                <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="panel">
                        <div className="mb-5 flex items-center justify-between">
                            <h5 className="text-lg font-semibold dark:text-white-light">{`${t('profile')}`}</h5>
                            <Link href={`/hrm/profile/${detail?.id}`} className="btn btn-primary rounded-full p-2 ltr:ml-auto rtl:mr-auto">
                                <IconPencilPaper />
                            </Link>
                        </div>
                        <div className="mb-5">
                            <div className="flex flex-col items-center justify-center">
                                <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                        <div className="upload__image-wrapper">
                                            {detail?.avatar ? (
                                                <div className="upfile_content" style={{ marginTop: imageList.length !== 0 ? '-1px' : '20px' }}>
                                                    <img
                                                    
                                                        src={`${process.env.NEXT_PUBLIC_MINIO_URL}${detail.avatar}`}
                                                        alt="img"
                                                        className="m-auto"
                                                        style={{ width: '80px', height: '80px', borderRadius: '50px' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="custom-uploadfile" style={{ cursor: 'pointer', border: 'none' }}>
                                                    <div className="upfile_content" style={{ marginTop: imageList.length !== 0 ? '-1px' : '20px' }}>
                                                        {imageList.length === 0 ? (
                                                            <>
                                                                <img
                                                                    src="/assets/images/default.png"
                                                                    className="icon_upload"
                                                                    style={{ width: '80px', height: '80px', margin: '-22px 0px', borderRadius: '50px' }}
                                                                ></img>
                                                            </>
                                                        ) : (
                                                            <></>
                                                        )}
                                                        {imageList.map((image, index) => (
                                                            <img key={index} src={image.dataURL} alt="img" className="m-auto" style={{ width: '80px', height: '80px', borderRadius: '50px' }} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            &nbsp;
                                        </div>
                                    )}
                                </ImageUploading>
                                <p className="text-xl font-semibold text-primary">{detail?.fullName}</p>
                            </div>
                            <ul className="m-auto mt-5 flex max-w-[160px] flex-col space-y-4 font-semibold text-white-dark">
                                <li className="flex items-center gap-2">
                                    <IconCoffee className="shrink-0" />
                                    {detail?.code}
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconCalendar className="shrink-0" />
                                    {toDateString(detail?.birthDay)}
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconMapPin className="shrink-0" />
                                    {detail?.identityPlace}
                                </li>
                                <li>
                                    <button className="flex items-center gap-2">
                                        <IconMail className="h-5 w-5 shrink-0" />
                                        <span className="truncate text-primary">{detail?.email}</span>
                                    </button>
                                </li>
                                <li className="flex items-center gap-2">
                                    <IconPhone />
                                    <span className="whitespace-nowrap" dir="ltr">
                                        {detail?.passportNumber}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="panel lg:col-span-2 xl:col-span-3">
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
                                nation: detail?.nation ? `${detail?.nation}` : '',
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
                                isActive: detail?.isActive ? `${detail?.isActive}` : true,
                                othername: detail?.othername ? `${detail?.othername}` : '',
                                isCheckGPS: detail?.isCheckGPS ? detail?.isCheckGPS : false,
                                userShifts: detail?.userShifts
                                    ? detail?.userShifts
                                        .map((i: any) => {
                                            return shift2?.find((item: any) => i.shiftId === item.value);
                                        })
                                        .filter((item: any) => item !== undefined)
                                    : '',
                                directSuperior: detail?.directSuperior ? human2?.find((i: any) => i.value === detail?.directSuperior) : '',
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
                                                    <AnimateHeight duration={300} height='auto'>
                                                        <div className="space-y-2 border-t border-[#d3d3d3] p-4 text-[13px] dark:border-[#1b2e4b]">
                                                            <div className="flex justify-between gap-5">
                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="anotherName" className="label">
                                                                        {' '}
                                                                        {t('other_name')}
                                                                    </label>
                                                                    <Field
                                                                        disabled autoComplete="off"
                                                                        name="anotherName"
                                                                        type="text"
                                                                        id="anotherName"
                                                                        placeholder={t('enter_other_name')}
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                                {/* <div className="mb-5 w-1/2">
																	<label htmlFor="birthDay" className="label">
																		{' '}
																		{t('date_of_birth')}
																	</label>
																	<Flatpickr disabled
																		options={{
																			dateFormat: 'd-m-Y',
																			position: 'auto left',
																		}}
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
																</div> */}
                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="sex" className="label">
                                                                        {' '}
                                                                        {t('gender')}
                                                                    </label>
                                                                    <Select
                                                                        isDisabled
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
                                                            </div>
                                                            <div className="flex justify-between gap-5">

                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="identityNumber" className="label">
                                                                        {' '}
                                                                        {t('id_number')}
                                                                    </label>
                                                                    <Field
                                                                        disabled autoComplete="off"
                                                                        name="identityNumber"
                                                                        type="number"
                                                                        id="identityNumber"
                                                                        placeholder={t('enter_id_number')}
                                                                        className="form-input"
                                                                        inputMode="numeric"
                                                                        onChange={(e: any) => setFieldValue('identityNumber', e.target.value)}
                                                                        onInput={(e: any) => {
                                                                            e.target.value = e.target.value.toString().slice(0, 12);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="identityDate" className="label">
                                                                        {' '}
                                                                        {t('date_of_issue')}
                                                                    </label>
                                                                    <Flatpickr disabled
                                                                        options={{
                                                                            dateFormat: 'd-m-Y',
                                                                            position: 'auto left',
                                                                        }}
                                                                        id="identityDate"
                                                                        name="identityDate"
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
                                                            </div>
                                                            <div className="flex justify-between gap-5">

                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="identityPlace" className="label">
                                                                        {' '}
                                                                        {t('address_issue')}
                                                                    </label>
                                                                    <Field
                                                                        disabled autoComplete="off"
                                                                        name="identityPlace"
                                                                        type="text"
                                                                        id="identityPlace"
                                                                        placeholder={t('enter_address_issue')}
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="passportNumber" className="label">
                                                                        {' '}
                                                                        {t('id_passport')}
                                                                    </label>
                                                                    <Field
                                                                        disabled autoComplete="off"
                                                                        name="passportNumber"
                                                                        type="number"
                                                                        id="passportNumber"
                                                                        placeholder={t('enter_id_passport')}
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between gap-5">

                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="passportDate" className="label">
                                                                        {' '}
                                                                        {t('date_of_issue_passport')}
                                                                    </label>
                                                                    <Flatpickr disabled
                                                                        options={{
                                                                            dateFormat: 'd-m-Y',
                                                                            position: 'auto left',
                                                                        }}
                                                                        value={values.passportDate}
                                                                        id="passportDate"
                                                                        name="passportDate"
                                                                        onChange={(e) => {
                                                                            if (e.length > 0) {
                                                                                setStartDate(dayjs(e[0]).format('YYYY-MM-DD'));
                                                                                setFieldValue('passportDate', dayjs(e[0]).format('DD-MM-YYYY'));
                                                                            }
                                                                        }}
                                                                        className="calender-input form-input"
                                                                        placeholder={`${t('enter_date_of_issue_passport')}`}
                                                                    />
                                                                    {startDate >= endDate && startDate != null && endDate != null ? (
                                                                        <div className="mt-1 text-danger"> Vui lòng chọn ngày hết hạn sau ngày cấp </div>
                                                                    ) : (
                                                                        ''
                                                                    )}
                                                                </div>
                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="passportPlace" className="label">
                                                                        {' '}
                                                                        {t('address_issue_passport')}
                                                                    </label>
                                                                    <Field
                                                                        disabled autoComplete="off"
                                                                        name="passportPlace"
                                                                        type="text"
                                                                        id="passportPlace"
                                                                        placeholder={t('enter_address_issue_passport')}
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between gap-5">

                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="passportExpired" className="label">
                                                                        {' '}
                                                                        {t('date_end_passport')}
                                                                    </label>
                                                                    <Flatpickr disabled
                                                                        options={{
                                                                            dateFormat: 'd-m-Y',
                                                                            position: 'auto left',
                                                                        }}
                                                                        value={values.passportExpired}
                                                                        id="passportExpired"
                                                                        name="passportExpired"
                                                                        placeholder={t('enter_date_end_passport') || ''}
                                                                        className="calender-input form-input"
                                                                        onChange={(e) => {
                                                                            if (e.length > 0) {
                                                                                setEndDate(dayjs(e[0]).format('YYYY-MM-DD'));
                                                                                setFieldValue('passportExpired', dayjs(e[0]).format('DD-MM-YYYY'));
                                                                            }
                                                                        }}
                                                                    />
                                                                    {startDate >= endDate && startDate != null && endDate != null ? (
                                                                        <div className="mt-1 text-danger"> Vui lòng chọn ngày hết hạn sau ngày cấp </div>
                                                                    ) : (
                                                                        ''
                                                                    )}
                                                                </div>
                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="placeOfBirth" className="label">
                                                                        {' '}
                                                                        {t('place_of_birth')}
                                                                    </label>
                                                                    <Field
                                                                        disabled autoComplete="off"
                                                                        name="placeOfBirth"
                                                                        type="text"
                                                                        id="placeOfBirth"
                                                                        placeholder={t('enter_place_of_birth')}
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between gap-5">

                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="nation" className="label">
                                                                        {' '}
                                                                        {t('nation')}
                                                                    </label>
                                                                    <Field disabled autoComplete="off" name="nation" type="text" id="nation" placeholder={t('enter_nation')} className="form-input" />
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
                                                                        disabled autoComplete="off"
                                                                        name="maritalStatus"
                                                                        type="text"
                                                                        id="maritalStatus"
                                                                        placeholder={t('enter_marital_status')}
                                                                        className="form-input"
                                                                    />
                                                                </div>
                                                                <div className="mb-5 w-1/2">
                                                                    <label htmlFor="contractInfo" className="label">
                                                                        {t('contract')}
                                                                    </label>
                                                                    <Select
                                                                        isDisabled
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
                                        </div>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
                <><Formik
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
                        nation: detail?.nation ? `${detail?.nation}` : '',
                        province: detail?.province ? `${detail?.province}` : '',
                        religion: detail?.religion ? `${detail?.religion}` : '',
                        maritalStatus: detail?.maritalStatus ? `${detail?.maritalStatus}` : '',
                        departmentId: detail?.departmentId ? department2?.find((i: any) => i.value === detail?.departmentId) : '',
                        positionId: detail?.positionId ? position2?.find((i: any) => i.value === detail?.positionId) : '',
                        dateOfJoin: detail?.dateOfJoin ? `${dayjs(detail?.dateOfJoin).format('DD-MM-YYYY')}` : '',
                        taxCode: detail?.taxCode ? `${detail?.taxCode}` : '',
                        bankAccount: detail?.bankAccount ? `${detail?.bankAccount}` : '',
                        bankName: detail?.bankName ? `${detail?.bankName}` : '',
                        bankBranch: detail?.bankBranch ? `${detail?.bankBranch}` : '',
                        isActive: detail?.isActive ? `${detail?.isActive}` : true,
                        othername: detail?.othername ? `${detail?.othername}` : '',
                        isCheckGPS: detail?.isCheckGPS ? detail?.isCheckGPS : false,
                        userShifts: detail?.userShifts
                            ? detail?.userShifts
                                .map((i: any) => {
                                    return shift2?.find((item: any) => i.shiftId === item.value);
                                })
                                .filter((item: any) => item !== undefined)
                            : '',
                        directSuperior: detail?.directSuperior ? human2?.find((i: any) => i.value === detail?.directSuperior) : '',
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

                            <div className="rounded">
                                <button type="button" className={`custom-accordion flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(3)}>
                                    {t('other_information')}
                                    <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(3) ? 'rotate-180' : ''}`}>
                                        <IconCaretDown />
                                    </div>
                                </button>
                                <div className={`custom-content-accordion`}>
                                    <AnimateHeight duration={300} height='auto'>
                                        <div className="space-y-2 border-t border-[#d3d3d3] p-4 text-[13px] dark:border-[#1b2e4b]">
                                            <div className="flex justify-between gap-5">
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="departmentId" className="label">
                                                        {' '}
                                                        {t('Department_Parent')}
                                                    </label>
                                                    <Select
                                                        isDisabled
                                                        value={values?.departmentId}
                                                        id="departmentId"
                                                        name="departmentId"
                                                        onInputChange={(e) => handleSearchDepartment(e)}
                                                        options={dataDepartment}
                                                        onMenuOpen={() => setSizeDepartment(1)}
                                                        placeholder={t('select_departmentparent')}
                                                        maxMenuHeight={160}
                                                        isLoading={loadDepartment}
                                                        onMenuScrollToBottom={() => handleOnScrollBottom()}
                                                        onChange={(newValue: any, actionMeta: any) => {
                                                            setFieldValue('departmentId', newValue ? newValue : null);
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
                                                        isDisabled
                                                        value={values?.positionId}
                                                        id="positionId"
                                                        name="positionId"
                                                        placeholder={t('select_duty')}
                                                        onInputChange={(e) => handleSearchPosition(e)}
                                                        options={dataPosition}
                                                        maxMenuHeight={160}
                                                        isLoading={loadPosition}
                                                        onMenuOpen={() => setSizePosition(1)}
                                                        onMenuScrollToBottom={() => handleOnScrollBottomPosition()}
                                                        onChange={(newValue: any, actionMeta: any) => {
                                                            setFieldValue('positionId', newValue ? newValue : null);
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
                                                        isDisabled
                                                        value={values?.directSuperior}
                                                        id="directSuperior"
                                                        name="directSuperior"
                                                        onInputChange={(e) => handleSearchDirect(e)}
                                                        options={dataDirectSuperior}
                                                        onMenuOpen={() => setSizeDirectSuperior(1)}
                                                        isLoading={loadHuman}
                                                        onMenuScrollToBottom={() => handleOnScrollBottomDirectSuperior()}
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
                                                        isDisabled
                                                        value={values?.indirectSuperior}
                                                        id="indirectSuperior"
                                                        name="indirectSuperior"
                                                        onInputChange={(e) => handleSearchDirect(e)}
                                                        options={dataDirectSuperior}
                                                        onMenuOpen={() => setSizeDirectSuperior(1)}
                                                        onMenuScrollToBottom={() => handleOnScrollBottomDirectSuperior()}
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

                                                    <Flatpickr disabled
                                                        name="dateOfJoin"
                                                        id="dateOfJoin"
                                                        value={values.dateOfJoin}
                                                        options={{
                                                            dateFormat: 'd-m-Y',
                                                            position: 'auto left',
                                                        }}
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
                                                        disabled autoComplete="off"
                                                        name="taxCode"
                                                        type="number"
                                                        id="taxCode"
                                                        placeholder={t('enter_tax_code')}
                                                        className="form-input"
                                                        onChange={(e: any) => setFieldValue('taxCode', e.target.value)}
                                                        onInput={(e: any) => {
                                                            e.target.value = e.target.value.toString().slice(0, 10);
                                                        }}
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
                                                        disabled autoComplete="off"
                                                        name="bankAccount"
                                                        type="number"
                                                        id="bankAccount"
                                                        placeholder={t('enter_bank_number')}
                                                        className="form-input"
                                                        onChange={(e: any) => setFieldValue('bankAccount', e.target.value)}
                                                        onInput={(e: any) => {
                                                            e.target.value = e.target.value.toString().slice(0, 10);
                                                        }}
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
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="userShifts" className="label">
                                                        {' '}
                                                        {t('choose_shift_')}{' '}
                                                    </label>
                                                    <Select
                                                        isDisabled
                                                        value={values?.userShifts}
                                                        id="userShifts"
                                                        name="userShifts"
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
                                                            setFieldValue('userShifts', newValue ? newValue : null);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between gap-5">
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
                                                    <div className="flex">
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
                                                <div className="mb-5 w-1/2" style={{ display: 'flex', alignItems: "flex-start" }}>
                                                    <label htmlFor="isCheckGPS" className="label">
                                                        {' '}
                                                        {t('status_timekeeping')}
                                                    </label>
                                                    <div className="flex" style={{ alignItems: 'center', marginLeft: '20px' }}>
                                                        <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                                            <Field
                                                                disabled autoComplete="off"
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

                        </Form>
                    )}
                </Formik></>
            </div>
            <OvertimeHoursLog
                openModal={viewLogModal}
                handleModal={handleOvertimeLogModal}
                data={fixedOvertimeHoursLog}
            />
        </div>
    );
};

export default DetailPersonel;