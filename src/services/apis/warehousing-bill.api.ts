import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetWarehousingBill = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreateWarehousingBill = (body: any) => {
    const endpoint = '/warehousing-bill';
    return callApi(endpoint, 'POST', body);
};

export const EditWarehousingBill = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteWarehousingBill = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const CheckWarehousingBillDetail = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}/tally/${body.detailId}?quantity=${body.quantity}`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillAddDetail = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}/add-detail`;
    return callApi(endpoint, 'POST', body);
};

export const WarehousingBillEditDetail = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}/update-detail/${body.detailId}`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillDeleteDetail = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}/remove-detail/${body.detailId}`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillAddDetails = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}/add-details`;
    return callApi(endpoint, 'POST', body);
};

export const WarehousingBillSubmit = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}/submit`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillForward = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillApprove = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillReject = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillFinish = (body: any) => {
    const endpoint = `/warehousing-bill/${body.id}/finish`;
    return callApi(endpoint, 'PATCH', body);
};

