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
import { Proposals } from '@/services/swr/proposal.swr';
import { DeleteProposal, ProposalApprove, ProposalReject, ProposalReturn } from '@/services/apis/proposal.api';
// constants
import { PAGE_SIZES } from '@/utils/constants';
// helper
import { downloadFile, showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
import Link from 'next/link';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { DropdownWarehouses } from '@/services/swr/dropdown.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { Loader } from '@mantine/core';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import moment from 'moment';
import { removeVietnameseTones } from '@/utils/commons';

interface Props {
    [key: string]: any;
}

const ProposalPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const [active, setActive] = useState<any>([]);
    const [department, setDepartment] = useState<any>();
    const [profile, setProfile] = useState<any>();
    const [isAdmin, setIsAdmin] = useState<any>();
    const isFirstRender = useRef(true);
    const [showLoader, setShowLoader] = useState(true);
    const [isLoadingExportFile, setIsLoadingExportFile] = useState({});
    const [isDisabled, setIsDisabled] = useState(false);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    // get data
    // const { data: proposal, pagination, mutate, isLoading } = Proposals({ sortBy: "id.DESC", ...router.query, departmentId: isAdmin === false ? department : '' });
    const { data: proposal, pagination, mutate, isLoading } = Proposals({ sortBy: "id.DESC", ...router.query });
    const { data: warehouses, pagination: warehousePagination, isLoading: warehouseLoading } = DropdownWarehouses({});

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        dispatch(setPageTitle(`${t('proposal')}`));
    });

    useEffect(() => {
        setShowLoader(false);
    }, [proposal])

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
        if (proposal?.data.length <= 0 && pagination.page > 1) {
            router.push({
                query: {
                    page: pagination.page - 1,
                    perPage: pagination.perPage
                }
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proposal])

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
                title: `${t('delete_proposal')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${name} ?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    DeleteProposal({ id }).then(() => {
                        mutate();
                        showMessage(`${t('delete_success')}`, 'success');
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    });
                }
            });
    };

    const handleSearch = (param: any) => {
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    search: param.target.value,
                },
            }
        );
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
        router.push(`/warehouse-process/proposal/${value.id}`)
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
                return t("draft");
            case "PENDING":
                return t("pending");
            case "IN_PROGRESS":
                return t("in_progress");
            case "APPROVED":
                return t("approved");
            case "REJECTED":
                return t("rejected");
            default:
                return t("complete");
        }
    }


    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(pagination?.page - 1) * pagination?.perPage + index + 1}</span>,
        },
        { accessor: 'name', title: `${t('name_proposal')}`, sortable: false },
        // { accessor: 'type', title: 'Loại yêu cầu', sortable: false },
        { accessor: 'content', title: `${t('content')}`, sortable: false },
        {
            accessor: 'warehouse',
            title: `${t('warehouse_name')}`,
            render: ({ warehouse }: any) => <span>{warehouse?.name}</span>,
        },
        {
            accessor: 'status',
            title: `${t('status')}`,
            render: ({ status }: any) => {
                return (
                    <span className={`badge uppercase bg-${handleReturnColor(status)}`} key={status}>
                        {
                            handleReturnText(status)
                        }
                    </span>
                )
            },
            sortable: false
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            width: '10%',
            titleClassName: 'text-center',
            render: (records: any) => (
                <div className="flex justify-center gap-2 mr-2">
                    {/* <RBACWrapper
                        permissionKey={[
                            'proposal:findOne',
                            'proposal:headApprove',
                            'proposal:headReject',
                        ]}
                        type={'OR'}
                    > */}
                    <div className="w-[auto]">
                        <Link href={`/warehouse-process/proposal/${records.id}?status=${true}`}>
                            <button data-testId="detail-proposal-btn" type='button' className='button-detail'>
                                <IconNewEye /> <span>{t('detail')}</span>
                            </button>
                        </Link>
                    </div>
                    {/* </RBACWrapper> */}
                    {
                        (records?.status === 'APPROVED' || records?.status === "COMPLETED" || records?.status === 'APPROVED_RETURN' || records?.status === "COMPLETED_RETURN") &&
                        <div className="w-[auto]">
                            {
                                <button disabled={isDisabled} type="button" className="button-download1" onClick={() => handleExportFile(records)}>
                                    {
                                        isLoadingExportFile[records?.id as keyof typeof isLoadingExportFile] === true ? <Loader size="xs" color='#000' className='rtl:ml-2' /> : <IconNewDownload className="ltr:mr-2 rtl:ml-2" />
                                    }
                                    <span>{t('export_file')}</span>
                                </button>
                            }
                        </div>
                    }
                    {
                        records.status === "DRAFT" &&
                        <RBACWrapper permissionKey={['proposal:update']} type={'AND'}>
                            <div className="w-[auto]">
                                <button data-testId="edit-proposal-btn" type="button" className='button-edit' onClick={() => handleDetail(records)}>
                                    <IconNewEdit /><span>
                                        {t('edit')}
                                    </span>
                                </button>
                            </div>
                        </RBACWrapper>
                    }
                    {
                        // (records.status !== "APPROVED" && records.status !== "COMPLETED" && records.status !== "FINISHED") &&
                        records.status === "DRAFT" &&
                        <RBACWrapper permissionKey={['proposal:remove']} type={'AND'}>
                            <div className="w-[auto]">
                                <button type="button" className='button-delete' onClick={() => handleDelete(records)}>
                                    <IconNewTrash />
                                    <span>
                                        {t('delete')}
                                    </span>
                                </button>
                            </div>
                        </RBACWrapper>
                    }
                </div>
            ),
        },
    ]


    const handleActive = (item: any) => {
        if (Number(localStorage.getItem('defaultFilterProposal')) === item.value) {
            setActive([0]);
            localStorage.setItem('defaultFilterProposal', "");
            router.push({
                query: { warehouseId: '' }
            })
        } else {
            router.push({
                query: { warehouseId: item.value }
            })
            setActive([item.value]);
            localStorage.setItem('defaultFilterProposal', item.value);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && isFirstRender.current) {
            setActive([Number(localStorage.getItem('defaultFilterProposal'))]);
            router.push({
                query: { warehouseId: localStorage.getItem('defaultFilterProposal') }
            })
        }
        isFirstRender.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    const handleExportFile = (param: any) => {
        setIsLoadingExportFile((prev) => ({ ...prev, [param.id]: true }));
        setIsDisabled(true)
        downloadFile(
            `${removeVietnameseTones(param.name) + '_' + removeVietnameseTones(param.department.name) + '_' + moment().format("DD-MM-YYYY")}.pdf`,
            `/proposal/${param.id}/generate-pdf`
        ).finally(() => {
            setIsLoadingExportFile((prev) => ({ ...prev, [param.id]: false }));
            setIsDisabled(false)
        })
    };

    return (
        <div>
            {/* {isLoading && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )} */}
            <title>product</title>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                        <li>
                            <Link href="/hrm/dashboard" className="text-primary hover:underline">
                                {t('dashboard')}
                            </Link>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <span>{t('proposal')}</span>

                        </li>
                    </ul>
                </div>
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        <RBACWrapper permissionKey={['proposal:create']} type={'AND'}>
                            <button data-testId="add-proposal" type="button" className="m-1 button-table button-create" onClick={(e) => router.push(`/warehouse-process/proposal/create`)}>
                                <IconNewPlus />
                                <span className='uppercase'>{t('add')}</span>
                            </button>
                        </RBACWrapper>
                    </div>

                    <input
                        data-testId="search-proposal-input"
                        autoComplete="off"
                        type="text"
                        className="form-input w-auto"
                        placeholder={`${t('search')}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e)
                            }
                        }}
                    />
                </div>
                {
                    isAdmin === true &&
                    <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                        <div className='flex items-center flex-wrap gap-2'>
                            {
                                warehouses?.data.map((item: any, index: any) => {
                                    return (
                                        <div key={index} className={active.includes(item.value) ? 'border p-2 rounded bg-[#E9EBD5] text-[#476704] cursor-pointer' : 'border p-2 rounded cursor-pointer'} onClick={() => handleActive(item)}>{item.label}</div>
                                    );
                                })
                            }
                        </div>
                    </div>
                }
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table"
                        records={proposal?.data}
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
        </div>
    );
};

export default ProposalPage;
