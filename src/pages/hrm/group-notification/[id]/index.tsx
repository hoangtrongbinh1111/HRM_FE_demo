import { useEffect, useRef, useState, createContext } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/router';

import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconBack from '@/components/Icon/IconBack';
import Select from 'react-select';
import { Upload } from '@/services/apis/upload.api';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import dayjs from 'dayjs';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import { Lao } from '@/utils/lao';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { GroupDropdowns } from '@/services/swr/group.swr';
import { CreateNotificationGroup, GetNotificationGroup, UpdateNotificationGroup } from '@/services/apis/notification-group.api';
interface Props {
    [key: string]: any;
}
interface Human {
    value: number;
    label: string;
}
interface User {
    id: number;
    fullName: string;
}
const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const DetailDuty = ({ ...props }: Props) => {
    const [pageGroup, setPageGroup] = useState(1);
    const [dataGroupDropdown, setDataGroupDropdown] = useState<any>([]);


    const [searchGroup, setSearchGroup] = useState<any>();

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle(t('Update Announcement')));
    });
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;
    const { data: groupDropdown, pagination: groupPagination, isLoading: groupLoading } = GroupDropdowns({ page: pageGroup, search: searchGroup });

    const router = useRouter();
    const [detail, setDetail] = useState<any>();
    const [dataPath, setDataPath] = useState<any>();
    const [path, setPath] = useState<any>([]);
    const { t } = useTranslation();
    const [initialValue, setInitialValue] = useState<any>();
    const fileRef = useRef<any>();

    useEffect(() => {
        if (groupPagination?.page === undefined) return;
        if (groupPagination?.page === 1) {
            setDataGroupDropdown(groupDropdown?.data)
        } else {
            setDataGroupDropdown([...dataGroupDropdown, ...groupDropdown?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupPagination])

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPageGroup(groupPagination?.page + 1);
        }, 1000);
    }

    useEffect(() => {
        if (router.query.id !== 'create') {
            GetNotificationGroup(router.query.id)
                .then((res) => {
                    setDetail(res?.data);
                })
                .catch((err: any) => {
                    console.log(err);
                });
        }
    }, [router]);

    useEffect(() => {
        setPath([...path?.filter((item: any) => item !== undefined), dataPath]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataPath]);

    useEffect(() => {
        if (detail) {
            setPath([...path?.filter((item: any) => item !== undefined), ...detail?.medias.map((item: any) => { return { path: item.mediaPath.path } })]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [detail]);


    const handleChange = async (event: any) => {
        await Object.keys(event.target.files).map((item: any) => {
            const formData = new FormData();
            formData.append('file', event.target.files[item]);
            formData.append('fileName', event.target.files[item].name);
            Upload(formData)
                .then((res) => {
                    setDataPath({ id: res.data.id, path: res.data.path });
                    return
                }).catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        })
    }

    const handleDuty = async (value: any) => {
        if (router.query.id !== 'create') {
            const query: any = {
                title: value.title,
                startDate: value.startDate,
                endDate: value.endDate,
                type: value.type,
                contentHtml: value.contentHtml,
                groupId: Number(value.groupId.value),
            }
            if (dataPath) {
                query.attachmentIds = path.map((item: any) => { return (item.id) })
            }
            await UpdateNotificationGroup(detail?.id, {
                content: value?.content,
                contentHtml: value?.contentHtml,
            }).then((res) => {
                showMessage(`${t('update_announcement_success')}`, 'success');
                router.push(`/hrm/group/${router.query.groupId}`);
            }).catch((err) => {
                showMessage(err?.response?.data?.message[0].error, "error");
            })
        } else {
            const query: any = {
                title: value.title,
                startDate: value.startDate,
                endDate: value.endDate,
                type: value.type,
                contentHtml: value.contentHtml,
                groupId: Number(value.groupId.value),
            }
            if (dataPath) {
                query.attachmentIds = path.map((item: any) => { return (item.id) })
            }
            await CreateNotificationGroup(query).then((res) => {
                showMessage(`${t('create_announcement_success')}`, 'success');
                router.push(`/hrm/group/${router.query.groupId}`);
            }).catch((err) => {
                showMessage(err?.response?.data?.message[0].error, "error");
            })
        }
    };

    useEffect(() => {
        setInitialValue({
            title: detail ? detail?.title : '',
            startDate: detail ? `${detail?.startDate}` : '',
            endDate: detail ? `${detail?.endDate}` : '',
            type: detail ? detail?.type : '',
            contentHtml: detail ? detail?.contentHtml : '',
            groupId: detail ? {
                value: `${detail?.group?.id}`,
                label: `${detail?.group?.name}`
            } : {
                value: router.query.groupId,
                label: router.query.groupName
            },
            createdBy: detail ? detail.createdBy.fullName : "",
            createdAt: detail ? detail.createdAt : "",
        });
    }, [detail, router]);

    const columnTask = [
        {
            accessor: 'id',
            title: 'STT',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'name',
            title: `${t('name')}`,
            sortable: false,
            render: (records: any) => {
                return <span>{records?.receiver?.fullName}</span>;
            },
        },
        {
            accessor: 'time',
            title: `${t('time_seen')}`,
            sortable: false,
        },
    ];
    const formikRef = useRef<any>();
    const [disable, setDisable] = useState(false);
    const [disableData, setDisableData] = useState(false);

    useEffect(() => {
        if (router.query.status === 'true') setDisable(true);
    }, [router])

    useEffect(() => {
        if (detail) setDisableData(true);
    }, [detail])

    return (
        <div>
            <div className="p-5">
                {/* <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/hrm/dashboard" className="text-primary hover:underline">
                            <span>{t('homepage')}</span>
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <Link href="/hrm/announcement" className="text-primary hover:underline">
                            <span>{t('announcement')}</span>
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{t('Update Announcement')}</span>
                    </li>
                </ul> */}
                <div className="header-page-bottom mb-4 flex justify-between pb-4">
                    <h1 className="page-title">{t('announcement')}</h1>
                    <Link href={`/hrm/group/${router.query.groupId}`}>
                        <button type="button" className="btn btn-primary btn-sm back-button m-1">
                            <IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                            <span>{t('back')}</span>
                        </button>
                    </Link>
                </div>
                <Formik
                    initialValues={initialValue}
                    innerRef={formikRef}
                    // validationSchema={SubmittedForm}
                    onSubmit={(values) => {
                        handleDuty(values);
                    }}
                    enableReinitialize
                >
                    {({ errors, touched, submitCount, setFieldValue, values }) => (
                        <Form className="space-y-5" style={{ padding: '0 15px' }}>
                            <div className='mt-2'>
                                <label htmlFor="title" className="label">{t('title')}</label>
                                <Field
                                    autoComplete="off"
                                    name="title" type="text"
                                    id="title"
                                    placeholder={`${t('please_fill_title')}`}
                                    className={disableData ? "form-input bg-[#f2f2f2]" : "form-input"}
                                    disabled={disableData}
                                />
                            </div>

                            <div className="flex justify-between gap-5">
                                <div className="flex-1 mb-2 w-1/2">
                                    <label htmlFor="endDate" className="label">
                                        {t('creator_task')}
                                    </label>
                                    <Field
                                        autoComplete="off"
                                        name="createdBy"
                                        type="text"
                                        id="createdBy"
                                        className={true ? "form-input bg-[#f2f2f2]" : "form-input"}
                                        disabled
                                    />
                                </div>
                                <div className="mb-5 w-1/2">
                                    <label htmlFor="createdAt" className="label">
                                        {t('creation_date')}
                                    </label>
                                    <Flatpickr
                                        data-enable-time
                                        options={{
                                            enableTime: true,
                                            dateFormat: 'H:i d-m-Y',
                                            time_24hr: true,
                                            locale: {
                                                ...chosenLocale,
                                            },
                                        }}
                                        value={values?.createdAt}
                                        onChange={(e: any) => {
                                            if (e?.length > 0) {
                                                setFieldValue('createdAt', dayjs(e[0]).toISOString());
                                            }
                                        }}
                                        placeholder={`${t('choose_from_time')}`}
                                        className={disableData ? "form-input bg-[#f2f2f2] calender-input" : "form-input calender-input"}
                                        disabled={disableData}
                                    />
                                    {submitCount ? errors.createdAt ? <div className="mt-1 text-danger"> {`${errors.createdAt}`} </div> : null : ''}
                                </div>
                            </div>
                            <div className="flex justify-between gap-5" style={{ marginTop: '0px' }}>
                                <div className="flex-1 w-1/2">
                                    <label htmlFor="startDate" className="label">
                                        {t('from_time')}
                                    </label>
                                    <Flatpickr

                                        data-enable-time
                                        options={{
                                            enableTime: true,
                                            dateFormat: 'H:i d-m-Y',
                                            time_24hr: true,
                                            locale: {
                                                ...chosenLocale,
                                            },
                                        }}
                                        value={values?.startDate}
                                        onChange={(e: any) => {
                                            if (e?.length > 0) {
                                                setFieldValue('startDate', dayjs(e[0]).toISOString());
                                            }
                                        }}
                                        placeholder={`${t('choose_from_time')}`}
                                        className={disableData ? "form-input bg-[#f2f2f2] calender-input" : "form-input calender-input"}
                                        disabled={disableData}
                                    />
                                    {submitCount ? errors.startDate ? <div className="mt-1 text-danger"> {`${errors.startDate}`} </div> : null : ''}
                                </div>
                                <div className="mb-2 flex-1 w-1/2">
                                    <label htmlFor="endDate" className="label">
                                        {t('end_time')}
                                    </label>
                                    <Flatpickr

                                        data-enable-time
                                        options={{
                                            enableTime: true,
                                            dateFormat: 'H:i d-m-Y',
                                            time_24hr: true,
                                            locale: {
                                                ...chosenLocale,
                                            },
                                        }}
                                        value={values?.endDate}
                                        placeholder={`${t('choose_end_time')}`}
                                        onChange={(e: any) => {
                                            if (e?.length > 0) {
                                                setFieldValue('endDate', dayjs(e[0]).toISOString());
                                            }
                                        }}
                                        className={disableData ? "form-input bg-[#f2f2f2] calender-input" : "form-input calender-input"}
                                        disabled={disableData}
                                    />
                                    {submitCount ? errors.endDate ? <div className="mt-1 text-danger"> {`${errors.endDate}`} </div> : null : ''}
                                </div>
                            </div>
                            <div className="flex items-center flex-wrap min-w-[35%] gap-5">
                                <div className="mb-5 w-1/2">
                                    <label htmlFor="type" className="label">
                                        {t('type_')}
                                    </label>
                                    <div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
                                        <label style={{ marginBottom: 0, marginRight: '10px' }}>
                                            <Field
                                                autoComplete="off"
                                                type="radio"
                                                name="type"
                                                value={values?.type}
                                                checked={values?.type === 'NORMAL'}
                                                className="form-checkbox rounded-full"
                                                onChange={(e: any) => {
                                                    setFieldValue('type', 'NORMAL');
                                                }}
                                                disabled={disableData}
                                            />
                                            {t('normal')}
                                        </label>
                                        <label style={{ marginBottom: 0 }}>
                                            <Field
                                                autoComplete="off"
                                                type="radio"
                                                name="type"
                                                disabled={disableData}
                                                value={values?.type}
                                                checked={values?.type === 'IMPORTANT'}
                                                className="form-checkbox rounded-full"
                                                onChange={(e: any) => {
                                                    setFieldValue('type', 'IMPORTANT');
                                                }}
                                            />
                                            {t('important')}
                                        </label>
                                    </div>
                                </div>
                                <div className="flex-1 mb-2 w-1/2">
                                    <label htmlFor="groupId" className="label">
                                        {t('group_name')}
                                    </label>
                                    <Select
                                        id='groupId'
                                        name='groupId'
                                        options={dataGroupDropdown}
                                        onMenuOpen={() => setPageGroup(1)}
                                        onMenuScrollToBottom={handleMenuScrollToBottom}
                                        isLoading={groupLoading}
                                        maxMenuHeight={160}
                                        value={values?.groupId}
                                        onInputChange={e => setSearchGroup(e)}
                                        onChange={e => {
                                            setFieldValue('groupId', e)
                                        }}
                                        isDisabled={disableData}
                                    />
                                    {submitCount ? errors.groupId ? <div className="mt-1 text-danger"> {`${errors.groupId}`} </div> : null : ''}
                                </div>

                            </div>
                            <div className="h-fit">
                                <label htmlFor="endDate" className="label">
                                    {t('content')}
                                </label>
                                <ReactQuill
                                    theme="snow"
                                    id="contentHtml"
                                    value={values?.contentHtml || ''}
                                    defaultValue={values?.contentHtml || ''}
                                    onChange={(contentHtml, delta, source, editor) => {
                                        values.contentHtml = contentHtml;
                                        setFieldValue('contentHtml', contentHtml);
                                    }}
                                    style={{ minHeight: '100px' }}
                                    readOnly={disable}
                                />
                            </div>
                            <div>
                                <Field
                                    innerRef={fileRef}
                                    autoComplete="off"
                                    name="attachmentIds"
                                    type="file"
                                    id="attachmentIds"
                                    accept="image/*"
                                    multiple
                                    onChange={(e: any) => {
                                        handleChange(e);
                                    }}
                                    className={disable ? "form-input bg-[#f2f2f2]" : "form-input"}
                                    disabled={disable}
                                />

                                {path !== undefined ? (
                                    <div className="mt-2 grid gap-4 rounded border p-2">
                                        <p>{t('List of file upload paths')}</p>
                                        {path?.map((item: any, index: number) => {
                                            return (
                                                <>
                                                    {item?.path && (
                                                        <div className="flex gap-4">
                                                            <Link href={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} target="_blank" className="d-block ml-5" style={{ color: 'blue' }}>
                                                                {item?.path}
                                                            </Link>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>
                            <div>
                                <div className="!mt-8 flex items-center justify-end">
                                    <Link href={`/hrm/group/${router.query.groupId}`} className="text-primary">
                                        <button type="button" className="btn cancel-button btn-outline-danger">
                                            {t('cancel')}
                                        </button>
                                    </Link>
                                    <button type="submit" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4">
                                        {detail?.id ? t('update') : t('add')}
                                    </button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div >
    );
};

export default DetailDuty;
