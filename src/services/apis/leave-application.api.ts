import callApi from '@core/call-api';
import Config from '@core/configs';
import Cookies from 'js-cookie';

export const GetLeaveApplication = (body: any) => {
    const endpoint = `/leave-application/${body.id}`;
    return callApi(endpoint, 'GET', body);
};

export const CreateLeaveApplication = (body: any) => {
    const endpoint = '/leave-application';
    return callApi(endpoint, 'POST', body);
};

export const EditLeaveApplication = (body: any) => {
    const endpoint = `/leave-application/${body.id}`;
    return callApi(endpoint, 'PATCH', body);
};

export const DeleteLeaveApplication = (body: any) => {
    const endpoint = `/leave-application/${body.id}`;
    return callApi(endpoint, 'DELETE', body);
};

export const LeaveApplicationPending = (body: any) => {
    const endpoint = `/leave-application/${body.id}/pending`;
    return callApi(endpoint, 'PATCH', body);
};

export const LeaveApplicationForward = (body: any) => {
    const endpoint = `/leave-application/${body.id}/forward`;
    return callApi(endpoint, 'PATCH', body);
};

export const LeaveApplicationApprove = (body: any) => {
    const endpoint = `/leave-application/${body.id}/approve`;
    return callApi(endpoint, 'PATCH', body);
};

export const LeaveApplicationReject = (body: any) => {
    const endpoint = `/leave-application/${body.id}/reject`;
    return callApi(endpoint, 'PATCH', body);
};

export const LeaveApplicationInitial = (body: any) => {
    const endpoint = `/leave-application/${body.id}/initials`;
    return callApi(endpoint, 'PATCH', body);
};
