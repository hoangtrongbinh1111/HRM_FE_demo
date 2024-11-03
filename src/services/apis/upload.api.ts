import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const Upload = (body: any) => {
    const endpoint = '/media/upload';
    return callApi(endpoint, 'POST', body);
};

export const UploadFace = (body: any) => {
    const endpoint = '/face';
    return callApi(endpoint, 'POST', body);
};
