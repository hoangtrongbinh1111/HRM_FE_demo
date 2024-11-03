import { useEffect, Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, Transition } from '@headlessui/react';

import IconX from '@/components/Icon/IconX';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewUnion from '@/components/Icon/IconNewUnion1';
import AddShiftTimekeepingModal from './AddShiftTimekeeping';
import DetailShift from './DetailShift'
import dayjs from 'dayjs';
import moment from 'moment';
interface Props {
    [key: string]: any;
}

const customSortKey = (s: any) => {
    return s.split(/(\d+)/).map((text: any) => (isNaN(text) ? text : parseInt(text)));
};

const DetailShiftUserModal = ({ ...props }: Props) => {
    const { t } = useTranslation();
    const [showAddShift, setShowAddShift] = useState(false);
    const [selectedShiftDetail, setSelectedShiftDetail] = useState(null);
    const [showDetailShift, setShowDetailShift] = useState(false);
    const [listShift, setListShift] = useState([]);
    useEffect(() => {
        const listSort = props?.selectedCell?.shiftInfo?.sort((shiftA: any, shiftB: any) => {
            const a = shiftA?.shift.name
            const b = shiftB?.shift.name
            const aKey = customSortKey(a);
            const bKey = customSortKey(b);

            // So sánh từng phần của chuỗi a và b
            for (let i = 0; i < Math.max(aKey.length, bKey.length); i++) {
                if (aKey[i] === undefined) return -1;
                if (bKey[i] === undefined) return 1;
                if (aKey[i] < bKey[i]) return -1;
                if (aKey[i] > bKey[i]) return 1;
            }
            return 0;
        });
        setListShift(listSort);
    }, [props?.selectedCell]);

    const handleCancel = () => {
        setShowAddShift(false);
        props?.handleCancel();
    }
    const handleDetailShiftCancel = () => {
        setShowDetailShift(false);
        setSelectedShiftDetail(null)
        props?.handleCancel();
    }
    const handleDetail = (id: any) => {
        setSelectedShiftDetail(id)
        setShowDetailShift(true);
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
                            <Dialog.Panel className="panel w-full max-w-xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button
                                    type="button"
                                    onClick={() => props?.handleCancel()}
                                    className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                >
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                                    <span>{t('shift_of_staff')} </span>
                                    <span className='uppercase'>{props?.selectedCell?.staffInfo?.fullName} - {t(props?.selectedCell?.date?.dayOfWeek)} {props?.selectedCell?.date?.date}/{props?.selectedCell?.date?.month}</span>
                                </div>
                                <div className="panel">
                                    <div className="mb-4.5 grid grid-cols-2 gap-x-4 gap-y-4 md:gap-x-6">
                                        {
                                            listShift?.map((shift: any, index: any) => {
                                                const status = props?.listStatus[shift?.status ?? 0]
                                                return <div className="p-2 text-center flex justify-center shift-item"
                                                    key={index}
                                                    style={{
                                                        border: `1px solid #${status?.color}`,
                                                        backgroundColor: `${status?.background}`,
                                                        borderRadius: "5px",
                                                        // marginLeft: "5px"
                                                    }}
                                                >
                                                    <div style={{
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        margin: "auto"
                                                    }}>
                                                        <span>{shift?.shift?.name}</span>
                                                        <span style={{ fontSize: "10px" }}>({shift?.startTime ? dayjs(shift?.startTime).format('HH:mm') : '-:-'} - {shift?.endTime ? dayjs(shift?.endTime).format('HH:mm') : '-:-'})</span>
                                                    </div>
                                                    <button
                                                        className="view-button"
                                                        onClick={() => handleDetail(shift?.id)}
                                                    >
                                                        <IconNewEye />
                                                    </button>
                                                </div>
                                            })
                                        }
                                        <div className="p-2 text-center"
                                            style={{
                                                border: `1px dashed #ccc`,
                                                backgroundColor: "#fff",
                                                borderRadius: "5px",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                cursor: "pointer",
                                                height: "50px"
                                            }}
                                            onClick={() => setShowAddShift(true)}
                                        >
                                            <button
                                                className="add-shift-btn"
                                            >
                                                <IconNewUnion />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {
                                    props?.selectedCell && <AddShiftTimekeepingModal
                                        openModal={showAddShift}
                                        setOpenModal={setShowAddShift}
                                        // data={data}
                                        // setData={setData}
                                        mutate={props?.mutate}
                                        selectedCell={props?.selectedCell}
                                        handleCancel={handleCancel}
                                    />}
                                {
                                    selectedShiftDetail && <DetailShift
                                        openModal={showDetailShift}
                                        setOpenModal={setShowDetailShift}
                                        // data={data}
                                        // setData={setData}
                                        mutate={props?.mutate}
                                        selectedShift={selectedShiftDetail}
                                        selectedCell={props?.selectedCell}
                                        handleCancel={handleDetailShiftCancel}
                                    />}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition >
    );
};

export default DetailShiftUserModal;
