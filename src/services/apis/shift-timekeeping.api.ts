import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const CreateShiftTimekeeping = async (data: any) => {
    const endpoint = '/shift-timekeeping';
    return callApi(endpoint, 'POST', data);
};
export const DetailShiftTimekeeping = async (id: any) => {
    const endpoint = `/shift-timekeeping/${id}`;
    return callApi(endpoint, 'GET');
};
export const UpdateShiftTimekeeping = async (id: any, data: any) => {
    const endpoint = `/shift-timekeeping/${id}`;
    return callApi(endpoint, 'PATCH', data);
};
export const UpdateShiftTimekeepingV2 = async (id: any, data: any) => {
    const endpoint = `/shift-timekeeping?timekeepingStaffId=${id}`;
    return callApi(endpoint, 'PATCH', data);
};
export const DeleteShiftTimekeeping = async (data: any) => {
    const endpoint = `/shift-timekeeping/${data}`;
    return callApi(endpoint, 'DELETE', data);
};
