import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllGroupPositon = async (data: any) => {
	const endpoint = '/position-group';
	return callApi(endpoint, 'GET', data);
};
export const detailGroupPositon = async (id: any) => {
	const endpoint = `/position-group/${id}`;
	return callApi(endpoint, 'GET');
};
export const createGroupPositon = async (data: any) => {
	const endpoint = `/position-group`;
	return callApi(endpoint, 'POST', data);
};
export const updateGroupPositon = async (id: any, data: any) => {
	const endpoint = `/position-group/${id}`;
	return callApi(endpoint, 'PATCH', data);
};
export const deleteGroupPositon = async (data: any) => {
	const endpoint = `/position-group/${data}`;
	return callApi(endpoint, 'DELETE');
};

