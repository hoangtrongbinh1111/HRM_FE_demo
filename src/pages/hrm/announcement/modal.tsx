import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import { AddConfirmPortalDetail, EditConfirmPortalDetail } from '@/services/apis/confirm-portal.api';
import { DropdownInventory, DropdownProducts } from '@/services/swr/dropdown.swr';
import { GetQuantity } from '@/services/apis/product.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import dayjs from 'dayjs';
import { Upload } from '@/services/apis/upload.api';
import 'flatpickr/dist/flatpickr.css';
import { useProfile } from '@/services/swr/profile.swr';
import { detailAnnouncement, sendAnnouncement, updateAnnouncement } from '@/services/apis/announcement.api';
import { formatNumber, moneyToNumber, moneyToText, convertDateFormat, toDateString } from '@/utils/commons';
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

import { Humans } from '@/services/swr/human.swr';
import { GetCalculation } from '@/services/apis/timekeeping.api';

const Modal = ({ ...props }: Props) => {
    const [path, setPath] = useState<any>([]);
    const [detail, setDetail] = useState<any>();
    const [dataPath, setDataPath] = useState<any>();
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataProductDropdown, setDataProductDropdown] = useState<any>([]);
    const [openCal, setOpenCal] = useState(false);
    const [comment, setComment] = useState();
    const [res, setRes] = useState<WorkdayInfo[]>([]);
    const fileRef = useRef<any>();

    const today = new Date();
    const { data: humans, pagination: paginationHuman } = Humans({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100,
        ...router.query,
    });
    const human = humans?.data?.map((i: any) => ({
        value: i.id,
        label: i.fullName,
    }));
    const handleDuty = (value: any) => {
        console.log(value)
        GetCalculation({
            id: value?.id?.value,
            time: convertDateFormat(value.time),
        })
            .then((res) => {
                setOpenCal(true);
                setRes(res?.data);
                setComment(res?.data?.comment);
                setInitialValue({
                    id: value.id,
                    time: value.time,
                });
                showMessage('Thông báo thành công', 'success');
            })
            .catch((err) => {
                showMessage(`${t('create_duty_error')}`, 'error');
            });
    };
    useEffect(() => {
        const listPath = path?.filter((item: any) => item !== undefined) ?? [];
        setPath([...listPath, dataPath]); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataPath]);

    const handleChange = async (event: any) => {
        const files = Array.from(event.target.files);

        const uploadPromises = await Object.keys(event.target.files).map((item: any) => {
            const formData = new FormData();
            formData.append('file', event.target.files[item]);
            formData.append('fileName', event.target.files[item].name);
            Upload(formData)
                .then((res) => {
                    setDataPath({ id: res.data.id, path: res.data.path, name: res?.data?.name });
                    return { id: res.data.id, path: res.data.path, name: res.data.name };
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        });
        const newFiles = await Promise.all(uploadPromises);
        const validNewFiles = newFiles.filter((file) => file !== null);

        setPath((prevPath: any) => {
            if (!Array.isArray(prevPath)) {
                return validNewFiles;
            }
            return [...prevPath, ...validNewFiles];
        });

        // Update the file input value
        const dataTransfer = new DataTransfer();
        [...fileRef.current.files].forEach((file: any) => dataTransfer.items.add(file));
        fileRef.current.files = dataTransfer.files;
    };
    useEffect(() => {
        const id = props.id;
        if (id) {
            detailAnnouncement(id?.id)
                .then((res) => {
                    setDetail(res?.data);
                    setPath(res?.data?.attachments);
                })
                .catch((err: any) => {
                    console.log(err);
                });
            // sendAnnouncement(id);
        }
    }, [props.id]);
    useEffect(() => {
        setInitialValue({});
    }, [props?.open]);
    return (
        <Transition appear show={props.open ?? false} as={Fragment}>
            <Dialog as="div" open={props.open} onClose={() => props.setOpen(false)} className="relative z-50">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto" >
                    <div className="flex max-h-screen items-center justify-center px-4 py-7" >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="max-w-2xl w-full max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-y-auto">
                                <button
                                    onClick={() => {
                                        setOpenCal(false);
                                        props.setOpen(false);
                                    }}
                                    type="button"
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">{t('announcement')}</div>
                                <div>
                                    <div className="py-10 pl-10 pr-10">
                                        <Formik
                                            initialValues={initialValue}
                                            onSubmit={(values) => {
                                                handleDuty(values);
                                            }}
                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5">
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/3">{t('title')}</div>
                                                        <div className="mb-5 w-2/3">
                                                            <p style={{ color: 'black' }}>{detail?.title}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/3">Người gửi</div>
                                                        <div className="mb-5 w-2/3">
                                                            <p style={{ color: 'black' }}>{detail?.createdBy?.fullName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/3">Thời gian bắt đầu</div>
                                                        <div className="mb-5 w-2/3">
                                                            <p style={{ color: 'black' }}>{dayjs(detail?.startDate).format('HH:mm DD-MM-YYYY')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/3">Thời gian kết thúc</div>
                                                        <div className="mb-5 w-2/3">
                                                            <p style={{ color: 'black' }}>{dayjs(detail?.endDate).format('HH:mm DD-MM-YYYY')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/3">Nội dung</div>
                                                        <div className="mb-5 w-2/3">
                                                            <p style={{ color: 'black' }}>{detail?.content}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/3">{t('location')}</div>
                                                        <div className="mb-5 w-2/3">
                                                            <p style={{ color: 'black' }}>{detail?.location}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between gap-5">
                                                        <div className="mb-5 w-1/3">
                                                            <p>{t('List of file upload paths')}</p></div>
                                                        <div className="mb-5 w-2/3">
                                                            {path[0] !== undefined ? (
                                                                <div className="mt-2 grid gap-4 rounded border p-2">
                                                                    {path?.map((item: any, index: number) => {
                                                                        return (
                                                                            <>
                                                                                {item?.path && (
                                                                                    <Link
                                                                                        key={index}
                                                                                        title="Xem chi tiết"
                                                                                        href={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} target="_blank" className='ml-5 d-block' style={{ color: 'blue' }}>{item?.name}</Link>
                                                                                )}
                                                                            </>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <></>
                                                            )}
                                                        </div>
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
