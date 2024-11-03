import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetTrackingLog = (body: any) => {
	const endpoint = `/tracking-log/${body.id}`;
	return callApi(endpoint, 'GET', body);
};

export const GetTrackingLogDetail = (body: any) => {
	const endpoint = `/tracking-log/${body.id}/get-details`;
	return callApi(endpoint, 'GET', body);
};

export const CreateTrackingLog = (body: any) => {
	const endpoint = '/tracking-log';
	return callApi(endpoint, 'POST', body);
};

export const EditTrackingLog = (body: any) => {
	const endpoint = `/tracking-log/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteTrackingLog = (body: any) => {
	const endpoint = `/tracking-log/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const AddTrackingLogDetail = (body: any) => {
	const endpoint = `/tracking-log/${body.id}/add-detail`;
	return callApi(endpoint, 'POST', body);
};

export const AddTrackingLogDetails = (body: any) => {
	const endpoint = `/tracking-log/${body.id}/add-details`;
	return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditTrackingLogDetail = (body: any) => {
	const endpoint = `/tracking-log/${body.id}/update-detail/${body.detailId}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteTrackingLogDetail = (body: any) => {
	const endpoint = `/tracking-log/${body.id}/remove-detail/${body.detailId}`;
	return callApi(endpoint, 'DELETE', body);
};

export const TrackingLogPending = (body: any) => {
	const endpoint = `/tracking-log/${body.id}/pending`;
	return callApi(endpoint, 'PATCH', body);
};

export const TrackingLogForward = (body: any) => {
	const endpoint = `/tracking-log/${body.id}/forward`;
	return callApi(endpoint, 'PATCH', body);
};

export const TrackingLogApprove = (body: any) => {
	const endpoint = `/tracking-log/${body.id}/approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const TrackingLogReject = (body: any) => {
	const endpoint = `/tracking-log/${body.id}/reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const TrackingLogReturn = (body: any) => {
	const endpoint = `/tracking-log/${body.id}/return`;
	return callApi(endpoint, 'PATCH', body);
};
