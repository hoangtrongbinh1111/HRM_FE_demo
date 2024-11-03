import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const CalendarDepartments = (queries?: any) => swr(getEndpoint('/task/dashboard', queries));
