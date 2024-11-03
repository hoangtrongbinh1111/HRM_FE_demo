import { useEffect, Fragment, useState } from "react"
import { useTranslation } from "react-i18next"

import { Dialog, Transition } from "@headlessui/react"

import * as Yup from "yup"
import { Field, Form, Formik } from "formik"
import Swal from "sweetalert2"
import { showMessage } from "@/@core/utils"
import IconX from "@/components/Icon/IconX"
import Flatpickr from "react-flatpickr"
import "flatpickr/dist/flatpickr.css"
import Select from "react-select"
// import dutyList from "../../duty/duty_list.json"

interface Props {
  [key: string]: any;
}

const DetailModal = ({ ...props }: Props) => {
  const { t } = useTranslation()
  const [disabled, setDisabled] = useState(false)

  const handleCancel = () => {
    props.setOpenModal(false)
    props.setData(undefined)
  }
  return (
    <Transition appear show={props.openModal ?? false} as={Fragment}>
      <Dialog
        as="div"
        open={props.openModal}
        onClose={() => props.setOpenModal(false)}
        className="relative z-50 w-1/2"
      >
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
              <Dialog.Panel
                className="panel w-full overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                style={{ maxWidth: "44rem" }}
              >
                <button
                  type="button"
                  onClick={() => handleCancel()}
                  className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                >
                  <IconX />
                </button>
                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                  {t("detail_shift")}
                </div>
                <div className="p-5">
                  <div className="flex justify-between gap-5 mb-3">
                      <label htmlFor="name_shift" className="w-2/5">
                        {" "}
                        {t("name_shift")} <span style={{ color: "red" }}>* </span>
                      </label>
                      <p
                        className="w-3/5"
                        style={{ borderBottom: "1px solid #ccc" }}
                      >
                        {props?.data?.name_shift ?? ""}
                      </p>
                      </div>
                      <div className="flex justify-between gap-5 mb-3">
                       <label htmlFor="type_shift" className="w-2/5">
                        {" "}
                        {t("type_shift")} <span style={{ color: "red" }}>* </span>
                      </label>
                    <p
                        className="w-3/5"
                        style={{ borderBottom: "1px solid #ccc" }}
                      >
                        {props?.data?.type_shift ?? ""}</p>
                    </div>
                  <div className="flex justify-between gap-5 mb-3">
                      <label htmlFor="from_time" className="w-2/5">
                        {" "}
                        {t("from_time")}{" "}
                        <span style={{ color: "red" }}>* </span>
                      </label>
                      <p className="w-3/5"
                        style={{ borderBottom: "1px solid #ccc" }}>{props?.data?.from_time ?? ""}</p>
                    </div>
                    <div className="flex justify-between gap-5 mb-3">
                      <label htmlFor="end_time" className="w-2/5">
                        {" "}
                        {t("end_time")}{" "}
                        <span style={{ color: "red" }}>* </span>
                      </label>
                      <p className="w-3/5"
                        style={{ borderBottom: "1px solid #ccc" }}>{props?.data?.end_time ?? ""}</p>
                    </div>
                  <div className="flex justify-between gap-5 mb-3">
                      <label htmlFor="department_apply" className="w-2/5">
                        {" "}
                        {t("department_apply")}{" "}
                        <span style={{ color: "red" }}>* </span>
                      </label>
                      <p className="w-3/5"
                        style={{ borderBottom: "1px solid #ccc" }}>{props?.data?.department_apply ?? ""}</p>
                    </div>

                  <div className="flex justify-between gap-5 mb-3">
                      <label htmlFor="time" className="w-2/5">
                        {" "}
                        {t("time_shift")} <span style={{ color: "red" }}>* </span>
                      </label>
                      <p className="w-3/5"
                        style={{ borderBottom: "1px solid #ccc" }}>{props?.data?.time ?? ""}</p>
                    </div>

                  <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                    <button
                      type="submit"
                      className="btn btn-primary ltr:ml-4 rtl:mr-4"
                      onClick={() => handleCancel()}
                    >
                      {`${t("close")}`}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default DetailModal
