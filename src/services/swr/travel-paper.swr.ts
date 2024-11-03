import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const TravelPapers = (queries?: any) => swr(getEndpoint('/travel-paper', queries));
export const TravelPaperDetails = (queries?: any) => swr(getEndpoint(`/travel-paper/${queries.id}/get-details`, queries));
