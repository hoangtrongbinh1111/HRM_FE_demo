import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const ConfirmPortals = (queries?: any) => swr(getEndpoint('/confirm-portal', queries));
export const ConfirmPortalDetails = (queries?: any) => swr(getEndpoint(`/confirm-portal/${queries.id}/get-details`, queries));
