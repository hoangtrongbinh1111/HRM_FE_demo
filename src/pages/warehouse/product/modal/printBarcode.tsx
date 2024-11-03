import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import IconX from '@/components/Icon/IconX';
import { useRouter } from 'next/router';
import Select from 'react-select';
import { DropdownProducts } from '@/services/swr/dropdown.swr';
import 'flatpickr/dist/flatpickr.css';
import { DataTable } from 'mantine-datatable';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewEdit from '@/components/Icon/IconNewEdit';
import QuantityModal from './quantityModal';
import { PrintBarcodeApi } from '@/services/apis/product.api';
import { IconLoading } from '@/components/Icon/IconLoading';
import { showMessage } from '@/@core/utils';

interface Props {
    [key: string]: any;
}

const PrintBarcode = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [dataProductDropdown, setDataProductDropdown] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [searchProduct, setSearchProduct] = useState<any>();
    const [data, setData] = useState<any>([]);
    const [detail, setDetail] = useState<any>();
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: productDropdown, pagination: productPagination, isLoading: productLoading } = DropdownProducts({ page: page, search: searchProduct, warehouseId: props?.warehouseId });

    const handleCancel = () => {
        props.setOpenModal(false);
        setData([]);
    };

    useEffect(() => {
        setData(props?.data ? props?.data?.map((item: any) => {
            return {
                value: item.product.id,
                label: item.product.name,
                code: item.product.code,
                quantity: item.proposalQuantity,
                barcode: item.product.barcode,
            }
        }) : props?.dataDetail ? [
            {
                value: props?.dataDetail.id,
                label: props?.dataDetail.name,
                code: props?.dataDetail.code,
                quantity: 1,
                barcode: props?.dataDetail.barcode
            }
        ] : []);
    }, [props?.data, props?.dataDetail])

    useEffect(() => {
        if (productPagination?.page === undefined) return;
        if (productPagination?.page === 1) {
            setDataProductDropdown(productDropdown?.data)
        } else {
            setDataProductDropdown([...dataProductDropdown, ...productDropdown?.data])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productPagination])

    const handleMenuScrollToBottom = () => {
        setTimeout(() => {
            setPage(productPagination?.page + 1);
        }, 1000);
    }

    const columns = [
        {
            accessor: 'value',
            title: '#',
            render: (records: any, index: any) => <span>{index + 1}</span>,
        },
        { accessor: 'code', title: `${t('code_product')}`, sortable: false },
        { accessor: 'label', title: `${t('name_product')}`, sortable: false },
        { accessor: 'barcode', title: 'barcode', sortable: false },
        {
            accessor: 'quantity',
            title: `${t('quantity')}`,
            sortable: false,
            width: "13%",
            render: (records: any) => {
                return (
                    <div>
                        <input
                            value={records?.quantity}
                            type="number"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[160px] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={e => setData(
                                data.map((item: any) => {
                                    if (item.value === records.value) {
                                        return {
                                            ...item,
                                            quantity: e.target.value
                                        }
                                    } else {
                                        return item
                                    }
                                })
                            )}
                        />
                    </div>
                )
            }
        },
        {
            accessor: 'action',
            title: `${t('action')}`,
            titleClassName: 'text-center',
            width: '10%',
            render: (records: any) => (
                <div className="flex justify-center gap-2 pr-2">
                    {/* <div className="w-[auto]">
                        <button type='button' className='button-edit' onClick={e => handleEdit(records)}>
                            <IconNewEdit /> <span>{t('edit')}</span>
                        </button>
                    </div> */}
                    <div className="w-[auto]">
                        <button type="button" className='button-delete' onClick={e => handleDelete(records)}>
                            <IconNewTrash />
                            <span>
                                {t('delete')}
                            </span>
                        </button>
                    </div>
                </div>
            ),
        },
    ];

    const handleDelete = (param: any) => {
        setData(data.filter((item: any) => (item.value !== param.value)));
    }

    const handleEdit = (param: any) => {
        setDetail(param);
        setOpenModal(true);
    }

    const printBarcode = () => {
        setLoading(true);
        PrintBarcodeApi({
            products: data.map((item: any) => {
                return {
                    id: item.value !== undefined ? item.value : item.id,
                    quantity: item.quantity
                }
            }),
            "config": {
                "format": "a4"
            }
        })
            .then((response: any) => {
                const url = window.URL.createObjectURL(new Blob([response]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'barcode.pdf');
                document.body.appendChild(link);
                link.click();
                setLoading(false);
                if (!response.error) {
                    showMessage('Tải file thành công', 'success')
                }
            }).catch((err) => {
                setLoading(false);
                showMessage(err?.response?.data?.message, 'error')
            });
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
                            <Dialog.Panel className="panel w-full max-w-[100%] overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => handleCancel()}
                                    className="absolute top-4 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    {t('print_barcode')}
                                </div>
                                <div>
                                    {loading && (
                                        <div className="screen_loader fixed inset-0 bg-[#fafafa] dark:bg-[#060818] z-[60] grid place-content-center animate__animated">
                                            <IconLoading />
                                        </div>
                                    )}
                                    <div className="p-5 pl-10 pr-10">
                                        <div className="w-[30%] mb-4.5">
                                            <Select
                                                options={dataProductDropdown}
                                                onMenuOpen={() => setPage(1)}
                                                onMenuScrollToBottom={handleMenuScrollToBottom}
                                                isLoading={productLoading}
                                                maxMenuHeight={160}
                                                onInputChange={e => setSearchProduct(e)}
                                                value={''}
                                                onChange={(e: any) => {
                                                    const param = {
                                                        ...e,
                                                        quantity: 1
                                                    }
                                                    if (data?.find((item: any) => item.value === param.value)) {
                                                        return;
                                                    }
                                                    setData([...data, param])
                                                }}
                                                className='z-50'
                                            />
                                        </div>
                                        <div className="datatables">
                                            <DataTable
                                                highlightOnHover
                                                className="whitespace-nowrap table-hover custom_table"
                                                records={data}
                                                columns={columns}
                                                // totalRecords={pagination?.totalRecords}
                                                // recordsPerPage={pagination?.perPage}
                                                // page={pagination?.page}
                                                // onPageChange={(p) => handleChangePage(p, pagination?.perPage)}
                                                // recordsPerPageOptions={PAGE_SIZES}
                                                // onRecordsPerPageChange={(e) => handleChangePage(pagination?.page, e)}
                                                // sortStatus={sortStatus}
                                                // onSortStatusChange={setSortStatus}
                                                minHeight={400}
                                            // paginationText={({ from, to, totalRecords }) => `${t('Showing_from_to_of_totalRecords_entries', { from: from, to: to, totalRecords: totalRecords })}`}
                                            />
                                        </div>
                                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                            <button data-testid={'submit-btn'} type="button" className="btn btn-primary add-button" onClick={e => printBarcode()}>
                                                {t('print')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                    <QuantityModal openModal={openModal} setOpenModal={setOpenModal} data={data} setData={setData} detail={detail} />
                </div>
            </Dialog>
        </Transition>
    );
};
export default PrintBarcode;
