import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import InventoryChart from './inventory';
import OrderStatusChart from './order-status';
import OrderTypeChart from './order-type';
import ProductCategoryChart from './product-categories';
import ProposalStatusChart from './proposal-status';
import ProposalTypeChart from './proposal-type';
import RepairStatusChart from './repair-status';
import WarehouseChart from './warehouses';
import WarehousingStatusChart from './warehousing-status';
import WarehousingTypeChart from './warehousing-type';

interface Props {
    [key: string]: any;
}

const StatisticPage = ({ ...props }: Props) => {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        dispatch(setPageTitle(`${t('Statistc')}`));
    });

    return (
        <div className="panel">
            <WarehouseChart />
            <InventoryChart />
            <ProductCategoryChart />
            <ProposalTypeChart />
            <ProposalStatusChart />
            <RepairStatusChart />
            <OrderStatusChart />
            {/* <OrderTypeChart /> */}
            {/* <WarehousingStatusChart /> */}
            {/* <WarehousingTypeChart /> */}
        </div>
    );
};

export default StatisticPage;