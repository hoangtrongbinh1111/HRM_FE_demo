import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const PaymentOrders = (queries?: any) => swr(getEndpoint('/payment-order', queries));
