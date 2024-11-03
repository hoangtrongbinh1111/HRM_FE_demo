import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetNotificationGroup = async (data: any) => {
    const endpoint = `/notification-group/${data}`;
    return callApi(endpoint, 'GET');
};
export const CreateNotificationGroup = async (data: any) => {
    const endpoint = `/notification-group`;
    return callApi(endpoint, 'POST', data);
};

export const UpdateNotificationGroup = async (id: any, data: any) => {
    const endpoint = `/notification-group/${id}`;
    return callApi(endpoint, 'PATCH', data);
};
