import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const ProductCategories = (queries?: any) => swr(getEndpoint('/statistic/product-categories', queries));
export const WarehouseStatistic = (queries?: any) => swr(getEndpoint('/statistic/warehouses', queries));
export const OrderTypes = (queries?: any) => swr(getEndpoint('/statistic/orders/type', queries));
export const OrderStatus = (queries?: any) => swr(getEndpoint('/statistic/orders/status', queries));
export const RepairStatus = (queries?: any) => swr(getEndpoint('/statistic/repair-requests/status', queries));
export const ProposalType = (queries?: any) => swr(getEndpoint('/statistic/proposals/type', queries));
export const ProposalStatus = (queries?: any) => swr(getEndpoint('/statistic/proposals/status', queries));
export const WarehousingType = (queries?: any) => swr(getEndpoint('/statistic/warehousing-bills/type', queries));
export const WarehousingStatus = (queries?: any) => swr(getEndpoint('/statistic/warehousing-bills/status', queries));
export const ProductInventory = (queries?: any) => swr(getEndpoint('/statistic/products/inventory', queries));
export const InventoryExpired = (queries?: any) => swr(getEndpoint('/statistic/products/inventory/expired', queries));
