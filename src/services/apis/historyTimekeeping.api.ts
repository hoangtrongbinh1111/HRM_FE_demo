import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllHistoryTimekeeping = async (data: any) => {
	const endpoint = '/history-timekeeping';
	return callApi(endpoint, 'GET', data);
};
export const detailHistoryTimekeeping = async (id: any) => {
	const endpoint = `/history-timekeeping/${id}`;
	return callApi(endpoint, 'GET');
};
export const createHistoryTimekeeping = async (data: any) => {
	const endpoint = `/history-timekeeping`;
	return callApi(endpoint, 'POST', data);
};
export const updateHistoryTimekeeping = async (id: any, data: any) => {
	const endpoint = `/history-timekeeping/${id}`;
	return callApi(endpoint, 'PATCH', data);
};
export const deleteHistoryTimekeeping = async (data: any) => {
	const endpoint = `/history-timekeeping/${data}`;
	return callApi(endpoint, 'DELETE');
};

