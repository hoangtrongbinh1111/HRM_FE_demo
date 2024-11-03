import callApi from '@core/call-api';

export const getConfig = async (data: any) => {
    const endpoint = `/approval-config/${data?.entity}?fromPosition=${data?.fromPosition}&startPosition=${data?.startPosition}&departmentId=${data?.departmentId}`;
    return callApi(endpoint, 'GET', null);
};

