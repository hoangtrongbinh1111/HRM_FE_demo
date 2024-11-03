import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetGuestNotice = (body: any) => {
    const endpoint = `/guest-notice/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const GetGuestNoticeDetail = (body: any) => {
    const endpoint = `/guest-notice/${body.id}/get-details`;
    return callApi(endpoint, 'GET', body);
};

export const CreateGuestNotice = (body: any) => {
    const endpoint = '/guest-notice';
    return callApi(endpoint, 'POST', body);
};

export const EditGuestNotice = (body: any) => {
    const endpoint = `/guest-notice/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteGuestNotice = (body: any) => {
    const endpoint = `/guest-notice/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const AddGuestNoticeDetail = (body: any) => {
    const endpoint = `/guest-notice/${body.id}/add-detail`;
    return callApi(endpoint, 'POST', body);
};

export const AddGuestNoticeDetails = (body: any) => {
    const endpoint = `/guest-notice/${body.id}/add-details`;
    return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditGuestNoticeDetail = (body: any) => {
    const endpoint = `/guest-notice/${body.id}/update-detail/${body.detailId}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteGuestNoticeDetail = (body: any) => {
    const endpoint = `/guest-notice/${body.id}/remove-detail/${body.detailId}`;
    return callApi(endpoint, 'DELETE', body);
};

export const GuestNoticePending = (body: any) => {
    const endpoint = `/guest-notice/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const GuestNoticeForward = (body: any) => {
    const endpoint = `/guest-notice/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const GuestNoticeApprove = (body: any) => {
    const endpoint = `/guest-notice/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const GuestNoticeReject = (body: any) => {
    const endpoint = `/guest-notice/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const GuestNoticeReturn = (body: any) => {
    const endpoint = `/guest-notice/${body.id}/return`;
    return callApi(endpoint, 'PATCH', body);
};
