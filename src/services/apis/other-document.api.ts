import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetOtherDocument = (body: any) => {
    const endpoint = `/other-document/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreateOtherDocument = (body: any) => {
    const endpoint = '/other-document';
    return callApi(endpoint, 'POST', body);
};

export const EditOtherDocument = (body: any) => {
    const endpoint = `/other-document/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteOtherDocument = (body: any) => {
    const endpoint = `/other-document/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const OtherDocumentPending = (body: any) => {
    const endpoint = `/other-document/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const OtherDocumentForward = (body: any) => {
    const endpoint = `/other-document/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const OtherDocumentApprove = (body: any) => {
    const endpoint = `/other-document/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const OtherDocumentReject = (body: any) => {
    const endpoint = `/other-document/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

