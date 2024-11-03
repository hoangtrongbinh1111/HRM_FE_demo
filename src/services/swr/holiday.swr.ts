import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Holidays = (queries?: any) => swr(getEndpoint('/holiday', queries));
