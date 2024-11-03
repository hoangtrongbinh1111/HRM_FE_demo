import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetDrivingOrder = (body: any) => {
    const endpoint = `/driving-order/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const GetDrivingOrderDetail = (body: any) => {
    const endpoint = `/driving-order/${body.id}/get-details`;
    return callApi(endpoint, 'GET', body);
};

export const CreateDrivingOrder = (body: any) => {
    const endpoint = '/driving-order';
    return callApi(endpoint, 'POST', body);
};

export const EditDrivingOrder = (body: any) => {
    const endpoint = `/driving-order/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteDrivingOrder = (body: any) => {
    const endpoint = `/driving-order/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const AddDrivingOrderDetail = (body: any) => {
    const endpoint = `/driving-order/${body.id}/add-detail`;
    return callApi(endpoint, 'POST', body);
};

export const AddDrivingOrderDetails = (body: any) => {
    const endpoint = `/driving-order/${body.id}/add-details`;
    return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditDrivingOrderDetail = (body: any) => {
    const endpoint = `/driving-order/${body.id}/update-detail/${body.detailId}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteDrivingOrderDetail = (body: any) => {
    const endpoint = `/driving-order/${body.id}/remove-detail/${body.detailId}`;
    return callApi(endpoint, 'DELETE', body);
};

export const DrivingOrderPending = (body: any) => {
    const endpoint = `/driving-order/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const DrivingOrderForward = (body: any) => {
    const endpoint = `/driving-order/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const DrivingOrderApprove = (body: any) => {
    const endpoint = `/driving-order/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const DrivingOrderReject = (body: any) => {
    const endpoint = `/driving-order/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const DrivingOrderMangementApprove = (body: any) => {
    const endpoint = `/driving-order/${body.id}/manager-approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const DrivingOrderManagemetReject = (body: any) => {
    const endpoint = `/driving-order/${body.id}/manager-reject`;
    return callApi(endpoint, 'PATCH', body);
};
