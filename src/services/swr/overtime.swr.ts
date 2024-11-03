import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Overtimes = (queries?: any) => swr(getEndpoint('/over-time', queries));
