import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Positions = (queries?: any) => swr(getEndpoint('/position', queries));
