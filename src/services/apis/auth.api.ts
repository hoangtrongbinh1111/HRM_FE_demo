import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const signIn = (username: string, password: string) => {
	const endpoint = '/auth/login';
	return callApi(endpoint, 'POST', { username, password });
};

export const ChangePassword = (body: any) => {
	const endpoint = '/profile/change-password';
	return callApi(endpoint, 'PATCH', body);
};

export const signUp = (email: string, password: string) => {
	const endpoint = '/auth/signup';
	return callApi(endpoint, 'POST', { email, password });
};

export const Profile = () => {
	const endpoint = '/profile';
	return callApi(endpoint, 'GET', null);
};

export const MobileCode = () => {
	const endpoint = '/test';
	return callApi(endpoint, 'POST', null);
};
