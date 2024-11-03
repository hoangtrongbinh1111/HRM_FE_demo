import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetOrder = (body: any) => {
	const endpoint = `/order/${body.id}`;
	return callApi(endpoint, 'GET', body);
};

export const GetOrderDetail = (body: any) => {
	const endpoint = `/order/${body.id}/get-items`;
	return callApi(endpoint, 'GET', null);
};

export const CreateOrder = (body: any) => {
	const endpoint = '/order';
	return callApi(endpoint, 'POST', body);
};

export const EditOrder = (body: any) => {
	const endpoint = `/order/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteOrder = (body: any) => {
	const endpoint = `/order/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const AddOrderDetail = (body: any) => {
	const endpoint = `/order/${body.id}/add-item`;
	return callApi(endpoint, 'POST', body);
};

export const AddOrderDetails = (body: any) => {
	const endpoint = `/order/${body.id}/add-items`;
	return callApi(endpoint, 'POST', body);
};

export const EditOrderDetail = (body: any) => {
	const endpoint = `/order/${body.id}/update-item/${body.itemId}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteOrderDetail = (body: any) => {
	const endpoint = `/order/${body.id}/remove-item/${body.itemId}`;
	return callApi(endpoint, 'DELETE', body);
};

export const OrderPlace = (body: any) => {
	const endpoint = `/order/${body.id}/place-order`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderShipping = (body: any) => {
	const endpoint = `/order/${body.id}/shipping`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderReceive = (body: any) => {
	const endpoint = `/order/${body.id}/receive`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderCancel = (body: any) => {
	const endpoint = `/order/${body.id}/cancel`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderSubmit = (body: any) => {
	const endpoint = `/order/${body.id}/submit`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderForward = (body: any) => {
	const endpoint = `/order/${body.id}/forward`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderApprove = (body: any) => {
	const endpoint = `/order/${body.id}/approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderHeadApprove = (body: any) => {
	const endpoint = `/order/${body.id}/head-approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderManagerApprove = (body: any) => {
	const endpoint = `/order/${body.id}/manager-approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderReject = (body: any) => {
	const endpoint = `/order/${body.id}/reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderHeadReject = (body: any) => {
	const endpoint = `/order/${body.id}/head-reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderManagerReject = (body: any) => {
	const endpoint = `/order/${body.id}/manager-reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderAdministrativeApprove = (body: any) => {
	const endpoint = `/order/${body.id}/administrative-approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderAdministrativeReject = (body: any) => {
	const endpoint = `/order/${body.id}/administrative-reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderBodApprove = (body: any) => {
	const endpoint = `/order/${body.id}/bod-approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const OrderBodReject = (body: any) => {
	const endpoint = `/order/${body.id}/bod-reject`;
	return callApi(endpoint, 'PATCH', body);
};
