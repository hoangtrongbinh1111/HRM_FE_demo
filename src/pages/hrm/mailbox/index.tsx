'use client';
import { useState, useEffect, useRef } from 'react';
import { Disclosure } from '@headlessui/react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'react-quill/dist/quill.snow.css';
import Dropdown from '@/components/Dropdown';
import Swal from 'sweetalert2';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { setPageTitle } from '@/store/themeConfigSlice';
import dynamic from 'next/dynamic';
import IconMail from '@/components/Icon/IconMail';
import IconStar from '@/components/Icon/IconStar';
import IconSend from '@/components/Icon/IconSend';
import IconInfoHexagon from '@/components/Icon/IconInfoHexagon';
import IconFile from '@/components/Icon/IconFile';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconArchive from '@/components/Icon/IconArchive';
import IconBookmark from '@/components/Icon/IconBookmark';
import IconVideo from '@/components/Icon/IconVideo';
import IconChartSquare from '@/components/Icon/IconChartSquare';
import IconUserPlus from '@/components/Icon/IconUserPlus';
import IconPlus from '@/components/Icon/IconPlus';
import IconRefresh from '@/components/Icon/IconRefresh';
import IconWheel from '@/components/Icon/IconWheel';
import IconHorizontalDots from '@/components/Icon/IconHorizontalDots';
import IconOpenBook from '@/components/Icon/IconOpenBook';
import IconBook from '@/components/Icon/IconBook';
import IconTrash from '@/components/Icon/IconTrash';
import IconRestore from '@/components/Icon/IconRestore';
import IconMenu from '@/components/Icon/IconMenu';
import IconSearch from '@/components/Icon/IconSearch';
import IconSettings from '@/components/Icon/IconSettings';
import IconHelpCircle from '@/components/Icon/IconHelpCircle';
import IconUser from '@/components/Icon/IconUser';
import IconMessage2 from '@/components/Icon/IconMessage2';
import IconUsers from '@/components/Icon/IconUsers';
import IconTag from '@/components/Icon/IconTag';
import IconPaperclip from '@/components/Icon/IconPaperclip';
import IconArrowLeft from '@/components/Icon/IconArrowLeft';
import IconPrinter from '@/components/Icon/IconPrinter';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import IconGallery from '@/components/Icon/IconGallery';
import IconFolder from '@/components/Icon/IconFolder';
import IconZipFile from '@/components/Icon/IconZipFile';
import IconTxtFile from '@/components/Icon/IconTxtFile';
import IconDownload from '@/components/Icon/IconDownload';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
// import { TreeSelect } from 'antd';
import { Announcements } from '@/services/swr/announcement.swr';
import dayjs from 'dayjs';
import { HumansByDepartment } from '@/services/swr/human.swr';
import { createAnnouncement } from '@/services/apis/announcement.api';
import { useRouter } from 'next/router';
import { Upload } from '@/services/apis/upload.api';
interface Props {
    [key: string]: any;
}

