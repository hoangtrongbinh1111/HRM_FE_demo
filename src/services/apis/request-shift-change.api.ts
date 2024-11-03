import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetRequestShiftChange = (body: any) => {
    const endpoint = `/request-shift-change/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreateRequestShiftChange = (body: any) => {
    const endpoint = '/request-shift-change';
    return callApi(endpoint, 'POST', body);
};

export const EditRequestShiftChange = (body: any) => {
    const endpoint = `/request-shift-change/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteRequestShiftChange = (body: any) => {
    const endpoint = `/request-shift-change/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const RequestShiftChangeForward = (body: any) => {
    const endpoint = `/request-shift-change/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestShiftChangeApprove = (body: any) => {
    const endpoint = `/request-shift-change/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestShiftChangeReject = (body: any) => {
    const endpoint = `/request-shift-change/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

