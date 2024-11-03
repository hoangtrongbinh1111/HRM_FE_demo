import { useEffect, Fragment, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import * as Yup from 'yup';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { IconLoading } from '@/components/Icon/IconLoading';
import { Formik, Form, Field } from 'formik';
import Select, { components } from 'react-select';
import { DropdownDepartment, DropdownPosition } from '@/services/swr/dropdown.swr';
import IconBackward from '@/components/Icon/IconBackward';
import Link from 'next/link';
import { CreateAccessControl, EditAccessControl, GetAccessControl } from '@/services/apis/access-control.api';
import { showMessage } from '@/@core/utils';
import { useDebounce } from 'use-debounce';
import { loadMore } from '@/utils/commons';

interface Props {
    [key: string]: any;
}

const DocumentDetailPage = ({ ...props }: Props) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const router = useRouter();
    useEffect(() => {
        dispatch(setPageTitle(data !== undefined ? t('edit_document') : t('create_document')));
    });
    const [disable, setDisable] = useState(false);
    const [block, setBlock] = useState(false);
    const [pageDepartment, setPageDepartment] = useState(1);
    const [pagePosition, setPagePosition] = useState(1);
    const [dataDepartmentDropdown, setDataDepartmentDropdown] = useState<any>([]);
    const [dataPositionDropdown, setDataPositionDropdown] = useState<any>([]);
    const [checked, setChecked] = useState<any>([]);
    const [data, setData] = useState<any>();
    const [query, setQuery] = useState<any>();
    const [queryDepartment, setQueryDepartment] = useState<any>();
    const [debouncedQuery] = useDebounce(queryDepartment, 500);
    const [queryPosition, setQueryPosition] = useState<any>();
    const [debouncedQueryPosition] = useDebounce(queryPosition, 500);

    const [loadDetail, setLoadDetail] = useState(true);
    const [isAdd, setIsAdd] = useState(false);
    const { data: departmentDropdown, pagination: departmentPagination, isLoading: departmentLoading } = DropdownDepartment({ page: pageDepartment, search: debouncedQuery?.search });
    const { data: positionDropdown, pagination: positionPagination, isLoading: positionLoading } = DropdownPosition({ page: pagePosition, search: debouncedQueryPosition?.search });
    const handleCancel = () => {
        const queryParams = {
            page: router?.query?.page?.toString(),
            perPage: router?.query?.perPage?.toString(),
            positionId: router?.query?.positionId?.toString(),
            departmentId: router?.query?.departmentId?.toString(),
        };

        // Filter out undefined values and ensure all values are strings
        const filteredQueryParams = Object.fromEntries(
            Object.entries(queryParams)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => [key, value as string]) // Cast to string to ensure compatibility
        );

        // Create the query string using URLSearchParams
        const queryString = new URLSearchParams(filteredQueryParams).toString();

        router.push(`/hrm/document?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`);
    };

    useEffect(() => {
        if (Number(router.query.id)) {
            GetAccessControl({ id: router.query.id })
                .then((res) => {
                    setLoadDetail(false);
                    setData(res.data);
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
            setBlock(true);
        }
    }, [router]);

    useEffect(() => {
        if (data?.canViewOwnDepartment === true) {
            setChecked([1]);
        } else if (data?.canViewAllDepartments === true) {
            setChecked([2]);
        } else if (data?.canViewSpecificDepartment === true) {
            setChecked([3]);
            setDisable(true);
        }
    }, [data]);

    useEffect(() => {
        if (departmentPagination?.page === undefined) return;
        if (departmentPagination?.page === 1) {
            setDataDepartmentDropdown(departmentDropdown?.data);
        } else {
            setDataDepartmentDropdown([...dataDepartmentDropdown, ...departmentDropdown?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentPagination]);

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPageDepartment(departmentPagination?.page + 1);
        }, 1000);
    };
    const handleSearchDepartment = (param: any) => {
        setQueryDepartment({ search: param });
    };
    const handleSearchDepartment1 = (param: any) => {
        setQueryDepartment({ search: param });
    };
    useEffect(() => {
        if (positionPagination?.page === undefined) return;
        if (positionPagination?.page === 1) {
            setDataPositionDropdown(positionDropdown?.data);
        } else {
            setDataPositionDropdown([...dataPositionDropdown, ...positionDropdown?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [positionPagination]);

    const handleMenuScrollPositionToBottom = () => {
        setTimeout(() => {
            setPagePosition(positionPagination?.page + 1);
        }, 1000);
    };
    const handleSearch = (param: any) => {
        setQuery({ search: param });
    };
    const handleSearchPosition = (param: any) => {
        setQueryPosition({ search: param });
    };
    const handleDocument = (param: any) => {
        const query: any = {
            departmentId: param.departmentId.value,
            positionId: param.positionId.value,
            entity: param.entity.value,
            canViewOwnDepartment: checked.includes(1) ? true : false,
            canViewAllDepartments: checked.includes(2) ? true : false,
            canViewSpecificDepartment: checked.includes(3) ? true : false,
        };
        if (disable) {
            query.departmentIds = param.departmentIds.map((item: any) => {
                return item.value;
            });
        }
        setIsAdd(true);

        if (data) {
            EditAccessControl({ id: router.query.id, ...query })
                .then(() => {
                    showMessage(`${t('edit_success')}`, 'success');
                    handleCancel();
                })
                .catch((err) => {
                    setIsAdd(false);
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        } else {
            CreateAccessControl({ ...query })
                .then(() => {
                    showMessage(`${t('create_success')}`, 'success');
                    handleCancel();
                })
                .catch((err) => {
                    setIsAdd(false);
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        }
    };

    const document: any = [
        { value: 'leavingLateEarly', label: `${t('leavingLateEarly')}` },
        { value: 'forgotCheckinOut', label: `${t('forgotCheckinOut')}` },
        { value: 'leaveApplication', label: `${t('leaveApplication')}` },
        { value: 'resignationLetter', label: `${t('resignationLetter')}` },
        { value: 'paymentRequestList', label: `${t('paymentRequestList')}` },
        { value: 'paymentOrder', label: `${t('paymentOrder')}` },
        { value: 'drivingOrder', label: `${t('driving_order')}` },
        { value: 'travelPaper', label: `${t('travelPaper')}` },
        { value: 'confirmPortal', label: `${t('confirm_portal')}` },
        { value: 'requestOvertime', label: `${t('requestOvertime')}` },
        { value: 'requestAdvancePayment', label: `${t('request_advance_payment')}` },
        { value: 'trackingLog', label: `${t('trackingLog')}` },
        { value: 'guestNotice', label: `${t('guest_notice')}` },
        { value: 'riceCoupon', label: `${t('riceCoupon')}` },
        { value: 'mealCancel', label: `${t('meal_cancel')}` },
        { value: 'foodVoucher', label: `${t('food_voucher')}` },
        { value: 'requestAdditionalPersonnel', label: `${t('requestAdditionalPersonnel')}` },
        { value: 'requestShiftChange', label: `${t('requestShiftChange')}` },
        { value: 'otherDocument', label: `${t('otherDocument')}` },
        { value: 'timeAttendance', label: `${t('timeAttendance')}` },
        { value: 'proposal', label: `${t('proposal')}` },
        { value: 'order', label: `${t('proposal_order')}` },
        { value: 'repairRequest', label: `${t('repair_request')}` },
        { value: 'warehousingBill', label: `${t('wareHousingBillExportImport')}` },
        { value: 'stocktake', label: `${t('proposal_stocktake')}` },
    ];

    const returnValue = (param: any) => {
        switch (param) {
            case 'leavingLateEarly':
                return { value: 'leavingLateEarly', label: `${t('leavingLateEarly')}` };
            case 'forgotCheckinOut':
                return { value: 'forgotCheckinOut', label: `${t('forgotCheckinOut')}` };
            case 'leaveApplication':
                return { value: 'leaveApplication', label: `${t('leaveApplication')}` };
            case 'resignationLetter':
                return { value: 'resignationLetter', label: `${t('resignationLetter')}` };
            case 'paymentRequestList':
                return { value: 'paymentRequestList', label: `${t('paymentRequestList')}` };
            case 'paymentOrder':
                return { value: 'paymentOrder', label: `${t('paymentOrder')}` };
            case 'drivingOrder':
                return { value: 'drivingOrder', label: `${t('driving_order')}` };
            case 'travelPaper':
                return { value: 'travelPaper', label: `${t('travelPaper')}` };
            case 'confirmPortal':
                return { value: 'confirmPortal', label: `${t('confirm_portal')}` };
            case 'requestOvertime':
                return { value: 'requestOvertime', label: `${t('requestOvertime')}` };
            case 'requestAdvancePayment':
                return { value: 'requestAdvancePayment', label: `${t('requestAdvancePayment')}` };
            case 'trackingLog':
                return { value: 'trackingLog', label: `${t('trackingLog')}` };
            case 'riceCoupon':
                return { value: 'riceCoupon', label: `${t('riceCoupon')}` };
            case 'foodVoucher':
                return { value: 'foodVoucher', label: `${t('food_voucher')}` };
            case 'requestAdditionalPersonnel':
                return { value: 'requestAdditionalPersonnel', label: `${t('requestAdditionalPersonnel')}` };
            case 'requestShiftChange':
                return { value: 'requestShiftChange', label: `${t('requestShiftChange')}` };
            case 'otherDocument':
                return { value: 'otherDocument', label: `${t('otherDocument')}` };
            case 'timeAttendance':
                return { value: 'timeAttendance', label: `${t('timeAttendance')}` };
            case 'proposal':
                return { value: 'proposal', label: `${t('proposal')}` };
            case 'order':
                return { value: 'order', label: `${t('proposal_order')}` };
            case 'warehousingBill':
                return { value: 'warehousingBill', label: `${t('wareHousingBillExportImport')}` };
            case 'stocktake':
                return { value: 'stocktake', label: `${t('proposal_stocktake')}` };
            default:
                return { value: 'repairRequest', label: `${t('repair_request')}` };
        }
    };
    return (
        <div>
            {loadDetail && data !== undefined && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )}
            <div>
                <div className="mb-1 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <ul className="mb-1 flex space-x-2 rtl:space-x-reverse">
                        <li>
                            <Link href="/hrm/dashboard" className="text-primary hover:underline">
                                {t('dashboard')}
                            </Link>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <Link href="/hrm/document" className="text-primary hover:underline">
                                <span>{t('document_level')}</span>
                            </Link>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <span>{data !== undefined ? t('edit_document') : t('create_document')}</span>
                        </li>
                    </ul>
                </div>
                <div className="header-page-bottom mb-4 flex justify-between pb-4">
                    <h1 className="page-title">{data !== undefined ? t('edit_document') : t('create_document')}</h1>
                    <Link href={`/hrm/document?page=${router?.query?.page ?? 1}&perPage=${router?.query?.perPage ?? 10}`}>
                        <div className="btn btn-primary btn-sm back-button m-1 h-9">
                            <IconBackward />
                            <span>{t('back')}</span>
                        </div>
                    </Link>
                </div>
                <div className="p-5">
                    <Formik
                        initialValues={{
                            departmentId: data?.department
                                ? {
                                    value: `${data?.department?.id}`,
                                    label: `${data?.department?.name}`,
                                }
                                : '',
                            positionId: data
                                ? {
                                    value: `${data?.position?.id}`,
                                    label: `${data?.position?.name}`,
                                }
                                : '',
                            entity: data ? returnValue(data?.entity) : '',
                            departmentIds: data
                                ? data?.departments?.map((item: any) => {
                                    return {
                                        label: item.name,
                                        value: item.id,
                                    };
                                })
                                : '',
                        }}
                        onSubmit={(values) => {
                            handleDocument(values);
                        }}
                        enableReinitialize
                    >
                        {({ errors, values, setFieldValue, submitCount }) => (
                            <Form className="space-y-5">
                                <div className="mb-5 flex justify-between gap-4">
                                    <div className="w-1/2">
                                        <label htmlFor="departmentId" className="label">
                                            {' '}
                                            {t('department')}
                                        </label>
                                        <Select
                                            id="departmentId"
                                            name="departmentId"
                                            options={dataDepartmentDropdown}
                                            onMenuOpen={() => setPageDepartment(1)}
                                            onMenuScrollToBottom={handleMenuScrollToBottom}
                                            isLoading={departmentLoading}
                                            onInputChange={(e) => handleSearchDepartment(e)}
                                            placeholder={t('choose_department')}
                                            maxMenuHeight={160}
                                            value={values?.departmentId}
                                            onChange={(e: any) => {
                                                setFieldValue('departmentId', e);
                                            }}
                                            isDisabled={block}
                                        />
                                        {submitCount && errors.departmentId ? <div className="mt-1 text-danger"> {`${errors.departmentId}`} </div> : null}
                                    </div>
                                    <div className="w-1/2">
                                        <label htmlFor="positionId" className="label">
                                            {' '}
                                            {t('position')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Select
                                            id="positionId"
                                            name="positionId"
                                            options={dataPositionDropdown}
                                            onMenuOpen={() => setPagePosition(1)}
                                            placeholder={`${t('choose_position')}`}
                                            onInputChange={(e) => handleSearchPosition(e)}
                                            onMenuScrollToBottom={handleMenuScrollPositionToBottom}
                                            isLoading={positionLoading}
                                            maxMenuHeight={160}
                                            value={values?.positionId}
                                            onChange={(e: any) => {
                                                setFieldValue('positionId', e);
                                            }}
                                            isDisabled={block}
                                        />
                                        {submitCount && errors.positionId ? <div className="mt-1 text-danger"> {`${errors.positionId}`} </div> : null}
                                    </div>
                                </div>
                                <div className="mb-5 flex justify-between gap-4">
                                    <div className="w-1/2">
                                        <label htmlFor="entity" className="label">
                                            {' '}
                                            {t('document')} <span style={{ color: 'red' }}>* </span>
                                        </label>
                                        <Select
                                            id="entity"
                                            name="entity"
                                            options={document || []}
                                            maxMenuHeight={160}
                                            placeholder={`${t('choose_document')}`}
                                            value={values?.entity}
                                            onChange={(e: any) => {
                                                setFieldValue('entity', e);
                                            }}
                                            isDisabled={block}
                                        />
                                        {submitCount && errors.entity ? <div className="mt-1 text-danger"> {`${errors.entity}`} </div> : null}
                                    </div>
                                    <div className="grid w-1/2 grid-cols-3 gap-2 pl-2.5">
                                        <label className="label mt-8 flex basis-1/3 items-center">
                                            <Field
                                                autoComplete="off"
                                                className="mr-2"
                                                type="checkbox"
                                                name="allDepartment"
                                                value={checked.includes(1)}
                                                checked={checked.includes(1)}
                                                onChange={(e: any) => {
                                                    setChecked(checked.includes(1) ? [] : [1]);
                                                    setDisable(false);
                                                }}
                                            />
                                            {t('View my department')}
                                        </label>
                                        <label className="label mt-8 flex basis-1/3 items-center">
                                            <Field
                                                autoComplete="off"
                                                className="mr-2"
                                                type="checkbox"
                                                name="all"
                                                value={checked.includes(2)}
                                                checked={checked.includes(2)}
                                                onChange={(e: any) => {
                                                    setChecked(checked.includes(2) ? [] : [2]);
                                                    setDisable(false);
                                                }}
                                            />
                                            {t('View all departments')}
                                        </label>
                                        <label className="label mt-8 flex basis-1/3 items-center">
                                            <Field
                                                autoComplete="off"
                                                className="mr-2"
                                                type="checkbox"
                                                name="allByDepartment"
                                                value={checked.includes(3)}
                                                checked={checked.includes(3)}
                                                onChange={(e: any) => {
                                                    setChecked(checked.includes(3) ? [] : [3]);
                                                    setDisable(!disable);
                                                }}
                                            />
                                            {t('View particular departments')}
                                        </label>
                                    </div>
                                </div>
                                <div className="mb-5 flex justify-between gap-4">
                                    {disable && (
                                        <div className="w-1/2">
                                            <label htmlFor="departmentIds" className="label">
                                                {' '}
                                                {t('department_list')} <span style={{ color: 'red' }}>* </span>
                                            </label>
                                            <Select
                                                id="departmentIds"
                                                name="departmentIds"
                                                options={dataDepartmentDropdown}
                                                onMenuOpen={() => setPageDepartment(1)}
                                                onInputChange={(e) => handleSearchDepartment1(e)}
                                                onMenuScrollToBottom={handleMenuScrollToBottom}
                                                isLoading={departmentLoading}
                                                maxMenuHeight={160}
                                                value={values?.departmentIds}
                                                onChange={(e: any) => {
                                                    setFieldValue('departmentIds', e);
                                                }}
                                                isMulti
                                                placeholder={`${t('choose_department')}`}
                                            />
                                            {submitCount && errors.departmentIds ? <div className="mt-1 text-danger"> {`${errors.departmentIds}`} </div> : null}
                                        </div>
                                    )}
                                    <div className="w-1/2"></div>
                                </div>
                                <div className="flex items-center justify-end gap-4 pt-[40px]">
                                    <button data-testid={'cancel-btn'} type="button" className="btn btn-outline-danger cancel-button ml-4" onClick={() => handleCancel()}>
                                        {t('cancel')}
                                    </button>
                                    <button data-testid={'submit-btn'} type="submit" className="btn btn-primary add-button" disabled={isAdd}>
                                        {data !== undefined ? t('update') : t('add')}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default DocumentDetailPage;
