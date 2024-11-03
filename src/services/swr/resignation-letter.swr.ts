import swr from '@core/swr';
import callApi from '@core/call-api';
import { getEndpoint } from '@core/utils';

export const ResignationLetters = (queries?: any) => swr(getEndpoint('/resignation-letter', queries));
