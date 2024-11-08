import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const OtherDocuments = (queries?: any) => swr(getEndpoint('/other-document', queries));
