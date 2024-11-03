import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Stocktakes = (queries?: any) => swr(getEndpoint('/stocktake', queries));
export const StocktakeDetail = (queries?: any) => swr(getEndpoint(`/stocktake/${queries.id}/get-details`, queries));