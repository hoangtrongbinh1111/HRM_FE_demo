import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const TimekeepingTypes = (queries?: any) => swr(getEndpoint('/timekeeping-type', queries));
