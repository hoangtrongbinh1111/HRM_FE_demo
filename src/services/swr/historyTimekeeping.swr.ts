import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const HistoryTimekeepings = (queries?: any) => swr(getEndpoint('/history-timekeeping', queries));
