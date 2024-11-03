import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { ProductInventory } from '@/services/swr/statistic.swr';
import { IRootState } from '@/store';
import dynamic from 'next/dynamic';
import { DropdownWarehouses } from '@/services/swr/dropdown.swr';
import Select, { components } from 'react-select';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});

interface Props {
    [key: string]: any;
}

const InventoryChart = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    const [showLoader, setShowLoader] = useState(true);
    const [dataProductInventory, setDataProductInventory] = useState<any>();
    const [dataWarehouseDropdown, setDataWarehouseDropdown] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState<any>();

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // get data
    const { data: inventory } = ProductInventory({ ...query });
    const { data: dropdownWarehouse, pagination: paginationWarehousetype, isLoading } = DropdownWarehouses({ page: page });

    useEffect(() => {
        var a: any = [];
        var b: any = [];
        inventory?.data.map((item: any) => {
            a.push(item.quantity[0]) && b.push(item.name)
        })

        setDataProductInventory(
            {
                series: [{ data: a }],
                name: b
            }
        );
        setShowLoader(true);
    }, [inventory?.data]);

    useEffect(() => {
        if (paginationWarehousetype?.page === undefined) return;
        if (paginationWarehousetype?.page === 1) {
            setDataWarehouseDropdown(dropdownWarehouse?.data)
        } else {
            setDataWarehouseDropdown([...dataWarehouseDropdown, ...dropdownWarehouse?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationWarehousetype])

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(paginationWarehousetype?.page + 1);
        }, 1000);
    }

    const handleSearch = (param: any) => {
        setQuery({ warehouseId: param?.value })
        // router.replace(
        //     {
        //         pathname: router.pathname,
        //         query: {
        //             ...router.query,
        //             warehouseId: param?.value || ""
        //         },
        //     }
        // );
    }

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
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 8,
                borderRadiusApplication: 'end',
                distributed: true
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
            categories: dataProductInventory?.name || [],
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
                <h5 className="text-lg font-semibold ">{t('inventory')}</h5>
                <Select
                    options={dataWarehouseDropdown}
                    onMenuOpen={() => setPage(1)}
                    onMenuScrollToBottom={handleMenuScrollToBottom}
                    maxMenuHeight={160}
                    isClearable
                    isLoading={isLoading}
                    className="z-50 w-3/12"
                    onChange={e => handleSearch(e)}
                />
            </div>
            {showLoader && <ReactApexChart options={options} series={dataProductInventory?.series || []} type="bar" height={360} width={'100%'} />}

        </div>
    );
};

export default InventoryChart;
