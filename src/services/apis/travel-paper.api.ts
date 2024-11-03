import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetTravelPaper = (body: any) => {
    const endpoint = `/travel-paper/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const GetTravelPaperDetail = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/get-details`;
    return callApi(endpoint, 'GET', body);
};

export const CreateTravelPaper = (body: any) => {
    const endpoint = '/travel-paper';
    return callApi(endpoint, 'POST', body);
};

export const EditTravelPaper = (body: any) => {
    const endpoint = `/travel-paper/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteTravelPaper = (body: any) => {
    const endpoint = `/travel-paper/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const AddTravelPaperDetail = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/add-detail`;
    return callApi(endpoint, 'POST', body);
};

export const AddTravelPaperDetails = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/add-details`;
    return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditTravelPaperDetail = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/update-detail/${body.detailId}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteTravelPaperDetail = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/remove-detail/${body.detailId}`;
    return callApi(endpoint, 'DELETE', body);
};

export const TravelPaperPending = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const TravelPaperForward = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const TravelPaperApprove = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const TravelPaperReject = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const TravelPaperMangementApprove = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/manager-approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const TravelPaperManagemetReject = (body: any) => {
    const endpoint = `/travel-paper/${body.id}/manager-reject`;
    return callApi(endpoint, 'PATCH', body);
};
