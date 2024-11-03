import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const Products = (queries?: any) => swr(getEndpoint('/product', queries));
export const ProductByIdWarehouse = (queries?: any) => swr(getEndpoint(`/warehouse/${queries.id}/products`, queries));
export const ProductCategorys = (queries?: any) => swr(getEndpoint('/product-category', queries));
export const Providers = (queries?: any) => swr(getEndpoint('/provider', queries));
export const Units = (queries?: any) => swr(getEndpoint('/unit', queries));