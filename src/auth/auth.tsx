import axios, { AxiosResponse } from 'axios';
import { API } from '../@core/libs/client';

export default class Auth {
    static saveToken(token: string): void {
        window.localStorage.setItem('accessToken', token);
    }

    static removeToken(): void {
        window.localStorage.removeItem('accessToken');
    }

    static async refreshToken(): Promise<boolean> {
        try {
            const refreshRes: AxiosResponse = await API.post(
                '/api/v1/refresh',
                {},
                {
                    headers: { Authorization: 'Bearer ' + window.localStorage.getItem('accessToken') },
                }
            );

            const newToken = refreshRes?.data?.data?.access_token;

            if (!newToken) {
                return false;
            }

            this.saveToken(newToken);
            return true;
        } catch (e) {
            this.removeToken();
            window.location.href = '/auth-login';
            return false; // Ensure a boolean value is returned in all cases
        }
    }
}
