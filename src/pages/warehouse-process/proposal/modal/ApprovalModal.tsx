import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import { AddProposalDetail, EditProposalDetail, ProposalForward, ProposalPending } from '@/services/apis/proposal.api';
import { DropdownDepartment, DropdownInventory, DropdownProducts, DropdownSuperior } from '@/services/swr/dropdown.swr';
import { GetQuantity } from '@/services/apis/product.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { useProfile } from '@/services/swr/profile.swr';

interface Props {
    [key: string]: any;
}

const ApprovalModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const [page, setPage] = useState(1);
    const [dataSuperiorDropdown, setDataSuperiorDropdown] = useState<any>([]);
    const [searchSuperior, setSearchSuperior] = useState<any>();
    const [pageDepartment, setPageDepartment] = useState(1);
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [departmentId, setDepartmentId] = useState<any>();

    const SubmittedForm = Yup.object().shape({
        approverId: new Yup.ObjectSchema().required(`${t('please_fill_approver')}`),
        // comment: new Yup.StringSchema().required(`${t('please_fill_approve_content')}`),
    });

    const { data: profile } = useProfile();
    const { data: superiorDropdown, pagination: superiorPagination, isLoading: superiorLoading } = DropdownSuperior({
        page: page,
        documentType: props?.entity,
        search: searchSuperior,
        departmentId: departmentId,
        fromPosition: profile?.data.position.id,
        startPosition: router.query.id === 'create' ? profile?.data.position.id : props?.data?.createdBy.position.id,
        sort: true,
    });
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: pageDepartment, search: searchDepartment });


    const handleProposal = (param: any) => {
        const query = {
            approverId: Number(param.approverId.value),
            comment: param.comment,
            sign: props.sign
        };
        if (props.data?.approvalHistory?.length > 0) {
            ProposalForward({ id: router.query.id, ...query }).then(() => {
                showMessage(`${t('forward_success')}`, 'success');
                props.handleData();
                handleCancel();
                props.handleCancel();
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        } else {
            ProposalPending({ id: router.query.id !== 'create' ? router.query.id : props.id, ...query }).then(() => {
                showMessage(`${t('forward_success')}`, 'success');
                if (Number(router.query.id)) {
                    props.handleData();
                }
                props.handleCancel();
                handleCancel();
            }).catch((err) => {
                showMessage(`${err?.response?.data?.message}`, 'error');
            });
        }
    };

    const handleCancel = () => {
        props.setOpenModal(false);
        props.handleCancel();
    };

    const [defaultValue, setDefaultValue] = useState<any>();

    useEffect(() => {
        setInitialValue({
            approverId: defaultValue,
            comment: '',
            departmentId: profile?.data?.department ? {
                value: `${profile?.data?.department?.id}`,
                label: `${profile?.data?.department?.name}`
            } : ""
        });
        setDepartmentId(profile?.data?.department?.id);
    }, [defaultValue, profile?.data?.department]);

    useEffect(() => {
        if (superiorPagination?.page === undefined) return;
        if (superiorPagination?.page === 1) {
            setDataSuperiorDropdown(superiorDropdown?.data.sort((a: any, b: any) => b.position_level - a.position_level))
        } else {
            setDataSuperiorDropdown([...dataSuperiorDropdown, ...superiorDropdown?.data.sort((a: any, b: any) => b.position_level - a.position_level)])
        }

        for (let index = 0; index < superiorDropdown?.data.length; index++) {
            if (superiorDropdown?.data[index].disabled === false) {
                setDefaultValue(superiorDropdown?.data[index]);
                break;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [superiorPagination])

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(superiorPagination?.page + 1);
        }, 1000);
    }

    const formRef = useRef<any>();

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.handleSubmit()
        }
    };

    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data)
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationDepartment])

    const handleMenuScrollDepartmentToBottom = () => {
        setTimeout(() => {
            setPage(paginationDepartment?.page + 1);
        }, 1000);
    }

    return (
        <Transition appear show={props.openModal ?? false} as={Fragment}>
            <Dialog as="div" open={props.openModal} onClose={() => props.setOpenModal(false)} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel w-full max-w-[700px] overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {/* {props.data === undefined ? t('add_detail') : t('edit_detail')} */}
                                </div>
                                <div>
                                    <div className="p-5">
                                        <Formik
                                            initialValues={initialValue}
                                            validationSchema={SubmittedForm}
                                            onSubmit={async (values, { resetForm }) => {
                                                await handleProposal(values)
                                                resetForm()
                                            }}
                                            innerRef={formRef}
                                            enableReinitialize
                                        >
                                            {({ errors, values, setFieldValue, submitCount }) => (
                                                <Form className="space-y-5" >
                                                    {/* <div className="mb-5 flex justify-between gap-4" >
                                                        <div className=" flex-1">
                                                            <label htmlFor="departmentId" className='label'> {t('department')} < span style={{ color: 'red' }}>* </span></label >
                                                            <Select
                                                                id='departmentId'
                                                                name='departmentId'
                                                                placeholder={t('choose_department')}
                                                                options={dataDepartment}
                                                                maxMenuHeight={160}
                                                                value={values?.departmentId}
                                                                onMenuOpen={() => setPageDepartment(1)}
                                                                onMenuScrollToBottom={handleMenuScrollDepartmentToBottom}
                                                                isLoading={isLoadingDepartment}
                                                                onInputChange={e => setSearchDepartment(e)}
                                                                onChange={e => {
                                                                    setFieldValue('departmentId', e)
                                                                    setDepartmentId(e.value);
                                                                }}
                                                            />
                                                            {submitCount && errors.departmentId ? (
                                                                <div className="text-danger mt-1"> {`${errors.departmentId}`} </div>
                                                            ) : null}
                                                        </div>
                                                    </div> */}
                                                    <div className="mb-5 flex justify-between gap-4" >
                                                        <div className="flex-1" >
                                                            <label htmlFor="approverId" className='label'> {t('approver')} < span style={{ color: 'red' }}> * </span></label >
                                                            <Select
                                                                id='approverId'
                                                                name='approverId'
                                                                options={dataSuperiorDropdown}
                                                                onMenuOpen={() => setPage(1)}
                                                                onMenuScrollToBottom={handleMenuScrollToBottom}
                                                                isLoading={superiorLoading}
                                                                maxMenuHeight={160}
                                                                value={values?.approverId}
                                                                onInputChange={e => setSearchSuperior(e)}
                                                                onChange={e => {
                                                                    setFieldValue('approverId', e)
                                                                }}
                                                                isOptionDisabled={(option) => option.disabled}
                                                            />
                                                            {submitCount && errors.approverId ? (
                                                                <div className="text-danger mt-1"> {`${errors.approverId}`} </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <div className="mb-5">
                                                        <label htmlFor="comment" className='label'> {t('approve_content')} </label >
                                                        <Field autoComplete="off"
                                                            name="comment"
                                                            as="textarea"
                                                            id="comment"
                                                            placeholder={`${t('enter_description')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount && errors.comment ? (
                                                            <div className="text-danger mt-1"> {`${errors.comment}`} </div>
                                                        ) : null}
                                                    </div>
                                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button data-testId="submit-modal-btn" type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmit()}>
                                                            {props?.btnRule ? t('continue_initial') : t('continue_approval')}
                                                        </button>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>

                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
export default ApprovalModal;
