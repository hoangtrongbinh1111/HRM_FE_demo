import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const ForgotCheckinOuts = (queries?: any) => swr(getEndpoint('/forgot-checkin-out', queries));
