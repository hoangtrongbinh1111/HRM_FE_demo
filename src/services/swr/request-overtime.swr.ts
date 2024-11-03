import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const RequestOvertimes = (queries?: any) => swr(getEndpoint('/request-overtime', queries));
export const RequestOvertimeDetails = (queries?: any) => swr(getEndpoint(`/request-overtime/${queries.id}/get-details`, queries));
