import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllTask = async (data: any) => {
	const endpoint = '/task';
	return callApi(endpoint, 'GET', data);
};
export const detailTask = async (data: any) => {
	const endpoint = `/task/${data}`;
	return callApi(endpoint, 'GET');
};
export const createTask = async (data: any) => {
	const endpoint = `/task`;
	return callApi(endpoint, 'POST', data);
};
export const updateTask = async (id: any, data: any) => {
	const endpoint = `/task/${id}`;
	return callApi(endpoint, 'PATCH', data);
};
export const deleteTask = async (data: any) => {
	const endpoint = `/task/${data}`;
	return callApi(endpoint, 'DELETE', data);
};
export const listAllTaskDashboard = async (data: any) => {
	const endpoint = '/task/dashboard';
	return callApi(endpoint, 'GET', data);
};
