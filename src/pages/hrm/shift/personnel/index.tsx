import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../../store/themeConfigSlice';
import Link from 'next/link';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
// API
import { Positions } from '@/services/swr/position.swr';
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
// helper
import { downloadFile, downloadFile2, showMessage } from '@/@core/utils';
// icons
import { IconLoading } from '@/components/Icon/IconLoading';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import IconImportFile from '@/components/Icon/IconImportFile';
import { useRouter } from 'next/router';


// json
import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { deletePosition, exportPosition } from '@/services/apis/position.api';
import { GroupPositions } from '@/services/swr/group-position.swr';
import { HumanByShifts, Humans } from '@/services/swr/human.swr';
import { listHumanShift } from '@/services/apis/human.api';
interface Props {
    [key: string]: any;
}

const Personnel = ({ ...props }: Props) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const router = useRouter();

    const [showLoader, setShowLoader] = useState(true);
    const [page, setPage] = useState<any>(PAGE_NUMBER_DEFAULT);
    const [pageSize, setPageSize] = useState(PAGE_SIZES_DEFAULT);
    const [recordsData, setRecordsData] = useState<any>();
    const [total, setTotal] = useState(0);
    const [getStorge, setGetStorge] = useState<any>();
    const [data, setData] = useState<any>();
    const [search, setSearch] = useState<any>("");

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    const [openModal, setOpenModal] = useState(false);
    //get data
    const [isFirstLoad, setIsFirstLoad] = useState(true);
      // Hàm gọi API với các tham số
      const { data: humans, pagination, mutate, loading } = HumanByShifts({
        sortBy: 'id.ASC',
        ...(router.query.id && { shiftId: router.query.id }),
        ...router.query
    });
console.log('pagination', pagination)
    useEffect(() => {
        if (isFirstLoad) {
            // Nếu là lần đầu tiên, thiết lập page = 1
            router.replace({
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: 1, // Luôn đặt page = 1 lần đầu tiên
                },
            });
            // Đánh dấu là đã qua lần đầu tiên
            setIsFirstLoad(false);
        }
    }, [isFirstLoad, router]);
    const listHuman = () => {
        listHumanShift({
            page: page,
            perPage: pageSize,
            ...(props?.id && { shiftId: props?.id })
        })
            .then((res) => {
                setData(res)
            })
    }
    let user: any;
    if (typeof window !== 'undefined') {
        const userString = localStorage.getItem('profile');
        user = userString ? JSON.parse(userString) : null;
    }
    // useEffect(() => {
    //     listHuman();
    // }, [props?.id])

    useEffect(() => {
        setShowLoader(false);
    }, [recordsData])
    const handleExcel = () => {
        exportPosition()
            .then((res) => {
                downloadFile2(res?.data)
            })
            .catch((e) => {
                console.log(e)
            })
    }
    useEffect(() => {
        const searchQuery = router?.query?.search;
        if (typeof searchQuery === 'string') {
            setSearch(searchQuery);
        } else if (Array.isArray(searchQuery)) {
            setSearch(searchQuery[0] || '');
        } else {
            setSearch('');
        }

    }, [router?.query?.search]);
    const handleEdit = (data: any) => {
        router.push(`/hrm/duty/${data.id}`)
    };
    const handleDetail = (data: any) => {
        router.push(`/hrm/duty/detail/${data?.id}`)
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
                title: `${t('delete_duty')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data.name}?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    deletePosition(data?.id).then(() => {
                        showMessage(`${t('delete_duty_success')}`, 'success');
                        mutate();
                    }).catch((err) => {
                        showMessage(`${t('delete_duty_error')}`, 'error');
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
                page: 1,
                perPage: 10,
                search: param,
            },
        });
    };
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            handleSearch(search)
        }
    };
    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{(page - 1) * pageSize + index + 1}</span>,
        },
        { accessor: 'fullName', title: `${t('name_staff')}`, sortable: false },
        { accessor: 'code', title: `${t('code_staff')}`, sortable: false },
        { accessor: 'phoneNumber', title: `${t('phone_number')}`, sortable: false },
        {
            accessor: 'department', title: `${t('department')}`, sortable: false,
            render: ({ department }: any) => <span>{department?.name}</span>,
        },
        {
            accessor: 'position', title: `${t('duty')}`, sortable: false,
            render: ({ position }: any) => <span>{position?.name}</span>,
        },
        // {
        //     accessor: 'action',
        //     title: `${t('action')}`,
        //     titleClassName: 'text-center',
        //     render: (records: any) => (
        //         <div className="mx-auto flex items-center gap-2 justify-center">
        //             <div className="w-[auto]">
        //                 <button type="button" className='button-detail' onClick={() => handleDetail(records)}>
        //                     <IconNewEye /><span>
        //                         {t('detail')}
        //                     </span>
        //                 </button>
        //             </div>

        //                 <div className="w-[auto]">
        //                     <button type="button" className='button-edit' onClick={() => handleEdit(records)}>
        //                         <IconNewEdit /><span>
        //                             {t('edit')}
        //                         </span>
        //                     </button>
        //                 </div>
        //             <div className="w-[auto]">
        //                 <button type="button" className='button-delete' onClick={() => handleDelete(records)}>
        //                     <IconNewTrash />
        //                     <span>
        //                         {t('delete')}
        //                     </span>
        //                 </button>
        //             </div>

        //         </div>
        //     ),
        // },
    ]

    return (
        <div>
            {showLoader && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}

            <title>{t('department')}</title>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-end md:flex-row flex-col mb-4.5 gap-5">

                    <input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} value={search} onKeyDown={(e) => handleKeyPress(e)} onChange={(e) => e.target.value === "" ? handleSearch("") : setSearch(e.target.value)} />
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover custom_table button_hover"
                        records={humans?.data}
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

export default Personnel;
