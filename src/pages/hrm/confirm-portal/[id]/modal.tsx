import 'flatpickr/dist/flatpickr.css';
import { formatNumber, moneyToNumber, moneyToText, convertDateFormat } from '@/utils/commons';
import { Loader } from '@mantine/core';
interface Props {
    [key: string]: any;
}
interface WorkdayInfo {
    weekdayWork: string;
    extraWork: string;
    holidayWork: string;
    dayOffWork: string;
    bussinessWork: string;
}
import { GetCalculation } from '@/services/apis/timekeeping.api';
import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
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
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconCalendar from '@/components/Icon/IconCalendar';
import { getCurrentFormattedTime } from '@/utils/commons';
import { Humans } from '@/services/swr/human.swr';
import { createTask } from '@/services/apis/task.api';
import { useProfile } from '@/services/swr/profile.swr';
import dayjs from 'dayjs';
import { loadMore } from '@/utils/commons';
import { useDebounce } from 'use-debounce';
import { useRouter } from 'next/router';
import { Upload } from '@/services/apis/upload.api';
import { IconLoading } from '@/components/Icon/IconLoading';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';

const Modal = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const router = useRouter();
    const [disabled, setDisabled] = useState(false);
    const [query, setQuery] = useState<any>();
    const [typeShift, setTypeShift] = useState('0');
    const fileRef = useRef<any>();
    const [path, setPath] = useState<any>([]);
    const [dataPath, setDataPath] = useState<any>();
    const [loading, setLoading] = useState(false);
    //scroll

    const [queryHuman, setQueryHuman] = useState<any>();
    const [dataHuman, setDataHuman] = useState<any>([]);
    const [dataHuman2, setDataHuman2] = useState<any>([]);
    const [pageHuman, setSizeHuman] = useState<any>(1);
    const [debouncedPageHuman] = useDebounce(pageHuman, 500);
    const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
    const [loadHuman, setLoadHuman] = useState(false);
    const [loadCoordinator, setLoadCoorditor] = useState(false);
    const { data: manages, pagination: paginationHuman } = Humans({
        sortBy: 'id.ASC',
        page: debouncedPageHuman,
        perPage: 10,
        search: debouncedQueryHuman?.search,
    });
    const handleSearchHuman = (param: any) => {
        setQueryHuman({ search: param });
    };
    const handleOnScrollBottomHuman = () => {
        setLoadHuman(true);
        if (paginationHuman?.page < paginationHuman?.totalPages) {
            setSizeHuman(paginationHuman?.page + 1);
        }
    };
    const handleOnScrollBottomHuman2 = () => {
        setLoadCoorditor(true);
        if (paginationHuman?.page < paginationHuman?.totalPages) {
            setSizeHuman(paginationHuman?.page + 1);
        }
    };
    useEffect(() => {
        loadMore(manages, dataHuman, paginationHuman, setDataHuman, 'id', 'fullName', setLoadHuman);
        loadMore(manages, dataHuman2, paginationHuman, setDataHuman2, 'id', 'fullName', setLoadCoorditor);
    }, [paginationHuman, debouncedPageHuman, debouncedQueryHuman]);
    /////////////////////////
    const { data: permission } = useProfile();
    const SubmittedForm = Yup.object().shape({
        name: Yup.string()
            .min(2, `${t('error_too_short')}`)
            .required(`${t('error_fill_task_name')}`),
        assigneeId: Yup.string().required(`${t('error_select_executor')}`),
        // coordinatorIds: Yup.string().required(`${t('please_collaborator_task')}`),
    });

    const [isSubmit, setIsSubmit] = useState(false);
    const handleTask = (value: any) => {
        setIsSubmit(true); const query: any = {};
        if (value.name !== '') {
            query.name = value.name;
        }

        if (value.description !== '') {
            query.description = value.description;
        }

        // if (value.priority !== undefined) {
        // 	query.priority = value.priority;
        // }

        if (value.dueDate !== '') {
            query.dueDate = value.dueDate;
        }
        if (value.project !== undefined) {
            query.project = value.project;
        }

        if (value.status !== '') {
            query.status = value.status?.value;
        }

        if (value.progress !== '') {
            query.progress = value.progress;
        }

        if (value.assigneeId !== undefined) {
            query.assigneeId = parseInt(value.assigneeId);
        }

        if (value.coordinatorIds.length > 0) {
            query.coordinatorIds = value.coordinatorIds?.map((i: any) => {
                return i.value;
            });
        }

        if (value.startDate !== '') {
            query.startDate = value.startDate;
        }

        if (value.endDate !== '') {
            query.endDate = value.endDate;
        }

        if (value.comments !== '') {
            query.comments = value.comments;
        }
        createTask({
            ...query,
            status: 'UNFINISHED',
            ...(path?.length !== 0 && {
                attachmentIds: path.map((item: any) => item?.id).filter((id: any) => id !== undefined),
            }),
            entityDocument: "confirmPortal",
            entityDocumentId: parseInt(props?.id)
        })
            .then(() => {
                showMessage(`${t('add_task_success')}`, 'success');
                props?.handleData()
                props.setOpen(false)
            })
            .catch((err) => {
                const errorMessage = err?.response?.data?.message[0]?.error ?? err?.response?.data?.message;
                showMessage(errorMessage, 'error');
            }).finally(() => {
                setIsSubmit(false);
            });
    };
    const handleChangeTypeShift = (e: any) => {
        setTypeShift(e);
    };
    useEffect(() => {
        const listPath = path?.filter((item: any) => item !== undefined) ?? [];
        setPath([...listPath, dataPath]); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataPath]);
    const handleDeleteFile = (index: any) => {
        const newPath = path.filter((i: any) => i !== path[index]);
        setPath(newPath);
        if (fileRef?.current) {
            const dataTransfer = new DataTransfer();
            Array.from(fileRef?.current?.files)
                .filter((i: any) => i !== fileRef?.current?.files[index])
                .forEach((file: any) => dataTransfer.items.add(file));
            fileRef.current.files = dataTransfer.files;
        }
    };
    const handleChange = async (event: any) => {
        setLoading(true);
        const files = Array.from(event.target.files);

        // Tạo mảng các promises để tải lên các tệp
        const uploadPromises = files.map((file: any) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);

            // Trả về promise của việc tải lên
            return Upload(formData)
                .then((res) => {
                    return { id: res.data.id, path: res.data.path, name: res.data.name };
                })
                .catch((err) => {
                    const input = err?.response?.data?.message;

                    // Tách chuỗi tại " or MIME type"
                    const parts = input.split(' or MIME type');

                    // Sử dụng biểu thức chính quy để tìm chuỗi bắt đầu bằng dấu chấm và theo sau là các ký tự chữ cái
                    const fileType = parts[0].match(/\.\w+$/)[0];

                    if (fileType) {
                        showMessage(`${t('unsupported type file', { fileType: fileType })}`, 'error');
                    } else {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    }
                    return null; // Trả về null nếu có lỗi
                });
        });

        // Sử dụng Promise.allSettled để xử lý tất cả các promises
        try {
            // Sử dụng Promise.allSettled để xử lý tất cả các promises
            const results = await Promise.allSettled(uploadPromises);

            // Lọc các kết quả để chỉ lấy các tệp tải lên thành công
            const validNewFiles = results
                .filter((result): result is PromiseFulfilledResult<{ id: any; path: any; name: any }> => result.status === 'fulfilled' && result.value !== null)
                .map((result) => result.value);

            // Cập nhật state với các đường dẫn tệp mới
            setPath((prevPath: any) => {
                if (!Array.isArray(prevPath)) {
                    return validNewFiles;
                }
                return [...prevPath, ...validNewFiles];
            });

            // Cập nhật giá trị của input file
            const dataTransfer = new DataTransfer();
            files.forEach((file: any) => dataTransfer.items.add(file));
            fileRef.current.files = dataTransfer.files;
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            // Kết thúc quá trình tải lên, đặt loading thành false
            setLoading(false);
        }
    };
    return (
        <Transition appear show={props.open ?? false} as={Fragment}>
            <Dialog as="div" open={props.open} onClose={() => props.setOpen(false)} className="relative z-50">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel w-full max-w-5xl overflow-hidden rounded-2xl border-0 p-0 text-[#476704] dark:text-white-dark">
                                <button
                                    onClick={() => {
                                        props.setOpen(false);
                                    }}
                                    type="button"
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">{t('assigned')}</div>
                                <div>
                                    <div className="py-10 pl-10 pr-10">
                                        <Formik
                                            initialValues={{
                                                name: props?.data ? `${props?.data?.name}` : '',
                                                attachmentIds: props?.data ? `${props?.data?.attachmentIds}` : '',
                                                description: props?.data ? `${props?.data?.description}` : '',
                                                project: props?.data ? `${props?.data?.project}` : '',
                                                dueDate: props?.data ? `${props?.data?.dueDate}` : '',
                                                status: {
                                                    value: 'DOING',
                                                    label: `${t('DOING')}`,
                                                },
                                                progress: props?.data ? `${props?.data?.progress}` : '',
                                                supportingDocuments: props?.data ? `${props?.data?.supportingDocuments}` : '',
                                                assigneeId: props?.data ? `${props?.data?.assigneeId}` : '',
                                                coordinatorIds: props?.data ? `${props?.data?.coordinatorIds}` : '',
                                                comments: props?.data ? `${props?.data?.comments}` : '',
                                                startDate: getCurrentFormattedTime(),
                                            }}
                                            validationSchema={SubmittedForm}
                                            onSubmit={(values) => {
                                                handleTask(values);
                                            }}
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5">
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-3 w-1/2">
                                                            <label htmlFor="startDate">
                                                                {' '}
                                                                {t('date_create')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <Field autoComplete="off" type="date" name="startDate" id="startDate" className="form-input" disabled></Field>
                                                        </div>

                                                        <div className="mb-3 w-1/2">
                                                            <label htmlFor="assigneeIds">
                                                                {' '}
                                                                {t('creator_task')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <Field autoComplete="off" type="text" name="assigneeIds" id="assigneeIds" className="form-input" disabled value={permission?.data.fullName} style={{ color: 'gray' }} />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-3 w-1/2">
                                                            <label htmlFor="name">
                                                                {' '}
                                                                {t('name_task')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <Field autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_task')}`} className="form-input" />
                                                            {submitCount ? errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null : ''}
                                                        </div>
                                                        <div className="mb-3 w-1/2">
                                                            <label htmlFor="dueDate">{t('deadline_task')}</label>
                                                            <Flatpickr
                                                                options={{
                                                                    enableTime: true,
                                                                    dateFormat: "d-m-Y H:i",
                                                                    time_24hr: true,
                                                                    locale: {
                                                                        ...chosenLocale,
                                                                    },
                                                                }}
                                                                value={dayjs(values?.dueDate).format('DD-MM-YYYY HH:mm')}
                                                                onChange={(e: any) => {
                                                                    if (e?.length > 0) {
                                                                        setFieldValue("dueDate", dayjs(e[0]).toISOString());
                                                                    }
                                                                }}
                                                                className="calender-input form-input"
                                                                placeholder={`${t('enter_deadline_task')}`}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-3 w-1/2">
                                                            <label htmlFor="assigneeId">
                                                                {' '}
                                                                {t('executor_task')} <span style={{ color: 'red' }}>* </span>
                                                            </label>
                                                            <Select
                                                                id="assigneeId"
                                                                name="assigneeId"
                                                                options={dataHuman}
                                                                onInputChange={(e) => handleSearchHuman(e)}
                                                                onMenuOpen={() => setSizeHuman(1)}
                                                                isLoading={loadHuman}
                                                                onMenuScrollToBottom={() => handleOnScrollBottomHuman()}
                                                                placeholder={`${t('Select Assignee')}`}
                                                                maxMenuHeight={160}
                                                                onChange={(newValue: any, actionMeta: any) => {
                                                                    setFieldValue('assigneeId', newValue ? newValue?.value : null);
                                                                }}
                                                            />

                                                            {submitCount ? errors.assigneeId ? <div className="mt-1 text-danger"> {errors.assigneeId} </div> : null : ''}
                                                        </div>
                                                        <div className="mb-3 w-1/2">
                                                            <label htmlFor="coordinatorIds"> {t('collaborator_task')} </label>

                                                            <Select
                                                                id="coordinatorIds"
                                                                name="coordinatorIds"
                                                                isMulti
                                                                closeMenuOnSelect={false}
                                                                options={dataHuman2}
                                                                isLoading={loadCoordinator}
                                                                onMenuOpen={() => setSizeHuman(1)}
                                                                onInputChange={(e) => handleSearchHuman(e)}
                                                                onMenuScrollToBottom={() => handleOnScrollBottomHuman2()}
                                                                placeholder={`${t('Select Collaborator')}`}
                                                                maxMenuHeight={160}
                                                                onChange={(newValue: any, actionMeta: any) => {
                                                                    setFieldValue('coordinatorIds', newValue ? newValue : null);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-3 w-1/2">
                                                            <label htmlFor="project">
                                                                {' '}
                                                                {t('project')}
                                                            </label>
                                                            <Field
                                                                autoComplete="off"
                                                                name="project"
                                                                type="project"
                                                                rows="2"
                                                                id="project"
                                                                style={{ height: '37.6px' }}
                                                                placeholder={`${t('enter_project')}`}
                                                                className="form-input"
                                                            />
                                                        </div>
                                                        <div className="mb-3 w-1/2">
                                                            <div>
                                                                <label htmlFor="attachmentIds" className="label">
                                                                    {' '}
                                                                    {t('attached_file')}{' '}
                                                                </label>
                                                                <Field
                                                                    innerRef={fileRef}
                                                                    autoComplete="off"
                                                                    name="attachmentIds"
                                                                    type="file"
                                                                    id="attachmentIds"
                                                                    className="form-input"
                                                                    multiple
                                                                    onChange={(e: any) => handleChange(e)}
                                                                // onClick={() => setChangeFile(true)}
                                                                />
                                                                {submitCount && errors.attachmentIds ? <div className="mt-1 text-danger"> {`${errors.attachmentIds}`} </div> : null}

                                                                {loading && (
                                                                    <div className="" style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                                                                        <IconLoading />
                                                                    </div>
                                                                )}
                                                                {path[1] !== undefined && (
                                                                    <div className="mt-2 grid gap-4 rounded border p-2">
                                                                        <p>{t('List of file upload paths')}</p>
                                                                        {path?.map((item: any, index: number) => {
                                                                            return (
                                                                                <>
                                                                                    {item?.path && (
                                                                                        <div className="flex gap-4" style={{ cursor: 'pointer' }}>
                                                                                            <Link href={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} target="_blank" className="d-block ml-5" style={{ color: 'blue' }}>
                                                                                                {item?.name}
                                                                                            </Link>
                                                                                            <button type="button" onClick={() => handleDeleteFile(index)} className="btn-outline-dark">
                                                                                                <IconX />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label htmlFor="description"> {t('description_task')}</label>
                                                        <Field autoComplete="off" name="description" as="textarea" rows="2" id="description" placeholder={`${t('enter_description_task')}`} className="form-input" />
                                                    </div>

                                                    <div className="mt-8 flex items-center justify-end gap-8 ltr:text-right rtl:text-left">
                                                        <button type="button" onClick={() => props.setOpen(false)} className="btn btn-outline-danger cancel-button">
                                                            {t('cancel')}
                                                        </button>

                                                        <button type="submit" className="btn :ml-4 add-button rtl:mr-4" disabled={disabled}>
                                                            {isSubmit ? <Loader size="sm" /> : `${props.data !== undefined ? t('update') : t('assigned')}`}

                                                        </button>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
export default Modal;
