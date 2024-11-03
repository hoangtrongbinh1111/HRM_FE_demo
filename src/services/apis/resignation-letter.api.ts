import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetResignationLetter = (body: any) => {
    const endpoint = `/resignation-letter/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreateResignationLetter = (body: any) => {
    const endpoint = '/resignation-letter';
    return callApi(endpoint, 'POST', body);
};

export const EditResignationLetter = (body: any) => {
    const endpoint = `/resignation-letter/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteResignationLetter = (body: any) => {
    const endpoint = `/resignation-letter/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const ResignationLetterPending = (body: any) => {
    const endpoint = `/resignation-letter/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const ResignationLetterForward = (body: any) => {
    const endpoint = `/resignation-letter/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const ResignationLetterApprove = (body: any) => {
    const endpoint = `/resignation-letter/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const ResignationLetterReject = (body: any) => {
    const endpoint = `/resignation-letter/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const ResignationLetterReturn = (body: any) => {
    const endpoint = `/resignation-letter/${body.id}/return`;
    return callApi(endpoint, 'PATCH', body);
};

export const ResignationLetterInitial = (body: any) => {
    const endpoint = `/resignation-letter/${body.id}/initials`;
    return callApi(endpoint, 'PATCH', body);
};
