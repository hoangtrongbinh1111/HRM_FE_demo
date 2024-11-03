import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Auth from '../../auth/auth';

function getAuthToken(): string {
    return window.localStorage.getItem('accessToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlck5hbWUiOiJhZG1pbiIsInJvbGUiOiIiLCJzdWIiOjEsImlhdCI6MTcwMjkwNjE4MywiZXhwIjoxNzAyOTkyNTgzfQ.f90xyPM2Pi71qNVyWSoU5K6nROYt3Wu5nxqvT2p3u2g';
}

const API = axios.create({
    baseURL: `https://api.vangtat.cstt.com.vn/`,
});

API.interceptors.request.use((config: any) => {
    config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${getAuthToken()}`,
    };
    return { ...config };
});

API.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const status = error.response ? error.response.status : null;

        // Access Token was expired
        // if (status === 401) {
        //     return Auth.refreshToken().then((res) => {
        //         if (error.config && error.config.headers) {
        //             error.config.headers['Authorization'] = 'Bearer ' + getAuthToken();
        //         }
        //         return API(error.config);
        //     });
        // }
        if (status === 400) {
            return error.response;
        }
        return Promise.reject(error);
    }
);

export { API };
