import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetFoodVoucher = (body: any) => {
	const endpoint = `/food-voucher/${body.id}`;
	return callApi(endpoint, 'GET', body);
};

export const GetFoodVoucherDetail = (body: any) => {
	const endpoint = `/food-voucher/${body.id}/get-details`;
	return callApi(endpoint, 'GET', body);
};

export const CreateFoodVoucher = (body: any) => {
	const endpoint = '/food-voucher';
	return callApi(endpoint, 'POST', body);
};

export const EditFoodVoucher = (body: any) => {
	const endpoint = `/food-voucher/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteFoodVoucher = (body: any) => {
	const endpoint = `/food-voucher/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const AddFoodVoucherDetail = (body: any) => {
	const endpoint = `/food-voucher/${body.id}/add-detail`;
	return callApi(endpoint, 'POST', body);
};

export const AddFoodVoucherDetails = (body: any) => {
	const endpoint = `/food-voucher/${body.id}/add-details`;
	return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditFoodVoucherDetail = (body: any) => {
	const endpoint = `/food-voucher/${body.id}/update-detail/${body.detailId}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteFoodVoucherDetail = (body: any) => {
	const endpoint = `/food-voucher/${body.id}/remove-detail/${body.detailId}`;
	return callApi(endpoint, 'DELETE', body);
};

export const FoodVoucherPending = (body: any) => {
	const endpoint = `/food-voucher/${body.id}/pending`;
	return callApi(endpoint, 'PATCH', body);
};

export const FoodVoucherForward = (body: any) => {
	const endpoint = `/food-voucher/${body.id}/forward`;
	return callApi(endpoint, 'PATCH', body);
};

export const FoodVoucherApprove = (body: any) => {
	const endpoint = `/food-voucher/${body.id}/approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const FoodVoucherReject = (body: any) => {
	const endpoint = `/food-voucher/${body.id}/reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const FoodVoucherReturn = (body: any) => {
	const endpoint = `/food-voucher/${body.id}/return`;
	return callApi(endpoint, 'PATCH', body);
};
