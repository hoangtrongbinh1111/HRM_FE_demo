import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetProduct = (body: any) => {
	const endpoint = `/product/${body.id}`;
	return callApi(endpoint, 'GET', null);
};

export const GetQuantity = (body: any) => {
	const endpoint = `/product/${body.id}/quantity`;
	return callApi(endpoint, 'GET', null);
};

export const CreateProduct = (body: any) => {
	const endpoint = '/product';
	return callApi(endpoint, 'POST', body);
};

export const EditProduct = (body: any) => {
	const endpoint = `/product/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteProduct = (body: any) => {
	const endpoint = `/product/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const LimitProduct = (body: any) => {
	const endpoint = `/product/${body.id}/limit`;
	return callApi(endpoint, 'PATCH', body);
};

export const GetProductCategory = (body: any) => {
	const endpoint = `/product-category/${body.id}`;
	return callApi(endpoint, 'GET', null);
};

export const CreateProductCategory = (body: any) => {
	const endpoint = '/product-category';
	return callApi(endpoint, 'POST', body);
};

export const EditProductCategory = (body: any) => {
	const endpoint = `/product-category/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteProductCategory = (body: any) => {
	const endpoint = `/product-category/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const CreateProvider = (body: any) => {
	const endpoint = '/provider';
	return callApi(endpoint, 'POST', body);
};

export const EditProvider = (body: any) => {
	const endpoint = `/provider/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteProvider = (body: any) => {
	const endpoint = `/provider/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const GetUnit = (body: any) => {
	const endpoint = `/unit/${body.id}`;
	return callApi(endpoint, 'GET', null);
};

export const CreateUnit = (body: any) => {
	const endpoint = '/unit';
	return callApi(endpoint, 'POST', body);
};

export const EditUnit = (body: any) => {
	const endpoint = `/unit/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteUnit = (body: any) => {
	const endpoint = `/unit/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const PrintBarcodeApi = (body: any) => {
	const endpoint = `/product/generate-barcode-pdf`;
	return callApi(endpoint, 'POST', body, null, true);
};

export const GetProductByCode = (body: any) => {
	const endpoint = `/product/get-by-code/${body}`;
	return callApi(endpoint, 'GET', null);
};
