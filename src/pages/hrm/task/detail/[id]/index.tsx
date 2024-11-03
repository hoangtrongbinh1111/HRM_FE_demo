import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';
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
import { ProductCategorys, Providers } from '@/services/swr/product.swr';
import IconBack from '@/components/Icon/IconBack';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconCalendar from '@/components/Icon/IconCalendar';
import { convertDateFormat, getCurrentFormattedTime, loadMore } from '@/utils/commons';
import { Humans } from '@/services/swr/human.swr';
import { detailTask, updateTask } from '@/services/apis/task.api';
import { removeNullProperties } from '@/utils/commons';
import { useProfile } from '@/services/swr/profile.swr';
import dayjs from 'dayjs';
import { useDebounce } from 'use-debounce';
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

const AddNewTask = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(t('detail_task')));
    });
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);
    const [query, setQuery] = useState<any>();
    const router = useRouter();
    const [comments, setComments] = useState(false)
    const [typeCreate, setTypeCreate] = useState<any>(0);
    const [type, setType] = useState<any>(0);
    const [assigned, setAssigned] = useState<any>(0);
    const [detail, setDetail] = useState<any>();
    const fileRef = useRef<any>();
    const [path, setPath] = useState<any>([]);
    const [dataPath, setDataPath] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [loadDetail, setLoadDetail] = useState(false);

    const statuss = [
        {
            value: 'UNFINISHED',
            label: `${t('Unfinished_task')}`,
        },
        {
            value: 'DOING',
            label: `${t('Doing_task')}`,
        },
        {
            value: 'FINISHED',
            label: `${t('finsished_task')}`,
        },
    ];
    const { data: permission } = useProfile();

    useEffect(() => {
        const id = router.query.id;
        setLoadDetail(true)
        if (id) {
            detailTask(id)
                .then((res) => {
                    setLoadDetail(false)
                    if (res?.data?.status === 'UNFINISHED') setComments(false);
                    else setComments(true)
                    setTypeCreate(res?.data?.status);
                    if (res?.data?.createdBy?.id === permission?.data?.id) {
                        setType(1); // người giao nhiệm vụ
                    } else if (res?.data?.assignee?.id === permission?.data?.id) setAssigned(1);
                    setDetail(res?.data);
                    setPath(res?.data?.attachments);
                })
                .catch((err: any) => {
                    console.log(err);
                });
        }
    }, [router]);
    const SubmittedForm = Yup.object().shape({
        name: Yup.string()
            .min(2, `${t('error_too_short')}`)
            .required(`${t('error_fill_task_name')}`),
    });
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
    const handleSearch = (param: any) => {
        setQuery({ search: param });
    };
    const handleTask = (value: any) => {
        removeNullProperties(value);
        const query: any = {};
        if (value.name !== '') {
            query.name = value.name;
        }

        if (value.description !== '') {
            query.description = value.description;
        }

        if (value.priority !== undefined) {
            query.priority = value.priority;
        }

        if (value.dueDate !== '') {
            query.dueDate = convertDateFormat(value.dueDate);
        }

        if (value.status !== '') {
            query.status = value.status?.value;
        }

        if (value.progress !== '') {
            query.progress = parseInt(value.progress);
        }

        if (value.assigneeId !== '') {
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
        if (value.evaluation !== '') {
            query.evaluation = value.evaluation;
        }

        if (value.comments !== '') {
            query.comments = value.comments;
        }
        updateTask(detail?.id, {
            ...query,
            ...(path?.length
                ? {
                    attachmentIds: path.map((item: any) => item?.id).filter((id: any) => id !== undefined),
                }
                : {}),
        })
            .then(() => {
                showMessage(`${t('update_task_success')}`, 'success');
                router.push('/hrm/task');
            })
            .catch((err) => {
                const errorMessage = err?.response?.data?.message[0]?.error ?? err?.response?.data?.message;
                showMessage(errorMessage, 'error');
            });
    };
    useEffect(() => {
        const listPath = path?.filter((item: any) => item !== undefined) ?? [];
        setPath([...listPath, dataPath]);
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
        <div>
            {loadDetail && (
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
                        <Link href="/hrm/task" className="text-primary hover:underline">
                            <span>{t('task_list')}</span>
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{t('detail_task')}</span>
                    </li>
                </ul>
                <div className="header-page-bottom mb-4 flex justify-between pb-4">
                    <h1 className="page-title">{t('detail_task')}</h1>
                    <div className='flex' style={{ alignItems: "center" }}>
                        {
                            <Link href={`/hrm/task/${router?.query.id}?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
                                <button className="edit-page-btn btn btn-primary ltr:ml-4 rtl:mr-4 h-9">
                                    {t('edit')}
                                </button>
                            </Link>
                        }
                        <Link href={`/hrm/task?page=${router?.query?.page}&perPage=${router?.query?.perPage}`}>
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
                        name: detail ? `${detail?.name}` : '',
                        // attachment: detail ? `${detail?.attachment}` : '',
                        assigneeId: detail?.assignee?.id ? { value: detail?.assignee?.id, label: detail?.assignee?.fullName } : { value: '', label: '' },
                        coordinatorId: detail?.coordinator ? { value: detail?.coordinator?.id, label: detail?.coordinator?.fullName } : { value: '', label: '' },
                        comments: detail?.comments ? `${detail?.comments}` : '',
                        coordinator: detail?.createdById ? detail?.createdBy?.fullName : '',
                        dueDate: detail?.dueDate ? `${dayjs(detail?.dueDate).format('DD-MM-YYYY')}` : '',
                        description: detail?.description ? `${detail?.description}` : '',
                        priority: detail?.priority ? `${detail?.priority}` : '',
                        project: detail?.project ? `${detail?.project}` : '',
                        evaluation: detail?.evaluation ? `${detail?.evaluation}` : '',
                        coordinatorIds: detail
                            ? detail?.coordinators?.map((item: any) => {
                                return {
                                    label: item.fullName,
                                    value: item.id,
                                };
                            })
                            : '',
                        progress: detail?.progress ? `${detail?.progress}` : 0,
                        status: detail?.status ? statuss?.find((i: any) => i.value === detail?.status) : { value: '', label: '' },
                        date_create: detail ? dayjs(detail.createdAt).format('DD/MM/YYYY') : getCurrentFormattedTime(),
                    }}
                    enableReinitialize
                    validationSchema={SubmittedForm}
                    onSubmit={(values) => {
                        handleTask(values);
                    }}
                >
                    {({ errors, values, setFieldValue, submitCount }) => (
                        <Form className="space-y-5">
                            <div className="flex justify-between gap-5">
                                <div className="mb-3 w-1/2">
                                    <label htmlFor="date_create" className="label">
                                        {' '}
                                        {t('date_create')} <span style={{ color: 'red' }}>* </span>
                                    </label>
                                    <Field autoComplete="off" name="date_create" id="date_create" className="form-input" disabled></Field>
                                </div>
                                <div className="mb-3 w-1/2">
                                    <label htmlFor="coordinator" className="label">
                                        {' '}
                                        {t('creator_task')} <span style={{ color: 'red' }}>* </span> 
                                    </label>
                                    <Field autoComplete="off" type="text" name="coordinator" id="coordinator" className="form-input" disabled style={{ color: 'gray' }}></Field>
                                </div>
                            </div>
                            <div className="flex justify-between gap-5">
                                <div className="mb-3 w-1/2">
                                    <label htmlFor="name" className="label">
                                        {' '}
                                        {t('name_task')} <span style={{ color: 'red' }}>* </span>
                                    </label>
                                    <Field disabled autoComplete="off" name="name" type="text" id="name" placeholder={`${t('enter_name_task')}`} className="form-input" />
                                    {submitCount ? errors.name ? <div className="mt-1 text-danger"> {errors.name} </div> : null : ''}
                                </div>
                                <div className="mb-3 w-1/2">
                                    <label className="label" htmlFor="dueDate">{t('deadline_task')}</label>
                                    <Flatpickr
                                        disabled
                                        options={{
                                            locale: {
                                                ...chosenLocale,
                                            },
                                            dateFormat: 'd-m-Y',
                                            position: 'auto left',
                                        }}
                                        value={values.dueDate}
                                        className="calender-input form-input"
                                        placeholder={`${t('enter_deadline_task')}`}
                                        onChange={(e) => {
                                            if (e.length > 0) {
                                                setFieldValue('dueDate', dayjs(e[0]).format('DD-MM-YYYY'));
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between gap-5">
                                <div className="mb-3 w-1/2">
                                    <label htmlFor="assigneeId" className="label">
                                        {' '}
                                        {t('executor_task')} <span style={{ color: 'red' }}>* </span>
                                    </label>
                                    <Select
                                        value={values?.assigneeId}
                                        isDisabled={true}
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
                                            setFieldValue('assigneeId', newValue ? newValue : null);
                                        }}
                                        styles={{
                                            singleValue: (provided) => ({
                                              ...provided,
                                              color: 'black',
                                              marginLeft: '10px', // Thêm khoảng cách 10px bên trái cho chữ khi được chọn
                                            }),
                                          }}
                                    />

                                    {submitCount ? errors.assigneeId ? <div className="mt-1 text-danger">{`${errors.assigneeId}`} </div> : null : ''}
                                </div>
                                <div className="mb-3 w-1/2">
                                    <label htmlFor="coordinatorIds" className="label">
                                        {' '}
                                        {t('collaborator_task')}
                                    </label>

                                    <Select
                                        isDisabled={true}
                                        id="coordinatorIds"
                                        name="coordinatorIds"
                                        isMulti
                                        options={dataHuman2}
                                        value={values?.coordinatorIds}
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
                                    {submitCount ? errors.coordinatorIds ? <div className="mt-1 text-danger"> {`${errors.coordinatorIds}`} </div> : null : ''}
                                </div>
                            </div>
                            <div className="flex justify-between gap-5">
                                <div className="mb-3 w-1/2">
                                    <label className="label" htmlFor="project"> {t('project')}</label>
                                    <Field
                                        disabled
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
                                <div className="mb-5 w-1/2">
                                    <label htmlFor="progress" className="label">
                                        {t('progress')}
                                    </label>
                                    <div style={{ display: 'flex' }}>
                                        <Field
                                            // style={{borderRadius: '0'}}
                                            disabled
                                            autoComplete="off"
                                            name="progress"
                                            type="number"
                                            id="progress"
                                            placeholder={t('enter_progress')}
                                            className="form-input ltr:rounded-r-none rtl:rounded-l-none"
                                            onChange={(e: any) => {
                                                const value = e.target.value.trim();
                                                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                                                    setFieldValue('progress', value === '' ? null : parseInt(value));
                                                }
                                            }}
                                        />
                                        <div className="flex items-center justify-center border border-[#e0e6ed] bg-[#eee] px-3 font-semibold dark:border-[#17263c] dark:bg-[#1b2e4b] ltr:rounded-r-md ltr:border-l-0 rtl:rounded-l-md rtl:border-r-0">
                                            %
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="label" htmlFor="description"> {t('description_task')}</label>
                                <Field
                                    disabled
                                    autoComplete="off"
                                    name="description"
                                    as="textarea"
                                    rows="2"
                                    id="description"
                                    placeholder={`${t('enter_description_task')}`}
                                    className="form-input"
                                />
                            </div>
                            {comments ? (
                                <div className="mb-3">
                                    <label htmlFor="comments">Ý kiến thực hiện</label>
                                    <Field autoComplete="off" disabled name="comments" as="textarea" rows="2" id="comments" placeholder={`${t('enter_directive_task')}`} className="form-input" />
                                </div>
                            ) : (
                                <></>
                            )}


                            <div className="flex justify-between gap-5">
                                <div className="mb-3 w-1/2">
                                    <div>
                                        <label htmlFor="attachmentIds" className="label">
                                            {' '}
                                            {t('attached_file')}{' '}
                                        </label>
                                        <Field
                                            disabled
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
                                    </div>

                                    {loading && (
                                        <div className="" style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                                            <IconLoading />
                                        </div>
                                    )}
                                    {path[0] !== undefined && (
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
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-5 w-1/2">
                                    <label htmlFor="status" className="label">
                                        {t('status_task')}
                                    </label>
                                    <Select
                                        isDisabled={true}
                                        options={statuss}
                                        value={values.status}
                                        placeholder={`${t('enter_status_task')}`}
                                        maxMenuHeight={160}
                                        onChange={(e) => {
                                            setFieldValue('status', e);
                                            if (e?.value !== 'UNFINISHED') setComments(true);
                                            else { setComments(false) }
                                        }}
                                    />
                                </div>
                            </div>
                            {typeCreate === 'FINISHED' ? (
                                <div className="mb-3">
                                    <label className="label" htmlFor="evaluation"> {t('Evaluate')}</label>
                                    <Field autoComplete="off" disabled name="evaluation" as="textarea" rows="2" id="evaluation" placeholder={`${t('enter_evaluation_task')}`} className="form-input" />
                                </div>
                            ) : (
                                <></>
                            )}
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default AddNewTask;
