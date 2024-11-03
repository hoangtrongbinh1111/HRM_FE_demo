import { useEffect, Fragment, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
// API
import { TravelPapers } from '@/services/swr/travel-paper.swr';
import { DeleteTravelPaper, TravelPaperApprove, TravelPaperReject } from '@/services/apis/travel-paper.api';
import Select from "react-select"
// helper
import { downloadFile, showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
import Link from 'next/link';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { listAllDepartmentTree } from '@/services/apis/department.api';
import { flattenDepartments, loadMore } from '@/utils/commons';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import "flatpickr/dist/plugins/monthSelect/style.css"
import monthSelectPlugin, { Config } from "flatpickr/dist/plugins/monthSelect"

import dayjs from 'dayjs';
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT, LIST_STATUS, LIST_STATUS_COLOR, LIST_STATUS_MEAN } from '@/utils/constants';
import { useDebounce } from 'use-debounce';
import Department from '../free-timekeeping';
import { Departments } from '@/services/swr/department.swr';
import { useProfile } from '@/services/swr/profile.swr';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
import { Loader } from '@mantine/core';
import IconNewDownload from '@/components/Icon/IconNewDownload';
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
const TravelPaperPage = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [active, setActive] = useState<any>([]);
    const [department, setDepartment] = useState<any>();
    const [profile, setProfile] = useState<any>();
    const [isAdmin, setIsAdmin] = useState<any>();
    const isFirstRender = useRef(true);
    const [search, setSearch] = useState<any>("");
    const [queryDepartment, setQueryDepartment] = useState<any>();
    //scroll
    const [showLoader, setShowLoader] = useState(true);
    const [recordsData, setRecordsData] = useState<any>();
    const { data: userData } = useProfile();
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [pageDepartment, setSizeDepartment] = useState<any>(1);
    const [debouncedPageDepartment] = useDebounce(pageDepartment, 500);
    const [debouncedQueryDepartment] = useDebounce(queryDepartment, 500);
    const { data: manages, pagination: paginationDepartment } = Departments({
        sortBy: 'id.ASC',
        page: debouncedPageDepartment,
        perPage: 10,
        search: debouncedQueryDepartment?.search
    });
    const [loadDepartment, setLoadDepartment] = useState(false)
    const [isLoadingExportFile, setIsLoadingExportFile] = useState({});
    const [isDisabled, setIsDisabled] = useState(false);
    const handleExportFile = (id: any) => {
        setIsLoadingExportFile((prev) => ({ ...prev, [id]: true }));
        setIsDisabled(true)
        downloadFile("travel_paper.pdf", `/travel-paper/${id}/export-text-draft`).finally(() => {
            setIsLoadingExportFile((prev) => ({ ...prev, [id]: false }));
            setIsDisabled(false)
        })
    }
    const handleOnScrollBottomDepartment = () => {
        setLoadDepartment(true)
        if (paginationDepartment?.page < paginationDepartment?.totalPages) {
            setSizeDepartment(paginationDepartment?.page + 1);
        }
    };
    useEffect(() => {
        loadMore(manages, dataDepartment, paginationDepartment, setDataDepartment, 'id', 'name', setLoadDepartment)
    }, [paginationDepartment, debouncedPageDepartment, debouncedQueryDepartment])
    const handleSearchDepartment = (param: any) => {
        setQueryDepartment({ search: param });
    };
    /////
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    const { data: travelPaper, pagination, mutate,
    } = TravelPapers({ sortBy: "id.DESC", ...router.query });

    useEffect(() => {
        dispatch(setPageTitle(`${t('travel_paper')}`));
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProfile(JSON.parse(localStorage.getItem('profile') || ''))
            setIsAdmin(localStorage.getItem('admin') === '1' ? true : false)
        }

    }, [router]);

    useEffect(() => {
        if (typeof window !== 'undefined' && profile) {
            setDepartment(profile?.department?.id);
        }
    }, [profile])
    useEffect(() => {
        setShowLoader(false);
    }, [recordsData])

    useEffect(() => {
        if (travelPaper?.data.length <= 0 && pagination.page > 1) {
            router.push({
                query: {
                    page: pagination.page - 1,
                    perPage: pagination.perPage
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [travelPaper])


    const handleDelete = ({ id, name }: any) => {
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
                title: `${t('delete_letter')}`,
                text: `${t('delete')} ${t('travel_paper')}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteTravelPaper({ id }).then(() => {
                        mutate();
                        showMessage(`${t('delete_success')}`, 'success');
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    });
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

    const handleDetail = (value: any) => {
        router.push(`/hrm/travel-paper/${value.id}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
    };

    const handleReturnColor = (status: any) => {
        switch (status) {
            case "COMPLETED":
            case "APPROVED":
                return "success";
            case "REJECTED":
                return "danger"
            default:
                return "warning"
        }
    }

    const handleReturnText = (status: any) => {
        switch (status) {
            case "DRAFT":
                return "Nháp";
            case "PENDING":
                return "Chờ duyệt";
            case "IN_PROGRESS":
                return "Đang duyệt";
            case "APPROVED":
                return "Đã duyệt";
            case "REJECTED":
                return "Đã từ chối";
            default:
                return "Đã hoàn tất"
        }
    }

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
            accessor: 'registerday', title: `${t('registerday')}`, sortable: false, render: (records: any, index: any) => <span onClick={(records) => handleDetail(records)}>{`${dayjs(records?.startDay).format("DD/MM/YYYY")}`}</span>
        },
        { accessor: 'checker', title: `${t('checker')}`, sortable: false, render: (records: any, index: any) => <span>{records?.currentApprover?.fullName || records?.approvalHistory?.[0]?.approver?.fullName}</span> },
        {
            accessor: 'isCheck',
            title: `${t('status')}`,
            sortable: false,
            render: (records: any) => <span className={`uppercase badge bg-${LIST_STATUS_COLOR[records?.status]}`}>{t(`${LIST_STATUS_MEAN[records?.status]}`)}</span>
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: '10%',
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="flex justify-center gap-2">
                    {/* <RBACWrapper
                        permissionKey={[
                            'travelPaper:findOne',
                            'travelPaper:headApprove',
                            'travelPaper:headReject',
                        ]}
                        type={'OR'}
                    > */}
                    <div className="w-[auto]">
                        <Link href={`/hrm/travel-paper/${records.id}?status=${true}&page=${pagination?.page}&perPage=${pagination?.perPage}`}>
                            <button data-testId="detail-travel-paper-btn" type='button' className='button-detail'>
                                <IconNewEye /> <span>{t('detail')}</span>
                            </button>
                        </Link>
                    </div>
                    {/* <RBACWrapper
                        permissionKey={[
                            'travelPaper:exportTextDraft',
                        ]}
                        type={'OR'}
                    > */}
                    {
                        records?.status === 'APPROVED' && <div className="w-[auto]">
                            {
                                <button disabled={isDisabled} type="button" className="button-download1" onClick={() => handleExportFile(records?.id)}>
                                    {
                                        isLoadingExportFile[records?.id as keyof typeof isLoadingExportFile] === true ? <Loader size="xs" color='#000' className='rtl:ml-2' /> : <IconNewDownload className="ltr:mr-2 rtl:ml-2" />
                                    }
                                    <span>{t('export_file')}</span>
                                </button>
                            }
                        </div>
                    }
                    {/* </RBACWrapper> */}
                    {/* </RBACWrapper> */}
                    {
                        (records?.status === LIST_STATUS.DRAFT || (userData?.data?.id === records?.currentApproverId && records?.status !== LIST_STATUS.APPROVED && records?.status !== LIST_STATUS.REJECTED)) &&
                        // <RBACWrapper permissionKey={['travelPaper:update']} type={'AND'}>
                        <div className="w-[auto]">
                            <button data-testId="edit-travel-paper-btn" type="button" className='button-edit' onClick={() => handleDetail(records)}>
                                <IconNewEdit /><span>
                                    {t('edit')}
                                </span>
                            </button>
                        </div>
                        // </RBACWrapper>
                    }
                    {
                        (records.status === "DRAFT") &&
                        // <RBACWrapper permissionKey={['travelPaper:remove']} type={'AND'}>
                        <div className="w-[auto]">
                            <button type="button" className='button-delete' onClick={() => handleDelete(records)}>
                                <IconNewTrash />
                                <span>
                                    {t('delete')}
                                </span>
                            </button>
                        </div>
                        // </RBACWrapper>
                    }
                </div>
            ),
        },
    ]
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
                        departmentId: de.value
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
                        <span>{t('travel_paper')}</span>
                    </li>
                </ul>
            </div>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        {/* <RBACWrapper permissionKey={['travelPaper:create']} type={'AND'}> */}
                        <button data-testId="add-travel-paper" type="button" className="m-1 button-table button-create" onClick={(e) => router.push(`/hrm/travel-paper/create?page=${pagination?.page}&perPage=${pagination?.perPage}`)}>
                            <IconNewPlus />
                            <span className='uppercase'>{t('add')}</span>
                        </button>
                        {/* </RBACWrapper> */}
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
                                placeholder={t('choose_department')}
                                styles={customStyles}
                                options={dataDepartment}
                                onInputChange={(e) => handleSearchDepartment(e)}
                                onMenuOpen={() => setSizeDepartment(1)}
                                isLoading={loadDepartment}
                                onMenuScrollToBottom={() => handleOnScrollBottomDepartment()}
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
                                    locale: {
                                        ...chosenLocale,
                                    },
                                    // dateFormat: 'd/m/y',
                                    defaultDate: `${router?.query?.month}/${router?.query?.year}`,
                                    plugins: [
                                        monthSelectPlugin(monthSelectConfig) // Sử dụng plugin với cấu hình
                                    ]
                                }}
                                placeholder={`${t('choose_month')}`}
                                onChange={(selectedDates, dateStr, instance) => {
                                    handleChangeMonth(dateStr)
                                }}
                            />
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
                        records={travelPaper?.data}
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

export default TravelPaperPage;
