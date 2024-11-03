import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetPaymentOrder = (body: any) => {
    const endpoint = `/payment-order/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreatePaymentOrder = (body: any) => {
    const endpoint = '/payment-order';
    return callApi(endpoint, 'POST', body);
};

export const EditPaymentOrder = (body: any) => {
    const endpoint = `/payment-order/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeletePaymentOrder = (body: any) => {
    const endpoint = `/payment-order/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const PaymentOrderPending = (body: any) => {
    const endpoint = `/payment-order/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentOrderForward = (body: any) => {
    const endpoint = `/payment-order/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentOrderApprove = (body: any) => {
    const endpoint = `/payment-order/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const PaymentOrderReject = (body: any) => {
    const endpoint = `/payment-order/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

