import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Timekeeper = (queries?: any) => swr(getEndpoint('/Timekeeper', queries));
