import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetRequestOvertime = (body: any) => {
    const endpoint = `/request-overtime/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const GetRequestOvertimeDetail = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/get-details`;
    return callApi(endpoint, 'GET', body);
};

export const CreateRequestOvertime = (body: any) => {
    const endpoint = '/request-overtime';
    return callApi(endpoint, 'POST', body);
};

export const EditRequestOvertime = (body: any) => {
    const endpoint = `/request-overtime/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteRequestOvertime = (body: any) => {
    const endpoint = `/request-overtime/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const AddRequestOvertimeDetail = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/add-detail`;
    return callApi(endpoint, 'POST', body);
};

export const AddRequestOvertimeDetails = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/add-details`;
    return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditRequestOvertimeDetail = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/update-detail/${body.detailId}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteRequestOvertimeDetail = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/remove-detail/${body.detailId}`;
    return callApi(endpoint, 'DELETE', body);
};

export const RequestOvertimePending = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestOvertimeForward = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestOvertimeApprove = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestOvertimeReject = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestOvertimeMangementApprove = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/manager-approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestOvertimeManagemetReject = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/manager-reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestOvertimeInitial = (body: any) => {
    const endpoint = `/request-overtime/${body.id}/initials`;
    return callApi(endpoint, 'PATCH', body);
};
