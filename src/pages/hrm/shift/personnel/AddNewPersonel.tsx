import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
import ImageUploading, { ImageListType } from 'react-images-uploading';
import list_departments from '../../department/department_list.json';
import list_personnels from '../personnel/personnel_list.json';
import list_duty from "../../duty/duty_list.json";
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
interface Props {
    [key: string]: any;
}

const AddNewPersonel = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [query, setQuery] = useState<any>();
    const [images, setImages] = useState<any>([]);
    const [listDepartment, setListDepartment] = useState<any>();
    const [listPersons, setListPersons] = useState<any>();
    const [listDuty, setListDuty] = useState<any>([]);
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
    const onChange = (imageList: ImageListType, addUpdateIndex: number[] | undefined) => {
        setImages(imageList as never[]);
    };
    const maxNumber = 69;

    const [typeShift, setTypeShift] = useState("0"); // 0: time, 1: total hours
    const { data: departmentparents } = ProductCategorys(query);
    const { data: manages } = Providers(query);
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
            .required(`${t('please_fill_name_staff')}`),
        code: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_Xaypayouode')}`),
        surname: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_surname_name')}`),
        email: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_email')}`),
        phone: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_phone')}`),
        userName: Yup.string()
            .min(2, 'Too Short!')
            .required(`${t('please_fill_username')}`),
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
    return (

        <div className="p-5">
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{t('add_staff')}</h1>
                <Link href="/hrm/personnel">
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
                    name: props?.data ? `${props?.data?.name}` : '',
                    code: props?.data ? `${props?.data?.code}` : '',
                    surname: props?.data ? `${props?.data?.surname}` : '',
                    email: props?.data ? `${props?.data?.email}` : '',
                    phone: props?.data ? `${props?.data?.phone}` : '',
                    userName: props?.data ? `${props?.data?.userName}` : '',
                    othername: props?.data ? `${props?.data?.othername}` : '',
                    dateofbirth: props?.data ? `${props?.data?.dateofbirth}` : '',
                    sex: props?.data ? {
                        value: `${props?.data?.sex.id}`,
                        label: `${props?.data?.sex.name}`
                    } : "",
                    IDnumber: props?.data ? `${props?.data?.IDnumber}` : '',
                    dateissue: props?.data ? `${props?.data?.dateissue}` : '',
                    manageId: props?.data ? {
                        value: `${props?.data?.manage.id}`,
                        label: `${props?.data?.manage.name}`
                    } : "",
                    departmentparentId: props?.data ? {
                        value: `${props?.data?.departmentparent.id}`,
                        label: `${props?.data?.departmentparent.name}`
                    } : "",

                }}
                validationSchema={SubmittedForm}
                onSubmit={() => { }}

            >
                {({ errors, touched, values, setFieldValue, submitCount }) => (
                    <Form className="space-y-5">
                        <div className="mb-5">

                            <div className="space-y-2 font-semibold">
                                <div className="rounded">
                                    <button
                                        type="button"
                                        className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion`}
                                        onClick={() => togglePara('1')}
                                    >
                                        {t('general_infomation')}                                        <div className={`ltr:ml-auto rtl:mr-auto ${active === '1' ? 'rotate-180' : ''}`}>
                                            <IconCaretDown />
                                        </div>
                                    </button>
                                    <div className={`custom-content-accordion`}>

                                        <AnimateHeight duration={300} height={'auto'}>
                                            <div className="space-y-2 border-[#d3d3d3] p-4 text-[13px] text-white-dark dark:border-[#1b2e4b]">
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <div className="custom-file-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} data-upload-id="myFirstImage">
                                                            <div className="label-container" style={{ marginBottom: '0', marginRight: '20px' }}>
                                                                <label style={{ color: '#476704', fontSize: '14px', marginBottom: '0' }}> {t('update_avatar')} </label>
                                                            </div>
                                                            <ImageUploading value={images} onChange={onChange} maxNumber={maxNumber}>
                                                                {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                                                    <div className="upload__image-wrapper">

                                                                        <div className="custom-uploadfile" style={{ cursor: 'pointer' }} onClick={onImageUpload}>
                                                                            <div className='upfile_content' style={{ marginTop: imageList.length !== 0 ? '-1px' : '20px' }}>
                                                                                {
                                                                                    imageList.length === 0 ? <>
                                                                                        <img src='/assets/images/uploadfile.png' className='icon_upload'></img>
                                                                                        {t('upload')}</> : <></>
                                                                                }

                                                                                {imageList.map((image, index) => (
                                                                                    <img key={index} src={image.dataURL} alt="img" className="m-auto" style={{ width: '80px', height: '80px', borderRadius: '50px' }} />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        &nbsp;
                                                                    </div>
                                                                )}
                                                            </ImageUploading>
                                                        </div>

                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="code" className='label'>
                                                            {' '}
                                                            {t('code_staff')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" name="code" type="text" id="code" placeholder={`${t('enter_code_staff')}`} className="form-input" />
                                                        {submitCount ? errors.code ? <div className="mt-1 text-danger"> {errors.code} </div> : null : ''}
                                                    </div>

                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="surname" className='label'>
                                                            {' '}
                                                            {t('surname_middle')}
                                                        </label>
                                                        <Field autoComplete="off" name="surname" type="text" id="surname" placeholder={t('enter_surname_middle')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="name" className='label'>
                                                            {' '}
                                                            {t('name_staff')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_staff')}`} className="form-input" />
                                                        {submitCount ? errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null : ''}
                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="email" className='label'>
                                                            {' '}
                                                            Email
                                                        </label>
                                                        <Field autoComplete="off" name="email" type="text" id="email" placeholder={t('enter_email')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="phone" className='label'>
                                                            {' '}
                                                            {t('phone_number')}
                                                        </label>
                                                        <Field autoComplete="off" name="phone" type="text" id="phone" placeholder={t('enter_phone_number')} className="form-input" />
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
                                    <button
                                        type="button"
                                        className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion`}
                                        onClick={() => togglePara('2')}
                                    >
                                        {t('personal_information')}
                                        <div className={`ltr:ml-auto rtl:mr-auto ${active === '2' ? 'rotate-180' : ''}`}>
                                            <IconCaretDown />
                                        </div>
                                    </button>
                                    <div className={`custom-content-accordion`}>

                                        <AnimateHeight duration={300} height={'auto'}>
                                            <div className="space-y-2 border-t border-[#d3d3d3] p-4 text-[13px] text-white-dark dark:border-[#1b2e4b]">
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="othername" className='label'>
                                                            {' '}
                                                            {t('other_name')}
                                                        </label>
                                                        <Field autoComplete="off" name="othername" type="text" id="othername" placeholder={t('enter_other_name')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="dateofbirth" className='label'>
                                                            {' '}
                                                            {t('date_of_birth')}
                                                        </label>
                                                        <Field autoComplete="off" id="dateofbirth" type="date" name="dateofbirth" className="form-input" />

                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="sex" className='label'>
                                                            {' '}
                                                            {t('gender')}
                                                        </label>
                                                        <Select
                                                            id='sex'
                                                            name='sex'
                                                            options={[{
                                                                label: `${t('male')}`
                                                            }, {
                                                                label: `${t('female')}`
                                                            }]}
                                                            placeholder={`${t('choose_gender')}`}
                                                            maxMenuHeight={160}
                                                            onChange={e => {
                                                                setFieldValue('sex', e)
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="IDnumber" className='label'>
                                                            {' '}
                                                            {t('id_number')}
                                                        </label>
                                                        <Field autoComplete="off" name="IDnumber" type="text" id="IDnumber" placeholder={t('enter_id_number')} className="form-input" />
                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="dateissue" className='label'>
                                                            {' '}
                                                            {t('date_of_issue')}
                                                        </label>
                                                        <Field autoComplete="off" id="dateissue" type="date" name="dateissue" className="form-input" />

                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="IDnumber" className='label'>
                                                            {' '}
                                                            {t('address_issue')}
                                                        </label>
                                                        <Field autoComplete="off" name="IDnumber" type="text" id="IDnumber" placeholder={t('enter_address_issue')} className="form-input" />
                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="id_passport" className='label'>
                                                            {' '}
                                                            {t('id_passport')}
                                                        </label>
                                                        <Field autoComplete="off" name="id_passport" type="text" id="id_passport" placeholder={t('enter_id_passport')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="dateissuepassport" className='label'>
                                                            {' '}
                                                            {t('date_of_issue_passport')}
                                                        </label>
                                                        <Field autoComplete="off" id="dateissuepassport" type="date" name="dateissuepassport" className="form-input" />

                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="issuepassport" className='label'>
                                                            {' '}
                                                            {t('address_issue_passport')}
                                                        </label>
                                                        <Field autoComplete="off" name="issuepassport" type="text" id="issuepassport" placeholder={t('enter_address_issue_passport')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="dateendpassport" className='label'>
                                                            {' '}
                                                            {t('date_end_passport')}
                                                        </label>
                                                        <Field autoComplete="off" id="dateendpassport" type="date" name="dateendpassport" className="form-input" />

                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="place_of_birth" className='label'>
                                                            {' '}
                                                            {t('place_of_birth')}
                                                        </label>
                                                        <Field autoComplete="off" name="place_of_birth" type="text" id="place_of_birth" placeholder={t('enter_place_of_birth')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="nation" className='label'>
                                                            {' '}
                                                            {t('nation')}
                                                        </label>
                                                        <Field autoComplete="off" name="nation" type="text" id="nation" placeholder={t('enter_nation')} className="form-input" />
                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="province" className='label'>
                                                            {' '}
                                                            {t('province')}
                                                        </label>
                                                        <Select
                                                            id='province'
                                                            name='province'
                                                            onInputChange={e => handleSearch(e)}
                                                            options={[{
                                                                label: 'Hà Nội'
                                                            },
                                                            {
                                                                label: 'Vĩnh Phúc'
                                                            }, {
                                                                label: 'Bắc Ninh'
                                                            }, {
                                                                label: 'Quảng Ninh'
                                                            }, {
                                                                label: 'Hải Dương'
                                                            }, {
                                                                label: 'Hải Phòng'
                                                            }, {
                                                                label: 'Hưng Yên'
                                                            }, {
                                                                label: 'Thái Bình'
                                                            }, {
                                                                label: 'Hà Nam'
                                                            }, {
                                                                label: 'Nam Định'
                                                            }, {
                                                                label: 'Ninh Bình'
                                                            }]}
                                                            placeholder={t('enter_province')}
                                                            maxMenuHeight={160}
                                                            onChange={e => {
                                                                setFieldValue('province', e)
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="religion" className='label'>
                                                            {' '}
                                                            {t('religion')}
                                                        </label>
                                                        <Field autoComplete="off" name="religion" type="text" id="religion" placeholder={t('enter_religion')} className="form-input" />
                                                    </div>
                                                </div>
                                                <div className="mb-5 w-1/2">
                                                    <label htmlFor="marital_status" className='label'>
                                                        {' '}
                                                        {t('marital_status')}
                                                    </label>
                                                    <Field autoComplete="off" name="marital_status" type="text" id="marital_status" placeholder={t('enter_marital_status')} className="form-input" />
                                                </div>
                                            </div>
                                        </AnimateHeight>
                                    </div>
                                </div>
                                <div className="rounded">
                                    <button
                                        type="button"
                                        className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion`}
                                        onClick={() => togglePara('3')}
                                    >
                                        {t('other_information')}
                                        <div className={`ltr:ml-auto rtl:mr-auto ${active === '3' ? 'rotate-180' : ''}`}>
                                            <IconCaretDown />
                                        </div>
                                    </button>
                                    <div className={`custom-content-accordion`}>
                                        <AnimateHeight duration={300} height={'auto'}>
                                            <div className="space-y-2 border-t border-[#d3d3d3] p-4 text-[13px] text-white-dark dark:border-[#1b2e4b]">
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="departmentparentId" className='label'> {t('Department_Parent')}</label >
                                                        <Select
                                                            id='unidepartmentparentIdtId'
                                                            name='departmentparentId'
                                                            placeholder={t('select_departmentparent')}
                                                            onInputChange={e => handleSearch(e)}
                                                            options={listDepartment}
                                                            maxMenuHeight={160}
                                                            value={values.departmentparentId}
                                                            onChange={e => {
                                                                setFieldValue('departmentparentId', e)
                                                            }}
                                                        />

                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="manageId" className='label'> {t('duty')}</label >
                                                        <Select
                                                            id='manageId'
                                                            name='manageId'
                                                            placeholder={t('select_duty')}

                                                            onInputChange={e => handleSearch(e)}
                                                            options={listDuty}
                                                            maxMenuHeight={160}
                                                            value={values.manageId}
                                                            onChange={e => {
                                                                setFieldValue('manageId', e)
                                                            }}
                                                        />

                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="manageId" className='label'> {t('Manager')} </label >
                                                        <Select
                                                            id='manageId'
                                                            name='manageId'
                                                            onInputChange={e => handleSearch(e)}
                                                            options={listPersons}
                                                            placeholder={t('select_manager')}
                                                            maxMenuHeight={160}
                                                            value={values.manageId}
                                                            onChange={e => {
                                                                setFieldValue('manageId', e)
                                                            }}
                                                        />

                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="manageId" className='label'> {t('Manager_2')} </label >
                                                        <Select
                                                            id='manageId'
                                                            name='manageId'
                                                            onInputChange={e => handleSearch(e)}
                                                            options={listPersons}
                                                            maxMenuHeight={160}
                                                            value={values.manageId}
                                                            placeholder={t('select_manager_2')}
                                                            onChange={e => {
                                                                setFieldValue('manageId', e)
                                                            }}
                                                        />

                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="approver" className='label'>
                                                            {' '}
                                                            {t('approver')}
                                                        </label>
                                                        <Field autoComplete="off" name="approver" type="text" id="approver" placeholder={t('enter_approver')} className="form-input " />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="date_join" className='label'>
                                                            {' '}
                                                            {t('date_join')}
                                                        </label>

                                                        <Flatpickr
                                                            options={{
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                dateFormat: 'Y-m-d',
                                                                position: 'auto left',
                                                            }}
                                                            className="form-input calender-input"
                                                            placeholder={`${t('enter_date_join')}`}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="tax_code" className='label'>
                                                            {' '}
                                                            {t('tax_code')}
                                                        </label>
                                                        <Field autoComplete="off" name="tax_code" type="text" id="tax_code" placeholder={t('enter_tax_code')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="bank_number" className='label'>
                                                            {' '}
                                                            {t('bank_number')}
                                                        </label>
                                                        <Field autoComplete="off" name="bank_number" type="text" id="bank_number" placeholder={t('enter_bank_number')} className="form-input" />
                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="bank" className='label'>
                                                            {' '}
                                                            {t('bank')}
                                                        </label>
                                                        <Field autoComplete="off" name="bank" type="text" id="bank" placeholder={t('enter_bank')} className="form-input" />
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="branch" className='label'>
                                                            {' '}
                                                            {t('branch')}
                                                        </label>
                                                        <Field autoComplete="off" name="branch" type="text" id="branch" placeholder={t('enter_branch')} className="form-input" />
                                                    </div>
                                                </div>
                                            </div>
                                        </AnimateHeight>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left gap-8">
                            <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                {t('cancel')}
                            </button>
                            <button type="submit" className="btn :ml-4 rtl:mr-4 add-button" disabled={disabled} onClick={() => {
                                if (Object.keys(touched).length !== 0 && Object.keys(errors).length === 0) {
                                    handleWarehouse(values);
                                }
                            }}>
                                {props.data !== undefined ? t('update') : t('add')}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>

        </div>

    );
};

export default AddNewPersonel;
