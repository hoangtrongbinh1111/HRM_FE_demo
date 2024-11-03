import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const PaymentRequestLists = (queries?: any) => swr(getEndpoint('/payment-request-list', queries));
export const PaymentRequestListDetails = (queries?: any) => swr(getEndpoint(`/payment-request-list/${queries.id}/get-details`, queries));
