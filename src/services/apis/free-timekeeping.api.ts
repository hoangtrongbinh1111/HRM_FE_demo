import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const CreateFreeTimekeeping = (body: any) => {
    const endpoint = `/free-timekeeping`;
    return callApi(endpoint, 'POST', body);
};

export const DeleteFreeTimekeeping = (body: any) => {
    const endpoint = `/free-timekeeping/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};
