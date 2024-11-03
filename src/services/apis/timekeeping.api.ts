import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetAllTimekeeping = (data: any) => {
    const objToQueryString = new URLSearchParams(data)
    const endpoint = `/time-keeping?${objToQueryString}`;
    return callApi(endpoint, 'GET', data);
};
export const GetTimekeeping = (body: any) => {
    const endpoint = `/time-keeping/${body.id}`;
    return callApi(endpoint, 'GET', body);
};
export const GetCalculation = async (data: any) => {
    const endpoint = `/time-keeping/work-calculation-v2?id=${data.id}&time=${data.time}`;
    return callApi(endpoint, 'GET', data);
};
export const GetTimekeepingDetails = (body: any) => {
    const endpoint = `/time-keeping/${body.id}/get-details`;
    return callApi(endpoint, 'GET', body);
};

export const LockTimekeeping = (body: any) => {
    const endpoint = `/time-keeping/lock`;
    return callApi(endpoint, 'PATCH', body);
};

export const TestTimekeeping = () => {
    const endpoint = `/time-keeping/test`;
    return callApi(endpoint, 'GET');
};

export const UpdateTimekeepingByMonth = (month: any, year: any) => {
    const endpoint = `/time-keeping/work-calculation?month=${month}&year=${year}`;
    return callApi(endpoint, 'GET');
};
