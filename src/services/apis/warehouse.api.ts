import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetWarehouse = (body: any) => {
	const endpoint = `/warehouse/${body.id}`;
	return callApi(endpoint, 'GET', body);
};

export const CreateWarehouse = (body: any) => {
	const endpoint = '/warehouse';
	return callApi(endpoint, 'POST', body);
};

export const EditWarehouse = (body: any) => {
	const endpoint = `/warehouse/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteWarehouse = (body: any) => {
	const endpoint = `/warehouse/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const CreateWarehouseType = (body: any) => {
	const endpoint = '/warehouse-type';
	return callApi(endpoint, 'POST', body);
};

export const EditWarehouseType = (body: any) => {
	const endpoint = `/warehouse-type/${body.id}`;
	return callApi(endpoint, 'PATCH', body);
};

export const DeleteWarehouseType = (body: any) => {
	const endpoint = `/warehouse-type/${body.id}`;
	return callApi(endpoint, 'DELETE', body);
};

export const ImportProduct = (body: any) => {
	const endpoint = `/warehouse/${body.id}/import`;
	return callApi(endpoint, 'POST', body);
};

export const EditImportProduct = (body: any) => {
	const endpoint = `/warehouse/${body.id}/products/${body.inventoryId}`;
	return callApi(endpoint, 'PATCH', body);
};

export const ImportProductFromExcel = (body: any) => {
	const endpoint = `/warehouse/${body.id}/import-from-file/${body.fileId}`;
	return callApi(endpoint, 'POST', body);
};
