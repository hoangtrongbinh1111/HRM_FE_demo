import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetProposal = (body: any) => {
	const endpoint = `/proposal/${body.id}`;
	return callApi(endpoint, 'GET', body);
};

export const GetProposalDetail = (body: any) => {
	const endpoint = `/proposal/${body.id}/get-details`;
	return callApi(endpoint, 'GET', body);
};

export const CreateProposal = (body: any) => {
	const endpoint = '/proposal';
	return callApi(endpoint, 'POST', body);
};

export const EditProposal = (body: any) => {
	const endpoint = `/proposal/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteProposal = (body: any) => {
	const endpoint = `/proposal/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const AddProposalDetail = (body: any) => {
	const endpoint = `/proposal/${body.id}/add-detail`;
	return callApi(endpoint, 'POST', body);
};

export const AddProposalDetails = (body: any) => {
	const endpoint = `/proposal/${body.id}/add-details`;
	return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditProposalDetail = (body: any) => {
	const endpoint = `/proposal/${body.id}/update-detail/${body.detailId}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteProposalDetail = (body: any) => {
	const endpoint = `/proposal/${body.id}/remove-detail/${body.detailId}`;
	return callApi(endpoint, 'DELETE', body);
};

export const ProposalPending = (body: any) => {
	const endpoint = `/proposal/${body.id}/pending`;
	return callApi(endpoint, 'PATCH', body);
};

export const ProposalForward = (body: any) => {
	const endpoint = `/proposal/${body.id}/forward`;
	return callApi(endpoint, 'PATCH', body);
};

export const ProposalApprove = (body: any) => {
	const endpoint = `/proposal/${body.id}/approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const ProposalReject = (body: any) => {
	const endpoint = `/proposal/${body.id}/reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const ProposalMangementApprove = (body: any) => {
	const endpoint = `/proposal/${body.id}/manager-approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const ProposalManagemetReject = (body: any) => {
	const endpoint = `/proposal/${body.id}/manager-reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const ProposalReturn = (body: any) => {
	const endpoint = `/proposal/${body.id}/return`;
	return callApi(endpoint, 'PATCH', body);
};

export const ProposalAdministrativeApprove = (body: any) => {
	const endpoint = `/proposal/${body.id}/administrative-approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const ProposalAdministrativeReject = (body: any) => {
	const endpoint = `/proposal/${body.id}/administrative-reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const ProposalBodApprove = (body: any) => {
	const endpoint = `/proposal/${body.id}/bod-approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const ProposalBodReject = (body: any) => {
	const endpoint = `/proposal/${body.id}/bod-reject`;
	return callApi(endpoint, 'PATCH', body);
};
