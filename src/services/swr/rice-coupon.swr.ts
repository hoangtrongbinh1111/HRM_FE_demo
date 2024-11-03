import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const RiceCoupons = (queries?: any) => swr(getEndpoint('/rice-coupon', queries));
export const RiceCouponDetails = (queries?: any) => swr(getEndpoint(`/rice-coupon/${queries.id}/get-details`, queries));
