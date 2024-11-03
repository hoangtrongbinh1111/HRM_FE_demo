import { useEffect, Fragment, useState, SetStateAction, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { downloadFile, showMessage } from '@/@core/utils';
import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select, { components, StylesConfig, GroupBase, OptionProps, CSSObjectWithLabel } from 'react-select';
import { DropdownDepartment } from '@/services/swr/dropdown.swr';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Lao } from '@/utils/lao';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import dayjs from 'dayjs';
import { Loader } from '@mantine/core';
import moment from 'moment';
interface Props {
    [key: string]: any;
}

const ModalDate = ({ ...props }: Props) => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const router = useRouter();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const [filter, setFilter] = useState<any>();
    const [isClient, setIsClient] = useState(false);

    const handleCancel = () => {
        setDepartmentId([])
        setFilter({})
        props.setOpenModal(false);
    };
    const [page, setPage] = useState(1);

    const [dataDepartment, setDataDepartment] = useState<any>([]);
    const [departmentId, setDepartmentId] = useState<any>();
    const [queryDepartment, setQueryDepartment] = useState<any>();

    const { data: dropdownDepartment, pagination: paginationDepartment, mutate: mutateDepartment, isLoading: isLoadingDepartment } = DropdownDepartment({ page: page, perPage: 10, search: queryDepartment });
    useEffect(() => {
        mutateDepartment();
    }, [queryDepartment])

    const handleSearchDepartment = (param: any) => {
        setPage(1);
        setQueryDepartment(param);
    };
    useEffect(() => {
        if (paginationDepartment?.page === undefined) return;
        if (paginationDepartment?.page === 1) {
            setDataDepartment(dropdownDepartment?.data);
        } else {
            setDataDepartment([...dataDepartment, ...dropdownDepartment?.data]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationDepartment]);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(paginationDepartment?.page + 1);
        }, 1000);
    };

    const handleChangeDates = (de: any) => {
        if (de?.length === 2) {
            setFilter({
                startDate: dayjs(de[0]).format('YYYY-MM-DD'),
                endDate: dayjs(de[1]).format('YYYY-MM-DD'),
            })
        }
    };
    const handleExportFile = () => {
        if (!filter) {
            showMessage(`${t('please_choose_time')}`, 'warning');
            return;
        } else if (!departmentId) {
            showMessage(`${t('please_choose_department')}`, 'warning');
            return;
        } else {
            setLoading(true);
            const stringQuery = new URLSearchParams({
                startDay: filter?.startDate,
                endDay: filter?.endDate,
            });
            if (Array.isArray(departmentId)) {
                departmentId.forEach(departmentId => {
                    stringQuery.append('departmentIds', departmentId?.value);
                });
            }
            const currentDate = moment().format('DD.MM.YYYY');
            let filename
            switch (props?.keyDownload) {
                case 'timekeeping-staff':
                    filename = `${t(`file_${props?.keyDownload}`)}_${currentDate}`
                    downloadFile(`${filename}.xlsx`, `/timekeeping-staff/export?${stringQuery}`).finally(() => {
                        // setSelectedMonth(null)
                        setDepartmentId([])
                        props?.setOpenModal(false)
                        setLoading(false);
                    })
                    break;
                case 'timekeeping-staff-v2':
                    filename = `${t(`file_timekeeping_staff_v2`)}_${currentDate}`
                    downloadFile(`${filename}.xlsx`, `/timekeeping-staff/export-v2?${stringQuery}`).finally(() => {
                        setDepartmentId([])
                        props?.setOpenModal(false)
                        setLoading(false);
                    })
                    break;
                default:
                    filename = `${t(`file_${props?.keyDownload}`)}_${currentDate}`
                    downloadFile(`${filename}.xlsx`, `/export-report/${props?.keyDownload}?${stringQuery}`).finally(() => {
                        setFilter(null)
                        setDepartmentId([])
                        props?.setOpenModal(false)
                        setLoading(false);
                    })
                    break;
            }

        }
    }
    const customStyles: StylesConfig<any, false> = {
        menuPortal: (base: any) => ({
            ...base,
            zIndex: 9999,
        }),
    };
    const formRef = useRef<any>();

    return (
        <Transition appear show={props.openModal ?? false} as={Fragment}>
            <Dialog as="div" open={props.openModal} onClose={() => { props.setOpenModal(false) }} className="relative z-50">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                            <Dialog.Panel className="panel w-full max-w-[500px] overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => { props.setOpenModal(false) }}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">
                                    {/* {props.data === undefined ? t('add_detail') : t('edit_detail')} */}
                                </div>
                                <div>
                                    <div className="p-5">
                                        <div className="mb-5 flex justify-between gap-4">
                                            <div className="flex-1">
                                                <label htmlFor="departmentId">{t('filter_time')}<span style={{ color: 'red' }}> * </span></label>
                                                <Flatpickr
                                                    className="form-input"
                                                    placeholder={`${t('choose_time_duration')}`}
                                                    options={{
                                                        locale: {
                                                            ...chosenLocale,
                                                        },
                                                        mode: 'range',
                                                        dateFormat: 'd-m-Y',
                                                    }}
                                                    onChange={(e: any) => {
                                                        handleChangeDates(e);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-5 flex justify-between gap-4">
                                            <div className="flex-1">
                                                <label htmlFor="departmentId">{t('choose_department_export')}<span style={{ color: 'red' }}> * </span></label>
                                                <Select
                                                    id="departmentId"
                                                    name="departmentId"
                                                    placeholder={t('choose_department')}
                                                    options={dataDepartment}
                                                    maxMenuHeight={160}
                                                    value={departmentId}
                                                    onMenuOpen={() => setPage(1)}
                                                    onMenuScrollToBottom={handleMenuScrollToBottom}
                                                    isLoading={isLoadingDepartment}
                                                    onInputChange={(e: any) => {
                                                        handleSearchDepartment(e);
                                                    }}
                                                    onChange={(e) => {
                                                        setDepartmentId(e);
                                                    }}
                                                    isMulti
                                                    closeMenuOnSelect={false}
                                                    menuPortalTarget={isClient ? document.body : null}
                                                    styles={{
                                                        option: (base: CSSObjectWithLabel) => ({
                                                            ...base,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            backgroundColor: base.isSelected2
                                                                ? 'rgb(171, 182, 103)'
                                                                : base.isFocused
                                                                    ? 'rgb(210, 214, 165)' // Background color on hover
                                                                    : 'white', // Default background color
                                                            color: base.isSelected2 ? 'white' : 'black',
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

                                                        multiValueLabel: (base: any, { index }) => ({
                                                            ...base,
                                                            display: 'block',
                                                        }),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                            <button type="button" className="btn btn-outline-danger cancel-button" onClick={() => handleCancel()}>
                                                {t('cancel')}
                                            </button>
                                            <button
                                                data-testId="submit-modal-btn" type="button"
                                                disabled={loading}
                                                className="btn btn-primary add-button ltr:ml-4 rtl:mr-4" onClick={() => handleExportFile()}>
                                                {
                                                    loading ? <Loader size="sm" /> : `${t('export_file')}`
                                                }
                                            </button>
                                        </div>

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
export default ModalDate;
