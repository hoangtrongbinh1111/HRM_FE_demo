import { useEffect, useRef, useState } from 'react';
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
import personel_list from '../personnel/personnel_list.json';
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
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
interface Props {
    [key: string]: any;
}
import { Loader } from '@mantine/core';

const AddNewTask = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(t('add_task')));
    });
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const router = useRouter();
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [query, setQuery] = useState<any>();
    const [typeShift, setTypeShift] = useState('0');
    const fileRef = useRef<any>();
    const [path, setPath] = useState<any>([]);
    const [dataPath, setDataPath] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [isAdd, setIsAdd]= useState(false);
    const [loadDetail, setLoadDetail] = useState(true)
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
        project: Yup.string(),
        // coordinatorIds: Yup.string().required(`${t('please_collaborator_task')}`),
    });

    const handleTask = (value: any) => {
        const query: any = {};
        setIsAdd(true)
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
        })
            .then(() => {
                showMessage(`${t('add_task_success')}`, 'success');
                router.push('/hrm/task');
            })
            .catch((err) => {
                setIsAdd(false)
                const errorMessage = err?.response?.data?.message[0]?.error ?? err?.response?.data?.message;
                showMessage(errorMessage, 'error');
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
        <div className="p-5">
            <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <Link href="/hrm/task" className="text-primary hover:underline">
                        <span>{t('task_list')}</span>
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('add_task')}</span>
                </li>
            </ul>
            <div className="header-page-bottom mb-4 flex justify-between pb-4">
                <h1 className="page-title">{t('add_task')}</h1>
                <Link href="/hrm/task">
                    <button type="button" className="btn btn-primary btn-sm back-button m-1">
                        <IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        <span>{t('back')}</span>
                    </button>
                </Link>
            </div>
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
                                        locale: {
                                            ...chosenLocale,
                                        },
                                        position: 'auto left',
                                        dateFormat: 'd-m-Y',
                                    }}
                                    className="calender-input form-input"
                                    placeholder={`${t('enter_deadline_task')}`}
                                    onChange={(e) => {
                                        if (e.length > 0) {
                                            setFieldValue('dueDate', dayjs(e[0]).format('YYYY-MM-DD'));
                                        }
                                    }}
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
                                    styles={{
                                        singleValue: (provided) => ({
                                          ...provided,
                                          color: 'black',
                                          marginLeft: '10px', // Thêm khoảng cách 10px bên trái cho chữ khi được chọn
                                        }),
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
                                {submitCount ? errors.project ? <div className="mt-1 text-danger"> {errors.project} </div> : null : ''}
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
                            <Link href="/hrm/task">
                                <button type="button" className="btn btn-outline-danger cancel-button">
                                    {t('cancel')}
                                </button>
                            </Link>
                            <button type="submit" className="btn :ml-4 add-button rtl:mr-4" disabled={isAdd}>
                            {isAdd ? <Loader size="sm" /> : t('assigned')}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default AddNewTask;
