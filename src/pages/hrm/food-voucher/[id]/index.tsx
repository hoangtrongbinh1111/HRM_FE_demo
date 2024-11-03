import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { downloadFile, showMessage } from '@/@core/utils';
import { useRouter } from 'next/router';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPencil from '@/components/Icon/IconPencil';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import IconPlus from '@/components/Icon/IconPlus';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import AnimateHeight from 'react-animate-height';
import Link from 'next/link';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Select, { components } from 'react-select';
import IconBack from '@/components/Icon/IconBack';
import { DropdownDepartment, DropdownProducts, DropdownUsers } from '@/services/swr/dropdown.swr';
import DetailModal from '../modal/DetailModal';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import ApprovalModal from '../modal/ApprovalModal';
import RejectModal from '../modal/RejectModal';
import { useProfile } from '@/services/swr/profile.swr';
import { FoodVoucherDetails } from '@/services/swr/food-voucher.swr';
import { AddFoodVoucherDetail, AddFoodVoucherDetails, CreateFoodVoucher, DeleteFoodVoucherDetail, EditFoodVoucher, EditFoodVoucherDetail, FoodVoucherApprove, GetFoodVoucher } from '@/services/apis/food-voucher.api';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { LIST_STATUS } from '@/utils/constants';
import { IRootState } from '@/store';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { Loader } from '@mantine/core';
import dayjs from 'dayjs';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import Modal from './modal';
import ExcelJS from "exceljs";
import IconNewDownload3 from '@/components/Icon/IconNewDownload3';
import IconImportFile2 from '@/components/Icon/IconImportFile2';
import { useDebounce } from 'use-debounce';
import { loadMore } from '@/utils/commons';
import { truncate } from 'lodash';
import { getConfig } from '@/services/apis/config-approve.api';
import SwitchBtn from '@/pages/warehouse-process/switchBtn';
interface Props {
    [key: string]: any;
}

