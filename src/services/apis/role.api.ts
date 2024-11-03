import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetRole = (body: any) => {
    const endpoint = `/role/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreateRole = (body: any) => {
    const endpoint = '/role';
    return callApi(endpoint, 'POST', body);
};

export const EditRole = (body: any) => {
    const endpoint = `/role/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteRole = (body: any) => {
    const endpoint = `/role/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const CreatePermission = (body: any) => {
    const endpoint = '/permission';
    return callApi(endpoint, 'POST', body);
};

export const EditPermission = (body: any) => {
    const endpoint = `/permission/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeletePermission = (body: any) => {
    const endpoint = `/permission/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};
