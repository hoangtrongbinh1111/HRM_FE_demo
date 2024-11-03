import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const WarehousingBillReturn = (queries?: any) => swr(getEndpoint('/warehousing-bill-return', queries));
export const WarehousingBillDetail = (queries?: any) => swr(getEndpoint(`/warehousing-bill/${queries.id}/details`, queries));
