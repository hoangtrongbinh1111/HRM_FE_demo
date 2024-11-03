import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const ShiftTimekeepings = (queries?: any) => swr(getEndpoint('/shift-timekeeping', queries));
