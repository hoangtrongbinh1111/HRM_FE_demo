import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const TrackingLogs = (queries?: any) => swr(getEndpoint('/tracking-log', queries));
export const TrackingLogDetails = (queries?: any) => swr(getEndpoint(`/tracking-log/${queries.id}/get-details`, queries));
