import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const FoodVouchers = (queries?: any) => swr(getEndpoint('/food-voucher', queries));
export const FoodVoucherDetails = (queries?: any) => swr(getEndpoint(`/food-voucher/${queries.id}/get-details`, queries));
