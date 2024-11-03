import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetGroup = (body: any) => {
	const endpoint = `/group/${body.id}`;
	return callApi(endpoint, 'GET', body);
};

export const GetGroupDetail = (body: any) => {
	const endpoint = `/group/${body.id}/get-items`;
	return callApi(endpoint, 'GET', null);
};

export const CreateGroup = (body: any) => {
	const endpoint = '/group';
	return callApi(endpoint, 'POST', body);
};

export const EditGroup = (body: any) => {
	const endpoint = `/group/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteGroup = (body: any) => {
	const endpoint = `/group/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const AddGroupDetail = (body: any) => {
	const endpoint = `/group/${body.id}/add-detail`;
	return callApi(endpoint, 'POST', body);
};

export const AddGroupDetails = (body: any) => {
	const endpoint = `/group/${body.id}/add-details`;
	return callApi(endpoint, 'POST', body);
};

export const EditGroupDetail = (body: any) => {
	const endpoint = `/group/${body.id}/update-item/${body.itemId}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteGroupDetail = (body: any) => {
	const endpoint = `/group/${body.id}/remove-detail/${body.itemId}`;
	return callApi(endpoint, 'DELETE', body);
};
