import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Proposals = (queries?: any) => swr(getEndpoint('/proposal', queries));
export const ProposalDetails = (queries?: any) => swr(getEndpoint(`/proposal/${queries.id}/get-details`, queries));
