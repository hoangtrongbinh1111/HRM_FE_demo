import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Roles = (queries?: any) => swr(getEndpoint('/role', queries));
export const Permissions = (queries?: any) => swr(getEndpoint('/permission', queries));