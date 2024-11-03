import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { DeleteOrder } from '@/services/apis/order.api';
import Link from 'next/link';
import IconBackward from '@/components/Icon/IconBackward';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import { Formik, Form, Field } from 'formik';
import AnimateHeight from 'react-animate-height';
import * as Yup from 'yup';
import { AddGroupDetail, AddGroupDetails, CreateGroup, DeleteGroupDetail, EditGroup, GetGroup } from '@/services/apis/group.api';
import { GroupDetails } from '@/services/swr/group.swr';
import { PAGE_NUMBER_DEFAULT, PAGE_SIZES, PAGE_SIZES_DEFAULT } from '@/utils/constants';
import Select from 'react-select';
import { DropdownUsers } from '@/services/swr/dropdown.swr';
import DetailModal from '../modal/DetailModal';
import IconX from '@/components/Icon/IconX';
import IconPlus from '@/components/Icon/IconPlus';
import { NotificationGroup } from '@/services/swr/notification-group.swr';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import { toDateString } from '@/utils/commons';
import { useProfile } from '@/services/swr/profile.swr';
import moment from 'moment';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const DetailPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [data, setData] = useState<any>();
    const formRef = useRef<any>();
    const [query, setQuery] = useState<any>();
    const [queryNoti, setQueryNoti] = useState<any>();
    const [initialValue, setInitialValue] = useState<any>();
    const [active, setActive] = useState<any>([1, 2, 3]);
    const [listDataDetail, setListDataDetail] = useState<any>([]);
    const [dataDetail, setDataDetail] = useState<any>();
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [id, setId] = useState<any>(0);
    const [openModal, setOpenModal] = useState(false);
    const [selected, setSelected] = useState('');
    const [searchUser, setSearchUser] = useState<any>();
    const { data: userData } = useProfile();

    const SubmittedForm = Yup.object().shape({
        name: Yup.string().required(`${t('please_fill_name')}`),
    });

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    // get data
    const { data: groupDetails, pagination, mutate, isLoading } = GroupDetails({ ...query });
    const { data: notificationGroup, pagination: paginationNoti, loading } = NotificationGroup({ sortBy: 'id.DESC', ...queryNoti, groupId: router.query.id });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(groupDetails?.data);
        }
    }, [groupDetails?.data, router]);

    useEffect(() => {
        if (Number(router.query.id)) {
            handleData();
            setQuery({ id: router.query.id });
            setQueryNoti({ id: router.query.id })
        }
        if (typeof window !== 'undefined') {
            setId(Number(localStorage.getItem("idUser")));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    useEffect(() => {
        setInitialValue({
            name: data?.name ? `${data?.name}` : "",
            note: data?.note ? `${data?.note}` : "",
        })
    }, [data]);

    const handleData = () => {
        GetGroup({ id: Number(router.query.id) }).then((res) => {
            setData(res.data);
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleDelete = ({ id, user }: any) => {
        if (Number(router.query.id)) {
            const swalDeletes = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-secondary',
                    cancelButton: 'btn btn-danger ltr:mr-3 rtl:ml-3',
                    popup: 'confirm-popup confirm-delete',
                },
                imageUrl: '/assets/images/delete_popup.png',
                buttonsStyling: false,
            });

            swalDeletes
                .fire({
                    title: `${t('delete')}`,
                    html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${user?.fullName} ?`,
                    padding: '2em',
                    showCancelButton: true,
                    cancelButtonText: `${t('cancel')}`,
                    confirmButtonText: `${t('confirm')}`,
                    reverseButtons: true,
                })
                .then((result) => {
                    if (result.value) {
                        DeleteGroupDetail({ id: router.query.id, itemId: id }).then(() => {
                            mutate();
                            showMessage(`${t('delete_success')}`, 'success');
                        }).catch((err) => {
                            showMessage(`${err?.response?.data?.message}`, 'error');
                        });
                    }
                });
        } else {
            setListDataDetail(listDataDetail.filter((item: any) => item.id !== id))
        }
    };

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'name',
            title: <div className='flex justify-center'>{t('name_staff')}</div>,
            render: ({ user, label }: any) => <span className='flex justify-center'>{user?.fullName || label}</span>,
            sortable: false
        },
        {
            accessor: 'department',
            title: <div className='flex justify-center'>{t('department')}</div>,
            render: ({ user, department_name }: any) => <span className='flex justify-center'>{user?.department?.name || department_name}</span>,
            sortable: false
        },
        {
            accessor: 'position',
            title: <div className='flex justify-center'>{t('position')}</div>,
            render: ({ user, position_name }: any) => {
                return <span className='flex justify-center'>{user?.position?.name || position_name}</span>
            }

            ,
            sortable: false
        },
        {
            accessor: 'action',
            title: <div className='flex justify-center'>{t('action')}</div>,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="flex items-center w-max mx-auto gap-2">
                    <button className='bg-[#E43940] flex justify-between gap-1 p-1 rounded text-[#F5F5F5]' type="button" onClick={() => handleDelete(records)}>
                        <IconTrashLines />  <span>{`${t('delete')}`}</span>
                    </button>
                </div>
            ),
        },
    ];


    const handleCancel = () => {
        router.push("/hrm/group")
    };

    const handleGroup = (param: any) => {
        const query: any = {
            name: param.name,
            note: param.note,
        };
        if (data) {
            EditGroup({ id: data.id, ...query }).then(() => {
                showMessage(`${t('edit_success')}`, 'success');
                handleCancel();
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            const query: any = {
                name: param.name,
                note: param.note,
            };
            CreateGroup(query).then((res) => {
                if (listDataDetail.length > 0) {
                    handleDetail(res.data.id);
                } else {
                    handleCancel();
                }
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message[0].error}`, 'error');
            });
        }
    }

    const handleDetail = (id: any) => {
        AddGroupDetails({
            id: id,
            details: listDataDetail.map((item: any, index: number) => {
                return {
                    ...item,
                    userId: item.value,
                    id: index
                }
            })
        }).then(() => {
            showMessage(`${t('create_success')}`, 'success');
            handleCancel();
        }).catch((err) => {
            DeleteOrder({ id })
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    }


    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit()
        }
    }

    const handleSearch = (param: any) => {
        setQuery({ ...query, search: param.target.value });
    }

    const handleChangePage = (page: number, pageSize: number) => {
        setQuery({ ...query, page, pageSize });
        return pageSize;
    };

    const handleSearchNoti = (param: any) => {
        setQueryNoti({ ...query, search: param.target.value });
    }

    const handleChangePageNoti = (page: number, pageSize: number) => {
        setPage(page);
        setPageSize(pageSize);
        setQueryNoti({ ...query, page, pageSize });
        return pageSize;
    };

    const columnsNoti = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        {
            accessor: 'createdBy',
            title: `${t('userCreate')}`,
            sortable: false,
            render: (record: any) => <span>{record?.createdBy?.fullName}</span>,
        },
        {
            accessor: 'createdBy',
            title: `${t('createdAt')}`,
            sortable: false,
            render: (record: any) => <span>{moment(record?.createdAt).format("DD/MM/YYYY")}</span>,
        },

        { accessor: 'title', title: `${t('title')}`, sortable: false },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: 250,
            style: { whiteSpace: 'pre-wrap' },
            titleClassName: 'text-center',
            render: (records: any) => {
                return (
                    <div className="mx-auto flex items-center justify-start gap-2">
                        <div className="w-[auto]">
                            <button type="button" className="button-detail" onClick={() => router.push(`/hrm/group-notification/${records.id}?status=true&groupId=${router.query.id}`)}>
                                <IconNewEye />
                                <span>{t('detail')}</span>
                            </button>
                        </div>
                        {records?.createdBy?.id === userData?.data?.id && (
                            <RBACWrapper permissionKey={['group:update']} type={'AND'}>
                                <div className="w-[auto]">
                                    <button type="button" className="button-edit" onClick={() => router.push(`/hrm/group-notification/${records.id}?groupId=${router.query.id}`)}>
                                        <IconNewEdit />
                                        <span>{t('edit')}</span>
                                    </button>
                                </div>
                            </RBACWrapper>
                        )}
                    </div>
                )
            }
        },
    ];


    return (
        <div>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>{t('group')}</h1>
                <Link href="/hrm/group">
                    <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                        <IconBackward />
                        <span>
                            {t('back')}
                        </span>
                    </div>
                </Link>
            </div>
            <div className="mb-5">

                <div className="font-semibold">
                    <div className="rounded">
                        <button
                            type="button"
                            className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                            onClick={() => handleActive(1)}
                        >
                            {t('group_information')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`mb-2 ${active.includes(1) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                <Formik
                                    initialValues={initialValue}
                                    validationSchema={SubmittedForm}
                                    onSubmit={values => {
                                        handleGroup(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5" >
                                            <div className='p-4'>
                                                <div className='mt-5'>
                                                    <label htmlFor="name" className='label'> {t('group_name')} < span style={{ color: 'red' }}>* </span></label >
                                                    <Field
                                                        autoComplete="off"
                                                        name="name"
                                                        type="text"
                                                        id="name"
                                                        className={"form-input"}
                                                    />
                                                    {submitCount && errors.name ? (
                                                        <div className="text-danger mt-1"> {`${errors.name}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className='mt-5'>
                                                    <label htmlFor="note" className='label'> {t('description')} </label >
                                                    <Field
                                                        autoComplete="off"
                                                        name="note"
                                                        type="text"
                                                        id="note"
                                                        className={"form-input"}
                                                    />
                                                    {submitCount && errors.note ? (
                                                        <div className="text-danger mt-1"> {`${errors.note}`} </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </Form>
                                    )
                                    }
                                </Formik>
                            </AnimateHeight>
                        </div>
                    </div>
                    <div className="rounded">
                        <button
                            type="button"
                            className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                            onClick={() => handleActive(2)}
                        >
                            {t('member_list')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(2) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`${active.includes(2) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(2) ? 'auto' : 0}>
                                <div className='p-4'>
                                    <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                                        <button data-testId='modal-repair-btn' type="button" onClick={(e) => { setOpenModal(true); setDataDetail(undefined); }} className="btn btn-primary btn-sm m-1 custom-button" >
                                            <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                            {t('add_members')}
                                        </button>
                                        <input
                                            autoComplete="off"
                                            type="text"
                                            className="form-input w-[400px]"
                                            data-testid="search-order-input"
                                            placeholder={`${t('search')}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch(e)
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="datatables">
                                        <DataTable
                                            highlightOnHover
                                            className="whitespace-nowrap table-hover custom_table"
                                            records={listDataDetail}
                                            noRecordsIcon={isLoading && (
                                                <div className="mt-10 z-[60] place-content-center">
                                                    <IconLoading />
                                                </div>
                                            )}
                                            noRecordsText=""
                                            columns={columns}
                                            totalRecords={pagination?.totalRecords}
                                            recordsPerPage={pagination?.perPage}
                                            page={pagination?.page}
                                            onPageChange={(p) => handleChangePage(p, pagination?.perPage)}
                                            recordsPerPageOptions={PAGE_SIZES}
                                            onRecordsPerPageChange={e => handleChangePage(pagination?.page, e)}
                                            sortStatus={sortStatus}
                                            onSortStatusChange={setSortStatus}
                                            minHeight={200}
                                            paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`}
                                        />
                                    </div>
                                </div>
                            </AnimateHeight>
                        </div>
                        <DetailModal
                            openModal={openModal}
                            setOpenModal={setOpenModal}
                            setData={setDataDetail}
                            orderDetailMutate={mutate}
                            listData={listDataDetail}
                            setListData={setListDataDetail}
                        />
                    </div>
                    <div className="rounded mt-2">
                        <button
                            type="button"
                            className={`flex w-full items-center p-4 text-white-dark dark:bg-[#1b2e4b] custom-accordion uppercase`}
                            onClick={() => handleActive(3)}
                        >
                            {t('list_noti')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(3) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`${active.includes(3) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(3) ? 'auto' : 0}>
                                <div className='p-4'>
                                    <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                                        <div className="flex flex-wrap items-center">
                                            <button data-testId='modal-repair-btn' type="button" onClick={(e) => { router.push(`/hrm/group-notification/create?groupId=${router.query.id}&groupName=${data?.name}`) }} className="btn btn-primary btn-sm m-1 custom-button" >
                                                <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                                {t('add')}
                                            </button>
                                        </div>
                                        <input
                                            autoComplete="off"
                                            type="text"
                                            className="form-input w-[400px]"
                                            data-testid="search-order-input"
                                            placeholder={`${t('search')}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearchNoti(e)
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="datatables">
                                        <DataTable
                                            whitespace-nowrap
                                            highlightOnHover
                                            style={{ whiteSpace: 'pre-wrap' }}
                                            className="table-hover custom_table button_hover whitespace-nowrap"
                                            records={notificationGroup?.data}
                                            columns={columnsNoti}
                                            totalRecords={pagination?.totalRecords}
                                            recordsPerPage={pagination?.perPage}
                                            page={pagination?.page}
                                            onPageChange={(p) => handleChangePageNoti(p, pagination?.perPage)}
                                            recordsPerPageOptions={PAGE_SIZES}
                                            onRecordsPerPageChange={(e) => handleChangePageNoti(pagination?.page, e)}
                                            sortStatus={sortStatus}
                                            onSortStatusChange={setSortStatus}
                                            minHeight={200}
                                            paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`}
                                        />
                                    </div>
                                </div>
                            </AnimateHeight>
                        </div>
                    </div>
                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                            {t('cancel')}
                        </button>
                        <button data-testId="submit-btn" type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmit()}>
                            {router.query.id !== "create" ? t('update') : t('save')}
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
};
export default DetailPage;
