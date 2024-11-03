import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetForgotCheckinout = (body: any) => {
    const endpoint = `/forgot-checkin-out/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreateForgotCheckinout = (body: any) => {
    const endpoint = '/forgot-checkin-out';
    return callApi(endpoint, 'POST', body);
};

export const EditForgotCheckinout = (body: any) => {
    const endpoint = `/forgot-checkin-out/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteForgotCheckinout = (body: any) => {
    const endpoint = `/forgot-checkin-out/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const ForgotCheckinoutPending = async (id: any, body: any) => {
    const endpoint = `/forgot-checkin-out/${id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const ForgotCheckinoutForward = (body: any) => {
    const endpoint = `/forgot-checkin-out/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const ForgotCheckinoutApprove = (body: any) => {
    const endpoint = `/forgot-checkin-out/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const ForgotCheckinoutReject = (body: any) => {
    const endpoint = `/forgot-checkin-out/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

