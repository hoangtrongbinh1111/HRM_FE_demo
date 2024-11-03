import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const useProfile = (queries?: any) => swr(getEndpoint('/profile', queries));
