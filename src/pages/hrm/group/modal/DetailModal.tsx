import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import { showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components, CSSObjectWithLabel } from 'react-select';
import { DropdownDepartment, DropdownInventory, DropdownProducts, DropdownUsers } from '@/services/swr/dropdown.swr';
import { AddRepairDetail, EditRepairDetail } from '@/services/apis/repair.api';
import { GetQuantity } from '@/services/apis/product.api';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import { makeRamdomText } from '@/utils/commons';
import { AddGroupDetails } from '@/services/apis/group.api';

interface Props {
    [key: string]: any;
}

const DetailModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [initialValue, setInitialValue] = useState<any>();
    const [dataUserDropdown, setDataUserDropdown] = useState<any>([]);
    const [dataDepartmentDropdown, setDataDepartmentDropdown] = useState<any>([]);
    const [pageUser, setPageUser] = useState(1);
    const [pageDepartment, setPageDepartment] = useState(1);
    const [searchUser, setSearchUser] = useState<any>();
    const [searchDepartment, setSearchDepartment] = useState<any>();
    const [departmentId, setDepartmentId] = useState<any>();
    const [selectedOptions, setSelectedOptions] = useState<any>([]);
    const { data: userDropdown, pagination: userPagination, isLoading: userLoading } = DropdownUsers({ page: pageUser, search: searchUser, departmentId });
    const { data: departmentDropdown, pagination: departmentPagination, isLoading: departmentLoading } = DropdownDepartment({ page: pageDepartment, search: searchDepartment });

    const handleRepairDetail = (param: any) => {
        if (router.query.id !== 'create') {
            const query = {
                id: router.query.id,
                details: selectedOptions.map((item: any) => { return { userId: Number(item.value) } })
            }
            AddGroupDetails({ ...query }).then((res) => {
                console.log("", res)
                handleCancel();
            }).catch((err) => {
                console.log("", err)
            })
        } else {
            props.setListData(selectedOptions);
            handleCancel();
        }

    }

    const handleCancel = () => {
        props.setOpenModal(false);
        // props.setData();
    };

    useEffect(() => {
        setInitialValue({
            departmentId: props?.data ? {
                value: `${props?.data?.replacementPart?.id}`,
                label: `${props?.data?.replacementPart?.name}`
            } : "",
            userId: "",
        })
    }, [props?.data, router]);

    useEffect(() => {
        if (userPagination?.page === undefined) return;
        if (userPagination?.page === 1) {
            setDataUserDropdown(userDropdown?.data)
        } else {
            setDataUserDropdown([...dataUserDropdown, ...userDropdown?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userPagination])

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPageUser(userPagination?.page + 1);
        }, 1000);
    }

    useEffect(() => {
        if (departmentPagination?.page === undefined) return;
        if (departmentPagination?.page === 1) {
            setDataDepartmentDropdown(departmentDropdown?.data)
        } else {
            setDataDepartmentDropdown([...dataDepartmentDropdown, ...departmentDropdown?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentPagination])

    const handleMenuScrollToBottomDepartment = () => {
        setTimeout(() => {
            setPageUser(departmentPagination?.page + 1);
        }, 1000);
    }


    const SubmittedForm = Yup.object().shape({
        // replacementPartId: new Yup.ObjectSchema().required(`${t('please_fill_product')}`),
        // quantity: Yup.string().required(`${t('please_fill_quantity')}`),
    });

    const handleChange = (selected: any) => {
        setSelectedOptions(selected);
    };

    const CustomOption = (props: any) => {
        return (
            <components.Option {...props}>
                <input type="checkbox" checked={props.isSelected} onChange={() => null} style={{ marginRight: 8 }} />
                <label>{props.label}</label>
            </components.Option>
        );
    };

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
                                    className="absolute top-4 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {t('add_receiver_list')}
                                </div>
                                <div className="pl-10 pr-10 p-5 min-h-[400px]">
                                    <Formik
                                        initialValues={initialValue}
                                        validationSchema={SubmittedForm}
                                        onSubmit={values => {
                                            handleRepairDetail(values);
                                        }}
                                        enableReinitialize
                                    >
                                        {({ errors, values, setFieldValue, submitCount }) => (
                                            <Form >
                                                <div className="mb-5 flex justify-between gap-4">
                                                    <div className="flex-1">
                                                        <label htmlFor="departmentId" > {t('department')}</label >
                                                        <Select
                                                            id='departmentId'
                                                            name='departmentId'
                                                            options={dataDepartmentDropdown}
                                                            onMenuOpen={() => setPageDepartment(1)}
                                                            onMenuScrollToBottom={handleMenuScrollToBottom}
                                                            isLoading={userLoading}
                                                            maxMenuHeight={160}
                                                            value={values?.departmentId}
                                                            onInputChange={e => setSearchDepartment(e)}
                                                            onChange={e => {
                                                                setFieldValue('departmentId', e)
                                                                setDepartmentId(e.value)
                                                            }}
                                                        />
                                                        {submitCount && errors.departmentId ? (
                                                            <div className="text-danger mt-1"> {`${errors.departmentId}`} </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label htmlFor="userId" > {t('staff')} </label>
                                                    {/* <Select
                                                        id='userId'
                                                        name='userId'
                                                        options={dataUserDropdown}
                                                        onMenuOpen={() => setPageUser(1)}
                                                        onMenuScrollToBottom={handleMenuScrollToBottom}
                                                        isLoading={userLoading}
                                                        maxMenuHeight={160}
                                                        value={values.userId}
                                                        onInputChange={e => setSearchUser(e)}
                                                        onChange={e => {
                                                            setFieldValue('userId', e)
                                                        }}
                                                        isMulti
                                                    /> */}
                                                    <Select
                                                        id="approverId"
                                                        options={dataUserDropdown}
                                                        maxMenuHeight={160}
                                                        name="approverId"
                                                        value={selectedOptions}
                                                        onChange={handleChange}
                                                        onInputChange={(e) => setSearchUser(e)}
                                                        onMenuOpen={() => setPageUser(1)}
                                                        onMenuScrollToBottom={handleMenuScrollToBottom}
                                                        isMulti
                                                        closeMenuOnSelect={false}
                                                        hideSelectedOptions={false}
                                                        isLoading={userLoading}
                                                        components={{ Option: CustomOption }}
                                                        // placeholder={t('Choose staff')}
                                                        styles={{
                                                            option: (base: CSSObjectWithLabel) => ({
                                                                ...base,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                backgroundColor: base.isSelected
                                                                    ? 'rgb(171, 182, 103)' // Background color when selected
                                                                    : base.isFocused
                                                                        ? 'rgb(210, 214, 165)' // Background color on hover
                                                                        : 'white', // Default background color
                                                                color: base.isSelected ? 'white' : 'black',
                                                                ':active': {
                                                                    backgroundColor: 'rgb(171, 182, 103)', // Background color when selected and clicked
                                                                    color: 'white',
                                                                },
                                                            }),
                                                            control: (base: CSSObjectWithLabel) => ({
                                                                ...base,
                                                                minHeight: '40px',
                                                            }),
                                                            menuPortal: (base: CSSObjectWithLabel) => ({
                                                                ...base,
                                                                zIndex: 9999,
                                                            }),
                                                            multiValue: (base: any, { index }) => ({
                                                                ...base,
                                                                display: index === 0 ? 'flex' : 'none',
                                                            }),
                                                            multiValueLabel: (base: any, { index }) => ({
                                                                ...base,
                                                                display: index === 0 ? 'block' : 'none', // Only show the label of the first item
                                                            }),
                                                        }}
                                                    />
                                                    {submitCount && errors.userId ? (
                                                        <div className="text-danger mt-1"> {`${errors.userId}`} </div>
                                                    ) : null}
                                                </div>
                                                <div className="p-[15px] flex items-center justify-center ltr:text-right rtl:text-left mt-[120px]">
                                                    <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                        {t('cancel')}
                                                    </button>
                                                    <button data-testId='submit-modal-btn' type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4 add-button">
                                                        {props.data !== undefined ? t('update') : t('add_new')}
                                                    </button>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>

                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};
export default DetailModal;
