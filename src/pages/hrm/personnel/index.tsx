import { useEffect, Fragment, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import { lazy } from 'react';
// Third party libs
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
// API
import { deleteDepartment, detailDepartment, listAllDepartment } from '../../../services/apis/department.api';
// constants
import { PAGE_SIZES, PAGE_SIZES_DEFAULT, PAGE_NUMBER_DEFAULT } from '@/utils/constants';
import { downloadFile } from '@/@core/utils';
// helper
import { capitalize, formatDate, showMessage } from '@/@core/utils';
// icons
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import { IconLoading } from '@/components/Icon/IconLoading';
import IconPlus from '@/components/Icon/IconPlus';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import { useRouter } from 'next/router';
import { Checkbox, Radio } from '@mantine/core';

// json
import PersonnelList from './personnel_list.json';
import PersonnelModal from './modal/PersonnelModal';
import IconFolderMinus from '@/components/Icon/IconFolderMinus';
import IconDownload from '@/components/Icon/IconDownload';
import IconCalendar from '@/components/Icon/IconCalendar';
import Link from 'next/link';
import RBACWrapper from '@/@core/rbac/RBACWrapper';

import { Box } from '@atlaskit/primitives';
import TableTree, { Cell, Header, Headers, Row, Rows } from '@atlaskit/table-tree';

import IconNewEdit from '@/components/Icon/IconNewEdit';
import IconNewEye from '@/components/Icon/IconNewEye';
import IconNewTrash from '@/components/Icon/IconNewTrash';
import IconNewCalendar from '@/components/Icon/IconNewCalendar';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import IconImportFile from '@/components/Icon/IconImportFile';
import IconNewDownload from '@/components/Icon/IconNewDownload';
import IconNewDownload2 from '@/components/Icon/IconNewDownload2';
import { Humans, HumansByDepartment } from '@/services/swr/human.swr';
import { deleteHuman, exportHuman, listAllHumanByDepartment } from '@/services/apis/human.api';
import { Field, Form, Formik } from 'formik';

import IconDisplaylist from '@/components/Icon/IconDisplaylist';
import IconDisplayTree from '@/components/Icon/IconDisplayTree';
import { Positions } from '@/services/swr/position.swr';
import Cookies from 'js-cookie';
import Select from "react-select";
import InfiniteScroll from 'react-infinite-scroll-component';
import { setCurrentPageHuman, setListHuman } from '@/store/humanListSlice';
import { IRootState } from '@/store';
import IconNewArrowDown from '@/components/Icon/IconNewArrowDown';
import IconNewArrowUp from '@/components/Icon/IconNewArrowUp';

interface Props {
    [key: string]: any;
}
const LIST_FACE_STATUS = [
    {
        value: "0",
        label: "Chưa đăng ký"
    },
    {
        value: "1",
        label: "Đã đăng ký"
    }
]
const Department = ({ ...props }: Props) => {
    const humanList = useSelector((state: IRootState) => state.humanList);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isReload, setIsReload] = useState(humanList?.isReload ?? false);
    const [totalPages, setTotalPages] = useState<any>();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(setPageTitle(`${t('staff_list')}`));
    });
    const [mode, setMode] = useState("expand");
    const router = useRouter();
    const [display, setDisplay] = useState('tree')
    const [showLoader, setShowLoader] = useState(false);
    const [page, setPage] = useState(humanList?.currentPage ?? 1);
    const [pageSize, setPageSize] = useState(3);
    const [recordsData, setRecordsData] = useState<any>();
    const [total, setTotal] = useState(0);
    const [faceStatus, setFaceStatus] = useState<any>();
    const [humanTree, setHumanTree] = useState<any>([]);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState<any>("");
    const [loading, setLoading] = useState(false)
    const [transformedData, setTransformedData] = useState<any>(humanList?.data ?? []);
    const { data: human, pagination, mutate } = Humans({ sortBy: 'id.ASC', ...router.query });
    // const { data: humanTree, pagination: paginationTree, mutate: mutateTree } = HumansByDepartment({ sortBy: 'id.ASC', ...router.query, page: page, perPage: pageSize });
    const getData = (page_: number, faceStatus_: number, search_: string) => {
        listAllHumanByDepartment({
            page: page_,
            perPage: pageSize,
            ...(faceStatus_ && { faceStatus: faceStatus_ }),
            ...(search_ && search_ !== "" && { search: search_ }),
        }).then(res => {
            setLoading(false)
            const transformedData_ = res?.data ? res?.data?.map((i: any) => {
                console.log(i)
                return {
                    ...i,
                    users: i.users?.sort((user1: any, user2: any) => {
                        const numA = parseInt(user1?.code?.match(/\d+/)?.[0] || '0');
                        const numB = parseInt(user2?.code?.match(/\d+/)?.[0] || '0');
                        return numA - numB; 
                    }).map((user: any) => {
                        return {
                            ...user,
                            name: user.fullName
                        };
                    })
                };
            }) : [];
            setTotal(res?.pagination?.totalRecords);
            setTotalPages(res?.pagination?.totalPages)
            if (page_ === 1) {
                setTransformedData(transformedData_)
                setHumanTree(res?.data)
            } else {
                setTransformedData((prev: any) => [...prev, ...transformedData_]);
                setHumanTree((prev: any) => [...prev, res?.data])
            }
            setHasMore(page < res?.pagination?.totalPages);
        }).catch(err => {
            console.log(err)
        })
    }
    useEffect(() => {
        // setPage(1); // Reset to first page
        if (!isReload) {
            getData(page, faceStatus, search);
        }
    }, [isReload]);
    const fetchMoreData = () => {
        const page_ = page + 1;
        setPage(page_);

        if (page_ > totalPages) {
            setHasMore(false);
            return;
        }
        setTimeout(() => {
            getData(page_, faceStatus, search);
        }, 500);
    };

    const [codeArr, setCodeArr] = useState<string[]>([]);

    const { data: positions } = Positions({
        sortBy: 'id.ASC',
        page: 1,
        perPage: 100
    });

    const handleEdit = (data: any) => {
        router.push(`/hrm/personnel/${data}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
        dispatch(setListHuman(transformedData));
        dispatch(setCurrentPageHuman(page + 1))
    };
    const handleDetail = (data: any) => {
        router.push(`/hrm/personnel/detail/${data}?page=${pagination?.page}&perPage=${pagination?.perPage}`);
        dispatch(setListHuman(transformedData));
        dispatch(setCurrentPageHuman(page + 1))
    };

    const handleDelete = (data: any) => {
        const swalDeletes = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-secondary',
                cancelButton: 'btn btn-danger ltr:mr-3 rtl:ml-3',
                popup: 'confirm-popup confirm-delete',
            },
            imageUrl: '/assets/images/delete_popup.png',
            buttonsStyling: false,
        });
        swalDeletes
            .fire({
                title: `${t('delete_staff')}`,
                html: `<span class='confirm-span'>${t('confirm_delete')}</span> ${data.fullName}?`,
                padding: '2em',
                showCancelButton: true,
                cancelButtonText: `${t('cancel')}`,
                confirmButtonText: `${t('confirm')}`,
                reverseButtons: true,
            })
            .then((result) => {
                if (result.value) {
                    deleteHuman(data?.id).then(() => {
                        getData(1, faceStatus, search);
                        showMessage(`${t('delete_staff_success')}`, 'success');
                    }).catch((err) => {
                        showMessage(`${err?.response?.data?.message}`, 'error');
                    });
                }
            });
    };
    const handleExcel = () => {
        downloadFile("human.xlsx", "/human/export")
    }
    const handleChangePage = (page: number, pageSize: number) => {
        router.replace(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    page: page,
                    perPage: pageSize,
                },
            },
            undefined,
            { shallow: true },
        );
        return pageSize;
    };
    const handleChangeStatus = (de: any) => {
        // setIsReload(false)
        setPage(1)
        setFaceStatus(de?.value);
        getData(1, de?.value, search);
    }
    const handleSearch = (param: any) => {
        setPage(1)
        // setIsReload(false)
        setSearch(param);
        getData(1, faceStatus, param);
    };
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            setSearch(search)
        }
    };
    type Content = { id: number; name: string; code: string; department?: object; duty?: string, type: string };

    type Item = {
        id: number;
        fullName: string; code: string; duty?: string; email: string; name: string;
        province: string;
        phoneNumber: string;
        positionId: string;
        hasChildren: boolean;
        position: object;
        users?: Item[];
        department: object;
        faceStatus: number;
    };
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const currentPage = page
        if (currentPage > 2) {
            pageNumbers.push(

                <li>
                    <button type="button" onClick={() => handleChangePage(1, 10)} className={`flex justify-center rounded-full px-3.5 py-2 font-semibold  text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary bg-white-light`} >
                        1
                    </button>
                </li >

            );
            pageNumbers.push(

                <li>
                    <button type="button" className={`flex justify-center rounded-full px-3.5 py-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary bg-white-light`} >
                        ...
                    </button>
                </li >

            );

        }
        for (let i = 1; i <= totalPages; i++) {
            if (currentPage < i + 2 && currentPage > i - 2) {
                pageNumbers.push(
                    <li>
                        <button type="button" key={i} onClick={() => handleChangePage(i, 10)} className={`flex justify-center rounded-full px-3.5 py-2 font-semibold ${i === currentPage ? 'text-white transition dark:bg-primary dark:text-white-light bt-pagination-active' : 'bg-white-light text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary'}`} >
                            {i}
                        </button>
                    </li >

                );
            }

        }
        if (currentPage < totalPages - 2) {
            pageNumbers.push(

                <li>
                    <button type="button" className={`flex justify-center rounded-full px-3.5 py-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary bg-white-light`} >
                        ...
                    </button>
                </li >

            );
        }
        if (currentPage < totalPages - 1) {
            pageNumbers.push(

                <li>
                    <button type="button" onClick={() => handleChangePage(totalPages, 10)} className={`flex justify-center rounded-full px-3.5 py-2 font-semibold  text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary bg-white-light`} >
                        {totalPages}
                    </button>
                </li >

            );
        }
        return pageNumbers;
    };
    const handleChangeExpand = (event: any) => {
        setMode(event);
    };
    return (
        <div>
            {/* {loading && (
				<div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
					<IconLoading />
				</div>
			)} */}
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('staff_list')}</span>

                </li>
            </ul>
            <title>{t('staff')}</title>
            <div className="panel mt-6" style={{ overflowX: 'auto' }}>
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center">
                        <RBACWrapper
                            permissionKey={[
                                'human:create'
                            ]}
                            type={'AND'}
                        >
                            <Link href="/hrm/personnel/AddNewPersonel">
                                <button type="button" className=" m-1 button-table button-create" >
                                    <IconNewPlus />
                                    <span className="uppercase">{t('add')}</span>
                                </button>
                            </Link>
                        </RBACWrapper>
                        {/* <RBACWrapper
                            permissionKey={[
                                'human:create'
                            ]}
                            type={'AND'}
                        >
                            <input autoComplete="off" type="file" ref={fileInputRef} style={{ display: "none" }} />
                            <button type="button" className=" m-1 button-table button-import" onClick={() => fileInputRef.current?.click()}>
                                <IconImportFile />
                                <span className="uppercase">{t('import_file')}</span>
                            </button>
                        </RBACWrapper> */}
                        <RBACWrapper
                            permissionKey={[
                                'human:export'
                            ]}
                            type={'AND'}
                        >
                            <button type="button" className=" m-1 button-table button-download" onClick={() => handleExcel()}>
                                <IconNewDownload2 />
                                <span className="uppercase">{t('export_file_excel')}</span>
                            </button>
                        </RBACWrapper>
                    </div>
                    <div className='display-style'>
                        {
                            mode === "collapse" ? <button type="button" className='button-arrow-list' onClick={() => handleChangeExpand('expand')}>
                                <IconNewArrowDown /><span>
                                    {t('expand')}
                                </span>
                            </button> : <button type="button" className='button-arrow-list' onClick={() => handleChangeExpand('collapse')}>
                                <IconNewArrowUp /><span>
                                    {t('collapse')}
                                </span>
                            </button>
                        }

                        <Select
                            className="zIndex-10 w-[230px] mr-2"
                            options={LIST_FACE_STATUS}
                            placeholder={t('choose_face_status')}
                            onChange={(e: any) => {
                                handleChangeStatus(e);
                            }}
                            isClearable
                        />
                        <input
                            autoComplete="off"
                            type="text"
                            className="form-input w-auto"
                            placeholder={`${t('search')}`}
                            onChange={(e) => {
                                if (e.target.value === "") {
                                    handleSearch("")
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch(e.currentTarget.value)
                                }
                            }}
                        />
                        {/* <button type="button" className="btn btn-primary btn-sm m-1  custom-button-display" style={{ backgroundColor: display === 'flat' ? '#E9EBD5' : '#FAFBFC', color: 'black' }} onClick={() => setDisplay('flat')}>
                            <IconDisplaylist fill={display === 'flat' ? '#959E5E' : '#BABABA'}></IconDisplaylist>
                        </button>
                        <button type="button" className="btn btn-primary btn-sm m-1  custom-button-display" style={{ backgroundColor: display === 'tree' ? '#E9EBD5' : '#FAFBFC' }} onClick={() => setDisplay('tree')}>
                            <IconDisplayTree fill={display === 'tree' ? '#959E5E' : '#BABABA'}></IconDisplayTree>

                        </button> */}
                    </div>
                </div>
                <div className="mb-5 whitespace-nowrap personnel-container">
                    <TableTree label="Advanced usage" className="personnel-table">
                        <Headers id="personnel-table-header" style={{ backgroundColor: "#EBEAEA" }}>
                            <Header width={'21%'} color="black">{`${t('name_staff')}`}</Header>
                            <Header width={'10%'} color="black">{`${t('code_staff')}`}</Header>
                            <Header width={'18%'} color="black"> {`${t('duty')}`}</Header>
                            <Header width={'13%'} color="black"> {`${t('phone_number')}`}</Header>
                            <Header width={'11%'} color="black"> {`${t('faceStatus')}`}</Header>
                            <Header width={'23%'} color="black"> {t('action')}</Header>
                        </Headers>
                        <InfiniteScroll
                            dataLength={mode === "expand" ? transformedData?.length : humanTree.length}
                            next={fetchMoreData}
                            hasMore={hasMore}
                            loader={mode === "expand" ?
                                <p style={{ textAlign: 'center' }}>
                                    <b>{t('Loading')}...</b>
                                </p> : <div className="flex" style={{ textAlign: 'center', justifyContent: "center", marginTop: "0.5rem" }}>
                                    <button
                                        type='button'
                                        className='button-edit'
                                        onClick={() => fetchMoreData()}
                                    >
                                        {t('load more')}
                                    </button>
                                </div>
                            }
                            endMessage={
                                <p style={{ textAlign: 'center' }}>
                                    <b>{t('You have seen it all')}</b>
                                </p>
                            }
                        >
                            <Rows
                                items={transformedData}
                                render={({ position, id, fullName, name, positionId, code, province, phoneNumber, email, department, faceStatus, users = [] }: Item) =>
                                    <Row
                                        itemId={id}
                                        items={users}
                                        hasChildren={users.length > 0}
                                        isDefaultExpanded={mode === "expand"}
                                    >
                                        <Cell>{department && typeof department === 'object' && 'name' in department ? (department as any).name : name}</Cell>
                                        <Cell>{fullName != undefined ? code : <></>}</Cell>
                                        <Cell>
                                            {display === 'tree' ? positions?.data?.find((i: any) => i.id === positionId)?.name : position && typeof position === 'object' && 'name' in position ? (position as any).name : ''}
                                        </Cell>
                                        <Cell>{phoneNumber?.split('-')?.length > 0 ? phoneNumber?.split('-')?.map((e: any, index: any) => <p key={index}>{e}</p>) : phoneNumber}</Cell>
                                        <Cell>
                                            {
                                                (users.length === 0 && fullName != undefined) ? (faceStatus === 0 ? t('notRegistered') : t('registered')) : ""
                                            }
                                        </Cell>
                                        <Cell>
                                            {users.length === 0 && fullName != undefined ? <div className="flex items-center w-max mx-auto gap-2">
                                                {
                                                    <div className="flex items-center w-max mx-auto gap-2">
                                                        <RBACWrapper
                                                            permissionKey={[
                                                                'human:findOne'
                                                            ]}
                                                            type={'AND'}
                                                        >
                                                            <div className="w-[auto]">
                                                                <button type="button" className='button-detail' onClick={() => handleDetail(id)}>
                                                                    <IconNewEye /><span>
                                                                        {t('detail')}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </RBACWrapper>
                                                        <RBACWrapper
                                                            permissionKey={[
                                                                'human:update'
                                                            ]}
                                                            type={'AND'}
                                                        >
                                                            <div className="w-[auto]">
                                                                <button type="button" className='button-edit' onClick={() => handleEdit(id)}>
                                                                    <IconNewEdit /><span>
                                                                        {t('edit')}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </RBACWrapper>
                                                        <RBACWrapper
                                                            permissionKey={[
                                                                'human:remove'
                                                            ]}
                                                            type={'AND'}
                                                        >
                                                            <div className="w-[auto]">
                                                                <button type="button" className='button-delete' onClick={() => handleDelete({ id, fullName })}>
                                                                    <IconNewTrash />
                                                                    <span>
                                                                        {t('delete')}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </RBACWrapper>
                                                    </div>
                                                }
                                            </div> : <></>}
                                        </Cell>
                                    </Row>
                                }
                            />
                        </InfiniteScroll>
                    </TableTree>
                    {/* <div className="flex w-full flex-col justify-start">
                        <ul className="inline-flex items-center space-x-1 rtl:space-x-reverse justify-end" style={{ marginTop: '10px' }}>
                            <li>
                                <button onClick={() => handleChangePage(display === 'tree' ? page - 1 : pagination?.page - 1, 10)}
                                    type="button"
                                    disabled={page === 1}
                                    className="flex justify-center rounded-full bg-white-light p-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
                                >
                                    <IconCaretDown className="w-5 h-5 rotate-90 rtl:-rotate-90" />
                                </button>
                            </li>
{renderPageNumbers()}
                            <li>
                                <button onClick={() => handleChangePage(display === 'tree' ? page + 1 : pagination?.page + 1, 10)}
                                    type="button"
                                    disabled={page === totalPages}
                                    className="flex justify-center rounded-full bg-white-light p-2 font-semibold text-dark transition hover:bg-primary hover:text-white dark:bg-[#191e3a] dark:text-white-light dark:hover:bg-primary"
                                >
                                    <IconCaretDown className="w-5 h-5 -rotate-90 rtl:rotate-90" />
                                </button>
                            </li>
                        </ul>
                    </div> */}
                </div>

            </div>
        </div>
    );
};

export default Department;
