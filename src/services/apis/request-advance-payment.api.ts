import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetRequestAdvancePayment = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const GetRequestAdvancePaymentDetail = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/get-details`;
    return callApi(endpoint, 'GET', body);
};

export const CreateRequestAdvancePayment = (body: any) => {
    const endpoint = '/request-advance-payment';
    return callApi(endpoint, 'POST', body);
};

export const EditRequestAdvancePayment = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteRequestAdvancePayment = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const AddRequestAdvancePaymentDetail = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/add-detail`;
    return callApi(endpoint, 'POST', body);
};

export const AddRequestAdvancePaymentDetails = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/add-details`;
    return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditRequestAdvancePaymentDetail = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/update-detail/${body.detailId}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteRequestAdvancePaymentDetail = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/remove-detail/${body.detailId}`;
    return callApi(endpoint, 'DELETE', body);
};

export const RequestAdvancePaymentPending = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestAdvancePaymentForward = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestAdvancePaymentApprove = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestAdvancePaymentReject = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestAdvancePaymentMangementApprove = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/manager-approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const RequestAdvancePaymentManagemetReject = (body: any) => {
    const endpoint = `/request-advance-payment/${body.id}/manager-reject`;
    return callApi(endpoint, 'PATCH', body);
};
