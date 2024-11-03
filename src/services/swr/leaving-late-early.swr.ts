import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const LeavingLateEarlys = (queries?: any) => swr(getEndpoint('/leaving-late-early', queries));
