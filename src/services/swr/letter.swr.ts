import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Letters = (queries?: any) => swr(getEndpoint('/letter', queries));
