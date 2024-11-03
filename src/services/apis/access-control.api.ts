import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetAccessControl = (body: any) => {
	const endpoint = `/access-control/${body.id}`;
	return callApi(endpoint, 'GET', null);
};

export const CreateAccessControl = (body: any) => {
	const endpoint = `/access-control`;
	return callApi(endpoint, 'POST', body);
};

export const EditAccessControl = (body: any) => {
	const endpoint = `/access-control/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteAccessControl = (body: any) => {
	const endpoint = `/access-control/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};
