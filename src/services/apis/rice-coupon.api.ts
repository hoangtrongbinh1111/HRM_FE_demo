import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetRiceCoupon = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}`;
	return callApi(endpoint, 'GET', body);
};

export const GetRiceCouponDetail = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}/get-details`;
	return callApi(endpoint, 'GET', body);
};

export const CreateRiceCoupon = (body: any) => {
	const endpoint = '/rice-coupon';
	return callApi(endpoint, 'POST', body);
};

export const EditRiceCoupon = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteRiceCoupon = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const AddRiceCouponDetail = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}/add-detail`;
	return callApi(endpoint, 'POST', body);
};

export const AddRiceCouponDetails = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}/add-details`;
	return callApi(endpoint, 'POST', { details: body?.details });
};

export const EditRiceCouponDetail = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}/update-detail/${body.detailId}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteRiceCouponDetail = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}/remove-detail/${body.detailId}`;
	return callApi(endpoint, 'DELETE', body);
};

export const RiceCouponPending = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}/pending`;
	return callApi(endpoint, 'PATCH', body);
};

export const RiceCouponForward = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}/forward`;
	return callApi(endpoint, 'PATCH', body);
};

export const RiceCouponApprove = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}/approve`;
	return callApi(endpoint, 'PATCH', body);
};

export const RiceCouponReject = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}/reject`;
	return callApi(endpoint, 'PATCH', body);
};

export const RiceCouponReturn = (body: any) => {
	const endpoint = `/rice-coupon/${body.id}/return`;
	return callApi(endpoint, 'PATCH', body);
};
