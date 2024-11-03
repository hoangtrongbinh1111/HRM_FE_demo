import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const RequestAdvancePayments = (queries?: any) => swr(getEndpoint('/request-advance-payment', queries));
export const RequestAdvancePaymentDetails = (queries?: any) => swr(getEndpoint(`/request-advance-payment/${queries.id}/get-details`, queries));
