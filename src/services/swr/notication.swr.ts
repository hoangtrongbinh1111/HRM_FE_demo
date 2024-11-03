import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Notifications = (queries?: any) => swr(getEndpoint('/notification', queries));

export const UnReadNotifications = (queries?: any) => swr(getEndpoint('/notification/unread'));
