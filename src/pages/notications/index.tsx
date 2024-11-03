import { useEffect, Fragment, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { PAGE_SIZES } from '@/utils/constants';
import { IconLoading } from '@/components/Icon/IconLoading';
import { Notifications } from '@/services/swr/notication.swr';
import { IRootState } from '@/store';
import { MarkAllRead } from '@/services/apis/notication.api';
import { showMessage } from '@/@core/utils';

interface Props {
    [key: string]: any;
}

const StocktakePage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    const [showLoader, setShowLoader] = useState(true);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

    // get data
    const { data: notifications, mutate, pagination } = Notifications({ ...router.query, lang: themeConfig.locale });

    useEffect(() => {
        dispatch(setPageTitle(`${t('Notications')}`));
    });

    useEffect(() => {
        setShowLoader(false);
    }, [notifications]);

    const handleSearch = (param: any) => {
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    search: param
                },
            }
        );
    }

    const handleRow = (e: any) => {
        router.push(e.link)
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

    const handleReadAll = () => {
        MarkAllRead()
            .then((res: any) => {
                showMessage(`${t('read_success')}`, 'success');
                mutate
            })
            .catch((err: any) => {
                console.error('ERR ~ ', err);
                throw err;
            });
    }

    const columns = [
        {
            accessor: 'id',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        {
            accessor: 'sender',
            title: 'Người gửi',
            render: (records: any) => records?.sender?.fullName
        },
        {
            accessor: 'sender',
            title: 'Nội dung',
            render: (records: any) => records?.details[0]?.content
        }
    ]

    return (
        <div>
            {showLoader && (
                <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                    <IconLoading />
                </div>
            )}
            <title>Inventory</title>
            <div className="panel mt-6">
                <div className="flex md:items-center justify-between md:flex-row flex-col mb-4.5 gap-5">
                    <div className="flex items-center flex-wrap">
                        <button className="btn btn-primary btn-small block w-full" onClick={e => handleReadAll()}>Read All Notifications</button>
                    </div>
                    <input autoComplete="off" type="text" className="form-input w-auto" placeholder={`${t('search')}`} onChange={(e) => handleSearch(e.target.value)} />
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover"
                        records={notifications?.data}
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
                        onRowClick={e => handleRow(e)}
                        paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default StocktakePage;
