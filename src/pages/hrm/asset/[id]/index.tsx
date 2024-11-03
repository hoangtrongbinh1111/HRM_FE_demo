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
import IconBack from '@/components/Icon/IconBack';
import { useRouter } from 'next/router';
import asset_list from "../asset_list.json"

interface Props {
    [key: string]: any;
}

const AddNewAsset = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [query, setQuery] = useState<any>();
    const router = useRouter();
    const [typeShift, setTypeShift] = useState("0"); // 0: time, 1: total hours
    const { data: departmentparents } = ProductCategorys(query);
    const { data: manages } = Providers(query);
    const [detail, setDetail] = useState<any>();
    const departmentparent = departmentparents?.data.filter((item: any) => {
        return (
            item.value = item.id,
            item.label = item.name,
            delete item.createdAt
        )
    })

    useEffect(() => {
        if (Number(router.query.id)) {
            const detailData = asset_list?.find(d => d.id === Number(router.query.id));
            setDetail(detailData);
        }
    }, [router])

    const manage = manages?.data.filter((item: any) => {
        return (
            item.value = item.id,
            item.label = item.name
        )
    })
    const SubmittedForm = Yup.object().shape({
        quantity: Yup.number().required(`${t('please_fill_asset_quantity')}`),
        name: Yup.string()
            .required(`${t('please_fill_name_asset')}`),
    });
    const handleSearch = (param: any) => {
        setQuery({ search: param });
    }
    const handleTask = (values: any) => {
        let updatedTasks = [...props.totalData];

        // Determine the color based on the task status
        let color = '';
        switch (values.status) {
            case 'ĐANG THỰC HIỆN':
                color = 'info';
                break;
            case 'HOÀN THÀNH':
                color = 'success';
                break;
            case 'ĐÃ XONG':
                color = 'warning';
                break;
            case 'HUỶ BỎ':
                color = 'danger';
                break;
            default:
                color = 'info'; // Default color if status is undefined or different
        }

        if (detail) {
            // Editing existing task
            updatedTasks = updatedTasks.map((task) => {
                if (task.id === props.data.id) {
                    return { ...task, ...values, color };
                }
                return task;
            });
            showMessage(`${t('edit_task_success')}`, 'success');
        } else {
            // Adding new task
            const newTask = {
                id: updatedTasks.length > 0 ? updatedTasks[updatedTasks.length - 1].id + 1 : 1,
                ...values,
                color,
            };
            updatedTasks.push(newTask);
            showMessage(`${t('add_task_success')}`, 'success');
        }

        localStorage.setItem('taskList', JSON.stringify(updatedTasks));
        props.setGetStorge(updatedTasks);
        props.setOpenModal(false);
        props.setData(undefined);
    };
    const handleChangeTypeShift = (e: any) => {
        setTypeShift(e);
    }

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
    };
    return (

        <div className="p-5">
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{t('edit_asset')}</h1>
                <Link href="/hrm/asset">
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
                    quantity: detail ? `${detail?.quantity}` : '',
                    name: detail ? `${detail?.name}` : '',
                }}
                validationSchema={SubmittedForm}
                onSubmit={(values) => {
                    handleTask(values);
                }}
                enableReinitialize
            >
                {({ errors, values, setFieldValue, submitCount }) => (
                    <Form className="space-y-5">
                        <div className='flex justify-between gap-5'>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="name">
                                    {' '}
                                    {t('name_asset')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_asset')}`} className="form-input" />
                                {submitCount ? errors.name ? <div className="mt-1 text-danger">{errors.name} </div> : null : ''}
                            </div>
                            <div className="mb-5 w-1/2">
                                <label htmlFor="quantity">
                                    {' '}
                                    {t('quantity_asset')} <span style={{ color: 'red' }}>* </span>
                                </label>
                                <Field autoComplete="off" name="quantity" type="number" id="quantity" placeholder={`${t('enter_quantity_asset')}`} className="form-input" />
                                {submitCount ? errors.quantity ? <div className="mt-1 text-danger"> {errors.quantity} </div> : null : ''}
                            </div>
                        </div>


                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left gap-8">
                            <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                {t('cancel')}
                            </button>
                            <button type="submit" className="btn :ml-4 rtl:mr-4 add-button" disabled={disabled}>
                                {t('update')}
                            </button>
                        </div>
                    </Form>
                )}

            </Formik>

        </div>

    );
};

export default AddNewAsset;
