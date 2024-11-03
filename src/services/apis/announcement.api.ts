import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllAnnouncement = async (data: any) => {
    const endpoint = '/announcement';
    return callApi(endpoint, 'GET', data);
};
export const detailAnnouncement = async (data: any) => {
    const endpoint = `/announcement/${data}`;
    return callApi(endpoint, 'GET');
};
export const createAnnouncement = async (data: any) => {
    const endpoint = `/announcement`;
    return callApi(endpoint, 'POST', data);
};
export const sendAnnouncement = async (data: any) => {
    const endpoint = `/announcement/is-seen/${data}`;
    return callApi(endpoint, 'GET', data);
};
export const updateAnnouncement = async (id: any, data: any) => {
    const endpoint = `/announcement/update-content/${id}`;
    return callApi(endpoint, 'PATCH', data);
};
export const makeHighLight = async (data: any) => {
    const endpoint = `/announcement/make-highlight/${data}`
    return callApi(endpoint, 'PATCH', data)
}
export const getHighLight = async () => {
    const endpoint = `/announcement/highlight`
    return callApi(endpoint, 'GET')
}
export const deleteAnnouncement = async (id: any) => {
	const endpoint = `/announcement/${id}`;
	return callApi(endpoint, 'DELETE');
};
