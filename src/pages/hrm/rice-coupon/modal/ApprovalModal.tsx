import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components } from 'react-select';
import { DropdownSuperior } from '@/services/swr/dropdown.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { RiceCouponForward } from '@/services/apis/rice-coupon.api';
import { DropdownDepartment } from '@/services/swr/dropdown.swr';
import { useProfile } from '@/services/swr/profile.swr';
import { Loader } from '@mantine/core';

interface Props {
    [key: string]: any;
}

const ApprovalModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataSuperiorDropdown, setDataSuperiorDropdown] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [searchSuperior, setSearchSuperior] = useState<any>();
    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [departmentId, setDepartmentId] = useState<any>();
    const { data: userData } = useProfile();
    const SubmittedForm = Yup.object().shape({
        approverId: new Yup.ObjectSchema().required(`${t('please_fill_approver')}`),
        comment: Yup.string()
    });
    const [isHigh, setIsHigh] = useState<any>('false');
    const [isSubmit, setIsSubmit] = useState(false);
    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, perPage: 100 });

    const { data: superiorDropdown, pagination: superiorPagination, isLoading: superiorLoading } = DropdownSuperior({
        page: page,
        search: searchSuperior,
        departmentId: departmentId,
        fromPosition: userData?.data.position.id,
        startPosition: router.query.id === 'create' ? userData?.data.position.id : props?.data?.createdBy.position.id,
        documentType: 'rice-coupon'
    });

    const handleProposal = (param: any) => {
        setIsSubmit(true);
        const dataSubmit = {
            approverId: Number(param.approverId.value),
            comment: param.comment,
            sign: props.sign,
        };
        const id_ = router.query.id !== 'create' ? router.query.id : props.createdId
        RiceCouponForward({ id: id_, ...dataSubmit }).then(() => {
            if (props.sign === 2) {
                showMessage(`${t('forward_success')}`, 'success');
            } else {
                showMessage(`${t('continue_initial_success')}`, 'success');
            }
            props.handleCancel();
            router.push(`/hrm/rice-coupon`)
        }).catch((err) => {
            showMessage(`${err?.response?.data?.message}`, 'error');
        }).finally(() => {
            setIsSubmit(false);
        });
    };
    const handleCancel = () => {
        props.setOpenModal(false);
        if (props.createdId) {
            router.push(`/hrm/rice-coupon/${props.createdId}`)
        }
    };

    const [defaultValue, setDefaultValue] = useState<any>();
    useEffect(() => {
        setInitialValue({
            approverId: defaultValue,
            comment: '',
            sign: props.sign,
        })
        if (router?.query.id === "create") {
            setDepartmentId(userData?.data?.department?.id)
        } else {
            setDepartmentId(props?.departmentId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props?.data, dataSuperiorDropdown.length, departmentId]);

    useEffect(() => {
        if (superiorPagination?.page === undefined) return;
        if (superiorPagination?.page === 1) {
            if (isHigh === "true") {
                setDataSuperiorDropdown(superiorDropdown?.data)
            } else {
                const dataSuperior = superiorDropdown?.data?.filter((item: any) => item.value !== userData?.data?.id)
                setDataSuperiorDropdown(dataSuperior)
            }
        } else {
            const dataSuperior = [...dataSuperiorDropdown, ...superiorDropdown?.data]
            if (isHigh === "true") {
                setDataSuperiorDropdown(dataSuperior)
            } else {
                setDataSuperiorDropdown(dataSuperior?.filter((item: any) => item.value !== userData?.data?.id))
            }
        }

        if (departmentId) {
            for (let index = 0; index < superiorDropdown?.data.length; index++) {
                if (superiorDropdown?.data[index].disabled === false) {
                    setDefaultValue(superiorDropdown?.data[index]);
                    break;
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [superiorPagination])
    useEffect(() => {
        if (departmentId) {
            for (let index = 0; index < superiorDropdown?.data.length; index++) {
                if (superiorDropdown?.data[index].disabled === false) {
                    setDefaultValue(superiorDropdown?.data[index]);
                    break;
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentId])
    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data)
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentId])

    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data)
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationDepartment]);

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

    return (
        <Transition appear show={props.openModal ?? false} as={Fragment}>
            <Dialog as="div" open={props.openModal} onClose={() => handleCancel()} className="relative z-50">
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
                                                        <div className="flex-1" >
                                                            <label htmlFor="approverId" > {t('choose_department')} < span style={{ color: 'red' }}>* </span></label >
                                                            <Select
                                                                id='departmentId'
                                                                name='departmentId'
                                                                placeholder={t('choose_department')}
                                                                options={dataDepartment}
                                                                maxMenuHeight={160}
                                                                value={dataDepartment?.find((e: any) => e.value === departmentId)}
                                                                onMenuOpen={() => setPage(1)}
                                                                onMenuScrollToBottom={handleMenuScrollToBottom}
                                                                isLoading={isLoadingDepartment}
                                                                onChange={e => {
                                                                    setDepartmentId(e?.value)
                                                                }}
                                                            />
                                                        </div>
                                                    </div> */}
                                                    <div className="mb-5 flex justify-between gap-4" >
                                                        <div className="flex-1" >
                                                            <label htmlFor="approverId" > {t('choose_approver')} < span style={{ color: 'red' }}>* </span></label >
                                                            <Select
                                                                id='approverId'
                                                                name='approverId'
                                                                options={dataSuperiorDropdown}
                                                                onMenuOpen={() => setPage(1)}
                                                                onMenuScrollToBottom={handleMenuScrollToBottom}
                                                                placeholder={t("choose_approver")}

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
                                                        <label htmlFor="comment" > {t('submit_content')}</label >
                                                        <Field autoComplete="off"
                                                            name="comment"
                                                            as="textarea"
                                                            id="comment"
                                                            placeholder={`${t('enter_description')}`}
                                                            className="form-input"
                                                        />
                                                        {submitCount ? errors.comment ? <div className="mt-1 text-danger"> {`${errors.comment}`} </div> : null : ''}
                                                    </div>
                                                    <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                        <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                            {t('cancel')}
                                                        </button>
                                                        <button data-testId="submit-modal-btn" type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button" onClick={() => handleSubmit()}>
                                                            {isSubmit ? <Loader size="sm" /> : props.sign === 2 ? t('continue_approval') : t('continue_initial')}
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
