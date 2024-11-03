import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetLeavingLateEarly = (body: any) => {
    const endpoint = `/leaving-late-early/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreateLeavingLateEarly = (body: any) => {
    const endpoint = '/leaving-late-early';
    return callApi(endpoint, 'POST', body);
};

export const EditLeavingLateEarly = (body: any) => {
    const endpoint = `/leaving-late-early/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteLeavingLateEarly = (body: any) => {
    const endpoint = `/leaving-late-early/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const LeavingLateEarlyForward = (body: any) => {
    const endpoint = `/leaving-late-early/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const LeavingLateEarlyApprove = (body: any) => {
    const endpoint = `/leaving-late-early/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const LeavingLateEarlyReject = (body: any) => {
    const endpoint = `/leaving-late-early/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

