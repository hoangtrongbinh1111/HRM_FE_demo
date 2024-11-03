import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const DrivingOrders = (queries?: any) => swr(getEndpoint('/driving-order', queries));
export const DrivingOrderDetails = (queries?: any) => swr(getEndpoint(`/driving-order/${queries.id}/get-details`, queries));
