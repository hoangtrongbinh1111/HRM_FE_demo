import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
// API
import { DeleteTrackingLog } from '@/services/apis/tracking-log.api';
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT, LIST_STATUS, LIST_STATUS_COLOR, LIST_STATUS_MEAN } from '@/utils/constants';
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
import { TrackingLogs } from '@/services/swr/tracking-log.swr';
import dayjs from 'dayjs';
import { listAllDepartmentTree } from '@/services/apis/department.api';
import { flattenDepartments } from '@/utils/commons';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { IRootState } from '@/store';
import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
import { Lao } from "@/utils/lao"
import { useSelector } from 'react-redux';
import "flatpickr/dist/plugins/monthSelect/style.css"
import monthSelectPlugin, { Config } from "flatpickr/dist/plugins/monthSelect"
import Select from "react-select";
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
const TrackingLogPage = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === "vi" ? Vietnamese : (themeConfig.locale === "la" ? Lao : null);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const isFirstRender = useRef(true);
    const [search, setSearch] = useState<any>("");
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });
    const [groupedOptions, setGroupedOptions] = useState<any>([
        {
            label: `${t('work_department')}`,
            options: []
        }
    ]
    );
    // get data
    const { data: trackingLog, pagination, mutate, isLoading } = TrackingLogs({ sortBy: 'id.DESC', ...router.query });
    const [isLoadingExportFile, setIsLoadingExportFile] = useState({});
    const [isDisabled, setIsDisabled] = useState(false);
    const handleExportFile = (id: any) => {
        setIsLoadingExportFile((prev) => ({ ...prev, [id]: true }));
        setIsDisabled(true)
        downloadFile("tracking_log.pdf", `/tracking-log/${id}/export-text-draft`).finally(() => {
            setIsLoadingExportFile((prev) => ({ ...prev, [id]: false }));
            setIsDisabled(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        dispatch(setPageTitle(`${t('tracking_log')}`));
    });
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
        if (trackingLog?.data.length <= 0 && pagination.page > 1) {
            router.push({
                query: {
                    page: pagination.page - 1,
                    perPage: pagination.perPage,
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackingLog]);

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
                icon: 'question',
                title: `${t('delete_tracking_log')}`,
                text: `${t('delete')} ${name}`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteTrackingLog({ id })
                        .then(() => {
                            mutate();
                            showMessage(`${t('delete_success')}`, 'success');
                        })
                        .catch((err) => {
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

    const handleDetail = (value: any) => {
        router.push(`/hrm/tracking-log/${value.id}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
    };

    const handleReturnColor = (status: any) => {
        switch (status) {
            case 'COMPLETED':
            case 'APPROVED':
                return 'success';
            case 'REJECTED':
                return 'danger';
            default:
                return 'warning';
        }
    };

    const handleReturnText = (status: any) => {
        switch (status) {
            case 'DRAFT':
                return 'Nháp';
            case 'PENDING':
                return 'Chờ duyệt';
            case 'IN_PROGRESS':
                return 'Đang duyệt';
            case 'APPROVED':
                return 'Đã duyệt';
            case 'REJECTED':
                return 'Đã từ chối';
            default:
                return 'Đã hoàn tất';
        }
    };

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(pagination?.page - 1) * pagination?.perPage + index + 1}</span>,
        },
        { accessor: 'time', title: `${t('time')}`, render: (records: any, index: any) => <span>{dayjs(dayjs(records?.time), 'YYYY-MM-DD').format('MM-YYYY')}</span>, sortable: false },
        // { accessor: 'type', title: 'Loại yêu cầu', sortable: false },
        {
            accessor: 'createdBy',
            title: `${t('person_duty')}`,
            render: (records: any, index: any) => <span>{records?.createdBy?.fullName}</span>, sortable: false
        },
        {
            accessor: 'status',
            title: `${t('status')}`,
            render: ({ status }: any) => {
                return (
                    <span className={`badge uppercase bg-${handleReturnColor(status)}`} key={status}>
                        {handleReturnText(status)}
                    </span>
                );
            },
            sortable: false,
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
                            'proposal:findOne',
                            'proposal:headApprove',
                            'proposal:headReject',
                        ]}
                        type={'OR'}
                    > */}
                    <div className="w-[auto]">
                        <Link href={`/hrm/tracking-log/${records.id}?status=${true}&page=${pagination?.page}&perPage=${pagination?.perPage}`}>
                            <button data-testId="detail-tracking-log-btn" type="button" className="button-detail">
                                <IconNewEye /> <span>{t('detail')}</span>
                            </button>
                        </Link>
                    </div>
                    <RBACWrapper
                        permissionKey={[
                            'trackingLog:exportTextDraft',
                        ]}
                        type={'OR'}
                    >
                        {
                            <div className="w-[auto]">
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
                    </RBACWrapper>
                    {/* </RBACWrapper> */}
                    {records.status === 'DRAFT' && (
                        // <RBACWrapper permissionKey={['trackingLog:update']} type={'AND'}>
                            <div className="w-[auto]">
                                <button data-testId="edit-tracking-log-btn" type="button" className="button-edit" onClick={() => handleDetail(records)}>
                                    <IconNewEdit />
                                    <span>{t('edit')}</span>
                                </button>
                            </div>
                        // </RBACWrapper>
                    )}
                    {(records.status === 'DRAFT' || records?.approvalHistory?.length <= 1) && (
                        <RBACWrapper permissionKey={['trackingLog:remove']} type={'AND'}>
                            <div className="w-[auto]">
                                <button type="button" className="button-delete" onClick={() => handleDelete(records)}>
                                    <IconNewTrash />
                                    <span>{t('delete')}</span>
                                </button>
                            </div>
                        </RBACWrapper>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            {isLoading && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )}
            <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <ul className="mb-1 flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/hrm/dashboard" className="text-primary hover:underline">
                            {t('dashboard')}
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>{t('tracking_log')}</span>
                    </li>
                </ul>
            </div>
            <div className="panel mt-6">
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center">
                        {/* <RBACWrapper permissionKey={['trackingLog:create']} type={'AND'}> */}
                            <button data-testId="add-tracking-log" type="button" className="button-table button-create m-1" onClick={(e) => router.push(`/hrm/tracking-log/create?page=${pagination?.page}&perPage=${pagination?.perPage}`)}>
                                <IconNewPlus />
                                <span className="uppercase">{t('add')}</span>
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
                        className="table-hover custom_table whitespace-nowrap"
                        records={trackingLog?.data}
                        columns={columns}
                        totalRecords={pagination?.totalRecords}
                        recordsPerPage={pagination?.perPage}
                        page={pagination?.page}
                        onPageChange={(p) => handleChangePage(p, pagination?.perPage)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={(e) => handleChangePage(pagination?.page, e)}
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

export default TrackingLogPage;
