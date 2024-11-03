import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const updateProfile = async (data: any) => {
    const endpoint = `/profile`;
	return callApi(endpoint, 'PATCH', data);
};