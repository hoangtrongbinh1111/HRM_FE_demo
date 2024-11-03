import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetWarehousingBillReturnByCode = (body: any) => {
    const endpoint = `/warehousing-bill-return/get-warehousing-bill/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const GetWarehousingBillReturn = (body: any) => {
    const endpoint = `/warehousing-bill-return/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreateWarehousingBillReturn = (body: any) => {
    const endpoint = '/warehousing-bill-return';
    return callApi(endpoint, 'POST', body);
};

export const EditWarehousingBillReturn = (body: any) => {
    const endpoint = `/warehousing-bill-return/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteWarehousingBillReturn = (body: any) => {
    const endpoint = `/warehousing-bill-return/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const TallyReturn = (body: any) => {
    const endpoint = `/warehousing-bill-return/${body.id}/tally/${body.detailId}?quantity=${body.quantity}`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillSubmitReturn = (body: any) => {
    const endpoint = `/warehousing-bill-return/${body.id}/submit`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillForwardReturn = (body: any) => {
    const endpoint = `/warehousing-bill-return/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillApproveReturn = (body: any) => {
    const endpoint = `/warehousing-bill-return/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillRejectReturn = (body: any) => {
    const endpoint = `/warehousing-bill-return/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const WarehousingBillFinishReturn = (body: any) => {
    const endpoint = `/warehousing-bill-return/${body.id}/finish`;
    return callApi(endpoint, 'PATCH', body);
};



