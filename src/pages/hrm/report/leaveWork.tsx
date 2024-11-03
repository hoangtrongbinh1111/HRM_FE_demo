import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { PAGE_SIZES } from '@/utils/constants';
import { downloadFile, showMessage } from '@/@core/utils';
import { IconLoading } from '@/components/Icon/IconLoading';
import moment from 'moment';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import { Loader } from '@mantine/core';
import { LeaveWork, NewPerson } from '@/services/swr/report.swr';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';

interface Props {
    [key: string]: any;
}

const LeaveWorkPage = ({ ...props }: Props) => {

    const { t } = useTranslation();
    const router = useRouter();
    const [dayCurrent, setDayCurrent] = useState(moment().subtract(7, 'd').format('YYYY-MM-DD'));
    const [dayBefor, setDayBefor] = useState(moment().format('YYYY-MM-DD'));
    const { data: leaveWork, pagination, mutate, isLoading } = LeaveWork({ ...router.query, startDay: dayCurrent, endDay: dayBefor });
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'desc' });

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
            render: (records: any, index: any) => <span>{(pagination?.page - 1) * pagination?.perPage + index + 1}</span>,
        },
        {
            accessor: 'fullName',
            title: `${t('name_staff')}`,
            render: ({ createdBy }: any) => <span>{createdBy?.fullName}</span>,
        },
        {
            accessor: 'department',
            title: `${t('department')}`,
            render: ({ createdBy }: any) => <span>{createdBy?.department?.name}</span>,
        },
        {
            accessor: 'department',
            title: `${t('position')}`,
            render: ({ createdBy }: any) => <span>{createdBy?.position?.name}</span>,
        },
        {
            accessor: 'createdAt',
            title: `${t('end_time')}`,
            render: ({ resignationDay }: any) => <span>{moment(resignationDay).format("DD/MM/YYYY")}</span>,
        },
    ]
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoadingExportFile, setIsLoadingExportFile] = useState({});
    const handleExportFile = () => {
        setIsLoadingExportFile(true);
        setIsDisabled(true)
        downloadFile("leave-work.xlsx", `/report/leave-work/generate-xlsx?startDay=${dayCurrent}&endDay=${dayBefor}`).finally(() => {
            setIsLoadingExportFile(false);
            setIsDisabled(false)
        })
    }

    return (
        <div className="py-4">
            <div className='flex justify-between gap-5 mt-5 mb-5'>
                <div className='flex justify-between gap-5 min-w-[50%]'>
                    <Flatpickr
                        options={{
                            enableTime: false,
                            dateFormat: "d/m/Y",
                        }}
                        value={moment(dayCurrent).format("DD-MM-YYYY")}
                        className={"form-input calender-input"}
                        onChange={e => setDayCurrent(moment(e[0]).format("YYYY-MM-DD"))}
                    />
                    <Flatpickr
                        options={{
                            enableTime: false,
                            dateFormat: "d/m/Y",
                        }}
                        value={moment(dayBefor).format("DD-MM-YYYY")}
                        onChange={e => setDayBefor(moment(e[0]).format("YYYY-MM-DD"))}
                        className={"form-input calender-input"}
                    />
                </div>
                <button disabled={isDisabled} type="button" className="button-download1 h-[35px] mr-2" onClick={() => handleExportFile()}>
                    {
                        isLoadingExportFile === true ? <Loader size="xs" color='#000' className='rtl:ml-2' /> : <IconNewDownload className="ltr:mr-2 rtl:ml-2" />
                    }
                    <span>{t('export_file')}</span>
                </button>
            </div>
            <div className="datatables">
                <DataTable
                    highlightOnHover
                    className="whitespace-nowrap table-hover custom_table"
                    records={leaveWork?.data}
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
    );
};

export default LeaveWorkPage;
