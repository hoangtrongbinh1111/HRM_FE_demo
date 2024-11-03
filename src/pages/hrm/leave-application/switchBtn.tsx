import { useEffect, useState, useRef, use } from 'react';
import { useTranslation } from 'react-i18next';

import { getConfig } from '@/services/apis/config-approve.api';
import { useProfile } from '@/services/swr/profile.swr';
import { useRouter } from 'next/router';
import { showMessage } from '@/@core/utils';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

interface Props {
    [key: string]: any;
}

const SwitchBtn = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [signRole, setSignRole] = useState<any>();
    const { data: userData } = useProfile();
    const [btnStatus, setBtnStatus] = useState(true);
    const [ahStatus, setAhStatus] = useState(false);
    useEffect(() => {
        const departmentId = router.query.id === 'create' ? userData?.data?.department?.id : props?.data?.createdBy?.department?.id;
        const fromPositionId = userData?.data?.position?.id;
        const startPositionId = router.query.id === 'create' ? userData?.data?.position?.id : props?.data?.createdBy?.position?.id;
        if (departmentId && fromPositionId && startPositionId) {
            getConfig({
                entity: props.entity,
                departmentId: departmentId,
                fromPosition: fromPositionId,
                startPosition: startPositionId
            }).then((res) => {
                setSignRole(res?.data[0]);
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, "error");
            })
        }
    }, [props?.data?.approvalHistory, props?.data?.createdBy?.position?.id, props?.data?.departmentId, props.entity, router.query.id, userData?.data?.department?.id, userData?.data?.position?.id])

    useEffect(() => {
        if (props?.data?.exportStatus === "EXPORT") {
            props?.data?.approvalHistory?.map((item: any) => {
                if (item.approverId === userData?.data.id && item.status !== "PENDING" && item.status !== "IN_PROGRESS" && item.status !== "APPROVED") {
                    setBtnStatus(false);
                }
            })
        } else {
            props?.data?.approvalHistory?.map((item: any) => {
                if (item.approverId === userData?.data.id && props?.data?.currentApproverId !== userData?.data.id) {
                    setBtnStatus(false);
                }
            })
        }
    }, [props?.data?.approvalHistory, props?.data?.currentApproverId, props?.data?.exportStatus, userData?.data.id]);

    useEffect(() => {
        if (
            props?.data?.status !== "DRAFT" &&
            props?.data?.status !== "REJECTED" &&
            props?.data?.status !== "APPROVED" &&
            props?.data?.status !== undefined
        ) {
            setAhStatus(true);
        }
    }, [props.data?.status]);
    console.log(signRole)

    return (
        <>
            <div>
                <div className="mb-5">
                    <div className="font-semibold">
                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                            {
                                !props.disable &&
                                <>
                                    <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => props.handleCancel()}>
                                        {t('cancel_form')}
                                    </button>
                                    <button data-testId="submit-btn" type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => props.handleSubmit()}>
                                        {router.query.id !== "create" ? t('update') : t('save_daf')}
                                    </button>
                                </>
                            }
                            {
                                <>
                                    {
                                        ahStatus &&
                                        // props.disable &&
                                        btnStatus &&
                                        Number(props.data?.createdById) !== props.id &&
                                        (
                                            <>
                                                {
                                                    signRole?.sign?.map((item: any) => {
                                                        return (
                                                            <>
                                                                {
                                                                    item.name === "REJECT" &&
                                                                    <button type="button" className="btn btn-danger cancel-button w-28" onClick={() => props.handleReject()}>
                                                                        {t('reject')}
                                                                    </button>
                                                                }
                                                            </>
                                                        )
                                                    })
                                                }
                                            </>
                                        )}
                                </>
                            }
                            {
                                signRole?.sign?.map((item: any) => {
                                    return (
                                        <>
                                            {
                                                item.name === 'SIGN' && btnStatus && 
                                                <button data-testId="send-approval-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => props.handleSubmitApproval(item.id)}>
                                                    {t('continue_approval')}
                                                </button>
                                            }
                                            {
                                                item.name === 'INITIAL' && btnStatus &&
                                                <button data-testId="send-approval-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => props.handleSubmitApproval(item.id)}>
                                                    {t('continue_initial')}
                                                </button>
                                            }
                                        </>
                                    );
                                })
                            }
                            {
                                ahStatus &&
                                // props.disable &&
                                btnStatus &&
                                Number(props.data?.createdById) !== props.id &&
                                (
                                    <>
                                        {
                                            signRole?.sign?.map((item: any) => {
                                                return (
                                                    <>
                                                        {
                                                            item.name === "APPROVED" &&
                                                            <button data-testId="submit-approve-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => props.handleApprove()}>
                                                                {t('approve')}
                                                            </button>
                                                        }
                                                    </>
                                                )
                                            })
                                        }
                                    </>
                                )}
                            {
                                ahStatus &&
                                // props.disable &&
                                btnStatus &&
                                Number(props.data?.createdById) !== props.id &&
                                (
                                    <>
                                        {
                                            signRole?.sign?.map((item: any) => {
                                                return (
                                                    <>
                                                        {
                                                            item.name === "FORWARD" && !props?.data?.approvalHistory?.find((item: any) => item.sign === 5) &&
                                                            <button data-testId="submit-approve-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => props.handleForward(item.id)}>
                                                                {t('forward')}
                                                            </button>
                                                        }
                                                    </>
                                                )
                                            })
                                        }
                                    </>
                                )}
                            {
                                ahStatus &&
                                // props.disable &&
                                btnStatus &&
                                Number(props.data?.createdById) !== props.id &&
                                (
                                    <>
                                        {
                                            signRole?.sign?.map((item: any) => {
                                                return (
                                                    <>
                                                        {
                                                            item.name === "CONTINUE" && !props?.data?.approvalHistory?.find((item: any) => item.sign === 6) &&
                                                            <button data-testId="submit-approve-btn" type="button" className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => props.handleForward(item.id)}>
                                                                {t('continue')}
                                                            </button>
                                                        }
                                                    </>
                                                )
                                            })
                                        }
                                    </>
                                )}
                        </div>
                    </div>
                </div >
            </div >
        </>
    );
};
export default SwitchBtn;
