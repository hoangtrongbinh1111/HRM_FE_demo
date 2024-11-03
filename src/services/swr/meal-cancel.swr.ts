import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const MealCancels = (queries?: any) => swr(getEndpoint('/meal-cancel', queries));
export const MealCancelDetails = (queries?: any) => swr(getEndpoint(`/meal-cancel/${queries.id}/get-details`, queries));

