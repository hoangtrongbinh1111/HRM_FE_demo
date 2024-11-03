import { useEffect, Fragment, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';

import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Swal from 'sweetalert2';
import { showMessage } from '@/@core/utils';
import IconBack from '@/components/Icon/IconBack';
import Select from 'react-select';
import { useRouter } from 'next/router';
import { Departments } from '@/services/swr/department.swr';
import { GroupPositions } from '@/services/swr/group-position.swr';
import { DropdownRole } from '@/services/swr/dropdown.swr';
import { useDebounce } from 'use-debounce';
import { loadMore } from '@/utils/commons';
import { Timekeeper } from '@/services/swr/Timekeeper.swr';
import { createTimekeeper, listAllTimekeeperHuman } from '@/services/apis/timekeeper.api';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { Upload } from '@/services/apis/upload.api';
import { createAnnouncement, makeHighLight } from '@/services/apis/announcement.api';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { IconLoading } from '@/components/Icon/IconLoading';
import { HumanDropdown, Humans } from '@/services/swr/human.swr';
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js';
import { Lao } from '@/utils/lao';
import IconX from '@/components/Icon/IconX';
import ApprovalModal from './modal/ApprovalModal';
import { useMyContext } from '../../../components/Layouts/myContext';

interface Props {
	[key: string]: any;
}
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import { listHumanDroppdown } from '@/services/apis/human.api';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { setPageTitle } from '@/store/themeConfigSlice';

const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const AddTimekeepingMachine = ({ ...props }: Props) => {

    const { setMyValue, myValue } = useMyContext();
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(setPageTitle(t('Create Announcement')));
	});
	const themeConfig = useSelector((state: IRootState) => state.themeConfig);
	const chosenLocale = themeConfig.locale === 'vi' ? Vietnamese : themeConfig.locale === 'la' ? Lao : null;

	const defaultParams = {
		id: null,
		from: 'vristo@mail.com',
		to: '',
		cc: '',
		type: '',
		file: null,
		description: '',
		displayDescription: '',
	};
	const { t } = useTranslation();
	const router = useRouter();
	const [dataRepairDropdown, setDataRepairDropdown] = useState<any>([]);
	const [pageRepair, setPageRepair] = useState<any>(1);
	const [search, setSearch] = useState<any>();
	const [dataPath, setDataPath] = useState<any>();
	const [path, setPath] = useState<any>([]);
	const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
	const fileRef = useRef<any>();
	const [loading, setLoading] = useState(false);
	const [humans, setHuman] = useState();
	const [loadingSubmit, setLoadingSubmit] = useState(false);
	const [usersParticipate, setUsersParticipate] = useState<any>([]);
    const [isAdd, setIsAdd]= useState(false);
	//scroll
	const [dataDepartment, setDataDepartment] = useState<any>([]);
	const [pageDepartment, setSizeDepartment] = useState<any>(1);
	const [debouncedPage] = useDebounce(pageDepartment, 500);
	//get data
	const { data: dropdownRepair, pagination: repairPagination, isLoading: repairLoading } = DropdownRole({ page: pageRepair });
	const closeMsgPopUp = () => {};
	useEffect(() => {
		const listPath = path?.filter((item: any) => item !== undefined) ?? [];
		setPath([...listPath, dataPath]); // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataPath]);
	const handleDeleteFile = (index: any) => {
		const newPath = path.filter((i: any) => i !== path[index]);
		setPath(newPath);
		if (fileRef?.current) {
			const dataTransfer = new DataTransfer();
			Array.from(fileRef?.current?.files)
				.filter((i: any) => i !== fileRef?.current?.files[index])
				.forEach((file: any) => dataTransfer.items.add(file));
			fileRef.current.files = dataTransfer.files;
		}
	};
	const handleChange = async (event: any) => {
		setLoading(true);
		const files = Array.from(event.target.files);

		// Tạo mảng các promises để tải lên các tệp
		const uploadPromises = files.map((file: any) => {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('fileName', file.name);

			// Trả về promise của việc tải lên
			return Upload(formData)
				.then((res) => {
					return { id: res.data.id, path: res.data.path, name: res.data.name };
				})
				.catch((err) => {
					const input = err?.response?.data?.message;

					// Tách chuỗi tại " or MIME type"
					const parts = input.split(' or MIME type');

					// Sử dụng biểu thức chính quy để tìm chuỗi bắt đầu bằng dấu chấm và theo sau là các ký tự chữ cái
					const fileType = parts[0].match(/\.\w+$/)[0];

					if (fileType) {
						showMessage(`${t('unsupported type file', { fileType: fileType })}`, 'error');
					} else {
						showMessage(`${err?.response?.data?.message}`, 'error');
					}
					return null; // Trả về null nếu có lỗi
				});
		});

		// Sử dụng Promise.allSettled để xử lý tất cả các promises
		try {
			// Sử dụng Promise.allSettled để xử lý tất cả các promises
			const results = await Promise.allSettled(uploadPromises);

			// Lọc các kết quả để chỉ lấy các tệp tải lên thành công
			const validNewFiles = results
				.filter((result): result is PromiseFulfilledResult<{ id: any; path: any; name: any }> => result.status === 'fulfilled' && result.value !== null)
				.map((result) => result.value);

			// Cập nhật state với các đường dẫn tệp mới
			setPath((prevPath: any) => {
				if (!Array.isArray(prevPath)) {
					return validNewFiles;
				}
				return [...prevPath, ...validNewFiles];
			});

			// Cập nhật giá trị của input file
			const dataTransfer = new DataTransfer();
			files.forEach((file: any) => dataTransfer.items.add(file));
			fileRef.current.files = dataTransfer.files;
		} catch (error) {
			console.error('Error uploading files:', error);
		} finally {
			// Kết thúc quá trình tải lên, đặt loading thành false
			setLoading(false);
		}
	};
	const SubmittedForm = Yup.object().shape({
		title: Yup.string()
			.min(2, 'Too Short!')
			.required(`${t('please_fill_title')}`),
		content: Yup.string()
			.min(2, 'Too Short!')
			.required(`${t('please_fill_contents')}`),
		location: Yup.string().required(`${t('please_fill_add')}`),
		startDate: Yup.date().typeError(`${t('please_fill_work_start_date')}`),
		endDate: Yup.date().typeError(`${t('please_fill_work_end_date')}`),
	});
	const { data: group_position, pagination: pagination1, mutate: mutate1 } = GroupPositions({ sortBy: 'id.ASC' });
	const getAllTimekeeperHuman = () => {
		listHumanDroppdown({ search: search })
			.then((res) => {
				const kq = res?.data?.map((i: any) => {
					return {
						value: i?.id,
						label: `${i?.label} - ${i?.position_name ? i?.position_name : 'Chưa có chức vụ'} - ${i?.department_name ? i?.department_name : 'Chưa thuộc phòng ban nào'}`,
					};
				});
				setHuman(kq);
			})
			.catch((e) => console.log(e));
	};

	const options = group_position?.data?.map((item: any) => ({ value: item.id, label: item.name })) || [];
	const handleDuty = (value: any) => {
		const query = {
			...value,
			departmentIds: value.departmentIds.map((item: any) => {
				return item.value;
			}),
		};
		// createTimekeeper({
		// 	...query,
		// })
		// 	.then(() => {
		// 		showMessage(`${t('create_announcement_success')}`, 'success');
		// 	})
		// 	.catch((err) => {
		// 		showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
		// 	});
	};
	const handleSubmit = async (value: any) => {
		try {
			const query = {
				content: value.content,
				startDate: value.startDate,
				endDate: value.endDate,
				location: value.location,
				typeReceiver: value?.typeReceiver,
				title: value?.title,
				type: value?.type,
				contentHtml: value?.contentHtml,
				departments: value.departments.map((item: any) => item.value),
				users: usersParticipate.map((item: any) => item.value),
				...(path?.length !== 0 && {
					attachmentIds: path.map((item: any) => item?.id).filter((id: any) => id !== undefined),
				}),
			};
			setIsAdd(true)
			const res = await createAnnouncement({ ...query });
			if (value?.typeReceiver === 'ALL' && value?.isHighlight) await makeHighLight(res?.data?.id);
			setMyValue(!myValue);
			showMessage(`${t('create_announcement_success')}`, 'success');
			setLoadingSubmit(false);
			router.push(`/hrm/announcement`);
		} catch (err: any) {
			setIsAdd(false)
			showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
				setLoadingSubmit(false);
		}
	};

	useEffect(() => {
		getAllTimekeeperHuman();
	}, [search]);
	useEffect(() => {
		if (repairPagination?.page === undefined) return;
		if (repairPagination?.page === 1) {
			setDataRepairDropdown(dropdownRepair?.data);
		} else {
			setDataRepairDropdown([...dataRepairDropdown, ...dropdownRepair?.data]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [repairPagination]);
	//scroll

	const [queryDepartment, setQueryDepartment] = useState<any>();
	const [debouncedQuery] = useDebounce(queryDepartment, 500);
	const [queryHuman, setQueryHuman] = useState<any>();
	const [dataHuman, setDataHuman] = useState<any>([]);
	const [pageHuman, setSizeHuman] = useState<any>(1);
	const [debouncedPageHuman] = useDebounce(pageHuman, 500);
	const [openModalApproval, setOpenModalApproval] = useState(false);
	const [debouncedQueryHuman] = useDebounce(queryHuman, 500);
	const [load, setLoad] = useState(false);
	const [loadDepartment, setLoadDepartment] = useState(false);
	const { data: departmentparents, pagination: paginationDepartment, isLoading } = Departments({ page: debouncedPage, search: debouncedQuery?.search });

	const { data: manages, pagination: paginationHuman, isLoading: isLoadingHuman } = HumanDropdown({ page: debouncedPageHuman, search: debouncedQueryHuman?.search });
	const handleOnScrollBottom = () => {
		setLoadDepartment(true);
		setTimeout(() => {
			setSizeDepartment(paginationDepartment?.page + 1);
		}, 1000);
	};
	const handleOnScrollBottomHuman = () => {
		setLoad(true);
		setTimeout(() => {
			setSizeHuman(paginationHuman?.page + 1);
		}, 1000);
	};
	useEffect(() => {
		loadMore(departmentparents, dataDepartment, paginationDepartment, setDataDepartment, 'id', 'name', setLoadDepartment);
	}, [paginationDepartment, debouncedPage, debouncedQuery]);
	useEffect(() => {
		if (paginationHuman?.page === undefined) return;
		if (paginationHuman?.page === 1) {
			setDataHuman(
				manages?.data?.map((item: any) => ({
					value: item.value,
					label: `${item?.label} - ${item?.position_name ? item?.position_name : 'Chưa có chức vụ'} - ${item?.department_name ? item?.department_name : 'Chưa thuộc phòng ban nào'}`,
				})),
			);
			setLoad(false);
		} else {
			openModalApproval;
			setDataHuman([
				...dataHuman,
				...manages?.data?.map((item: any) => ({
					value: item.value,
					label: `${item?.label} - ${item?.position_name ? item?.position_name : 'Chưa có chức vụ'} - ${item?.department_name ? item?.department_name : 'Chưa thuộc phòng ban nào'}`,
				})),
			]);
			setLoad(false);
		}
	}, [paginationHuman, debouncedPageHuman, debouncedQueryHuman]);
	const handleSearchDepartment = (param: any) => {
		setQueryDepartment({ search: param });
	};
	const handleSearchHuman = (param: any) => {
		setSearch({ search: param });
	};
	const handleFocus = (e: any) => {
		setOpenModalApproval(true);
	};
	// const handleSubmitApproval = () => {
	// 	setOpenModalApproval(true);
	// };

	const formikRef = useRef<any>();
	useEffect(() => {
		if (formikRef.current) {
			formikRef.current.setFieldValue('users', usersParticipate);
		}
	}, [usersParticipate]);
	return (
		<div className="p-5">
			<ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
				<li>
					<Link href="/hrm/dashboard" className="text-primary hover:underline">
						<span>{t('homepage')}</span>
					</Link>
				</li>
				<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
					<Link href="/hrm/announcement" className="text-primary hover:underline">
						<span>{t('announcement')}</span>
					</Link>
				</li>
				<li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
					<span>{t('Create Announcement')}</span>
				</li>
			</ul>
			<div className="header-page-bottom mb-4 flex justify-between pb-4">
				<h1 className="page-title">{t('Create Announcement')}</h1>
				<Link href="/hrm/announcement">
					<button type="button" className="btn btn-primary btn-sm back-button m-1">
						<IconBack className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
						<span>{t('back')}</span>
					</button>
				</Link>
			</div>
			<Formik
				initialValues={{
					title: '',
					isHighlight: false,
					type: 'NORMAL',
					attachmentIds: [],
					users: [],
					departments: [],
					content: '',
					contentHtml: '',
					startDate: params ? `${params?.startDate}` : null,
					endDate: params ? `${params?.endDate}` : null,
					location: '',
					typeReceiver: 'ALL',
				}}
				innerRef={formikRef}
				validationSchema={SubmittedForm}
				onSubmit={(values) => {
					setLoadingSubmit(true);
					handleSubmit(values);
				}}
			>
				{({ errors, touched, submitCount, setFieldValue, values }) => (
					<Form className="space-y-5" style={{ padding: '0 25px' }}>
						{loadingSubmit ? (
							<div className="" style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
								<IconLoading />
							</div>
						) : (
							<div>
								<label htmlFor="title" className="label">
									{' '}
									{t('title')} <span style={{ color: 'red' }}>* </span>
								</label>
								<Field autoComplete="off" name="title" type="text" id="title" placeholder={`${t('please_fill_title')}`} className="form-input" />
								{submitCount ? errors.title ? <div className="mt-1 text-danger"> {errors.title} </div> : null : ''}
								{/* </div> */}
								<div className="flex justify-between gap-5" style={{ marginTop: '22px' }}>
									<div className="mb-5 w-1/2">
										<label htmlFor="type" className="label">
											{t('type_')} <span style={{ color: 'red' }}>* </span>
										</label>
										<div className="flex" style={{ alignItems: 'center' }}>
											<label style={{ marginBottom: 0, marginRight: '10px' }}>
												<Field
													autoComplete="off"
													type="radio"
													name="type"
													value={values?.type}
													checked={values.type === 'NORMAL'}
													className="form-checkbox rounded-full"
													onChange={(e: any) => {
														setFieldValue('type', 'NORMAL');
													}}
												/>
												{t('normal')}
											</label>
											<label style={{ marginBottom: 0 }}>
												<Field
													autoComplete="off"
													type="radio"
													name="type"
													value={values?.type}
													checked={values.type === 'IMPORTANT'}
													className="form-checkbox rounded-full"
													onChange={(e: any) => {
														setFieldValue('type', 'IMPORTANT');
													}}
												/>
												{t('important')}
											</label>
										</div>
									</div>
									<div className="mb-5 w-1/2">
										<label htmlFor="location" className="label">
											{t('address')}
											<span style={{ color: 'red' }}> *</span>
										</label>
										<Field autoComplete="off" name="location" type="text" id="location" placeholder={t('enter_address')} className="form-input" />
										{submitCount ? errors.location ? <div className="mt-1 text-danger"> {errors.location} </div> : null : ''}
									</div>
								</div>
								<div className="mb-3 flex gap-2" style={{ marginTop: '' }}>
									<div className="flex-1">
										<label htmlFor="startDate" className="label">
											{t('from_time')}
											<span style={{ color: 'red' }}>* </span>
										</label>
										<Flatpickr
											options={{
												enableTime: true,
												dateFormat: 'H:i d-m-Y',
												time_24hr: true,
												locale: {
													...chosenLocale,
												},
											}}
											onChange={(e: any) => {
												if (e?.length > 0) {
													setFieldValue('startDate', dayjs(e[0]).toISOString());
												}
											}}
											placeholder={`${t('choose_from_time')}`}
											className="calender-input form-input"
										/>
										{submitCount ? errors.startDate ? <div className="mt-1 text-danger"> {errors.startDate} </div> : null : ''}
									</div>
									<div className="flex-1">
										<label htmlFor="endDate" className="label">
											{t('end_time')} <span style={{ color: 'red' }}>* </span>
										</label>
										<Flatpickr
											options={{
												enableTime: true,
												dateFormat: 'H:i d-m-Y',
												time_24hr: true,
												locale: {
													...chosenLocale,
												},
											}}
											placeholder={`${t('choose_end_time')}`}
											onChange={(e: any) => {
												if (e?.length > 0) {
													setFieldValue('endDate', dayjs(e[0]).toISOString());
												}
											}}
											className="calender-input form-input"
										/>
										{submitCount ? errors.endDate ? <div className="mt-1 text-danger"> {errors.endDate} </div> : null : ''}
									</div>
								</div>
								<div className="flex justify-between gap-5">
									<div className="mb-5 w-1/2" style={{ marginTop: '20px' }}>
										<label htmlFor="typeReceiver" className="label">
											{t('type1')} <span style={{ color: 'red' }}>* </span>
										</label>
										<div className="flex" style={{ alignItems: 'center'}}>
											<label style={{ marginBottom: 0, marginRight: '10px' }}>
												<Field
													autoComplete="off"
													type="radio"
													name="typeReceiver"
													value={values?.typeReceiver}
													checked={values.typeReceiver === 'ALL'}
													className="form-checkbox rounded-full"
													onChange={(e: any) => {
														setFieldValue('typeReceiver', 'ALL');
													}}
												/>
													<span style={{ cursor: 'pointer' }}>{t('allHuman')}</span>
											</label>
											<label style={{ marginBottom: 0 }}>
												<Field
													autoComplete="off"
													type="radio"
													name="typeReceiver"
													value={values?.typeReceiver}
													checked={values.typeReceiver === 'HUMAN'}
													className="form-checkbox rounded-full"
													onChange={(e: any) => {
														setFieldValue('typeReceiver', 'HUMAN');
													}}
												/>
													<span style={{ cursor: 'pointer' }}>{t('chooseHuman')}</span>
											</label>
										</div>
									</div>
									{values?.typeReceiver === 'ALL' ? (
										<div className="mb-5 w-1/2" style={{ marginTop: '20px' }}>
											<label htmlFor="isHighlight" className="label">
												{t('highlight')}
											</label>
											<div className="flex" style={{ alignItems: 'center', marginTop: '13px' }}>
												<label style={{ marginBottom: 0, marginRight: '10px' }}>
													<Field
														autoComplete="off"
														type="radio"
														name="isHighlight"
														value={values?.isHighlight}
														checked={values.isHighlight}
														className="form-checkbox rounded-full"
														onChange={(e: any) => {
															console.log(e);
															setFieldValue('isHighlight', true);
														}}
													/>
													{t('highlight_true')}
												</label>
												<label style={{ marginBottom: 0, marginRight: '10px' }}>
													<Field
														autoComplete="off"
														type="radio"
														name="isHighlight"
														value={values?.isHighlight}
														checked={!values.isHighlight}
														className="form-checkbox rounded-full"
														onChange={(e: any) => {
															setFieldValue('isHighlight', false);
														}}
													/>
													{t('highlight_false')}
												</label>
											</div>
										</div>
									) : (
										<></>
									)}
								</div>
								{values?.typeReceiver === 'ALL' ? (
									<></>
								) : (
									<div className="flex justify-between gap-5" style={{ marginTop: '10px' }}>
										<div className="mb-5 w-1/2">
											<label htmlFor="departments" className="label" style={{ cursor: 'pointer' }}>
												{' '}
												{t('departmentParticipate')}
											</label>
											<Select
												id="departments"
												name="departments"
												placeholder={t('choose_department')}
												onInputChange={(e) => handleSearchDepartment(e)}
												options={dataDepartment}

												isLoading={loadDepartment}
												onMenuOpen={() => setSizeDepartment(1)}
												onMenuScrollToBottom={() => handleOnScrollBottom()}
												maxMenuHeight={160}
												isMulti
												closeMenuOnSelect={false}
												value={values.departments}
												onChange={(e) => {
													setFieldValue('departments', e);
												}}
											/>
										</div>
										<div className="mb-5 w-1/2">
											<label htmlFor="users" className="label">
												{t('usersParticipate')}
											</label>
											<div onClick={() => setOpenModalApproval(true)}>
												<Select
													id="users"
													name="users"
													onInputChange={(e) => handleSearchHuman(e)}
													options={dataHuman}
													isLoading={load}
													onMenuOpen={() => setSizeHuman(1)}
													onMenuScrollToBottom={() => handleOnScrollBottomHuman()}
													placeholder={t('choose_human')}
													isMulti
													closeMenuOnSelect={false}
													maxMenuHeight={160}
													value={values.users}
													onChange={(e) => {
														setFieldValue('users', usersParticipate);
													}}
													menuIsOpen={false}
													openMenuOnFocus={false}
												/>
											</div>
										</div>
									</div>
								)}
								<div className="h-fit">
									<ReactQuill
										theme="snow"
										id="contentHtml"
										value={values.contentHtml || ''}
										defaultValue={values.contentHtml || ''}
										onChange={(contentHtml, delta, source, editor) => {
											values.contentHtml = contentHtml;
											values.content = editor.getText();
											setFieldValue('contentHtml', contentHtml);
										}}
										style={{ minHeight: '100px' }}
									/>
								</div>
								<div>
									<div className="mt-5">
										<label htmlFor="attachmentIds" className="label">
											{' '}
											{t('attached_file')}{' '}
										</label>
										<Field
											innerRef={fileRef}
											autoComplete="off"
											name="attachmentIds"
											type="file"
											id="attachmentIds"
											className="form-input"
											multiple
											onChange={(e: any) => handleChange(e)}
											// onClick={() => setChangeFile(true)}
										/>
										{submitCount && errors.attachmentIds ? <div className="mt-1 text-danger"> {`${errors.attachmentIds}`} </div> : null}
									</div>

									{loading && (
										<div className="" style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
											<IconLoading />
										</div>
									)}
									{path?.length > 0 && (
										<div className="mt-2 grid gap-4 rounded border p-2">
											<p>{t('List of file upload paths')}</p>
											{path?.map((item: any, index: number) => {
												return (
													<>
														{item?.path && (
															<div className="flex gap-4" style={{ cursor: 'pointer' }}>
																<Link href={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} target="_blank" className="d-block ml-5" style={{ color: 'blue' }}>
																	{item?.name}
																</Link>
																<button type="button" onClick={() => handleDeleteFile(index)} className="btn-outline-dark">
																	<IconX />
																</button>
															</div>
														)}
													</>
												);
											})}
										</div>
									)}
								</div>
								<div className="mt-8 flex items-center justify-end gap-8 ltr:text-right rtl:text-left">
									<button type="button" className="btn btn-outline-danger ltr:mr-3 rtl:ml-3" onClick={closeMsgPopUp}>
										{t('cancel')}
									</button>
									{/* <button type="button" className="btn btn-success ltr:mr-3 rtl:ml-3" onClick={() => saveMail('save', null)}>
												Lưu
											</button> */}
									<button type="submit" className="btn btn-primary add-button" disabled={isAdd}>
										{t('send')}
									</button>
								</div>
							</div>
						)}
					</Form>
				)}
			</Formik>
			<ApprovalModal openModal={openModalApproval} setOpenModal={setOpenModalApproval} setUsersParticipate={setUsersParticipate} usersParticipate={usersParticipate} />
		</div>
	);
};

export default AddTimekeepingMachine;
