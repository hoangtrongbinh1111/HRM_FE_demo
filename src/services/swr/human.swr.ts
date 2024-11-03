import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Humans = (queries?: any) => swr(getEndpoint('/human', queries));
export const HumanByShifts = (queries?: any) => swr(getEndpoint('/human/by-shift', queries));
export const HumanDropdown = (queries?: any) => swr(getEndpoint('/dropdown/user', queries));
export const HumansByOneDepartment = (queries?: any) => swr(getEndpoint('/dropdown/users-in-department', queries));
export const HumansByDepartment = (queries?: any) => swr(getEndpoint('/human/by-department', queries));
