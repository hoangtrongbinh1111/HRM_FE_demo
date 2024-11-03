import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';
export const listAllLetter = async (type: any) => {
	const endpoint = '/letter/list-all';
	return callApi(endpoint, 'GET');
};
export const detailLetter = async (data: any) => {
	const endpoint = `/letter/${data}`;
	return callApi(endpoint, 'GET');
};
export const createLetter = async (data: any) => {
	const endpoint = `/letter`;
	return callApi(endpoint, 'POST', data);
};
export const updateLetter = async (id: any, data: any) => {
	const endpoint = `/letter/${id}`;
	return callApi(endpoint, 'PATCH', data);
};
export const updateStatusLetter = async (id: any, data: any) => {
	const endpoint = `/letter/update-status/${id}`;
	return callApi(endpoint, 'PATCH', data);
};

export const deleteLetter = async (id: any) => {
	const endpoint = `/letter/${id}`;
	return callApi(endpoint, 'DELETE');
};

