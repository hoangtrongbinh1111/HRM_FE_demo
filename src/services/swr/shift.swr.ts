import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Shifts = (queries?: any) => swr(getEndpoint('/shift', queries));
