import { useEffect, Fragment, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import Link from 'next/link';
import Select from "react-select";
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import dayjs from "dayjs";
// API
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT, LIST_STATUS_COLOR, LIST_STATUS_MEAN, LIST_STATUS } from '@/utils/constants';
// helper
import { capitalize, formatDate, showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPlus from '@/components/Icon/IconPlus';

import { useRouter } from 'next/router';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import "flatpickr/dist/plugins/monthSelect/style.css"
import monthSelectPlugin, { Config } from "flatpickr/dist/plugins/monthSelect"

// json
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import "react-dropdown-tree-select/dist/styles.css";
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { ForgotCheckinOuts } from '@/services/swr/forgot-checkin-out.swr';
import { listAllDepartmentTree } from '@/services/apis/department.api';
import { flattenDepartments, toDateString } from '@/utils/commons';
import { DeleteForgotCheckinout } from '@/services/apis/forgot-checkin-out.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { useProfile } from '@/services/swr/profile.swr';

import IconCalendar from '@/components/Icon/IconCalendar';
import { IRootState } from '@/store';
interface Props {
    [key: string]: any;
}
const monthSelectConfig: Partial<Config> = {
    shorthand: true, //defaults to false
    dateFormat: "m/Y", //defaults to "F Y"
    theme: "light" // defaults to "light"
};


const formatGroupLabel = (data: any) => (
    <div className="groupStyles">
        <span>{data.label}</span>
        <span className="groupBadgeStyles">{data.options.length}</span>
    </div>
);

const LEVEL_INDENT = 20;
const customStyles = {
    option: (provided: any, state: any) => ({
        ...provided,
        paddingLeft: state.data.level ? state.data.level * LEVEL_INDENT : 10
    })
};
const LateEarlyForm = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { data: userData } = useProfile();
    useEffect(() => {
        dispatch(setPageTitle(`${t('forgot_checkin_out')}`));
    });

    const router = useRouter();

    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [recordsData, setRecordsData] = useState<any>();
    const [getStorge, setGetStorge] = useState<any>();
    const [data, setData] = useState<any>();
    const [search, setSearch] = useState<any>("");
    const [groupedOptions, setGroupedOptions] = useState<any>([
        {
            label: `${t('work_department')}`,
            options: []
        }
    ]
    );
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    const [openModal, setOpenModal] = useState(false);
    const { data: forgotCheckinOut, pagination, mutate } = ForgotCheckinOuts({ sortBy: 'id.DESC', ...router.query });

    useEffect(() => {
        listAllDepartmentTree({
            page: 1,
            perPage: 100
        }).then((res: any) => {
            const listDepartment_ = flattenDepartments(res?.data);
            setGroupedOptions([
                {
                    label: `${t('work_department')}`,
                    options: listDepartment_
                }
            ])
        }).catch((err: any) => {
            console.log(err);
        }
        );
    }, [])

    useEffect(() => {
        setShowLoader(false);
    }, [recordsData])

    const handleEdit = (data: any) => {
        router.push(`/hrm/forgot-checkin-out/${data.id}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
    };

    const handleDetail = (data: any) => {
        router.push(`/hrm/forgot-checkin-out/${data.id}?status=${true}&page=${pagination?.page}&perPage=${pagination?.perPage}`);
    };

    const handleDelete = (data: any) => {
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
                title: `${t('delete_form')}`,
                html: `<span class='confirm-span'>${t('delete_form')}</span> ${data.createdBy?.fullName}?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteForgotCheckinout({ id: data?.id }).then(res => {
                        mutate();
                        showMessage(`${t('delete_letter_success')}`, 'success');
                    }).catch(err => {
                        showMessage(`${t('delete_letter_error')}`, 'error');
                    })
                }
            });
    };

    const handleSearch = (param: any) => {
        setSearch(param);
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                search: param,
            },
        });
    };
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            handleSearch(search)
        }
    };

    const handleChangeMonth = (month: any) => {
        const month_ = month?.split('/')[0]
        const year_ = month?.split('/')[1]
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    month: Number(month_),
                    year: Number(year_)
                },
            }
        );
    }

    const handleChangeDepartment = (de: any) => {
        if (de) {
            router.replace(
                {
                    pathname: router.pathname,
                    query: {
                        ...router.query,
                        departmentId: de.id
                    },
                }
            );
        } else {
            delete router.query.departmentId
            router.replace(
                {
                    pathname: router.pathname,
                    query: {
                        ...router.query
                    },
                }
            );
        }

    }

    const handleChangeStatus = (de: any) => {
        if (de) {
            router.replace(
                {
                    pathname: router.pathname,
                    query: {
                        ...router.query,
                        status: de.value
                    },
                }
            );
        } else {
            delete router.query.status
            router.replace(
                {
                    pathname: router.pathname,
                    query: {
                        ...router.query
                    },
                }
            );
        }
    }
    const handleChangePage = (page: number, pageSize: number) => {
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: page,
                    perPage: pageSize,
                },
            },
            undefined,
            { shallow: true },
        );
        return pageSize;
    };

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        {
            accessor: 'name', title: `${t('personel_name')}`, sortable: false,
            render: (records: any, index: any) => <span>{records?.createdBy?.fullName}</span>
        },
        {
            accessor: 'department', title: `${t('personel_department')}`, sortable: false, render: (records: any, index: any) => <span>{records?.createdBy?.department?.name}</span>
        },
        {
            accessor: 'registerday', title: `${t('registerday')}`, sortable: false, render: (records: any, index: any) => <span onClick={(records) => handleDetail(records)}>{records?.registrationDay ? toDateString(records?.registrationDay) : ''}</span>
        },
        { accessor: 'checker', title: `${t('checker')}`, sortable: false, render: (records: any, index: any) => <span>{records?.currentApprover?.fullName}</span> },
        {
            accessor: 'isCheck',
            title: `${t('status')}`,
            sortable: false,
            render: (records: any) => <span className={`badge uppercase bg-${LIST_STATUS_COLOR[records?.status]}`}>{t(`${LIST_STATUS_MEAN[records?.status]}`)}</span>
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="flex justify-center gap-2">
                    <div className="w-[auto]">
                        <button type="button" className='button-detail' onClick={() => handleDetail(records)}>
                            <IconNewEye /><span>
                                {t('detail')}
                            </span>
                        </button>
                    </div>
                    {
                        (records?.status !== LIST_STATUS.APPROVED && records?.status !== LIST_STATUS.REJECTED) &&
                        // <RBACWrapper
                        //     permissionKey={[
                        //         'forgotCheckinOut:update'
                        //     ]}
                        //     type={'AND'}>
                            <div className="w-[auto]">
                                <button type="button" className='button-edit' onClick={() => handleEdit(records)}>
                                    <IconNewEdit /><span>
                                        {t('edit')}
                                    </span>
                                </button>
                            </div>
                        // </RBACWrapper>
                    }
                    {
                        (records.status === LIST_STATUS.DRAFT || records.status === LIST_STATUS.IN_PROGRESS) && userData?.data?.id === records?.createdById &&
                        <div className="w-[auto]">
                            <button type="button" className='button-delete' onClick={() => handleDelete(records)}>
                                <IconNewTrash />
                                <span>
                                    {t('delete')}
                                </span>
                            </button>
                        </div>
                    }
                </div>
            )
        },
    ]
    return (
        <div>
            {showLoader && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
            <div className="flex md:items-center justify-between md:flex-row flex-col gap-5">
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/hrm/dashboard" className="text-primary hover:underline">
                            {t('dashboard')}
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{t('forgot_checkin_out')}</span>
                    </li>
                </ul>
            </div>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        {/* <RBACWrapper
                            permissionKey={[
                                'forgotCheckinOut:create'
                            ]}
                            type={'AND'}
                        > */}
                            <Link href={`/hrm/forgot-checkin-out/create?page=${pagination?.page}&perPage=${pagination?.perPage}`}>
                                <button type="button" className=" m-1 button-table button-create" >
                                    <IconNewPlus />
                                    <span className="uppercase">{t('add')}</span>
                                </button>
                            </Link>
                        {/* </RBACWrapper> */}
                        {/* <button type="button" className="btn btn-primary btn-sm m-1 custom-button" >
                            <IconFolderMinus className="ltr:mr-2 rtl:ml-2" />
                            Nhập file
                        </button> */}
                        {/* <button type="button" className="btn btn-primary btn-sm m-1 custom-button" >
                            <IconDownload className="ltr:mr-2 rtl:ml-2" />
                            Xuất file excel
                        </button> */}
                    </div>
                    <div className='flex flex-row gap-2'>
                        <div className='flex flex-1 w-[220px]'>
                            <Select
                                className="zIndex-10 w-[200px]"
                                options={Object.values(LIST_STATUS)?.map((status: any) => {
                                    return {
                                        value: status,
                                        label: t(`${LIST_STATUS_MEAN[status]}`)
                                    }
                                })}
                                placeholder={t('choose_status')}
                                formatGroupLabel={formatGroupLabel}
                                onChange={(e: any) => {
                                    handleChangeStatus(e);
                                }}
                                isClearable
                            />
                        </div>
                        <div className='flex flex-1 w-[220px]'>
                            <Select
                                className="zIndex-10 w-[200px]"
                                options={groupedOptions}
                                placeholder={t('choose_department')}
                                styles={customStyles}
                                // value={router?.query?.departmentId}

                                formatGroupLabel={formatGroupLabel}
                                onChange={(e: any) => {
                                    handleChangeDepartment(e);
                                }}
                                isClearable
                            />
                        </div>
                        <div className='flex flex-1' style={{ alignItems: "flex-start" }}>
                            <Flatpickr
                                className='form-input'
                                options={{
                                    // dateFormat: 'd/m/y',
                                    disableMobile: true,
                                    defaultDate: `${router?.query?.month}/${router?.query?.year}`,
                                    locale: {
                                        ...chosenLocale,
                                    },
                                    plugins: [
                                        monthSelectPlugin(monthSelectConfig) // Sử dụng plugin với cấu hình
                                    ]
                                }}
                                placeholder={`${t('choose_month')}`}
                                onChange={(selectedDates, dateStr, instance) => {
                                    handleChangeMonth(dateStr)
                                }}
                            />
                            <div style={{ margin: '8px -31px' }} >
                                <IconCalendar />
                            </div>
                        </div>
                        <div className='flex flex-1' style={{ alignItems: "flex-start" }}>
                            <input
                                autoComplete="off"
                                type="text"
                                className="form-input w-auto"
                                placeholder={`${t('search')}`}
                                onKeyDown={(e) => handleKeyPress(e)}
                                onChange={(e) => e.target.value === "" ? handleSearch("") : setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={forgotCheckinOut?.data}
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
        </div>
    );
};

export default LateEarlyForm;
