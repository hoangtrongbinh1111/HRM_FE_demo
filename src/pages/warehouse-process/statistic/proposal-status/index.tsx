import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { ProposalStatus } from '@/services/swr/statistic.swr';
import { IRootState } from '@/store';
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});

interface Props {
    [key: string]: any;
}

const ProposalStatusChart = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [showLoader, setShowLoader] = useState(true);
    const [dataProposalStatus, setDataProposalStatus] = useState<any>();

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // get data
    const { data: proposalStatus } = ProposalStatus({ ...router.query });

    useEffect(() => {
        var a: any = [];
        var b: any = [];

        proposalStatus?.data.map((item: any) => {
            return a.push(item.count[0]) && b.push(item.status)
        })

        setDataProposalStatus(
            {
                series: [{ data: a }],
                name: b
            }
        );

        setShowLoader(true);
    }, [proposalStatus?.data]);

    const options: any = {
        chart: {
            height: 360,
            type: 'bar',
            fontFamily: 'Mulish, sans-serif',
            toolbar: {
                show: false,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            width: 2,
            colors: ['transparent'],
        },
        dropShadow: {
            enabled: true,
            blur: 3,
            color: '#515365',
            opacity: 0.4,
        },
        plotOptions: {
            bar: {
                distributed: true,
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 8,
                borderRadiusApplication: 'end',
            },
        },
        legend: {
            show: false,
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '14px',
            itemMargin: {
                horizontal: 8,
                vertical: 8,
            },
        },
        grid: {
            borderColor: isDark ? '#191e3a' : '#e0e6ed',
            padding: {
                left: 20,
                right: 20,
            },
        },
        xaxis: {
            categories: dataProposalStatus?.name || [],
            axisBorder: {
                show: true,
                color: isDark ? '#3b3f5c' : '#e0e6ed',
            },
        },
        yaxis: {
            tickAmount: 6,
            opposite: isRtl ? true : false,
            labels: {
                offsetX: isRtl ? -10 : 0,
            },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: isDark ? 'dark' : 'light',
                type: 'vertical',
                shadeIntensity: 0.3,
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 0.8,
                stops: [0, 100],
            },
        },
        tooltip: {
            marker: {
                show: true,
            },
        },
    }
    return (
        <div className="panel h-full mb-8 lg:col-span-2">
            <div className="mb-5 flex items-start justify-between border-b border-white-light p-5  dark:border-[#1b2e4b] dark:text-white-light">
                <h5 className="text-lg font-semibold ">{t('proposal_status')}</h5>
            </div>
            {showLoader && <ReactApexChart options={options} series={dataProposalStatus?.series || []} type="bar" height={360} width={'100%'} />}

        </div>
    );
};

export default ProposalStatusChart;
