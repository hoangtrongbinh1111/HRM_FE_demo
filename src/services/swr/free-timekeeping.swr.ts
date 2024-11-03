import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const FreeTimekeepings = (queries?: any) => swr(getEndpoint('/free-timekeeping', queries));
