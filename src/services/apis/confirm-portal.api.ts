import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetConfirmPortal = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const GetConfirmPortalDetail = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/get-details`;
    return callApi(endpoint, 'GET', body);
};

export const CreateConfirmPortal = (body: any) => {
    const endpoint = '/confirm-portal';
    return callApi(endpoint, 'POST', body);
};

export const EditConfirmPortal = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteConfirmPortal = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const AddConfirmPortalDetail = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/add-detail`;
    return callApi(endpoint, 'POST', body);
};

export const AddConfirmPortalDetails = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/add-details`;
    return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditConfirmPortalDetail = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/update-detail/${body.detailId}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteConfirmPortalDetail = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/remove-detail/${body.detailId}`;
    return callApi(endpoint, 'DELETE', body);
};

export const ConfirmPortalPending = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const ConfirmPortalForward = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const ConfirmPortalApprove = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const ConfirmPortalReject = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const ConfirmPortalMangementApprove = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/manager-approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const ConfirmPortalManagemetReject = (body: any) => {
    const endpoint = `/confirm-portal/${body.id}/manager-reject`;
    return callApi(endpoint, 'PATCH', body);
};
