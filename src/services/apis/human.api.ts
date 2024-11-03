import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const listAllHuman = async (data: any) => {
    const endpoint = '/human';
    return callApi(endpoint, 'GET', data);
};
export const listHumanNonDepartment = async (data: any) => {
    const endpoint = '/human/user-non-department';
    return callApi(endpoint, 'GET', data);
};
export const listHumanShift = async (data: any) => {
    const endpoint = `/human/by-shift?page=${data?.page}&perPage=${data?.perPage}&shiftId=${data?.shiftId}`;
    return callApi(endpoint, 'GET', data);
};
export const listHumanDroppdown = async (data: any) => {
    const endpoint = '/dropdown/user';
    return callApi(endpoint, 'GET', data);
};
export const listAllHumanByDepartment = async (data: any) => {
    const objToQueryString = new URLSearchParams(data)
    const endpoint = `/human/by-department?${objToQueryString}`;
    return callApi(endpoint, 'GET', data);
};
export const listManager = async (data: any) => {
    const endpoint = `/human/by-is-manager?page=${data?.page}&perPage=${data?.perPage}&isManager=${data?.isManager}`;
    return callApi(endpoint, 'GET', data);
};
export const detailHuman = async (data: any) => {
    const endpoint = `/human/${data}`;
    return callApi(endpoint, 'GET');
};
export const exportHuman = async () => {
    const endpoint = `/human/export`;
    return callApi(endpoint, 'GET', null, null, true);
};
export const createHuman = async (data: any) => {
    const endpoint = `/human`;
    return callApi(endpoint, 'POST', data, {
        'Content-Type': 'multipart/form-data',
    });
};
export const updateHuman = async (id: any, data: any) => {
    const endpoint = `/human/${id}`;
    return callApi(endpoint, 'PATCH', data);
};

export const deleteHuman = async (data: any) => {
    const endpoint = `/human/${data}`;
    return callApi(endpoint, 'DELETE', data);
};

export const getQuantityByNation = async () => {
    const endpoint = `/human/quantity-by-nation`;
    return callApi(endpoint, 'GET');
};

export const getQuantityByDepartment = async () => {
    const endpoint = `/human/quantity-by-department`;
    return callApi(endpoint, 'GET');
};
