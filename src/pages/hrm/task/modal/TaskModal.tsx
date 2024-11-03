import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';

interface Props {
    [key: string]: any;
}

const TaskModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);

    const SubmittedForm = Yup.object().shape({
        name: Yup.string()
            .min(2, `${t('error_too_short')}`)
            .required(`${t('error_fill_task_name')}`),
        creator: Yup.string().required(`${t('error_select_creator')}`),
        executor: Yup.string().required(`${t('error_select_executor')}`),
        collaborator: Yup.string(),
        description: Yup.string(),
        deadline: Yup.date().required(`${t('error_set_deadline')}`),
        directive: Yup.string(),
    });

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

        if (props?.data) {
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

    const handleCancel = () => {
        props.setOpenModal(false);
        props.setData(undefined);
    };

    return (
        <Transition appear show={props.openModal ?? false} as={Fragment}>
            <Dialog as="div" open={props.openModal} onClose={() => props.setOpenModal(false)} className="relative z-50">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                    {props.data !== undefined ? `${t('edit_task')}` : `${t('add_task')}`}
                                </div>
                                <div className="p-5">
                                    <Formik
                                        initialValues={{
                                            name: props?.data ? `${props?.data?.name}` : '',
                                            creator: props?.data ? `${props?.data?.creator}` : '',
                                            executor: props?.data ? `${props?.data?.executor}` : '',
                                            collaborator: props?.data ? `${props?.data?.collaborator}` : '',
                                            description: props?.data ? `${props?.data?.description}` : '',
                                            deadline: props?.data ? `${props?.data?.deadline}` : '',
                                            directive: props?.data ? `${props?.data?.directive}` : '',
                                            color: props?.data ? `${props?.data?.color}` : 'info',
                                            status: props?.data ? `${props?.data?.status}` : 'ĐANG THỰC HIỆN',
                                            attachment: props?.data ? `${props?.data?.attachment}` : '',
                                        }}
                                        validationSchema={SubmittedForm}
                                        onSubmit={(values) => {
                                            handleTask(values);
                                        }}
                                    >
                                        {({ errors, touched }) => (
                                            <Form className="space-y-5">
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-3 w-1/2">
                                                        <label htmlFor="name">
                                                            {' '}
                                                            {t('name_task')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_task')}`} className="form-input" />
                                                        {errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null}
                                                    </div>
                                                    <div className="mb-3 w-1/2">
                                                        <label htmlFor="creator">
                                                            {' '}
                                                            {t('creator_task')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" as="select" name="creator" id="creator" className="form-input">
                                                            <option value="">{`${t('Choose cteator')}`}</option>
                                                            <option value="Bountafaibounnheuang">Bountafaibounnheuang</option>
                                                            <option value="Khampa Sirt">Khampa Sirt</option>
                                                        </Field>
                                                        {errors.creator ? <div className="mt-1 text-danger"> {errors.creator} </div> : null}
                                                    </div>
                                                </div>
                                                <div className='flex justify-between gap-5'>
                                                    <div className="mb-3 w-1/2">
                                                        <label htmlFor="executor">
                                                            {' '}
                                                            {t('executor_task')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" as="select" name="executor" id="executor" className="form-input">
                                                            <option value="">{`${t('Choose assignee')}`}</option>
                                                            <option value="Suok Thi Da">Suok Thi Da</option>
                                                            <option value="Người thực hiện 2">{`${t('Assignee 2')}`}</option>
                                                        </Field>
                                                        {errors.executor ? <div className="mt-1 text-danger"> {errors.executor} </div> : null}
                                                    </div>
                                                    <div className="mb-3 w-1/2">
                                                        <label htmlFor="collaborator"> {t('collaborator_task')}</label>

                                                        <Field autoComplete="off" as="select" name="collaborator" id="collaborator" className="form-input">
                                                            <option value="">{`${t('Choose collaborator')}`}</option>
                                                            <option value="Người người phối hợp 1">Người phối hợp 1</option>
                                                            <option value="Người người phối hợp 2">Người phối hợp 2</option>
                                                        </Field>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="deadline">
                                                        {t('deadline_task')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" id="deadline" type="datetime-local" name="deadline" className="form-input" placeholder={`${t('enter_deadline_task')}`} />
                                                    {errors.deadline ? <div className="mt-1 text-danger"> {errors.deadline} </div> : null}
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="description">
                                                        {' '}
                                                        {t('description_task')} <span style={{ color: 'red' }}>* </span>
                                                    </label>
                                                    <Field autoComplete="off" name="description" as="textarea" rows="2" id="description" placeholder={`${t('enter_description_task')}`} className="form-input" />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="directive"> {t('directive_task')}</label>
                                                    <Field autoComplete="off" name="directive" as="textarea" rows="2" id="directive" placeholder={`${t('enter_directive_task')}`} className="form-input" />
                                                </div>
                                                {props.data !== undefined && (
                                                    <div className="mb-3">
                                                        <label>{t('status_task')}:</label>
                                                        <div className="mt-3">
                                                            <label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
                                                                <Field autoComplete="off" type="radio" name="status" value="ĐÃ XONG" className="form-radio text-warning" />
                                                                <span className="ltr:pl-2 rtl:pr-2">ĐÃ XONG</span>
                                                            </label>
                                                            <label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
                                                                <Field autoComplete="off" type="radio" name="status" value="HOÀN THÀNH" className="form-radio text-success" />
                                                                <span className="ltr:pl-2 rtl:pr-2">HOÀN THÀNH</span>
                                                            </label>
                                                            <label className="inline-flex cursor-pointer ltr:mr-3 rtl:ml-3">
                                                                <Field autoComplete="off" type="radio" name="status" value="HUỶ BỎ" className="form-radio text-danger" />
                                                                <span className="ltr:pl-2 rtl:pr-2">HUỶ BỎ</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* <div className="mb-3">
													<label htmlFor="attachment">
														{' '}
														{t('attachment_task')} <span style={{ color: 'red' }}>* </span>
													</label>
													<Field autoComplete="off" name="attachment" type="file" id="attachment" placeholder={`${t('enter_attachment_task')}`} className="form-input" />
												</div> */}
                                                <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => handleCancel()}>
                                                        {t('cancel')}
                                                    </button>
                                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4" disabled={disabled}>
                                                        {props.data !== undefined ? `${t('update')}` : `${t('add')}`}
                                                    </button>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default TaskModal;
