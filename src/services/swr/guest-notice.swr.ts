import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const GuestNotices = (queries?: any) => swr(getEndpoint('/guest-notice', queries));
export const GuestNoticeDetails = (queries?: any) => swr(getEndpoint(`/guest-notice/${queries.id}/get-details`, queries));
