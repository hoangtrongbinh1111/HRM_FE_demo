import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const CalendarLeaderShips = (queries?: any) => swr(getEndpoint('/calendar-leadership', queries));
