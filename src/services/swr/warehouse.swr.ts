import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const  Warehouses = (queries?: any) => swr(getEndpoint('/warehouse', queries));
export const  WarehouseTpyes = (queries?: any) => swr(getEndpoint('/warehouse-type', queries));