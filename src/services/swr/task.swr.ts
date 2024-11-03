import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Tasks = (queries?: any) => swr(getEndpoint('/task', queries));