const DetailPage = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const { data: userData } = useProfile();
    const [disable, setDisable] = useState<any>(false);
    const [dataDetail, setDataDetail] = useState<any>();
    const [listDataDetail, setListDataDetail] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [openModalApproval, setOpenModalApproval] = useState(false);
    const [openModalReject, setOpenModalReject] = useState(false);
    const [query, setQuery] = useState<any>({});
    const [active, setActive] = useState<any>([1, 2, 3]);
    const [initialValue, setInitialValue] = useState<any>();
    const [data, setData] = useState<any>();
    const [open, setOpen] = useState<any>(false);
    const [id, setId] = useState<any>(0);
    const [high, setIsHigh] = useState<any>('false');
    const [page, setPage] = useState(1);
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const formRef = useRef<any>();
    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [send, SetSend] = useState<any>(false);
    const [departmentId, setDepartmentId] = useState<any>();
    const [createdId, setCreatedId] = useState();
    const [openAssigned, setOpenAssigned] = useState(false);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [pageHuman, setSizeHuman] = useState<any>(1);
    const [queryHuman, setQueryHuman] = useState<any>();
    const [debouncedPageHuman] = useDebounce(pageHuman, 500);
    const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
    const [dataHuman, setDataHuman] = useState<any>([]);
    const [dataStaffDropdown, setDataStaffDropdown] = useState<any>([]);
    const [loadHuman, setLoadHuman] = useState(false)
    const [submitType, setSubmitType] = useState('');
    const [sign, setSign] = useState<any>();
    const [signStatus, setSignStatus] = useState<any>();
    const { data: profile } = useProfile();
    const [loading, setLoading] = useState(false);
    const [loadingState, setLoadingState] = useState({
        isContinueApproval: false,
        isApprove: false,
        isReject: false,
        isSubmit: false,
        isContinueInitial: false
    })

    const { data: FoodVoucherDetail, pagination, mutate, isLoading } = FoodVoucherDetails({ ...query });
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, search: searchDepartment });

    const handleExportFile = (id: any) => {
        setLoading(true)
        downloadFile("food_voucher.pdf", `/food-voucher/${id}/export-text-draft`).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        dispatch(setPageTitle(disable ? `${t('detail_food_voucher')}` : (data ? t('update_food_voucher') : t('add_food_voucher'))));
    });

    useEffect(() => {
        if (Number(router.query.id)) {
            setListDataDetail(FoodVoucherDetail?.data);
        }
    }, [FoodVoucherDetail?.data, router]);

    useEffect(() => {
        if (Number(router.query.id)) {
            handleData();
            setQuery({ id: router.query.id, ...router.query });
        }
        if (typeof window !== 'undefined') {
            setId(Number(localStorage.getItem('idUser')));
            setIsHigh(localStorage.getItem('isHighestPosition'));
        }

        setDisable(router.query.status === 'true' ? true : false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const handleData = () => {
        GetFoodVoucher({ id: router.query.id })
            .then((res) => {
                setData(res.data);
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
    };

    useEffect(() => {
        setInitialValue({
            departmentId: data?.department
                ? {
                    value: `${data?.department?.id}`,
                    label: `${data?.department?.name}`,
                }
                : profile?.data?.department
                    ? {
                        value: `${profile?.data?.department?.id}`,
                        label: `${profile?.data?.department?.name}`,
                    }
                    : '',
            position: data ? data?.createdBy?.position?.name : userData?.data?.position?.name,
            receiver: data?.createdBy ? data?.createdBy.fullName : JSON.parse(localStorage.getItem('profile') || '').fullName,
            requestDate: data ? data?.createdAt : new Date(),
            startDay: data ? data?.startDay : new Date(),
            endDay: data ? data?.endDay : new Date(),
            currentApprover: data?.currentApprover ? data?.currentApprover.fullName : '',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, router]);

    const SubmittedForm = Yup.object().shape({
        departmentId: new Yup.ObjectSchema().required(`${t('please_fill_department')}`),
    });

    const handleEdit = (data: any) => {
        EditFoodVoucherDetail({ detailId: data?.id, ...listDataDetail.find((item) => item.id === data.id), staffId: listDataDetail.find((item) => item.id === data.id).staffId.value, id: router.query.id }).then(() => {
            mutate();
            showMessage(`${t('edit_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        })
    };

    const handleDelete = ({ id, receiver }: any) => {
        if (listDataDetail?.length === 1) {
            showMessage(`${t('list_detail_can_not_be_empty')}`, 'error');
            return
        }
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
                title: `${t('delete_receiver')}`,
                text: `${t('delete')} ${receiver?.name}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    if (Number(router.query.id)) {
                        DeleteFoodVoucherDetail({ id: router.query.id, detailId: id })
                            .then(() => {
                                mutate();
                                showMessage(`${t('delete_receiver_success')}`, 'success');
                            })
                            .catch((err) => {
                                showMessage(`${err?.response?.data?.message}`, 'error');
                            });
                    } else {
                        setListDataDetail(listDataDetail?.filter((item: any) => item.id !== id));
                    }
                }
            });
    };

    const { data: staffDropdown, pagination: staffPagination, isLoading: staffLoading } = DropdownUsers({
        page: debouncedPageHuman,
        perPage: 10,
        departmentId: data?.createdBy?.department?.id ?? userData?.data?.department?.id,
        search: debouncedQueryHuman?.search,
    });

    useEffect(() => {
        if (staffPagination?.page === undefined) return;
        if (staffPagination?.page === 1) {
            setDataStaffDropdown(staffDropdown?.data);
        } else {
            setDataStaffDropdown([...dataStaffDropdown, ...staffDropdown?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffPagination]);

    const handleOnScrollBottomHuman = () => {
        setLoadHuman(true);
        if (staffPagination?.page < staffPagination?.totalPages) {
            setSizeHuman(staffPagination?.page + 1);
        }
    };
    useEffect(() => {
        loadMore(staffDropdown, dataHuman, staffPagination, setDataHuman, 'id', 'fullName', setLoadHuman);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staffPagination, debouncedPageHuman, debouncedQueryHuman]);
    const handleDataRecord = (records: any, value: any, name: any) => {
        const data = listDataDetail.find((item) => item.id === records.id);
        setListDataDetail([
            {
                id: records.id,
                staffId: name === 'staffId' ? value : data?.staff ? {
                    value: data?.staff.id,
                    label: data?.staff.fullName
                } : data?.staffId ? data?.staffId : '',
                MTHH: name === 'MTHH' ? value : data.MTHH,
                MTO: name === 'MTO' ? value : data.MTO,
                PG: name === 'PG' ? value : data.PG,
                TG: name === 'TG' ? value : data.TG,
                TV: name === 'TV' ? value : data.TV,
                TVL: name === 'TVL' ? value : data.TVL,
                Lk: name === 'Lk' ? value : data.Lk,
                ST: name === 'ST' ? value : data.ST,
                totalDay: name === 'totalDay' ? value : data.totalDay,
                new: data.new
            },
            ...listDataDetail.filter((item) => item.id !== records.id),
        ]);
    };

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
            width: 10,
        },
        {
            accessor: 'name',
            title: <span className='flex justify-center'>{t('name_staff')}</span>,
            render: (records: any) => {
                return (
                    <Select
                        menuPlacement="auto"
                        menuPosition="fixed"
                        menuPortalTarget={document.body}
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 })
                        }}
                        value={records?.staff ? {
                            label: records?.staff?.fullName,
                            value: records?.staff?.id,
                        } : records?.staffId}
                        id="staffId"
                        name="staffId"
                        closeMenuOnSelect={true}
                        options={dataStaffDropdown.map((item: any) => {
                            return {
                                value: item.value,
                                label: `${item.label}`,
                                department: item.department_name
                            }
                        })}
                        onInputChange={(e) => handleSearchHuman(e)}
                        onMenuOpen={() => setPage(1)}
                        onMenuScrollToBottom={() => handleOnScrollBottomHuman()}
                        isLoading={staffLoading}
                        placeholder={`${t('choose_staff')}`}
                        isSearchable
                        maxMenuHeight={160}
                        onChange={(e) => {
                            handleDataRecord(records, e, 'staffId')
                        }}
                        isDisabled={disable}
                    />
                )
            },
            width: 250,
            sortable: false,
        },
        {
            accessor: 'haohao',
            title: <span className='flex justify-center'>{t('Hảo hảo')}</span>,
            sortable: false,
            render: (records: any) => {
                return (
                    <input
                        name="MTHH"
                        type="number"
                        disabled={data?.currentApproverId === userData?.data?.id ? false : disable}
                        className='form-input'
                        min={0}
                        value={records.MTHH === 0 ? '' : records.MTHH}
                        onChange={e => handleDataRecord(records, Number(Number(e.target.value) < 0 ? 0 : e.target.value), e.target.name)}
                    />
                )
            },
            width: 120,
        },
        {
            accessor: 'omachi',
            title: <span className='flex justify-center'>{t('Omachi')}</span>,
            sortable: false,
            render: (records: any) => {
                return (
                    <input
                        name="MTO"
                        type="number"
                        disabled={data?.currentApproverId === userData?.data?.id ? false : disable}
                        className='form-input'
                        min={0}
                        value={records.MTO === 0 ? '' : records.MTO}
                        onChange={e => handleDataRecord(records, Number(Number(e.target.value) < 0 ? 0 : e.target.value), e.target.name)}
                    />
                )
            },
            width: 120,
        },
        {
            accessor: 'pho',
            title: <span className='flex justify-center'>{t('Phở')}</span>,
            sortable: false,
            render: (records: any) => {
                return (
                    <input
                        name="PG"
                        type="number"
                        disabled={data?.currentApproverId === userData?.data?.id ? false : disable}
                        className='form-input'
                        min={0}
                        value={records.PG === 0 ? '' : records.PG}
                        onChange={e => handleDataRecord(records, Number(Number(e.target.value) < 0 ? 0 : e.target.value), e.target.name)}
                    />
                )
            },
            width: 120,
        },
        {
            accessor: 'trungga',
            title: <span className='flex justify-center'>{t('Trứng gà')}</span>,
            sortable: false,
            render: (records: any) => {
                return (
                    <input
                        name="TG"
                        type="number"
                        disabled={data?.currentApproverId === userData?.data?.id ? false : disable}
                        className='form-input'
                        min={0}
                        value={records.TG === 0 ? '' : records.TG}
                        onChange={e => handleDataRecord(records, Number(Number(e.target.value) < 0 ? 0 : e.target.value), e.target.name)}
                    />
                )
            },
            width: 120,
        },
        {
            accessor: 'trungvit',
            title: <span className='flex justify-center'>{t('Trứng vịt')}</span>,
            sortable: false,
            render: (records: any) => {
                return (
                    <input
                        name="TV"
                        type="number"
                        disabled={data?.currentApproverId === userData?.data?.id ? false : disable}
                        className='form-input'
                        min={0}
                        value={records.TV === 0 ? '' : records.TV}
                        onChange={e => handleDataRecord(records, Number(Number(e.target.value) < 0 ? 0 : e.target.value), e.target.name)}
                    />
                )
            },
            width: 120,
        },
        {
            accessor: 'TVL',
            title: <span className='flex justify-center'>{t('Trứng vịt lộn')}</span>,
            sortable: false,
            render: (records: any) => {
                return (
                    <input
                        name="TVL"
                        type="number"
                        disabled={data?.currentApproverId === userData?.data?.id ? false : disable}
                        className='form-input'
                        min={0}
                        value={records.TVL === 0 ? '' : records.TVL}
                        onChange={e => handleDataRecord(records, Number(Number(e.target.value) < 0 ? 0 : e.target.value), e.target.name)}
                    />
                )
            },
            width: 120,
        },
        {
            accessor: 'LK',
            title: <span className='flex justify-center'>{t('Lương khô')}</span>,
            sortable: false,
            render: (records: any) => {
                return (
                    <input
                        name='Lk'
                        type="number"
                        disabled={data?.currentApproverId === userData?.data?.id ? false : disable}
                        className='form-input'
                        min={0}
                        value={records.Lk === 0 ? '' : records.Lk}
                        onChange={e => handleDataRecord(records, Number(Number(e.target.value) < 0 ? 0 : e.target.value), e.target.name)}
                    />
                )
            },
            width: 120
        },
        {
            accessor: 'sua',
            title: <span className='flex justify-center'>{t('Sữa')}</span>,
            sortable: false,
            render: (records: any) => {
                return (
                    <input
                        name='ST'
                        type="number"
                        disabled={data?.currentApproverId === userData?.data?.id ? false : disable}
                        className='form-input'
                        min={0}
                        value={records.ST === 0 ? '' : records.ST}
                        onChange={e => handleDataRecord(records, Number(Number(e.target.value) < 0 ? 0 : e.target.value), e.target.name)}
                    />
                )
            },
            width: 120,
        },
        {
            accessor: 'day',
            title: <span className='flex justify-center'>{t('days_issued')}</span>,
            sortable: false,
            render: (records: any) => {
                return (
                    <input
                        name='totalDay'
                        type="number"
                        disabled={data?.currentApproverId === userData?.data?.id ? false : disable}
                        className='form-input'
                        min={0}
                        value={records.totalDay === 0 ? '' : records.totalDay}
                        onChange={e => handleDataRecord(records, Number(Number(e.target.value) < 0 ? 0 : e.target.value), e.target.name)}
                    />
                )
            },
            width: 120,
        },
        {
            accessor: 'action',
            title: <span className='flex justify-center'>{t('action')}</span>,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="mx-auto flex w-max items-center gap-2">
                    <>
                        {
                            disable && data?.currentApproverId === userData?.data?.id &&
                            <button className="button-edit" type="button" onClick={() => handleEdit(records)}>
                                <IconNewEdit /> <span>{`${t('edit')}`}</span>
                            </button>
                        }
                        {!disable && (data?.status === 'DRAFT' || router.query.id === 'create') && (
                            <button className="button-delete" type="button" onClick={() => handleDelete(records)}>
                                <IconNewTrash /> <span>{`${t('delete')}`}</span>
                            </button>
                        )}
                    </>
                </div>
            ),
        },
    ];
    const handleSearchHuman = (param: any) => {
        setQueryHuman({ search: param });
    };

    const handleReturnFlowApprove = (action: any, sign: number) => {
        switch (action) {
            case "FORWARD":
            case "SUBMIT":
            case "SUBMIT_RETURN":
            case "FORWARD_RETURN":
                return sign === 2 ? `${t('continue_approval')}` : `${t('continue_initial')}`;
            case "REJECT":
                return `${t('reject')}`
            case "APPROVE":
                return `${t('approve')}`
            case "REJECT_RETURN":
                return `${t('reject_return')}`
            case "APPROVE_RETURN":
                return `${t('approve_return')}`
            default:
                return `${t('approve')}`
        }
    }

    const columnHistorys = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'action',
            title: `${t('action_type')}`,
            render: ({ action, sign }: any) => <span>{handleReturnFlowApprove(action, sign)}</span>,
            sortable: false,
        },
        {
            accessor: 'approver',
            title: `${t('executor')}`,
            render: ({ approver }: any) => <span>{approver?.fullName}</span>,
            sortable: false,
        },
        {
            accessor: 'submittedAt',
            title: `${t('exe_time')}`,
            render: ({ submittedAt }: any) => <span>{moment(submittedAt).format("HH:mm DD/MM/YYYY")}</span>,
            sortable: false,
        },
        { accessor: 'comment', title: `${t('description')}`, sortable: false },
    ];

    const handleCancel = () => {
        router.push(`/hrm/food-voucher`);
    };

    const handleActive = (value: any) => {
        if (active.includes(value)) {
            setActive(active.filter((item: any) => item !== value));
        } else {
            setActive([value, ...active]);
        }
    };
    const handleFoodVoucher = (param: any) => {
        const query: any = {
            departmentId: Number(param?.departmentId?.value),
            startDay: param?.startDay,
            endDay: param?.endDay,
        };

        if (data) {
            EditFoodVoucher({ id: data?.id, ...query })
                .then((res) => {
                    // showMessage(`${t('edit_success')}`, 'success');
                    listDataDetail?.map((item: any, index: number) => {
                        if (item.new) {
                            handleAddDetail(item);
                        } else {
                            handleEditDetail(item)
                        }
                        if (index + 1 === listDataDetail.length) {
                            handleCancel();
                        }
                    })
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        } else {
            if (listDataDetail?.length === undefined || listDataDetail?.length === 0) {
                showMessage(`${t('please_add_receiver')}`, 'error');
                handleActive(2);
            } else {
                CreateFoodVoucher(query)
                    .then((res) => {
                        // showMessage(`${t('save_draf_success')}`, 'success');
                        setCreatedId(res.data.id);
                        handleDetail(res.data.id);
                        // if (router.query.id === 'create' && send === true) {
                        //     showMessage(`${t('save_success')}`, 'success');
                        //     setId(res?.data?.createdById);
                        //     setOpenModalApproval(true);
                        // } else {
                        //     showMessage(`${t('save_draf_success')}`, 'success');
                        //     handleCancel();
                        // }

                    })
                    .catch((err) => {
                        showMessage(`${err?.response?.data?.message[0].error}`, 'error');
                    });
            }
        }
    };

    const handleEditDetail = (records: any) => {
        EditFoodVoucherDetail({ ...records, id: router.query.id, detailId: records.id, staffId: records.staffId.value })
            .then(() => {
                mutate();
                showMessage(`${t('edit_success')}`, 'success');
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            })
    }

    const handleAddDetail = (record: any) => {
        AddFoodVoucherDetail({
            id: router.query.id,
            MTHH: record.MTHH,
            MTO: record.MTO,
            PG: record.PG,
            TG: record.TG,
            TV: record.TV,
            TVL: record.TVL,
            Lk: record.Lk,
            ST: record.ST,
            totalDay: record.totalDay,
            staffId: record.staffId.value,
        }).then(() => {
            showMessage(`${t('save_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        });
    }
    const handleDetail = (id: any) => {
        AddFoodVoucherDetails({
            id: id,
            details: listDataDetail.map((item: any) => {
                // const { id, ...rest } = item;
                return {
                    MTHH: item.MTHH,
                    MTO: item.MTO,
                    PG: item.PG,
                    TG: item.TG,
                    TV: item.TV,
                    TVL: item.TVL,
                    Lk: item.Lk,
                    ST: item.ST,
                    totalDay: item.totalDay,
                    staffId: item.staffId.value,
                };
            }),
        })
            .then(() => {
                if (router.query.id === 'create' && send === true) {
                    showMessage(`${t('save_success')}`, 'success');
                    setId(id);
                    setOpenModalApproval(true);
                } else {
                    showMessage(`${t('save_draf_success')}`, 'success');
                    handleCancel();
                }
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
    };

    const RenturnError = (param: any) => {
        if (Object.keys(param?.errors || {}).length > 0 && param?.submitCount > 0) {
            showMessage(`${t('please_add_infomation')}`, 'error');
        }
        return <></>;
    };

    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data);
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationDepartment]);

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(paginationDepartment?.page + 1);
        }, 1000);
    };
    const [btnRule, setBtnRule] = useState(false);

    const handleSubmitApproval = (id: any) => {
        if (id === 1) {
            setBtnRule(true)
        } else {
            setBtnRule(false)
        }
        setSign(id);
        if (router.query.id !== "create") {
            setOpenModalApproval(true);
        } else {
            handleSubmit();
            SetSend(true);
        }
    };

    const Approve = () => {
        setLoadingState({
            ...loadingState,
            isApprove: true
        });
        FoodVoucherApprove({ id: router.query.id, sign: 3 }).then(() => {
            handleCancel();
            showMessage(`${t('approve_success')}`, 'success');
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        }).finally(() => {
            setLoadingState({
                ...loadingState,
                isApprove: false
            });
        });
    }

    const handleApprove = () => {
        const swalDeletes = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary testid-confirm-btn',
                cancelButton: 'btn btn-danger ltr:mr-3 rtl:ml-3',
                popup: 'confirm-popup confirm-delete',
            },
            imageUrl: '/assets/images/delete_popup.png',
            buttonsStyling: false,
        });
        swalDeletes
            .fire({
                title: `${t('approve')}`,
                text: `${t('approve')} ${t('food_voucher')}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    Approve();
                }
            });
    };

    const handleReject = () => {
        setOpenModalReject(true);
    };

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit();
        }
    };

    useEffect(() => {
        if (data?.approvalHistory.find((item: any) => Number(item.approverId) === Number(id))) {
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, [data, id]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        const lang = localStorage.getItem('i18nextLng');
        let urlString
        switch (lang) {
            case "vi":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/food_voucher/food_voucher_vi.xlsx`;
                break;
            case "la":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/food_voucher/food_voucher_la.xlsx`;
                break;
            case "en":
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/food_voucher/food_voucher_en.xlsx`;
                break;
            default:
                urlString = `${process.env.NEXT_PUBLIC_APP_URL}/templates/food_voucher/food_voucher_vi.xlsx`;
                break;
        }
        const link = document.createElement('a');
        link.href = urlString;
        link.setAttribute('download', 'food_voucher.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target?.result;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer as ArrayBuffer);

            const worksheet = workbook.worksheets[0];
            const jsonData: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 3) {
                    const rowValues = row.values as any[];
                    const item = rowValues.slice(1);
                    jsonData.push({
                        id: item[0],
                        staffId: item[1],
                        numberOfNoodle: item[2],
                        numberOfEgg: item[3],
                        numberOfDry: item[4],
                        numberOfMilk: item[5],
                        daysIssued: item[6]
                    });
                }
            });
            setListDataDetail((prev) => ([...prev, ...jsonData]));
        };
        reader.readAsArrayBuffer(file);
    };
    return (
        <div>
            {isLoading && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )}
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <Link href="/hrm/food-voucher" className="text-primary hover:underline">
                        <span>{t('food_voucher')}</span>
                    </Link>

                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>
                        {!disable && (data ? t('update_food_voucher') : t('add_food_voucher'))}
                        {
                            disable && t('detail_food_voucher')
                        }
                    </span>
                </li>
            </ul>
            <div className='flex justify-between header-page-bottom pb-4 mb-4'>
                <h1 className='page-title'>
                    {!disable && (data ? t('update_food_voucher') : t('add_food_voucher'))}
                    {
                        disable && t('detail_food_voucher')
                    }
                </h1>
                <div className='flex' style={{ alignItems: "center" }}>
                    <Link href={`/hrm/food-voucher`}>
                        <div className="btn btn-primary btn-sm m-1 back-button h-9" >
                            <IconBack />
                            <span>
                                {t('back')}
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="mb-5">
                <div className="font-semibold">
                    <div className="rounded">
                        <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(1)}>
                            {t('food_voucher_infomation')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(1) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`mb-2 ${active.includes(1) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(1) ? 'auto' : 0}>
                                <Formik
                                    initialValues={initialValue}
                                    validationSchema={SubmittedForm}
                                    onSubmit={(values) => {
                                        handleFoodVoucher(values);
                                    }}
                                    enableReinitialize
                                    innerRef={formRef}
                                >
                                    {({ errors, values, submitCount, setFieldValue }) => (
                                        <Form className="space-y-5">
                                            <div className="p-4">
                                                <div className="mb-5 mt-5 flex justify-between gap-5">
                                                    <div className="w-1/2">
                                                        <label htmlFor="receiver" className="label">
                                                            {' '}
                                                            {t('receiver')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field
                                                            autoComplete="off"
                                                            name="receiver"
                                                            type="text"
                                                            id="receiver"
                                                            placeholder={`${t('enter_code')}`}
                                                            className={true ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                            disabled={true}
                                                        />
                                                        {submitCount && errors.receiver ? <div className="mt-1 text-danger"> {`${errors.receiver}`} </div> : null}
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="position" className="label">
                                                            {' '}
                                                            {t('duty')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Field autoComplete="off" disabled type="text" name="position" id="position" className="form-input"></Field>
                                                    </div>

                                                </div>
                                                <div className="mt-5 flex justify-between gap-5">
                                                    <div className=" w-1/2">
                                                        <label htmlFor="departmentId" className="label">
                                                            {' '}
                                                            {t('work_department')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Select
                                                            id="departmentId"
                                                            name="departmentId"
                                                            isDisabled={true}
                                                            options={dataDepartment}
                                                            maxMenuHeight={160}
                                                            value={values?.departmentId}
                                                            onMenuOpen={() => setPage(1)}
                                                            onMenuScrollToBottom={handleMenuScrollToBottom}
                                                            isLoading={isLoadingDepartment}
                                                            placeholder={t('choose_department')}
                                                            onInputChange={(e) => setSearchDepartment(e)}
                                                            onChange={(e) => {
                                                                setDepartmentId(e.value);
                                                                setFieldValue('departmentId', e);
                                                            }}
                                                        // isDisabled={!isNaN(Number(router.query.id))}
                                                        />
                                                        {submitCount && errors.departmentId ? <div className="mt-1 text-danger"> {`${errors.departmentId}`} </div> : null}
                                                    </div>
                                                </div>
                                                <div className="mt-5 flex justify-between gap-5">
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="startDay" className="label">
                                                            {t('startDate')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            name="startDay"
                                                            disabled={disable}
                                                            options={{
                                                                enableTime: false,
                                                                dateFormat: 'd-m-Y',
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                minDate: disable ? "" : Number(moment().format('HH')) >= Number(moment(values?.startDay).format('HH')) ? "" : new Date,
                                                            }}
                                                            value={dayjs(values?.startDay).format('DD-MM-YYYY')}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('choose_submit_day')}`}
                                                            onChange={e => setFieldValue('startDay', e[0])}
                                                        />
                                                        {submitCount ? errors.requestDate ? <div className="mt-1 text-danger"> {`${errors.requestDate}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mb-5 w-1/2">
                                                        <label htmlFor="endDay" className="label">
                                                            {t('endDate')} <span style={{ color: 'red' }}>* </span>
                                                        </label>
                                                        <Flatpickr
                                                            name="endDay"
                                                            disabled={disable}
                                                            options={{
                                                                enableTime: false,
                                                                dateFormat: 'd-m-Y',
                                                                locale: {
                                                                    ...chosenLocale,
                                                                },
                                                                minDate: disable ? "" : Number(moment().format('HH')) >= Number(moment(values?.endDay).format('HH')) ? "" : new Date,
                                                            }}
                                                            value={dayjs(values?.endDay).format('DD-MM-YYYY')}
                                                            className="calender-input form-input"
                                                            placeholder={`${t('choose_submit_day')}`}
                                                            onChange={e => setFieldValue('endDay', e[0])}
                                                        />
                                                        {submitCount ? errors.requestDate ? <div className="mt-1 text-danger"> {`${errors.requestDate}`} </div> : null : ''}
                                                    </div>
                                                </div>
                                                {router.query.id !== 'create' && data?.status !== 'APPROVED' && data?.status !== 'DRAFT' ? (
                                                    <div className="mb-5 mt-5 flex justify-between gap-5">
                                                        <div className="w-1/2">
                                                            <label htmlFor="currentApprover" className="label">
                                                                {
                                                                    data?.status === 'REJECTED' && t('rejecter')
                                                                }
                                                                {
                                                                    (data?.status === 'PENDING' || data?.status === 'IN_PROGRESS') && t('pending_current_approver')
                                                                }
                                                                {
                                                                    data?.status === "APPROVED" && t('approver')
                                                                }
                                                                <span style={{ color: 'red' }}> *
                                                                </span>
                                                            </label>
                                                            <Field
                                                                autoComplete="off"
                                                                name="currentApprover"
                                                                type="text"
                                                                id="currentApprover"
                                                                className={true ? 'form-input bg-[#f2f2f2]' : 'form-input'}
                                                                disabled={true}
                                                            />
                                                            {submitCount && errors.currentApprover ? <div className="mt-1 text-danger"> {`${errors.currentApprover}`} </div> : null}
                                                        </div>
                                                        <div className="w-1/2"></div>
                                                    </div>
                                                ) : <div className="w-1/2"></div>}
                                            </div>
                                            {<RenturnError errors={errors} submitCount={submitCount} />}
                                        </Form>
                                    )}
                                </Formik>
                            </AnimateHeight>
                        </div>
                    </div>
                    <div className="rounded">
                        <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(2)}>
                            {t('receiver_list')}
                            <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(2) ? 'rotate-180' : ''}`}>
                                <IconCaretDown />
                            </div>
                        </button>
                        <div className={`${active.includes(2) ? 'custom-content-accordion' : ''}`}>
                            <AnimateHeight duration={300} height={active.includes(2) ? 'auto' : 0}>
                                <div className="p-4">
                                    <div className="mb-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                        <div className="flex flex-wrap items-center">
                                            {!disable && <>
                                                <button
                                                    data-testId="modal-proposal-btn"
                                                    type="button"
                                                    onClick={(e) => {
                                                        // setOpenModal(true);
                                                        // setDataDetail(undefined);
                                                        setListDataDetail([...listDataDetail, { id: (listDataDetail[listDataDetail.length - 1]?.id || 0) + 1, new: true }]);
                                                    }}
                                                    className="btn btn-primary btn-sm custom-button m-1"
                                                >
                                                    <IconPlus className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                                                    {t('add_receiver_list')}
                                                </button>
                                                <button
                                                    data-testId="modal-proposal-btn"
                                                    type="button"
                                                    onClick={(e) => handleDownloadTemplate()}
                                                    className="btn btn-primary btn-sm custom-button m-1"
                                                >
                                                    <IconNewDownload3 className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                                                    <span style={{ marginLeft: "0.2rem" }}>{t('download_template')}</span>
                                                </button>
                                                <input
                                                    autoComplete="off" type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    style={{ display: "none" }}
                                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                                />
                                                <button type="button" className="btn btn-primary btn-sm custom-button m-1" onClick={() => fileInputRef.current?.click()}>
                                                    <IconImportFile2 />
                                                    <span style={{ marginLeft: "0.2rem" }}>{t('import_file')}</span>
                                                </button>
                                            </>}
                                        </div>
                                        {/*
                                        <input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} onChange={(e) => handleSearch(e.target.value)} /> */}
                                    </div>
                                    <div className="datatables">
                                        <DataTable
                                            highlightOnHover
                                            className="table-hover whitespace-nowrap"
                                            records={listDataDetail?.sort((a, b) => a.id - b.id)}
                                            columns={columns}
                                            sortStatus={sortStatus}
                                            onSortStatusChange={setSortStatus}
                                            minHeight={200}
                                        />
                                    </div>
                                </div>
                                <DetailModal
                                    openModal={openModal}
                                    setOpenModal={setOpenModal}
                                    data={dataDetail}
                                    setData={setDataDetail}
                                    listData={listDataDetail}
                                    setListData={setListDataDetail}
                                    foodVoucherDetailMutate={mutate}
                                    departmentId={data?.createdBy?.department?.id ?? userData?.data?.department?.id}
                                />
                                {
                                    (router?.query?.id === "create" || (router?.query?.id !== "create" && data)) &&
                                    <ApprovalModal
                                        openModal={openModalApproval}
                                        setOpenModal={setOpenModalApproval}
                                        handleData={handleData}
                                        data={data}
                                        handleCancel={handleCancel}
                                        id={id}
                                        departmentId={data?.createdBy?.department?.id ?? userData?.data?.department?.id}
                                        createdId={createdId}
                                        submitType={submitType}
                                        sign={sign}
                                        btnRule={btnRule}
                                    />
                                }
                                <RejectModal openModal={openModalReject} setOpenModal={setOpenModalReject} handleCancel={handleCancel} />
                            </AnimateHeight>
                        </div>
                    </div>
                    {router.query.id !== 'create' && (
                        <div className="mt-5 rounded">
                            <button type="button" className={`custom-accordion flex w-full items-center p-4 uppercase text-white-dark dark:bg-[#1b2e4b]`} onClick={() => handleActive(3)}>
                                {t('history_approve')}
                                <div className={`ltr:ml-auto rtl:mr-auto ${active.includes(3) ? 'rotate-180' : ''}`}>
                                    <IconCaretDown />
                                </div>
                            </button>
                            <div className={`${active.includes(3) ? 'custom-content-accordion' : ''}`}>
                                <AnimateHeight duration={300} height={active.includes(3) ? 'auto' : 0}>
                                    <div className="p-4">
                                        <div className="mb-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                            <div className="flex flex-wrap items-center"></div>
                                        </div>
                                        <div className="datatables">
                                            <DataTable
                                                highlightOnHover
                                                className="table-hover whitespace-nowrap"
                                                records={data?.approvalHistory}
                                                columns={columnHistorys}
                                                sortStatus={sortStatus}
                                                onSortStatusChange={setSortStatus}
                                                minHeight={200}
                                            />
                                        </div>
                                    </div>
                                </AnimateHeight>
                            </div>
                        </div>
                    )}
                    {/* <div style={{ display: 'flex', marginTop: '10px' }}>
                        <p style={{ marginRight: '10px' }}>
                            <strong>{t('Order of signing')}:</strong>
                        </p>
                        <p>
                            <strong>
                                {t('Applicant')} {'->'} {t('Department Head/Deputy')} {'->'} {t('Head/Deputy of HR & Admin Department')}
                            </strong>
                        </p>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px' }}>
                        <p style={{ fontStyle: "italic" }}>{t('Note: For employees of the HR & Admin Department')}</p>
                    </div>
                    <div style={{ display: 'flex', marginTop: '10px', fontStyle: "italic" }}>
                        <p style={{ marginRight: '10px' }}>
                            {t('Order of signing')}:
                        </p>
                        <p>
                            {' '}
                            {t('Applicant')} {'->'} {t('Head/Deputy of HR & Admin Department')}
                        </p>
                    </div> */}
                    <div className="flex items-center justify-end ltr:text-right rtl:text-left mt-4">
                        <SwitchBtn
                            entity={'food-voucher'}
                            handleCancel={handleCancel}
                            handleSubmit={handleSubmit}
                            handleSubmitApproval={handleSubmitApproval}
                            handleReject={handleReject}
                            handleApprove={handleApprove}
                            setSign={setSign}
                            disable={disable}
                            data={data}
                            id={id}
                        />
                    </div>
                </div>
            </div>
            <Modal open={openAssigned} id={router.query.id} handleData={handleData} setOpen={setOpenAssigned}></Modal>
        </div>
    );
};
export default DetailPage;
