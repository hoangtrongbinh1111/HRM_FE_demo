import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetMealCancel = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const GetMealCancelDetail = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}/get-details`;
    return callApi(endpoint, 'GET', body);
};

export const CreateMealCancel = (body: any) => {
    const endpoint = '/meal-cancel';
    return callApi(endpoint, 'POST', body);
};

export const EditMealCancel = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteMealCancel = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const AddMealCancelDetail = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}/add-detail`;
    return callApi(endpoint, 'POST', body);
};

export const AddMealCancelDetails = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}/add-details`;
    return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditMealCancelDetail = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}/update-detail/${body.detailId}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteMealCancelDetail = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}/remove-detail/${body.detailId}`;
    return callApi(endpoint, 'DELETE', body);
};

export const MealCancelPending = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const MealCancelForward = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const MealCancelApprove = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const MealCancelReject = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const MealCancelReturn = (body: any) => {
    const endpoint = `/meal-cancel/${body.id}/return`;
    return callApi(endpoint, 'PATCH', body);
};