const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const Mailbox = () => {
    const dispatch = useDispatch();
    const [humans, setHumans] = useState([]);
    useEffect(() => {
        dispatch(setPageTitle('Mailbox'));
    });
    const router = useRouter();

    const formRef = useRef<any>();
    const fileRef = useRef<any>();
    const { data: announcements, pagination, mutate } = Announcements({ sortBy: 'id.ASC', ...router.query });
    const { data: humanTree } = HumansByDepartment({ sortBy: 'id.ASC', page: 1, perPage: 100 });
    const transformedData =
        humanTree &&
        humanTree.data?.map((department: any) => {
            return {
                title: department?.name,
                value: department.id,
                children: department.users?.map((user: any) => {
                    return {
                        title: user.fullName,
                        value: user.id,
                    };
                }),
            };
        });
    const humansTree = [
        {
            title: 'Tất cả',
            value: 0,
            children: transformedData,
        },
    ];
    const [mailList, setMailList] = useState([
        {
            id: 5,
            path: 'profile-17.jpeg',
            firstName: 'Roxanne',
            lastName: '',
            email: 'roxanne@mail.com',
            date: '11/15/2021',
            time: '2:00 PM',
            title: 'Schedular Alert',
            displayDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pulvinar feugiat consequat. Duis lacus nibh, sagittis id varius vel, aliquet non augue.',
            type: 'inbox',
            isImportant: false,
            isStar: false,
            group: 'personal',
            isUnread: true,
            description: `
                              <p class="mail-content"> Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS. </p>
                              <p>Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.</p>
                              `,
        },
        {
            id: 6,
            path: 'profile-18.jpeg',
            firstName: 'Nia',
            lastName: 'Hillyer',
            email: 'niahillyer@mail.com',
            date: '08/16/2020',
            time: '2:22 AM',
            title: 'Motion UI Kit',
            displayDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pulvinar feugiat consequat. Duis lacus nibh, sagittis id varius vel, aliquet non augue.',
            type: 'inbox',
            isImportant: true,

            isStar: true,
            group: '',
            isUnread: false,
            description: `
                              <p class="mail-content"> Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et.</p>
                              <div class="gallery text-center">
                                  <img alt="image-gallery" src="${'/assets/images/carousel3.jpeg'}" class="mb-4 mt-4" style="width: 250px; height: 180px;">
                                  <img alt="image-gallery" src="${'/assets/images/carousel2.jpeg'}" class="mb-4 mt-4" style="width: 250px; height: 180px;">
                                  <img alt="image-gallery" src="${'/assets/images/carousel1.jpeg'}" class="mb-4 mt-4" style="width: 250px; height: 180px;">
                              </div>
                              <p>Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.</p>
                              `,
        },
        {
            id: 7,
            path: 'profile-19.jpeg',
            firstName: 'Iris',
            lastName: 'Hubbard',
            email: 'irishubbard@mail.com',
            date: '08/16/2020',
            time: '1:40 PM',
            title: 'Green Illustration',
            displayDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pulvinar feugiat consequat. Duis lacus nibh, sagittis id varius vel, aliquet non augue.',
            type: 'inbox',
            isImportant: true,

            isStar: true,
            group: '',
            isUnread: false,
            description: `
                              <p class="mail-content"> Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS. </p>
                              <p>Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.</p>
                              `,
        },
        {
            id: 26,
            path: 'profile-26.jpeg',
            firstName: 'Florida',
            lastName: 'Morgan',
            email: 'florida54@gmail.com',
            date: '05/12/2019',
            time: '09:20 PM',
            title: 'Et fugit eligendi deleniti quidem qui sint nihil autem',
            displayDescription:
                'Doloribus at sed quis culpa deserunt consectetur qui praesentium\naccusamus fugiat dicta\nvoluptatem rerum ut voluptate autem\nvoluptatem repellendus aspernatur dolorem in',
            type: 'inbox',
            isImportant: false,
            isStar: false,
            group: '',
            isUnread: false,
            description: `<p class="mail-content">Doloribus at sed quis culpa deserunt consectetur qui praesentium\naccusamus fugiat dicta\nvoluptatem rerum ut voluptate autem\nvoluptatem repellendus aspernatur dolorem in</p>
                          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>`,
        },
    ]);

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

    const [isShowMailMenu, setIsShowMailMenu] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedTab, setSelectedTab] = useState('inbox');
    const [filteredMailList, setFilteredMailList] = useState<any>(mailList.filter((d) => d.type === 'inbox'));
    const [ids, setIds] = useState<any>([]);
    const [searchText, setSearchText] = useState<any>('');
    const [search, setSearch] = useState<any>('');
    const [selectedMail, setSelectedMail] = useState<any>(null);
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const [pagedMails, setPagedMails] = useState<any>([]);
    const [dataPath, setDataPath] = useState<any>();
    const { t } = useTranslation();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [pager] = useState<any>({
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        startIndex: 0,
        endIndex: 0,
    });

    useEffect(() => {
        searchMails();
    }, [selectedTab, searchText, mailList]);

    const refreshMails = () => {
        setSearchText('');
        searchMails(false);
    };

    const setArchive = () => {
        if (ids.length) {
            let items = filteredMailList.filter((d: any) => ids.includes(d.id));
            for (let item of items) {
                item.type = item.type === 'archive' ? 'inbox' : 'archive';
            }
            if (selectedTab === 'archive') {
                showMessage(ids.length + ' Mail has been removed from Archive.');
            } else {
                showMessage(ids.length + ' Mail has been added to Archive.');
            }
            searchMails(false);
        }
    };

    const setSpam = () => {
        if (ids.length) {
            let items = filteredMailList.filter((d: any) => ids.includes(d.id));
            for (let item of items) {
                item.type = item.type === 'spam' ? 'inbox' : 'spam';
            }
            if (selectedTab === 'spam') {
                showMessage(ids.length + ' Mail has been removed from Spam.');
            } else {
                showMessage(ids.length + ' Mail has been added to Spam.');
            }
            searchMails(false);
        }
    };

    const setGroup = (group: any) => {
        setSearch(group);
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                type: group,
            },
        });
    };

    const setAction = (type: any) => {
        if (ids.length) {
            const totalSelected = ids.length;
            let items = filteredMailList.filter((d: any) => ids.includes(d.id));
            for (let item of items) {
                if (type === 'trash') {
                    item.type = 'trash';
                    item.group = '';
                    item.isStar = false;
                    item.isImportant = false;
                    showMessage(totalSelected + ' Mail has been deleted.');
                    searchMails(false);
                } else if (type === 'read') {
                    item.isUnread = false;
                    showMessage(totalSelected + ' Mail has been marked as Read.');
                } else if (type === 'unread') {
                    item.isUnread = true;
                    showMessage(totalSelected + ' Mail has been marked as UnRead.');
                } else if (type === 'important') {
                    item.isImportant = true;
                    showMessage(totalSelected + ' Mail has been marked as Important.');
                } else if (type === 'unimportant') {
                    item.isImportant = false;
                    showMessage(totalSelected + ' Mail has been marked as UnImportant.');
                } else if (type === 'star') {
                    item.isStar = true;
                    showMessage(totalSelected + ' Mail has been marked as Star.');
                }
                //restore & permanent delete
                else if (type === 'restore') {
                    item.type = 'inbox';
                    showMessage(totalSelected + ' Mail Restored.');
                    searchMails(false);
                } else if (type === 'delete') {
                    setMailList(mailList.filter((d: any) => d.id != item.id));
                    showMessage(totalSelected + ' Mail Permanently Deleted.');
                    searchMails(false);
                }
            }
            clearSelection();
        }
    };

    const selectMail = (item: any) => {
        if (item) {
            if (item.type !== 'draft') {
                if (item && item.isUnread) {
                    item.isUnread = false;
                }
                setSelectedMail(item);
            } else {
                openMail('draft', item);
            }
        } else {
            setSelectedMail('');
        }
    };

    const setStar = (mailId: number) => {
        if (mailId) {
            let item = filteredMailList.find((d: any) => d.id === mailId);
            item.isStar = !item.isStar;
            setTimeout(() => {
                searchMails(false);
            });
        }
    };

    const setImportant = (mailId: number) => {
        if (mailId) {
            let item = filteredMailList.find((d: any) => d.id === mailId);
            item.isImportant = !item.isImportant;
            setTimeout(() => {
                searchMails(false);
            });
        }
    };

    const showTime = (item: any) => {
        const displayDt: any = new Date(item.date);
        const cDt: any = new Date();
        if (displayDt.toDateString() === cDt.toDateString()) {
            return item.time;
        } else {
            if (displayDt.getFullYear() === cDt.getFullYear()) {
                var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return monthNames[displayDt.getMonth()] + ' ' + String(displayDt.getDate()).padStart(2, '0');
            } else {
                return String(displayDt.getMonth() + 1).padStart(2, '0') + '/' + String(displayDt.getDate()).padStart(2, '0') + '/' + displayDt.getFullYear();
            }
        }
    };

    const openMail = (type: string, item: any) => {
        if (type === 'add') {
            setIsShowMailMenu(false);
            setParams(JSON.parse(JSON.stringify(defaultParams)));
        } else if (type === 'draft') {
            let data = JSON.parse(JSON.stringify(item));
            setParams({
                ...data,
                from: defaultParams.from,
                to: data.email,
                displayDescription: data.email,
            });
        } else if (type === 'reply') {
            let data = JSON.parse(JSON.stringify(item));
            setParams({
                ...data,
                from: defaultParams.from,
                to: data.email,
                title: 'Re: ' + data.title,
                displayDescription: 'Re: ' + data.title,
            });
        } else if (type === 'forward') {
            let data = JSON.parse(JSON.stringify(item));
            setParams({
                ...data,
                from: defaultParams.from,
                to: data.email,
                title: 'Fwd: ' + data.title,
                displayDescription: 'Fwd: ' + data.title,
            });
        }
        setIsEdit(true);
    };
    //tìm kiếm mail
    const searchMails = (isResetPage = true) => { };

    const saveMail = (type: any, id: any) => {
        if (!params.to) {
            showMessage('To email address is required.', 'error');
            return false;
        }
        if (!params.title) {
            showMessage('Title of email is required.', 'error');
            return false;
        }

        let maxId = 0;
        if (!params.id) {
            maxId = mailList.length ? mailList.reduce((max, character) => (character.id > max ? character.id : max), mailList[0].id) : 0;
        }
        let cDt = new Date();

        let obj: any = {
            id: maxId + 1,
            path: '',
            firstName: '',
            lastName: '',
            email: params.to,
            date: cDt.getMonth() + 1 + '/' + cDt.getDate() + '/' + cDt.getFullYear(),
            time: cDt.toLocaleTimeString(),
            type: params.type,
            displayDescription: params.displayDescription,
            // type: 'draft',
            isImportant: false,
            group: '',
            isUnread: false,
            description: params.description,
            attachments: null,
        };
        if (params.file && params.file.length) {
            obj.attachments = [];
            for (let file of params.file) {
                let flObj = {
                    name: file.name,
                    size: getFileSize(file.size),
                    type: getFileType(file.type),
                };
                obj.attachments.push(flObj);
            }
        }
        if (type === 'save' || type === 'save_reply' || type === 'save_forward') {
            //saved to draft
            obj.type = 'draft';
            mailList.splice(0, 0, obj);
            searchMails();
            showMessage('Mail has been saved successfully to draft.');
        } else if (type === 'send' || type === 'reply' || type === 'forward') {
            //saved to sent mail
            obj.type = 'sent_mail';
            mailList.splice(0, 0, obj);
            searchMails();
            showMessage('Mail has been sent successfully.');
        }

        setSelectedMail(null);
        setIsEdit(false);
    };

    const getFileSize = (file_type: any) => {
        let type = 'file';
        if (file_type.includes('image/')) {
            type = 'image';
        } else if (file_type.includes('application/x-zip')) {
            type = 'zip';
        }
        return type;
    };

    const getFileType = (total_bytes: number) => {
        let size = '';
        if (total_bytes < 1000000) {
            size = Math.floor(total_bytes / 1000) + 'KB';
        } else {
            size = Math.floor(total_bytes / 1000000) + 'MB';
        }
        return size;
    };

    const clearSelection = () => {
        setIds([]);
    };

    const tabChanged = (tabType: any) => {
        setIsEdit(false);
        setIsShowMailMenu(false);
        setSelectedMail(null);
    };

    const changeValue = (e: any) => {
        if (e?.value) {
            setParams({ ...params, type: e.value });
        } else {
            const { value, id } = e.target;
            setParams({ ...params, [id]: value });
        }
    };

    const [path, setPath] = useState<any>([]);

    useEffect(() => {
        const listPath = path?.filter((item: any) => item !== undefined) ?? [];
        setPath([...listPath, dataPath]); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataPath]);
    const handleChange = async (event: any) => {
        await Object.keys(event.target.files).map((item: any) => {
            const formData = new FormData();
            formData.append('file', event.target.files[item]);
            formData.append('fileName', event.target.files[item].name);
            const fileExtension = event.target.files[item]?.name.split('.').pop();
            Upload(formData)
                .then((res) => {
                    setDataPath({ id: res.data.id, path: res.data.path, name: res?.data?.name });
                    return;
                })
                .catch((err) => {
                    showMessage(`${err?.response?.data?.message}`, 'error');
                });
        });
    };
    const handleSubmit = (value: any) => {
        const query = {
            content: value.content,
            attachmentIds: [],
            type: 'HUMAN',
            users: humans,
            title: value?.title,
        };
        if (dataPath) {
            query.attachmentIds = path.map((item: any) => {
                return item.id;
            });
        }
        createAnnouncement({
            ...query,
        })
            .then(() => {
                showMessage(`${t('create_announcement_success')}`, 'success');
            })
            .catch((err) => {
                showMessage(`${err?.response?.data?.message[0].error ? err?.response?.data?.message[0].error : err?.response?.data?.message}`, 'error');
            });
    };
    const handleCheckboxChange = (id: any) => {
        if (ids.includes(id)) {
            setIds((value: any) => value.filter((d: any) => d !== id));
        } else {
            setIds([...ids, id]);
        }
    };
    const handleSearch = (param: any) => {
        setSearch(param);
        router.replace({
            pathname: router.pathname,
            query: {
                ...router.query,
                search: param,
            },
        });
    };
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            handleSearch(search);
        }
    };
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
    const checkAllCheckbox = () => {
        if (announcements?.data.length && ids.length === announcements?.data.length) {
            return true;
        } else {
            return false;
        }
    };

    const closeMsgPopUp = () => {
        setIsEdit(false);
        setSelectedTab('inbox');
        searchMails();
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    return (
        <div>
            <div className="relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)]">
                <div
                    className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowMailMenu ? '!block xl:!hidden' : ''}`}
                    onClick={() => setIsShowMailMenu(!isShowMailMenu)}
                ></div>
                <div
                    className={`panel dark:gray-50 absolute z-10 hidden h-full w-[250px] max-w-full flex-none space-y-3 overflow-hidden p-4 xl:relative xl:block xl:h-auto ltr:rounded-r-none ltr:xl:rounded-r-md rtl:rounded-l-none rtl:xl:rounded-l-md ${isShowMailMenu ? '!block' : ''
                        }`}
                >
                    <div className="flex h-full flex-col pb-16">
                        <div className="pb-5">
                            <button className="btn btn-primary w-full" type="button" onClick={() => openMail('add', null)}>
                                Tạo mới
                            </button>
                        </div>
                        <PerfectScrollbar className="relative h-full grow ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5">
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${!isEdit && selectedTab === 'inbox' ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedTab('inbox');
                                        tabChanged('inbox');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconMail className="h-5 w-5 shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">DS thông báo</div>
                                    </div>
                                    <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">{pagination?.totalRecords}</div>
                                </button>

                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${!isEdit && selectedTab === 'star' ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedTab('star');
                                        tabChanged('star');
                                    }}
                                >
                                    <div className="flex items-center">
                                        <IconStar className="shrink-0" />
                                        <div className="ltr:ml-3 rtl:mr-3">Thông báo quan trọng</div>
                                    </div>
                                </button>
                            </div>
                        </PerfectScrollbar>
                    </div>
                </div>

                <div className="panel h-full flex-1 overflow-x-hidden p-0">
                    {!selectedMail && !isEdit && (
                        <div className="flex h-full flex-col">
                            <div className="flex flex-wrap-reverse items-center justify-between gap-4 p-4">
                                <div className="flex w-full items-center sm:w-auto">
                                    <div className="ltr:mr-4 rtl:ml-4">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            checked={checkAllCheckbox()}
                                            value={ids}
                                            onChange={() => {
                                                if (ids.length === announcements?.data.length) {
                                                    setIds([]);
                                                } else {
                                                    let checkedIds = announcements?.data.map((d: any) => {
                                                        return d.id;
                                                    });
                                                    setIds([...checkedIds]);
                                                }
                                            }}
                                            onClick={(event) => event.stopPropagation()}
                                        />
                                    </div>
                                    <div>Chọn tất cả</div>

                                    {/* {selectedTab !== 'trash' && (
										<ul className="flex grow items-center gap-4 sm:flex-none ltr:sm:mr-4 rtl:sm:ml-4">
											<li>
												<div>
													<Tippy content="Archive">
														<button type="button" className="flex items-center hover:text-primary" onClick={setArchive}>
															<IconArchive />
														</button>
													</Tippy>
												</div>
											</li>
											<li>
												<div>
													<Tippy content="Spam">
														<button type="button" className="flex items-center hover:text-primary" onClick={setSpam}>
															<IconInfoHexagon />
														</button>
													</Tippy>
												</div>
											</li>
											<li>
												<div className="dropdown">
													<Dropdown
														offset={[0, 1]}
														placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
														btnClassName="hover:text-primary flex items-center"
														button={
															<Tippy content="Group">
																<span>
																	<IconWheel />
																</span>
															</Tippy>
														}
													>
														<ul className="text-sm font-medium">
															<li>
																<button type="button" className="w-full" onClick={() => setGroup('ALL')}>
																	<div className="h-2 w-2 shrink-0 rounded-full bg-primary ltr:mr-3 rtl:ml-3"></div>
																	Toàn bộ
																</button>
															</li>
															<li>
																<button type="button" className="w-full" onClick={() => setGroup('HUMAN')}>
																	<div className="h-2 w-2 shrink-0 rounded-full bg-danger ltr:mr-3 rtl:ml-3"></div>
																	Cá nhân
																</button>
															</li>
														</ul>
													</Dropdown>
												</div>
											</li>
											<li>
												<div className="dropdown">
													<Dropdown
														offset={[0, 1]}
														placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
														btnClassName="hover:text-primary flex items-center"
														button={<IconHorizontalDots className="rotate-90 opacity-70" />}
													>
														<ul className="whitespace-nowrap">
															<li>
																<button type="button" className="w-full" onClick={() => setAction('read')}>
																	<IconOpenBook className="shrink-0 ltr:mr-2 rtl:ml-2" />
																	Mark as Read
																</button>
															</li>
															<li>
																<button type="button" className="w-full" onClick={() => setAction('unread')}>
																	<IconBook className="shrink-0 ltr:mr-2 rtl:ml-2" />
																	Mark as Unread
																</button>
															</li>
															<li>
																<button type="button" className="w-full" onClick={() => setAction('trash')}>
																	<IconTrashLines className="shrink-0 ltr:mr-2 rtl:ml-2" />
																	Trash
																</button>
															</li>
														</ul>
													</Dropdown>
												</div>
											</li>
										</ul>
									)}

									{selectedTab === 'trash' && (
										<ul className="flex flex-1 items-center gap-4 sm:flex-none ltr:sm:mr-3 rtl:sm:ml-4">
											<li>
												<div>
													<Tippy content="Permanently Delete">
														<button type="button" className="block hover:text-primary" onClick={() => setAction('delete')}>
															<IconTrash />
														</button>
													</Tippy>
												</div>
											</li>
											<li>
												<div>
													<Tippy content="Restore">
														<button type="button" className="block hover:text-primary" onClick={() => setAction('restore')}>
															<IconRestore />
														</button>
													</Tippy>
												</div>
											</li>
										</ul>
									)} */}
                                </div>

                                <div className="flex w-full items-center justify-between sm:w-auto">
                                    <div className="flex items-center ltr:mr-4 rtl:ml-4">
                                        <button type="button" className="block hover:text-primary xl:hidden ltr:mr-3 rtl:ml-3" onClick={() => setIsShowMailMenu(!isShowMailMenu)}>
                                            <IconMenu />
                                        </button>
                                        <div className="group relative">
                                            <input
                                                autoComplete="off"
                                                type="text"
                                                className="form-input w-auto"
                                                value={search}
                                                onKeyDown={(e) => handleKeyPress(e)}
                                                onChange={(e) => (e.target.value === '' ? handleSearch('') : setSearch(e.target.value))}
                                            />
                                            <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                                                <IconSearch />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="ltr:mr-4 rtl:ml-4">
                                            <Tippy content="Settings">
                                                <button type="button" className="hover:text-primary">
                                                    <IconSettings />
                                                </button>
                                            </Tippy>
                                        </div>
                                        <div>
                                            <Tippy content="Help">
                                                <button type="button" className="hover:text-primary">
                                                    <IconHelpCircle className="h-6 w-6" />
                                                </button>
                                            </Tippy>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>

                            <div className="flex flex-col flex-wrap items-center justify-between px-4 pb-4 md:flex-row xl:w-auto">
                                <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-4">
                                    <button type="button" className={`btn btn-outline-primary flex ${selectedTab === 'personal' ? 'bg-primary text-white' : ''}`} onClick={() => setGroup('ALL')}>
                                        <IconUsers className="ltr:mr-2 rtl:ml-2" />
                                        Toàn bộ
                                    </button>
                                    {/* <button
										type="button"
										className={`btn btn-outline-success flex ${selectedTab === 'social' ? 'bg-success text-white' : ''}`}
										onClick={() => {
											setSelectedTab('social');
											tabChanged('social');
										}}
									>
                                    <IconMessage2 className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
										Phòng ban
									</button> */}

                                    <button type="button" className={`btn btn-outline-danger flex ${selectedTab === 'private' ? 'bg-danger text-white' : ''}`} onClick={() => setGroup('HUMAN')}>
                                        <IconTag className="ltr:mr-2 rtl:ml-2" />
                                        Cá nhân
                                    </button>
                                </div>
                                <div className="mt-4 flex-1 md:flex-auto">
                                    <div className="flex items-center justify-center md:justify-end">
                                        <div className="ltr:mr-3 rtl:ml-3">
                                            {pagination?.page +
                                                '-' +
                                                `${pagination?.perPage * pagination?.page > pagination?.totalRecords ? pagination?.totalRecords : pagination?.perPage * pagination?.page}` +
                                                ' of ' +
                                                pagination?.totalRecords}
                                        </div>
                                        <button
                                            type="button"
                                            disabled={pagination?.page === 1}
                                            className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30 ltr:mr-3 rtl:ml-3"
                                            onClick={() => {
                                                pager.currentPage--
                                                handleChangePage(pager.currentPage, pagination?.perPage);
                                            }}
                                        >
                                            <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={pagination?.perPage * pagination?.page > pagination?.totalRecords}
                                            className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                                            onClick={() => {
                                                pager.currentPage++
                                                handleChangePage(pager.currentPage, pagination?.perPage);
                                            }}
                                        >
                                            <IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Danh sách  */}
                            <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                            {announcements?.data ? (
                                <div className="table-responsive min-h-[400px] grow overflow-y-auto sm:min-h-[300px]">
                                    <table className="table-hover">
                                        <tbody>
                                            {announcements?.data.map((announ: any) => {
                                                return (
                                                    <tr key={announ.id} className="cursor-pointer" onClick={() => selectMail(announ)}>
                                                        <td>
                                                            <div className="flex items-center whitespace-nowrap">
                                                                <div className="ltr:mr-3 rtl:ml-3">
                                                                    {ids.includes(announ.id)}
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`chk-${announ.id}`}
                                                                        value={announ.id}
                                                                        checked={ids.length ? ids.includes(announ.id) : false}
                                                                        onChange={() => handleCheckboxChange(announ.id)}
                                                                        onClick={(event) => event.stopPropagation()}
                                                                        className="form-checkbox"
                                                                    />
                                                                </div>
                                                                <div className="ltr:mr-3 rtl:ml-3">
                                                                    <Tippy content="Star">
                                                                        <button
                                                                            type="button"
                                                                            className={`flex items-center enabled:hover:text-warning disabled:opacity-60 ${announ.isStar ? 'text-warning' : ''}`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setStar(announ.id);
                                                                            }}
                                                                            disabled={selectedTab === 'trash'}
                                                                        >
                                                                            <IconStar className={announ.isStar ? 'fill-warning' : ''} />
                                                                        </button>
                                                                    </Tippy>
                                                                </div>
                                                                <div className="ltr:mr-3 rtl:ml-3">
                                                                    <Tippy content="Important">
                                                                        <button
                                                                            type="button"
                                                                            className={`flex rotate-90 items-center enabled:hover:text-primary disabled:opacity-60 ${announ.isImportant ? 'text-primary' : ''
                                                                                }`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setImportant(announ.id);
                                                                            }}
                                                                            disabled={selectedTab === 'trash'}
                                                                        >
                                                                            <IconBookmark bookmark={false} className={`h-4.5 w-4.5 ${announ.isImportant && 'fill-primary'}`} />
                                                                        </button>
                                                                    </Tippy>
                                                                </div>
                                                                <div className={`whitespace-nowrap font-semibold dark:text-gray-300 ${!announ.isUnread ? 'text-gray-500 dark:text-gray-500' : ''}`}>
                                                                    {announ.createdBy?.fullName ? announ.createdBy?.fullName : ''}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="line-clamp-1 min-w-[300px] overflow-hidden font-medium text-white-dark">
                                                                <span className={`${announ.isUnread ? 'font-semibold text-gray-800 dark:text-gray-300' : ''}`}>
                                                                    <span>{announ.title}</span> &minus;
                                                                    <span> {announ.content}</span>
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="flex items-center">
                                                                <div
                                                                    className={`h-2 w-2 rounded-full ${(announ.type === 'ALL' && 'bg-primary') || (announ.type === 'HUMAN' && 'bg-danger')
                                                                        // (announ.group === 'social' && 'bg-success') ||
                                                                        // (announ.group === 'private' && 'bg-danger')
                                                                        }`}
                                                                ></div>
                                                                {announ.attachments[0] && (
                                                                    <div className="ltr:ml-4 rtl:mr-4">
                                                                        <IconPaperclip />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap font-medium ltr:text-right rtl:text-left">{dayjs(announ?.createdAt).format('DD-MM-YYYY')}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="grid h-full min-h-[300px] place-content-center text-lg font-semibold">Không có dữ liệu</div>
                            )}
                        </div>
                    )}

                    {selectedMail && !isEdit && (
                        <div>
                            <div className="flex flex-wrap items-center justify-between p-4">
                                <div className="flex items-center">
                                    <button type="button" className="hover:text-primary ltr:mr-2 rtl:ml-2" onClick={() => setSelectedMail(null)}>
                                        <IconArrowLeft className="h-5 w-5 rotate-180" />
                                    </button>
                                    <h4 className="text-base font-medium md:text-lg ltr:mr-2 rtl:ml-2">{selectedMail.title}</h4>
                                    <div className="badge bg-info hover:top-0">{selectedMail.type === 'ALL' ? 'Tất cả' : 'Nhân sự'}</div>
                                </div>
                                <div>
                                    <Tippy content="Print">
                                        <button type="button">
                                            <IconPrinter />
                                        </button>
                                    </Tippy>
                                </div>
                            </div>
                            <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                            <div className="relative p-4">
                                <div className="flex flex-wrap">
                                    <div className="flex-shrink-0 ltr:mr-2 rtl:ml-2">
                                        {selectedMail.createdBy?.avatar ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_BE_URL}${selectedMail.createdBy?.avatar}`}
                                                alt="img"
                                                className="h-12 w-12 rounded-full object-cover"
                                                style={{ width: '80px', height: '80px', borderRadius: '50px' }}
                                            />
                                        ) : (
                                            <img src="/assets/images/default.png" className="icon_upload" style={{ width: '40px', height: '40px', borderRadius: '50px' }}></img>
                                        )}
                                    </div>
                                    <div className="flex-1 ltr:mr-2 rtl:ml-2">
                                        <div className="flex items-center">
                                            <div className="whitespace-nowrap text-lg ltr:mr-4 rtl:ml-4">{selectedMail.createdBy ? selectedMail.createdBy?.fullName : ''}</div>
                                            {selectedMail.group && (
                                                <div className="ltr:mr-4 rtl:ml-4">
                                                    <Tippy content={selectedMail.group} className="capitalize">
                                                        <div
                                                            className={`h-2 w-2 rounded-full ${(selectedMail.group === 'personal' && 'bg-primary') ||
                                                                (selectedMail.group === 'work' && 'bg-warning') ||
                                                                (selectedMail.group === 'social' && 'bg-success') ||
                                                                (selectedMail.group === 'private' && 'bg-danger')
                                                                }`}
                                                        ></div>
                                                    </Tippy>
                                                </div>
                                            )}
                                            <div className="whitespace-nowrap text-white-dark">1 days ago</div>
                                        </div>
                                        <div className="flex items-center text-white-dark">
                                            <div className="ltr:mr-1 rtl:ml-1">{selectedMail.type === 'sent_mail' ? selectedMail.email : 'đến tôi'}</div>
                                            <div className="dropdown">
                                                <Dropdown offset={[0, 5]} placement={'bottom-end'} btnClassName="hover:text-primary flex items-center" button={<IconCaretDown className="h-5 w-5" />}>
                                                    <ul className="sm:w-56">
                                                        <li>
                                                            <div className="flex items-center px-4 py-2">
                                                                <div className="w-1/3 text-white-dark ltr:mr-2 rtl:ml-2">Từ:</div>
                                                                <div className="flex-1">{selectedMail.createdBy?.fullName}</div>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="flex items-center px-4 py-2">
                                                                <div className="w-1/3 text-white-dark ltr:mr-2 rtl:ml-2">Đến:</div>
                                                                <div className="flex-1">{selectedMail.type !== 'ALL' ? 'Tất cả' : 'Tôi'}</div>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="flex items-center px-4 py-2">
                                                                <div className="w-1/3 text-white-dark ltr:mr-2 rtl:ml-2">Ngày:</div>
                                                                <div className="flex-1">{selectedMail.createdAt}</div>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="flex items-center px-4 py-2">
                                                                <div className="w-1/3 text-white-dark ltr:mr-2 rtl:ml-2">{t('title')}:</div>
                                                                <div className="flex-1">{selectedMail.title}</div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                                            <Tippy content="Star">
                                                <button
                                                    type="button"
                                                    className={`enabled:hover:text-warning disabled:opacity-60 ${selectedMail.isStar ? 'text-warning' : ''}`}
                                                    onClick={() => setStar(selectedMail.id)}
                                                    disabled={selectedTab === 'trash'}
                                                >
                                                    <IconStar className={selectedMail.isStar ? 'fill-warning' : ''} />
                                                </button>
                                            </Tippy>
                                            <Tippy content="Important">
                                                <button
                                                    type="button"
                                                    className={`enabled:hover:text-primary disabled:opacity-60 ${selectedMail.isImportant ? 'text-primary' : ''}`}
                                                    onClick={() => setImportant(selectedMail.id)}
                                                    disabled={selectedTab === 'trash'}
                                                >
                                                    <IconBookmark bookmark={false} className={`h-4.5 w-4.5 rotate-90 ${selectedMail.isImportant && 'fill-primary'}`} />
                                                </button>
                                            </Tippy>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="prose mt-8 max-w-full prose-p:text-sm prose-img:m-0 prose-img:inline-block dark:prose-p:text-white md:prose-p:text-sm"
                                    dangerouslySetInnerHTML={{ __html: selectedMail.content }}
                                ></div>
                                <p className="mt-4">Trân trọng,</p>
                                <p>{selectedMail.createdBy?.fullName}</p>

                                {selectedMail.attachments && (
                                    <div className="mt-8">
                                        <div className="mb-4 text-base">Tệp đính kèm</div>
                                        <div className="h-px border-b border-white-light dark:border-[#1b2e4b]"></div>
                                        <div className="mt-6 flex flex-wrap items-center">
                                            {selectedMail.attachments.map((attachment: any, i: number) => {
                                                return (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        className="group relative mb-4 flex items-center rounded-md border border-white-light px-4 py-2.5 transition-all duration-300 hover:border-primary hover:text-primary dark:border-[#1b2e4b] ltr:mr-4 rtl:ml-4"
                                                    >
                                                        {attachment.type === 'image' && <IconGallery />}
                                                        {attachment.type === 'folder' && <IconFolder />}
                                                        {attachment.type === 'zip' && <IconZipFile />}
                                                        {attachment.type !== 'zip' && attachment.type !== 'image' && attachment.type !== 'folder' && <IconTxtFile className="h-5 w-5" />}

                                                        <div className="ltr:ml-3 rtl:mr-3">
                                                            <p className="text-xs font-semibold text-primary">{attachment.name}</p>
                                                            <p className="text-[11px] text-gray-400 dark:text-gray-600">{attachment.size}</p>
                                                        </div>
                                                        <div className="absolute top-0 z-[5] hidden h-full w-full rounded-md bg-dark-light/40 group-hover:block ltr:left-0 rtl:right-0"></div>
                                                        <div className="btn btn-primary absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 rounded-full p-1 group-hover:block">
                                                            <IconDownload className="h-4.5 w-4.5" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {isEdit && (
                        <div className="relative">
                            <div className="flex items-center px-6 py-4">
                                <button type="button" className="block hover:text-primary xl:hidden ltr:mr-3 rtl:ml-3" onClick={() => setIsShowMailMenu(!isShowMailMenu)}>
                                    <IconMenu />
                                </button>
                                <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400">{t('Create Announcement')}</h4>
                            </div>
                            <div className="h-px bg-gradient-to-l from-indigo-900/20 via-black to-indigo-900/20 opacity-[0.1] dark:via-white"></div>
                            <Formik
                                initialValues={{
                                    title: '',
                                    type: '',
                                    attachmentIds: [],
                                    users: [],
                                    departments: [],
                                    content: '',
                                }}
                                // validationSchema={SubmittedForm}
                                onSubmit={(values) => {
                                    handleSubmit(values);
                                }}
                            >
                                {({ errors, touched, submitCount, setFieldValue, values }) => (
                                    <Form className="space-y-5" style={{ padding: '0 25px' }}>
                                        <div>
                                            <label htmlFor="title" className="label">
                                                {' '}
                                                {t('title')} <span style={{ color: 'red' }}>* </span>
                                            </label>
                                            <Field autoComplete="off" name="title" type="text" id="title" placeholder={`${t('please_fill_title')}`} className="form-input" />
                                            {submitCount ? errors.title ? <div className="mt-1 text-danger"> {errors.title} </div> : null : ''}
                                        </div>

                                        <div>
                                            <label htmlFor="type" className="label">
                                                {t('users1')} <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            {/* <TreeSelect
												style={{ width: '100%' }}
												treeCheckable={true}
												id="type"
												treeData={humansTree || []}
												placeholder={`${t('please_choose_users1')}`}
												onChange={(e) => {
													console.log(e);
													setHumans(e);
												}}
											/>{' '} */}
                                            {submitCount ? errors.type ? <div className="mt-1 text-danger"> {errors.type} </div> : null : ''}
                                        </div>
                                        <div className="h-fit">
                                            <ReactQuill
                                                theme="snow"
                                                id="content"
                                                // name='content'
                                                value={params.description || ''}
                                                defaultValue={params.description || ''}
                                                onChange={(content, delta, source, editor) => {
                                                    params.description = content;
                                                    params.displayDescription = editor.getText();
                                                    setParams({
                                                        ...params,
                                                    });
                                                    setFieldValue('content', content);
                                                }}
                                                style={{ minHeight: '200px' }}
                                            />
                                        </div>

                                        <div>
                                            <Field
                                                innerRef={fileRef}
                                                autoComplete="off"
                                                name="attachmentIds"
                                                type="file"
                                                id="attachmentIds"
                                                className="form-input"
                                                accept="image/*,.zip,.pdf,.xls,.xlsx,.txt.doc,.docx"
                                                multiple
                                                onChange={(e: any) => {
                                                    handleChange(e);
                                                }}
                                            />

                                            {path[0] !== undefined ? (
                                                <div className="mt-2 grid gap-4 rounded border p-2">
                                                    <p>{t('List of file upload paths')}</p>
                                                    {path?.map((item: any, index: number) => {
                                                        return (
                                                            <>
                                                                {item?.path && (
                                                                    <Link href={`${process.env.NEXT_PUBLIC_BE_URL}${item?.path}`} target="_blank" className="d-block ml-5" style={{ color: 'blue' }}>
                                                                        {item?.name}
                                                                    </Link>
                                                                )}
                                                            </>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                            {/* <input
                                                multiple="multiple"
												type="file"
												className="form-input p-0 file:border-0 file:bg-primary/90 file:px-4 file:py-2 file:font-semibold file:text-white file:hover:bg-primary ltr:file:mr-5 rtl:file:ml-5"
												multiple
												accept="image/*,.zip,.pdf,.xls,.xlsx,.txt.doc,.docx"
												onChange={(e) =>  setFieldValue("file", e)}
											/> */}
                                        </div>
                                        <div className="mt-8 flex items-center justify-end gap-8 ltr:text-right rtl:text-left">
                                            <button type="button" className="btn btn-outline-danger ltr:mr-3 rtl:ml-3" onClick={closeMsgPopUp}>
                                                {t('cancel')}
                                            </button>
                                            {/* <button type="button" className="btn btn-success ltr:mr-3 rtl:ml-3" onClick={() => saveMail('save', null)}>
												Lưu
											</button> */}
                                            <button type="submit" className="btn btn-primary">
                                                Gửi
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Mailbox;
