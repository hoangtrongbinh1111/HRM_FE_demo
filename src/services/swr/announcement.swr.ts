import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Announcements = (queries?: any) => swr(getEndpoint('/announcement', queries));
