import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetRequestAdditionalPersonnel = (body: any) => {
    const endpoint = `/request-additional-personnel/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreateRequestAdditionalPersonnel = (body: any) => {
    const endpoint = '/request-additional-personnel';
    return callApi(endpoint, 'POST', body);
};

export const EditRequestAdditionalPersonnel = (body: any) => {
    const endpoint = `/request-additional-personnel/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteRequestAdditionalPersonnel = (body: any) => {
    const endpoint = `/request-additional-personnel/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const RequestAdditionalPersonnelPending = (body: any) => {
    const endpoint = `/request-additional-personnel/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestAdditionalPersonnelForward = (body: any) => {
    const endpoint = `/request-additional-personnel/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestAdditionalPersonnelApprove = (body: any) => {
    const endpoint = `/request-additional-personnel/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestAdditionalPersonnelReject = (body: any) => {
    const endpoint = `/request-additional-personnel/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

