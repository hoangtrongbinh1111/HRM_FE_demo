import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Groups = (queries?: any) => swr(getEndpoint('/group', queries));
export const GroupDropdowns = (queries?: any) => swr(getEndpoint('/dropdown/group', queries));
export const GroupDetails = (queries?: any) => swr(getEndpoint(`/group/${queries.id}/get-details`, queries));

