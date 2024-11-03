import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Timekeepings = (queries?: any) => swr(getEndpoint('/time-keeping', queries));
export const TimekeepingDetails = (queries?: any) => swr(getEndpoint(`/time-keeping/${queries.id}/get-details`, queries));
