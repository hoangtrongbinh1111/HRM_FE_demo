import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Repairs = (queries?: any) => swr(getEndpoint('/repair-request', queries));
export const RepairDetails = (queries?: any) => swr(getEndpoint(`/repair-request/${queries.id}/detail`, queries));
export const RepairHistory = (queries?: any) => swr(getEndpoint(`/vehicle/${queries.id}/history`, queries));
