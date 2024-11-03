import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetPaymentRequestList = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const GetPaymentRequestListDetail = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/get-details`;
    return callApi(endpoint, 'GET', body);
};

export const CreatePaymentRequestList = (body: any) => {
    const endpoint = '/payment-request-list';
    return callApi(endpoint, 'POST', body);
};

export const EditPaymentRequestList = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeletePaymentRequestList = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const AddPaymentRequestListDetail = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/add-detail`;
    return callApi(endpoint, 'POST', body);
};

export const AddPaymentRequestListDetails = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/add-details`;
    return callApi(endpoint, 'POST', body);
};
export const EditPaymentRequestListDetail = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/update-detail/${body.detailId}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeletePaymentRequestListDetail = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/remove-detail/${body.detailId}`;
    return callApi(endpoint, 'DELETE', body);
};

export const PaymentRequestListPending = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListForward = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListApprove = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListReject = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListMangementApprove = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/manager-approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListManagemetReject = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/manager-reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListReturn = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/return`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListAdministrativeApprove = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/administrative-approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListAdministrativeReject = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/administrative-reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListBodApprove = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/bod-approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListBodReject = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/bod-reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentRequestListExport = (body: any) => {
    const endpoint = `/payment-request-list/${body.id}/export-text-draft`;
    return callApi(endpoint, 'GET');
};
