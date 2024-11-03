import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const RequestAdditionalPersonnels = (queries?: any) => swr(getEndpoint('/request-additional-personnel', queries));
