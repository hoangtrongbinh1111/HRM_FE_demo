import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllTimekeeper = async (data: any) => {
    const endpoint = '/timekeeper';
    return callApi(endpoint, 'GET', data);
};
export const listAllTimekeeperHuman = async (data: any) => {
    const endpoint = '/timekeeper/human';
    return callApi(endpoint, 'GET', data);
};
export const detailTimekeeper = async (id: any) => {
    const endpoint = `/timekeeper/${id}`;
    return callApi(endpoint, 'GET');
};
export const createTimekeeper = async (data: any) => {
    const endpoint = `/timekeeper`;
    return callApi(endpoint, 'POST', data);
};
export const updateTimekeeper = async (id: any, data: any) => {
    const endpoint = `/timekeeper/${id}`;
    return callApi(endpoint, 'PATCH', data, null, false, { timeout: 10 * 60 * 1000 });
};
export const deleteTimekeeper = async (data: any) => {
    const endpoint = `/timekeeper/${data}`;
    return callApi(endpoint, 'DELETE');
};

