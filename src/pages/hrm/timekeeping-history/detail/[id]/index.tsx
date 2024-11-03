import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { showMessage } from '@/@core/utils';
import IconBack from '@/components/Icon/IconBack';
import { createHistoryTimekeeping, detailHistoryTimekeeping } from '@/services/apis/historyTimekeeping.api';
import { DropdownRole } from '@/services/swr/dropdown.swr';
import { GroupPositions } from '@/services/swr/group-position.swr';
import { Humans } from '@/services/swr/human.swr';
import { Timekeeper } from '@/services/swr/Timekeeper.swr';
import { IRootState } from '@/store';
import { setPageTitle } from '@/store/themeConfigSlice';
import { Lao } from "@/utils/lao";
import dayjs from 'dayjs';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import Flatpickr from 'react-flatpickr';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { useDebounce } from 'use-debounce';
import { IconLoading } from '@/components/Icon/IconLoading';
import * as Yup from 'yup';
interface Props {
    [key: string]: any;
}

const DetailHistory = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(`${t('detail_timekeeping')}`));
    });

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const router = useRouter();
    const [query, setQuery] = useState<any>();
    const [detail, setDetail] = useState<any>();
    const [dataRepairDropdown, setDataRepairDropdown] = useState<any>([]);
    const [pageRepair, setPageRepair] = useState<any>(1);
    const [searchR, setSearchR] = useState<any>();
    const maxNumber = 69;
    //scroll
    const [dataHuman, setDataHuman] = useState<any>([]);
    const [pageHuman, setSizeHuman] = useState<any>(1);
    const [debouncedPage] = useDebounce(pageHuman, 500);
    const [debouncedQuery] = useDebounce(query, 500);
    const [dataTimekeeper, setDataTimekeeper] = useState<any>([]);
    const [pageTimekeeper, setSizeTimekeeper] = useState<any>(1);
    const [loadDetail, setLoadDetail] = useState(true)
    //get data
    const { data: dropdownRepair, pagination: repairPagination, isLoading: repairLoading } = DropdownRole({ page: pageRepair, search: searchR });
    const { data: humans } = Humans({ page: 1, perPage: 100 });
    const humans1 = humans?.data.map((item: any) => ({
        value: item.id,
        label: item.fullName,
        code: item.code,
    }));
    const { data: timekeepers } = Timekeeper({ page: 1, perPage: 100 });
    const timekeepers1 = timekeepers?.data.map((item: any) => ({
        value: item.id,
        label: item.name,
    }));

    const { data: group_position, pagination: pagination1, mutate: mutate1 } = GroupPositions({ sortBy: 'id.ASC' });

    const [images, setImages] = useState<any>([]);
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };
    const SubmittedForm = Yup.object().shape({
        staffId: Yup.string().required(`${t('please_fill_name_timekeeper')}`),
        timesheet: Yup.string().required(`${t('please_choose_timesheet')}`),
        address: Yup.string().required(`${t('please_choose_address')}`),
    });
    useEffect(() => {
        const id = router.query.id;
        if (id) {
            detailHistoryTimekeeping(id)
                .then((res) => {
                    setLoadDetail(false)
                    setDetail(res?.data);
                })
                .catch((err: any) => {
                    console.log(err);
                });
        }
    }, [router]);
    const handleDuty = (value: any) => {
        createHistoryTimekeeping({
            ...value,
            lat: parseInt(value?.lat),
            lon: parseInt(value?.lon),
            staffId: value?.staffId,
        })
            .then(() => {
                showMessage(`${t('create_timekeeping_history_success')}`, 'success');
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
            });
    };
    useEffect(() => {
        if (repairPagination?.page === undefined) return;
        if (repairPagination?.page === 1) {
            setDataRepairDropdown(dropdownRepair?.data);
        } else {
            setDataRepairDropdown([...dataRepairDropdown, ...dropdownRepair?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repairPagination]);

    const handleSearchR = (param: any) => {
        setSearchR(param);
    };
    return (
        <div>
              {loadDetail && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
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
                    <Link href="/hrm/timekeeping-history" className="text-primary hover:underline">
                        <span>{t('timekeeping-history')}</span>
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('detail_timekeeping')}</span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">{t('detail_timekeeping')}</h1>
                <Link href={`/hrm/timekeeping-history?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                    <button type="button" className="btn btn-primary btn-sm back-button m-1">
                        <IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        <span>{t('back')}</span>
                    </button>
                </Link>
            </div>
            {detail?.id !== undefined && (
                <Formik
                    initialValues={{
                        lat: detail ? `${detail?.lat}` : '',
                        code: detail ? detail?.staff?.id: '',
                        lon: detail ? `${detail?.lon}` : '',
                        faceId: detail ? `${detail?.faceId}` : '',
                        status: detail?.status !== 1 ? `${t('GPS Attendance')}` : `${t('Face Attendance')}`,
                        address: detail?.address ? `${detail?.address}` : '',
                        createdAt: detail ? `${detail?.createdAt}` : '',
                        timeSheet: detail ? `${detail?.timeSheet}` : '',
                        staffId: detail ? {value: detail?.staff?.id, label: detail?.staff?.fullName} : '',
                        timekeeperId: detail ? timekeepers1?.find((i: any) => i.value === detail?.timekeeperId) : '',
                    }}
                    validationSchema={SubmittedForm}
                    onSubmit={(values) => {
                        handleDuty(values);
                    }}
                >
                    {({ errors, touched, submitCount, setFieldValue, values }) => (
                        <Form className="space-y-5">
                            <div className="flex justify-between gap-5">
                                <div className="mb-5 w-1/2">
                                    <div className="custom-file-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column-reverse' }} data-upload-id="myFirstImage">
                                        <div className="label-container" style={{ marginBottom: '0', marginRight: '20px' }}>
                                            <label style={{ color: '#476704', fontSize: '14px', marginBottom: '0' }}> {t('avatar_timekeeping')} </label>
                                        </div>
                                        <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                            {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                <div className="upload__image-wrapper">
                                                    {detail?.image ? (
                                                        <div className="upfile_content" style={{ marginTop: imageList.length !== 0 ? '-1px' : '20px' }}>
                                                            <img
                                                                src={`${process.env.NEXT_PUBLIC_MINIO_URL}/${detail?.image}`}
                                                                alt="img"
                                                                className="m-auto"
                                                                style={{ width: '430', height: '480px', borderRadius: '56px' }}
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
                                    </div>
                                </div>
                                <div className="mb-5 w-1/2">
                                    <label htmlFor="staffId" className="label" style={{ marginTop: '25px' }}>
                                        {' '}
                                        {t('human_timekeeping')}
                                    </label>
                                    <Select
                                        isDisabled={true}
                                        id="staffId"
                                        name="staffId"
                                        options={humans1}
                                        value={values?.staffId}
                                        onMenuOpen={() => setSizeHuman(1)}
                                        maxMenuHeight={160}
                                        placeholder={`${t('human_timekeeping')}`}
                                        onInputChange={(e) => handleSearchR(e)}
                                        onChange={(selectedOption: any) => {
                                            const assigneeId = selectedOption ? selectedOption.value : '';
                                            setFieldValue('staffId', assigneeId);
                                        }}
                                    />
                                    {submitCount && errors.staffId ? <div className="mt-1 text-danger"> {`${errors.staffId}`} </div> : null}

                                    <label htmlFor="code" className="label" style={{ marginTop: '25px' }}>
                                        {' '}
                                        {t('code_staff')}
                                    </label>
                                    <Field disabled autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_address')}`} className="form-input" />
                                    {detail?.status === 2 ? (
                                        <>
                                            <div>
                                                <label htmlFor="lat" className="label" style={{ marginTop: '25px' }}>
                                                    {' '}
                                                    {t('lat')}{' '}
                                                </label>
                                                <Field disabled autoComplete="off" name="lat" type="number" id="lat" placeholder={`${t('enter_lat')}`} className="form-input" />
                                                {submitCount ? errors.lat ? <div className="mt-1 text-danger"> {errors.lat} </div> : null : ''}
                                            </div>
                                            <div>
                                                <label htmlFor="lon" className="label" style={{ marginTop: '25px' }}>
                                                    {' '}
                                                    {t('lon')}{' '}
                                                </label>
                                                <Field disabled autoComplete="off" name="lon" type="number" id="lon" placeholder={`${t('enter_lon')}`} className="form-input" />
                                                {submitCount ? errors.lon ? <div className="mt-1 text-danger"> {errors.lon} </div> : null : ''}
                                            </div>
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                    <div>
                                        {/* {detail?.status === 2 ? (
                                            <div>
                                                <label htmlFor="address" className="label" style={{ marginTop: '25px' }}>
                                                    {' '}
                                                    {t('address')}
                                                </label>
                                                <Field disabled autoComplete="off" name="address" type="text" id="address" placeholder={`${t('enter_address')}`} className="form-input" />
                                                {submitCount ? errors.address ? <div className="mt-1 text-danger"> {errors.address} </div> : null : ''}
                                            </div>
                                        ) : (
                                            <div>
                                                <label htmlFor="faceId" className="label" style={{ marginTop: '25px' }}>
                                                    {' '}
                                                    {t('faceId')}{' '}
                                                </label>
                                                <Field disabled autoComplete="off" name="faceId" type="text" id="faceId" placeholder={`${t('faceId')}`} className="form-input" />
                                            </div>
                                        )} */}
                                        <div>
                                            <label className="label" style={{ marginTop: '25px' }} htmlFor="createdAt">{t('timesheet')}</label>
                                            <Flatpickr
                                                options={{
                                                    locale: {
                                                        ...chosenLocale,
                                                    },
                                                    enableTime: true,
                                                    dateFormat: 'H:i:s d-m-Y',
                                                    time_24hr: true,
                                                }}
                                                disabled={true}
                                                value={values.timeSheet}
                                                onChange={(e: any) => {
                                                    if (e?.length > 0) {
                                                        setFieldValue('timeSheet', dayjs(e[0]).toISOString());
                                                    }
                                                }}
                                                placeholder={`${t('choose_timesheet')}`}
                                                className="calender-input form-input"
                                            />
                                            {submitCount ? errors.createdAt ? <div className="mt-1 text-danger"> {errors.createdAt} </div> : null : ''}
                                        </div>
                                        <div>
                                            <label htmlFor="timekeeperId" className="label" style={{ marginTop: '25px' }}>
                                                {' '}
                                                {t('machine_timekeeping')}
                                            </label>
                                            <Select
                                                isDisabled={true}
                                                id="timekeeperId"
                                                name="timekeeperId"
                                                options={timekeepers1}
                                                value={values?.timekeeperId}
                                                onMenuOpen={() => setSizeHuman(1)}
                                                maxMenuHeight={160}
                                                placeholder={`${t('machine_timekeeping')}`}
                                                onInputChange={(e) => handleSearchR(e)}
                                                onChange={(selectedOption: any) => {
                                                    const assigneeId = selectedOption ? selectedOption.value : '';
                                                    setFieldValue('timekeeperId', assigneeId);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="status" className="label" style={{ marginTop: '25px' }}>
                                                {' '}
                                                {t('status')}{' '}
                                            </label>
                                            <Field disabled autoComplete="off" name="status" type="text" id="status" placeholder={`${t('status')}`} className="form-input" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </div>
        </div>
    );
};

export default DetailHistory;
