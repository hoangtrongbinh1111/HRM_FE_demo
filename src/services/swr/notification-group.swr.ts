import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const NotificationGroup = (queries?: any) => swr(getEndpoint('/notification-group', queries));
