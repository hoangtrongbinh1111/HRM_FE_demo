import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const NewPerson = (queries?: any) => swr(getEndpoint('/report/new-person', queries));
export const OnLeave = (queries?: any) => swr(getEndpoint('/report/on-leave', queries));
export const LeaveWork = (queries?: any) => swr(getEndpoint('/report/leave-work', queries));
