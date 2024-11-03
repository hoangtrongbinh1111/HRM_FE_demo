import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetRepair = (body: any) => {
	const endpoint = `/repair-request/${body.id}`;
	return callApi(endpoint, 'GET', body);
};

export const GetRepairDetail = (body: any) => {
	const endpoint = `/repair-request/${body.id}/detail`;
	return callApi(endpoint, 'GET', null);
};

export const CreateRepair = (body: any) => {
	const endpoint = '/repair-request';
	return callApi(endpoint, 'POST', body);
};

export const EditRepair = (body: any) => {
	const endpoint = `/repair-request/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteRepair = (body: any) => {
	const endpoint = `/repair-request/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const AddRepairDetail = (body: any) => {
	const endpoint = `/repair-request/${body.id}/detail`;
	return callApi(endpoint, 'POST', body);
};

export const AddRepairDetails = (body: any) => {
	const endpoint = `/repair-request/${body.id}/add-details`;
	return callApi(endpoint, 'POST', body);
};

export const EditRepairDetail = (body: any) => {
	const endpoint = `/repair-request/${body.id}/detail/${body.detailId}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteRepairDetail = (body: any) => {
	const endpoint = `/repair-request/${body.id}/detail/${body.detailId}`;
	return callApi(endpoint, 'DELETE', body);
};

export const RepairInprogress = (body: any) => {
	const endpoint = `/repair-request/${body.id}/in-progress`;
	return callApi(endpoint, 'PATCH', body);
};

export const RepairApprove = (body: any) => {
	const endpoint = `/repair-request/${body.id}/approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const RepairReject = (body: any) => {
	const endpoint = `/repair-request/${body.id}/reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const RepairSubmit = (body: any) => {
	const endpoint = `/repair-request/${body.id}/submit`;
	return callApi(endpoint, 'PATCH', body);
};

export const RepairForward = (body: any) => {
	const endpoint = `/repair-request/${body.id}/forward`;
	return callApi(endpoint, 'PATCH', body);
};

export const RepairManagerApprove = (body: any) => {
	const endpoint = `/repair-request/${body.id}/manager-approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const RepairManagerReject = (body: any) => {
	const endpoint = `/repair-request/${body.id}/manager-reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const RepairAdministrativeApprove = (body: any) => {
	const endpoint = `/repair-request/${body.id}/administrative-approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const RepairAdministrativeReject = (body: any) => {
	const endpoint = `/repair-request/${body.id}/administrative-reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const RepairBodApprove = (body: any) => {
	const endpoint = `/repair-request/${body.id}/bod-approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const RepairBodReject = (body: any) => {
	const endpoint = `/repair-request/${body.id}/bod-reject`;
	return callApi(endpoint, 'PATCH', body);
};
