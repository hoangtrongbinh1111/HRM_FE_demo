import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const getUsersByShiftId = async (id: any) => {
    const endpoint = `/user-shift/${id}/users`;
    return callApi(endpoint, 'GET');
};

export const addUsersShift = async (data: any) => {
    const endpoint = `/user-shift`;
    return callApi(endpoint, 'PATCH', data);
}
