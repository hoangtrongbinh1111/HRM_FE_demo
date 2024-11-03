import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const RequestShiftChanges = (queries?: any) => swr(getEndpoint('/request-shift-change', queries));
