import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const AccessControl = (queries?: any) => swr(getEndpoint('/access-control', queries));
