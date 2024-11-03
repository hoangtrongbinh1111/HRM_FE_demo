import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllCalendar = async (data: any) => {
	const endpoint = '/calendar/list-all';
	return callApi(endpoint, 'GET', data);
};
export const detailCalendar = async (data: any) => {
	const endpoint = `/calendar/${data}`;
	return callApi(endpoint, 'GET');
};
export const listAllCalendarDashboard = async (data: any) => {
	const endpoint = '/calendar/dashboard';
	return callApi(endpoint, 'GET', data);
};
export const createCalendar = async (data: any) => {
	const endpoint = `/calendar`;
	return callApi(endpoint, 'POST', data);
};
export const updateCalendar = async (id: any, data: any) => {
	const endpoint = `/calendar/${id}`;
	return callApi(endpoint, 'PATCH', data);
};

export const deleteCalendar = async (id: any) => {
	const endpoint = `/calendar/${id}`;
	return callApi(endpoint, 'DELETE');
};

