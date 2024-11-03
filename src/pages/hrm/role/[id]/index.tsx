import { useEffect, Fragment, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
// Third party libs
import * as Yup from 'yup';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
// API
import { Permissions } from '@/services/swr/role.swr';
// helper
import { showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
import { Formik, Form, Field } from 'formik';
import { CreateRole, EditRole, GetRole } from '@/services/apis/role.api';
import Link from 'next/link';
import IconBackward from '@/components/Icon/IconBackward';
import { IRootState } from '@/store';

import keyData from './key.json';

interface Props {
    [key: string]: any;
}

const RoleDetailPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [showLoader, setShowLoader] = useState(true);
    const [data, setData] = useState<any>();
    const [checked, setChecked] = useState<any>([]);
    const [checkedPart, setCheckedPart] = useState<any>([]);

    const [isAdd, setIsAdd]= useState(false);
    const [checkAll, setCheckAll] = useState<any>(false);
    const [dataPermission, setDataPermission] = useState<any>();
    // get data
    const { data: permission, loading } = Permissions({ perPage: 0, ...router.query });

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required(`${t('please_fill_name_role')}`),
    });
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    useEffect(() => {
        dispatch(setPageTitle(`${Number(router.query.id) ? t('detail_role') : t('add_role')}`));
    });

    useEffect(() => {
        setShowLoader(false);
        setDataPermission(permission?.data?.reduce(
            (h: any, permission: any) =>
                Object.assign(h, {
                    [permission.type]: (h[permission.type] || [])
                        .concat({ ...permission })
                }), {})
        )
    }, [permission]);

    useEffect(() => {
        GetRole({ id: router.query.id }).then((res) => {
            setData(res.data);
            setChecked(res.data.permissionIds);
        }).catch((err: any) => {
        });
    }, [router.query.id]);

    useEffect(() => {
        if (checked.length === permission?.data.length) {
            setCheckAll(true);
        } else {
            setCheckAll(false);
        }
    }, [checked, permission]);

    const handleRole = (param: any) => {
        setIsAdd(true)
        if (data && data?.id !== 'create') {
            EditRole({ id: router.query.id, ...param, permissionIds: checked }).then(() => {
                showMessage(`${t('edit_role_success')}`, 'success');
                router.push(`/hrm/role`);
            }).catch((err) => {
                setIsAdd(false)
                showMessage(`${t('edit_role_error')}`, 'error');
            });
        } else {
            CreateRole({ ...param, permissionIds: checked }).then(() => {
                showMessage(`${t('create_role_success')}`, 'success');
                router.push('/hrm/role');
            }).catch((err) => {
                setIsAdd(false)
                showMessage(`${t('create_role_error')}`, 'error');
            });
        }
    }

    const handleChecked = (permissionId: any, values: any) => {
        setData({
            id: router.query.id,
            name: values.name,
            description: values.description
        })
        setChecked(
            checked?.includes(permissionId)
                ? checked.filter((item: any) => item !== permissionId)
                : [...checked, permissionId]
        );
    }
    const handleCheckAll = (e: any) => {
        if (checkAll === false) {
            const permissionIds = permission?.data
                .map((item: any) => item.id)
            setChecked(permissionIds);
            setCheckedPart(Object.keys(dataPermission))
            setCheckAll(true);
        } else {
            setChecked([]);
            setCheckedPart([])
            setCheckAll(false);
        }
    };
    const handleCheckPart = (e: any, values: any, value: boolean) => {
        setData({
            id: router.query.id,
            name: values.name,
            description: values.description
        })
        if (checkedPart?.includes(e)) {
            setCheckAll(false)
            setCheckedPart(checkedPart.filter((item: any) => item !== e))
        } else {
            const temp = [...checkedPart, e]
            setCheckedPart(temp)
            if (temp.length === Object.keys(dataPermission).length) setCheckAll(true)

        }
        let temp = checked
        dataPermission[e].map((item: any) => {
            if (value) {
                if (!temp?.includes(item.id)) {
                    temp.push(item.id)
                }
            } else {
                temp = temp.filter((item1: any) => item1 !== item.id)
            }
        })
        setChecked(temp);
    };
    const handleCancel = () => {
        router.push(`/hrm/role`)
    }

    return (
        <div>
            {loading && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
            <div className="flex md:items-center justify-between md:flex-row flex-col mb-1 gap-5">
                <ul className="flex space-x-2 rtl:space-x-reverse mb-1">
                    <li>
                        <Link href="/hrm/dashboard" className="text-primary hover:underline">
                            {t('dashboard')}
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <Link href="/hrm/role" className="text-primary hover:underline">
                            <span>{t('role_list')}</span>
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{`${Number(router.query.id) ? t('detail_role') : t('add_role')}`}</span>
                    </li>
                </ul>
            </div>
            <div >
                <Formik
                    initialValues={{
                        name: data ? data.name : "",
                        description: data ? data.description : "",
                        // permissionIds: checked ? checked : []
                    }}
                    validationSchema={SubmittedForm}
                    onSubmit={values => {
                        handleRole(values);
                    }}
                    enableReinitialize
                >

                    {({ errors, values, setFieldValue }) => (
                        <Form>
                            <div className="space-y-5 panel mt-6">
                                <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                                    <h1 className='page-title'>{`${Number(router.query.id) ? t('detail_role') : t('add_role')}`}</h1>
                                    <Link href={`/hrm/role`}>
                                        <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                                            <IconBackward />
                                            <span>
                                                {t('back')}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                                <div className="mb-5" >
                                    <label htmlFor="name" > {t('name_role')} < span style={{ color: 'red' }}>* </span></label >
                                    <Field autoComplete="off"
                                        name="name"
                                        type="text"
                                        id="name"
                                        placeholder={`${t('enter_name_role')}`}
                                        className="form-input"
                                    />
                                    {errors.name ? (
                                        <div className="text-danger mt-1"> {`${errors.name}`} </div>
                                    ) : null}
                                </div>
                                <div className="mb-5">
                                    <label htmlFor="description" > {t('description')}</label >
                                    <Field autoComplete="off"
                                        name="description"
                                        component="textarea"
                                        id="description"
                                        placeholder={`${t('enter_description')}`}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="space-y-5 panel mt-6">
                                <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                                    <h1 className='page-title'>{t('permission')}</h1>
                                    <label className='flex items-center justify-between'>
                                        <Field autoComplete="off"
                                            className="mr-2"
                                            type="checkbox"
                                            onChange={(e: any) => handleCheckAll(e)}
                                            checked={checkAll}
                                        />
                                        <span className='text-[#046738]'>{t('check_all')}</span>
                                    </label>
                                </div>
                                {
                                    dataPermission &&
                                    keyData?.map((itemKey: any, keyIndex) => {
                                        return Object.keys(dataPermission).map((key: any, index: any) => {
                                            if (itemKey === key) {
                                                return (
                                                    <div className="mb-5" key={key}>
                                                        <div className='flex justify-between pb-4 mb-4'>
                                                            <label className="text-xl mb-4">{keyIndex + 1}. {t(key)}</label>
                                                            <label className='flex items-center justify-between'>
                                                                <Field autoComplete="off"
                                                                    className="mr-2"
                                                                    type="checkbox"
                                                                    onChange={(e: any) => handleCheckPart(key, values, e.target.checked)}
                                                                    checked={checkedPart?.includes(key)}
                                                                />
                                                                <span className='text-[#046738]'>{t('check_all')}</span>
                                                            </label>
                                                        </div>

                                                        <div className="grid grid-cols-4 gap-4 pl-2.5">
                                                            {
                                                                dataPermission[key].map((item: any) => {
                                                                    return (
                                                                        <label key={item} className='basis-1/4'>
                                                                            <Field
                                                                                autoComplete="off"
                                                                                className="mr-2"
                                                                                type="checkbox"
                                                                                name="permissionIds"
                                                                                value={item.id}
                                                                                checked={checked?.includes(item.id)}
                                                                                onChange={(e: any) => handleChecked(Number(e.target.value), values)}
                                                                            />
                                                                            {t(item.name)}
                                                                        </label>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        })
                                    })
                                }
                            </div>
                            <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" disabled={isAdd}>
                                    {router.query.id !== "create" ? t('update') : t('save')}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default RoleDetailPage;
