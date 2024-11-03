import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllOvertime = async (type: any) => {
	const endpoint = '/over-time/list-all';
	return callApi(endpoint, 'GET');
};
export const detailOvertime = async (data: any) => {
	const endpoint = `/over-time/${data}`;
	return callApi(endpoint, 'GET');
};
export const createOvertime = async (data: any) => {
	const endpoint = `/over-time`;
	return callApi(endpoint, 'POST', data);
};
export const updateOvertime = async (id: any, data: any) => {
	const endpoint = `/over-time/${id}`;
	return callApi(endpoint, 'PATCH', data);
};

export const deleteOvertime = async (id: any) => {
	const endpoint = `/over-time/${id}`;
	return callApi(endpoint, 'DELETE');
};

