import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const listAllShift = async (data: any) => {
    const endpoint = '/shift';
    return callApi(endpoint, 'GET', data);
};
export const detailShift = async (id: any) => {
    const endpoint = `/shift/${id}`;
    return callApi(endpoint, 'GET');
};
export const createShift = async (data: any) => {
    const endpoint = `/shift`;
    return callApi(endpoint, 'POST', data);
};
export const updateShift = async (id: any, data: any) => {
    const endpoint = `/shift/${id}`;
    return callApi(endpoint, 'PATCH', data);
};

export const deleteShift = async (data: any) => {
    const endpoint = `/shift/${data}`;
    return callApi(endpoint, 'DELETE');
};

export const getShiftByUser = async (data: any) => {
    const endpoint = `/shift/by-user`;
    return callApi(endpoint, 'GET', data);
}
