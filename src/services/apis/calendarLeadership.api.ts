import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllCalendarLeaderShip = async (data: any) => {
	const endpoint = '/calendar-leadership';
	return callApi(endpoint, 'GET', data);
};
export const detailCalendarLeaderShip = async (data: any) => {
	const endpoint = `/calendar-leadership/${data}`;
	return callApi(endpoint, 'GET');
};
export const createCalendarLeaderShip = async (data: any) => {
	const endpoint = `/calendar-leadership`;
	return callApi(endpoint, 'POST', data);
};
export const updateCalendarLeaderShip = async (id: any, data: any) => {
	const endpoint = `/calendar-leadership/${id}`;
	return callApi(endpoint, 'PATCH', data);
};

export const deleteCalendarLeaderShip = async (id: any) => {
	const endpoint = `/calendar-leadership/${id}`;
	return callApi(endpoint, 'DELETE');
};

