import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Calendars = (queries?: any) => swr(getEndpoint('/calendar', queries));
