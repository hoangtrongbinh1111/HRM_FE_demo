import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllPosition = async (data: any) => {
	const endpoint = '/position';
	return callApi(endpoint, 'GET', data);
};
export const detailPosition = async (data: any) => {
	const endpoint = `/position/${data}`;
	return callApi(endpoint, 'GET');
};
export const createPosition = async (data: any) => {
	const endpoint = `/position`;
	return callApi(endpoint, 'POST', data);
};
export const updatePosition = async (id: any, data: any) => {
	const endpoint = `/position/${id}`;
	return callApi(endpoint, 'PATCH', data);
};
export const exportPosition = async () => {
	const endpoint = `/position/export`;
	return callApi(endpoint, 'GET');
};

export const deletePosition = async (data: any) => {
	const endpoint = `/position/${data}`;
	return callApi(endpoint, 'DELETE');
};
