import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Orders = (queries?: any) => swr(getEndpoint('/order', queries));
export const OrderDetails = (queries?: any) => swr(getEndpoint(`/order/${queries.id}/get-items`, queries));