import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllHoliday = async (data: any) => {
	const endpoint = '/holiday';
	return callApi(endpoint, 'GET', data);
};
export const detailHoliday = async (data: any) => {
	const endpoint = `/holiday/${data}`;
	return callApi(endpoint, 'GET');
};
export const createHoliday = async (data: any) => {
	const endpoint = `/holiday`;
	return callApi(endpoint, 'POST', data);
};
export const updateHoliday = async (id: any, data: any) => {
	const endpoint = `/holiday/${id}`;
	return callApi(endpoint, 'PATCH', data);
};

export const deleteHoliday = async (data: any) => {
	const endpoint = `/holiday/${data}`;
	return callApi(endpoint, 'DELETE', data);
};

