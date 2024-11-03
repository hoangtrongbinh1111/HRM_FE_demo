/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import React from 'react';
import { useRouter } from 'next/router';
import { IRootState } from '../../store';
import { toggleLocale, toggleTheme, toggleSidebar, toggleRTL } from '../../store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import Dropdown from '../Dropdown';
import IconMenu from '@/components/Icon/IconMenu';
import IconCalendar from '@/components/Icon/IconCalendar';
import IconEdit from '@/components/Icon/IconEdit';
import IconChatNotification from '@/components/Icon/IconChatNotification';
import IconSearch from '@/components/Icon/IconSearch';
import IconXCircle from '@/components/Icon/IconXCircle';
import IconSun from '@/components/Icon/IconSun';
import IconMoon from '@/components/Icon/IconMoon';
import IconLaptop from '@/components/Icon/IconLaptop';
import IconMailDot from '@/components/Icon/IconMailDot';
import IconArrowLeft from '@/components/Icon/IconArrowLeft';
import IconInfoCircle from '@/components/Icon/IconInfoCircle';
import IconBellBing from '@/components/Icon/IconBellBing';
import IconUser from '@/components/Icon/IconUser';
import IconMail from '@/components/Icon/IconMail';
import IconLockDots from '@/components/Icon/IconLockDots';
import IconLogout from '@/components/Icon/IconLogout';
import IconMenuDashboard from '@/components/Icon/Menu/IconMenuDashboard';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconMenuApps from '@/components/Icon/Menu/IconMenuApps';
import IconMenuComponents from '@/components/Icon/Menu/IconMenuComponents';
import IconMenuElements from '@/components/Icon/Menu/IconMenuElements';
import IconMenuDatatables from '@/components/Icon/Menu/IconMenuDatatables';
import IconMenuForms from '@/components/Icon/Menu/IconMenuForms';
import IconMenuPages from '@/components/Icon/Menu/IconMenuPages';
import IconMenuMore from '@/components/Icon/Menu/IconMenuMore';
import IconLock from '../Icon/IconLock';
import { Notifications, UnReadNotifications } from '@/services/swr/notication.swr';
import moment from 'moment';
import { GetNotiUnread, MarkAllRead, MarkRead } from '@/services/apis/notication.api';
import InfiniteScroll from 'react-infinite-scroll-component';
import IconNewExpand from '../Icon/IconNewExpand';
import { useProfile } from '@/services/swr/profile.swr';
import { cookies } from 'next/headers';
import Config from '@/@core/configs';
import Cookies from 'js-cookie';
import dayjs from 'dayjs';
import { convertTime } from '@/utils/commons';
import { getHighLight } from '@/services/apis/announcement.api';
import { allowAccess } from '@/@core/rbac/RBACWrapper';
import { set } from 'lodash';
import { IconLoading } from '../Icon/IconLoading';
import HandleDetailModal from '@/pages/warehouse-process/repair/modal/DetailModal';
import io from 'socket.io-client';
import { useMyContext } from './myContext';
import Marquee from 'react-fast-marquee';
const token = `${Cookies.get(Config.Env.NEXT_PUBLIC_X_ACCESS_TOKEN)}`;
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
    extraHeaders: {
        Authorization: token,
    },
});

const Header = () => {
    const { myValue } = useMyContext();
    const router = useRouter();
    const { data: userData } = useProfile();

    const [highLight, setHighLight] = useState<any>();
    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }

            let allLinks = document.querySelectorAll('ul.horizontal-menu a.active');
            for (let i = 0; i < allLinks.length; i++) {
                const element = allLinks[i];
                element?.classList.remove('active');
            }
            selector?.classList.add('active');

            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [router.pathname]);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };
    const [flag, setFlag] = useState('');

    useEffect(() => {
        setLocale(localStorage.getItem('i18nextLng') || themeConfig.locale);
        getHighLight()
            .then((res) => {
                setHighLight(res?.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [myValue]);

    const dispatch = useDispatch();

    function createMarkup(messages: any) {
        return { __html: messages };
    }

    const [search, setSearch] = useState(false);

    const { t, i18n } = useTranslation();

    const [isHovered, setIsHovered] = useState(false);
    // noti
    const [page, setPage] = useState(1);
    const [dataNoti, setDataNoti] = useState<any>([]);
    const { data: notifications, mutate, pagination, isLoading } = Notifications({ page: page, lang: themeConfig.locale === 'la' ? 'lo' : themeConfig.locale || 'vi', sortBy: 'ASC' });
    const { data: unreadNotifications, mutate: getCountUnread } = UnReadNotifications();

    useEffect(() => {
        socket.on('events', (message: any) => {
            console.log('Received message:', message);
        });

        socket.on('notification', (message: any) => {
            if (message.fetch === true) {
                setPage(1);
            }
        });
        socket.on('announcement', (message: any) => {
            if (message.fetch === true) {
                setPage(1);
            }
        });
    }, []);

    useEffect(() => {
        if (pagination?.page === undefined) return;
        if (Number(pagination?.page) === 1) {
            setDataNoti(notifications?.data);
        } else {
            setDataNoti([...dataNoti, ...notifications?.data]);
        }
    }, [pagination]);

    const handleDetail = (data: any) => {
        router.push(`/hrm/announcement/detail/${data}`);
    };
    const handleTime = (start: any) => {
        const now = moment();
        return `${convertTime(start)}`;
    };

    const handleNoti = (data: any) => {
        if (data?.link && data?.link !== '/') {
            router.push(`${data?.link}`);
        }
        MarkRead({ id: data?.id })
            .then((res: any) => {
                setPage(1);
                mutate();
                getCountUnread();
            })
            .catch((err: any) => {
                console.error('ERR ~ ', err);
                throw err;
            });
    };

    const handleReadAll = () => {
        MarkAllRead()
            .then((res: any) => {
                setPage(1);
                mutate();
                getCountUnread();
            })
            .catch((err: any) => {
                console.error('ERR ~ ', err);
                throw err;
            });
    };
    const [statusNoti, setStatusNoti] = useState(false);

    const fetchMoreData = () => {
        setTimeout(() => {
            setPage(pagination.page + 1);
        }, 100);
    };
    useEffect(() => {
        setStatusNoti(isLoading);
    }, [isLoading]);

    const logOut = () => {
        const accessTokenKey = Config.Env.NEXT_PUBLIC_X_ACCESS_TOKEN as string;
        mutate();
        Cookies.remove(accessTokenKey);
    };
    return (
        <header
            className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}
            style={{
                backgroundColor: '#F5F5F5!important',
                width: '100%',
            }}
        >
            <div className="shadow-sm">
                <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black" style={{ backgroundColor: '#FDDC14' }}>
                    <div className="horizontal-logo flex items-center justify-between lg:hidden ltr:mr-2 rtl:ml-2">
                        <Link href="/hrm/dashboard" className="main-logo flex shrink-0 items-center">
                            <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/favicon.jpg" alt="logo" />
                            <span className="hidden align-middle text-2xl  font-semibold  transition-all duration-300 dark:text-white-light md:inline ltr:ml-1.5 rtl:mr-1.5">CSTT</span>
                        </Link>
                        <button
                            id="collapsebtn"
                            type="button"
                            className="collapse-icon flex items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconNewExpand className="rotate-90" />
                            <span className="uppercase">{t('expand')}</span>
                        </button>
                    </div>

                    <div className="hidden sm:block ltr:mr-2 rtl:ml-2"></div>

                    <div className="flex items-center justify-end space-x-1.5 dark:text-[#d0d2d6] sm:flex-1 lg:space-x-2 ltr:ml-auto ltr:sm:ml-0 rtl:mr-auto rtl:space-x-reverse sm:rtl:mr-0">
                        <div className="marquee-container" style={{ width: '70%' }}>
                            <Marquee pauseOnHover={false} gradient={false} speed={70} play={!isHovered}>
                                {highLight && highLight.length > 0 ? (
                                    highLight.map((item: any, index: any) => (
                                        <Link key={index} href={`/hrm/announcement/detail/${item.id}`} legacyBehavior>
                                            <a className="marquee-item" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} >
                                                {item?.title}
                                            </a>
                                        </Link>
                                    ))
                                ) : (
                                    <></>
                                )}
                            </Marquee>
                        </div>
                        <div
                            style={{ width: '30%' }}
                            className="flex items-center justify-end space-x-1.5 dark:text-[#d0d2d6] sm:flex-1 lg:space-x-2 ltr:ml-auto ltr:sm:ml-0 rtl:mr-auto rtl:space-x-reverse sm:rtl:mr-0"
                        >
                            {(allowAccess(['announcement:create'], 'AND', userData?.data?.permissions) || userData?.data?.accountId === 1) && <div className="dropdown shrink-0">
                                <Link href="/hrm/announcement/create">
                                    <button
                                        style={{ backgroundColor: '#DADADA' }}
                                        // disabled={!(allowAccess(['announcement:create'], 'AND', userData?.data?.permissions) || userData?.data?.accountId === 1)}
                                        type="button"
                                        className={`block flex rounded-full bg-primary/10 p-2 text-primary hover:text-primary`}
                                    >
                                        <img src={`/assets/images/Union.svg`} alt="flag" className="h-5 w-5 rounded-full object-cover" />
                                    </button>
                                </Link>
                            </div>
                            }
                            <div className="dropdown shrink-0">
                                <Dropdown
                                    offset={[0, 8]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                                    button={flag && <img className="h-5 w-5 rounded-full object-cover" src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="flag" />}
                                >
                                    <ul className="grid w-[280px] grid-cols-2 gap-2 !px-2 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                        {themeConfig.languageList.map((item: any) => {
                                            return (
                                                <li key={item.code}>
                                                    <button
                                                        type="button"
                                                        className={`flex w-full hover:text-primary ${i18n.language === item.code ? 'bg-primary/10 text-primary' : ''}`}
                                                        onClick={() => {
                                                            dispatch(toggleLocale(item.code));
                                                            i18n.changeLanguage(item.code);
                                                            setLocale(item.code);
                                                        }}
                                                    >
                                                        <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="h-5 w-5 rounded-full object-cover" />
                                                        <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Dropdown>
                            </div>

                            <div className="dropdown shrink-0">
                                <Dropdown
                                    offset={[0, 8]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    btnClassName="relative block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60 custom-bell mr-1"
                                    button={
                                        <span>
                                            <img src="/assets/images/iconbell.png" width={20} height={20}></img>
                                            {unreadNotifications?.data?.count !== 0 && (
                                                <span className="absolute top-0 flex h-3 w-3 ltr:right-0 rtl:left-0">
                                                    <span
                                                        className="relative right-[2px] top-[-3px] h-[19px] min-w-[20px] rounded-full bg-[red] p-[1.5px] text-xs text-[white]"
                                                        style={{ fontSize: '10px' }}
                                                    >
                                                        {unreadNotifications?.data?.count > 99 ? '99+' : unreadNotifications?.data?.count}
                                                    </span>
                                                </span>
                                            )}
                                        </span>
                                    }
                                >
                                    <InfiniteScroll
                                        dataLength={dataNoti.length}
                                        next={fetchMoreData}
                                        onScroll={(e) => fetchMoreData}
                                        scrollableTarget="scrollableDiv"
                                        hasMore={true}
                                        loader={<h4></h4>}
                                        style={{ boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px' }}
                                    >
                                        <ul
                                            id="scrollableDiv"
                                            className="h-[30.5rem] w-[300px] divide-y overflow-y-auto !py-0 text-dark dark:divide-white/10 dark:text-white-dark sm:w-[400px]"
                                            style={{ margin: '0px' }}
                                        >
                                            <li onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-between gap-x-2 px-4 py-2 font-semibold">
                                                    {/* <h4 className="text-lg">{t('notifications')}</h4> */}
                                                    {unreadNotifications?.data?.count !== 0 ? (
                                                        <span className="badge bg-primary/80">
                                                            {unreadNotifications?.data?.count > 99 ? '99+' : unreadNotifications?.data?.count} {t('unread')}
                                                        </span>
                                                    ) : (
                                                        ''
                                                    )}
                                                    {unreadNotifications?.data?.count !== 0 && (
                                                        <button className="badge" style={{ backgroundColor: 'rgb(67 97 238 / 0.8)' }} onClick={(e) => handleReadAll()}>
                                                            {t('Mark all as read')}
                                                        </button>
                                                    )}
                                                </div>
                                            </li>
                                            {dataNoti?.length > 0 ? (
                                                <>
                                                    {dataNoti?.map((item: any) => {
                                                        return (
                                                            <li key={item?.id} className={'dark:text-white-light/90'} style={{ cursor: 'pointer' }} onClick={(e) => handleNoti(item)}>
                                                                <div className={'group flex items-center px-4 py-2' + `${item?.isRead === 0 ? ' bg-slate-100' : ''}`}>
                                                                    <div className="grid place-content-center rounded">
                                                                        <div className="relative h-12 w-12">
                                                                            <img
                                                                                className="h-12 w-12 rounded-full object-cover"
                                                                                alt="profile"
                                                                                src={
                                                                                    item?.sender?.avatar ? `${process.env.NEXT_PUBLIC_MINIO_URL}${item?.sender?.avatar}` : '/assets/images/default.png'
                                                                                }
                                                                            />
                                                                            {/* <span className="absolute bottom-0 right-[6px] block h-2 w-2 rounded-full bg-success"></span> */}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-auto ltr:pl-3 rtl:pr-3">
                                                                        <div className="ltr:pr-3 rtl:pl-3">
                                                                            <p
                                                                                style={{
                                                                                    fontWeight: '600',
                                                                                }}
                                                                                // dangerouslySetInnerHTML={{
                                                                                // 	__html: item?.details.content,
                                                                                // }}
                                                                                dangerouslySetInnerHTML={{ __html: item?.details[0]?.title + `<br />` + item?.details[0]?.content }}
                                                                            ></p>
                                                                            <span
                                                                                className="block text-xs font-normal dark:text-gray-500"
                                                                                style={{
                                                                                    color: '#7E8F12',
                                                                                    fontWeight: '600',
                                                                                }}
                                                                            >
                                                                                {handleTime(item?.createdAt)}
                                                                            </span>
                                                                        </div>

                                                                    </div>
                                                                    {item.isRead === 0 && <span className="relative inline-flex min-h-[7px] min-w-[7px] rounded-full bg-[red]"></span>}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                    {/* <li>
													<div className="p-4">
														<button className="btn btn-primary btn-small block w-full" onClick={e => handleReadAll()}>Mark all as read</button>
													</div>
												</li> */}
                                                    {statusNoti && (
                                                        <li className={'dark:text-white-light/90'}>
                                                            <div className="animate__animated inset-0 z-[60] grid place-content-center bg-[#fafafa] p-5 dark:bg-[#060818]">
                                                                <IconLoading width={30} height={30} />
                                                            </div>
                                                        </li>
                                                    )}
                                                </>
                                            ) : (
                                                <li onClick={(e) => e.stopPropagation()}>
                                                    <button type="button" className="!grid min-h-[200px] place-content-center text-lg hover:!bg-transparent">
                                                        <div className="mx-auto mb-4 rounded-full ring-4 ring-primary/30">
                                                            <IconInfoCircle fill={true} className="h-10 w-10 text-primary" />
                                                        </div>
                                                        No data available.
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    </InfiniteScroll>
                                </Dropdown>
                            </div>
                            <div className="dropdown flex shrink-0">
                                <Dropdown
                                    offset={[0, 8]}
                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                    btnClassName="relative group block"
                                    button={
                                        <img
                                            className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100"
                                            src={userData?.data?.avatar ? `${process.env.NEXT_PUBLIC_MINIO_URL}${userData?.data?.avatar}` : '/assets/images/default.png'}
                                            alt="userProfile"
                                        />
                                    }
                                >
                                    <ul className="w-[230px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                                        <li>
                                            <div className="flex items-center px-4 py-4">
                                                <img
                                                    className="h-10 w-10 rounded-md object-cover"
                                                    src={userData?.data?.avatar ? `${process.env.NEXT_PUBLIC_MINIO_URL}${userData?.data?.avatar}` : '/assets/images/default.png'}
                                                    alt="userProfile"
                                                />
                                                <div className="truncate ltr:pl-4 rtl:pr-4">
                                                    <h4 className="text-base">
                                                        {userData?.data?.fullName}
                                                        <span className="rounded bg-success-light px-1 text-xs text-success ltr:ml-2 rtl:ml-2">Pro</span>
                                                    </h4>
                                                    <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                                                        {userData?.data?.email}
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <Link href={`/hrm/profile/detail/${userData?.data?.id}`} className="dark:hover:text-white">
                                                <IconUser className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                {t('profile')}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/auth/boxed-password-reset" className="dark:hover:text-white">
                                                <IconLock className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                {t('change_password')}
                                            </Link>
                                        </li>
                                        <li className="border-t border-white-light dark:border-white-light/10">
                                            <Link href="#" className="!py-3" style={{ fontSize: '0.875rem', color: 'red' }} onClick={(e) => logOut()} data-testId="sign-out-btn">
                                                <IconLogout className="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                                                {t('sign_out')}
                                            </Link>
                                        </li>
                                    </ul>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>

                {/* horizontal menu */}
                {/* <ul className="horizontal-menu hidden border-t border-[#ebedf2] bg-white px-6 py-1.5 font-semibold text-black dark:border-[#191e3a] dark:bg-black dark:text-white-dark lg:space-x-1.5 xl:space-x-8 rtl:space-x-reverse">
					<li className="menu nav-item relative">
						<button type="button" className="nav-link">
							<div className="flex items-center">
								<IconMenuDashboard className="shrink-0" />
								<span className="px-1">{t('dashboard')}</span>
							</div>
							<div className="right_arrow">
								<IconCaretDown />
							</div>
						</button>
						<ul className="sub-menu">
							<li>
								<Link href="/">{t('sales')}</Link>
							</li>
							<li>
								<Link href="/analytics">{t('analytics')}</Link>
							</li>
							<li>
								<Link href="/finance">{t('finance')}</Link>
							</li>
							<li>
								<Link href="/crypto">{t('crypto')}</Link>
							</li>
						</ul>
					</li>
					<li className="menu nav-item relative">
						<button type="button" className="nav-link">
							<div className="flex items-center">
								<IconMenuApps className="shrink-0" />
								<span className="px-1">{t('apps')}</span>
							</div>
							<div className="right_arrow">
								<IconCaretDown />
							</div>
						</button>
						<ul className="sub-menu">
							<li>
								<Link href="/apps/chat">{t('chat')}</Link>
							</li>
							<li>
								<Link href="/apps/mailbox">{t('mailbox')}</Link>
							</li>
							<li>
								<Link href="/apps/todolist">{t('todo_list')}</Link>
							</li>
							<li>
								<Link href="/apps/notes">{t('notes')}</Link>
							</li>
							<li>
								<Link href="/apps/scrumboard">{t('scrumboard')}</Link>
							</li>
							<li>
								<Link href="/apps/contacts">{t('contacts')}</Link>
							</li>
							<li className="relative">
								<button type="button">
									{t('invoice')}
									<div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
										<IconCaretDown />
									</div>
								</button>
								<ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
									<li>
										<Link href="/apps/invoice/list">{t('list')}</Link>
									</li>
									<li>
										<Link href="/apps/invoice/preview">{t('preview')}</Link>
									</li>
									<li>
										<Link href="/apps/invoice/add">{t('add')}</Link>
									</li>
									<li>
										<Link href="/apps/invoice/edit">{t('edit')}</Link>
									</li>
								</ul>
							</li>
							<li>
								<Link href="/apps/calendar">{t('calendar')}</Link>
							</li>
						</ul>
					</li>
					<li className="menu nav-item relative">
						<button type="button" className="nav-link">
							<div className="flex items-center">
								<IconMenuComponents className="shrink-0" />
								<span className="px-1">{t('components')}</span>
							</div>
							<div className="right_arrow">
								<IconCaretDown />
							</div>
						</button>
						<ul className="sub-menu">
							<li>
								<Link href="/components/tabs">{t('tabs')}</Link>
							</li>
							<li>
								<Link href="/components/accordions">{t('accordions')}</Link>
							</li>
							<li>
								<Link href="/components/modals">{t('modals')}</Link>
							</li>
							<li>
								<Link href="/components/cards">{t('cards')}</Link>
							</li>
							<li>
								<Link href="/components/carousel">{t('carousel')}</Link>
							</li>
							<li>
								<Link href="/components/countdown">{t('countdown')}</Link>
							</li>
							<li>
								<Link href="/components/counter">{t('counter')}</Link>
							</li>
							<li>
								<Link href="/components/sweetalert">{t('sweet_alerts')}</Link>
							</li>
							<li>
								<Link href="/components/timeline">{t('timeline')}</Link>
							</li>
							<li>
								<Link href="/components/notifications">{t('notifications')}</Link>
							</li>
							<li>
								<Link href="/components/media-object">{t('media_object')}</Link>
							</li>
							<li>
								<Link href="/components/list-group">{t('list_group')}</Link>
							</li>
							<li>
								<Link href="/components/pricing-table">{t('pricing_tables')}</Link>
							</li>
							<li>
								<Link href="/components/lightbox">{t('lightbox')}</Link>
							</li>
						</ul>
					</li>
					<li className="menu nav-item relative">
						<button type="button" className="nav-link">
							<div className="flex items-center">
								<IconMenuElements className="shrink-0" />
								<span className="px-1">{t('elements')}</span>
							</div>
							<div className="right_arrow">
								<IconCaretDown />
							</div>
						</button>
						<ul className="sub-menu">
							<li>
								<Link href="/elements/alerts">{t('alerts')}</Link>
							</li>
							<li>
								<Link href="/elements/avatar">{t('avatar')}</Link>
							</li>
							<li>
								<Link href="/elements/badges">{t('badges')}</Link>
							</li>
							<li>
								<Link href="/elements/breadcrumbs">{t('breadcrumbs')}</Link>
							</li>
							<li>
								<Link href="/elements/buttons">{t('buttons')}</Link>
							</li>
							<li>
								<Link href="/elements/buttons-group">{t('button_groups')}</Link>
							</li>
							<li>
								<Link href="/elements/color-library">{t('color_library')}</Link>
							</li>
							<li>
								<Link href="/elements/dropdown">{t('dropdown')}</Link>
							</li>
							<li>
								<Link href="/elements/infobox">{t('infobox')}</Link>
							</li>
							<li>
								<Link href="/elements/jumbotron">{t('jumbotron')}</Link>
							</li>
							<li>
								<Link href="/elements/loader">{t('loader')}</Link>
							</li>
							<li>
								<Link href="/elements/pagination">{t('pagination')}</Link>
							</li>
							<li>
								<Link href="/elements/popovers">{t('popovers')}</Link>
							</li>
							<li>
								<Link href="/elements/progress-bar">{t('progress_bar')}</Link>
							</li>
							<li>
								<Link href="/elements/search">{t('search')}</Link>
							</li>
							<li>
								<Link href="/elements/tooltips">{t('tooltips')}</Link>
							</li>
							<li>
								<Link href="/elements/treeview">{t('treeview')}</Link>
							</li>
							<li>
								<Link href="/elements/typography">{t('typography')}</Link>
							</li>
						</ul>
					</li>
					<li className="menu nav-item relative">
						<button type="button" className="nav-link">
							<div className="flex items-center">
								<IconMenuDatatables className="shrink-0" />
								<span className="px-1">{t('tables')}</span>
							</div>
							<div className="right_arrow">
								<IconCaretDown />
							</div>
						</button>
						<ul className="sub-menu">
							<li>
								<Link href="/tables">{t('tables')}</Link>
							</li>
							<li className="relative">
								<button type="button">
									{t('datatables')}
									<div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
										<IconCaretDown />
									</div>
								</button>
								<ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
									<li>
										<Link href="/datatables/basic">{t('basic')}</Link>
									</li>
									<li>
										<Link href="/datatables/advanced">{t('advanced')}</Link>
									</li>
									<li>
										<Link href="/datatables/skin">{t('skin')}</Link>
									</li>
									<li>
										<Link href="/datatables/order-sorting">{t('order_sorting')}</Link>
									</li>
									<li>
										<Link href="/datatables/multi-column">{t('multi_column')}</Link>
									</li>
									<li>
										<Link href="/datatables/multiple-tables">{t('multiple_tables')}</Link>
									</li>
									<li>
										<Link href="/datatables/alt-pagination">{t('alt_pagination')}</Link>
									</li>
									<li>
										<Link href="/datatables/checkbox">{t('checkbox')}</Link>
									</li>
									<li>
										<Link href="/datatables/range-search">{t('range_search')}</Link>
									</li>
									<li>
										<Link href="/datatables/export">{t('export')}</Link>
									</li>
									<li>
										<Link href="/datatables/column-chooser">{t('column_chooser')}</Link>
									</li>
								</ul>
							</li>
						</ul>
					</li>
					<li className="menu nav-item relative">
						<button type="button" className="nav-link">
							<div className="flex items-center">
								<IconMenuForms className="shrink-0" />
								<span className="px-1">{t('forms')}</span>
							</div>
							<div className="right_arrow">
								<IconCaretDown />
							</div>
						</button>
						<ul className="sub-menu">
							<li>
								<Link href="/forms/basic">{t('basic')}</Link>
							</li>
							<li>
								<Link href="/forms/input-group">{t('input_group')}</Link>
							</li>
							<li>
								<Link href="/forms/layouts">{t('layouts')}</Link>
							</li>
							<li>
								<Link href="/forms/validation">{t('validation')}</Link>
							</li>
							<li>
								<Link href="/forms/input-mask">{t('input_mask')}</Link>
							</li>
							<li>
								<Link href="/forms/select2">{t('select2')}</Link>
							</li>
							<li>
								<Link href="/forms/touchspin">{t('touchspin')}</Link>
							</li>
							<li>
								<Link href="/forms/checkbox-radio">{t('checkbox_and_radio')}</Link>
							</li>
							<li>
								<Link href="/forms/switches">{t('switches')}</Link>
							</li>
							<li>
								<Link href="/forms/wizards">{t('wizards')}</Link>
							</li>
							<li>
								<Link href="/forms/file-upload">{t('file_upload')}</Link>
							</li>
							<li>
								<Link href="/forms/quill-editor">{t('quill_editor')}</Link>
							</li>
							<li>
								<Link href="/forms/markdown-editor">{t('markdown_editor')}</Link>
							</li>
							<li>
								<Link href="/forms/date-picker">{t('date_and_range_picker')}</Link>
							</li>
							<li>
								<Link href="/forms/clipboard">{t('clipboard')}</Link>
							</li>
						</ul>
					</li>
					<li className="menu nav-item relative">
						<button type="button" className="nav-link">
							<div className="flex items-center">
								<IconMenuPages className="shrink-0" />
								<span className="px-1">{t('pages')}</span>
							</div>
							<div className="right_arrow">
								<IconCaretDown />
							</div>
						</button>
						<ul className="sub-menu">
							<li className="relative">
								<button type="button">
									{t('users')}
									<div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
										<IconCaretDown />
									</div>
								</button>
								<ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
									<li>
										<Link href="/users/profile">{t('profile')}</Link>
									</li>
									<li>
										<Link href="/users/user-account-settings">{t('account_settings')}</Link>
									</li>
								</ul>
							</li>
							<li>
								<Link href="/pages/knowledge-base">{t('knowledge_base')}</Link>
							</li>
							<li>
								<Link href="/pages/contact-us-boxed" target="_blank">
									{t('contact_us_boxed')}
								</Link>
							</li>
							<li>
								<Link href="/pages/contact-us-cover" target="_blank">
									{t('contact_us_cover')}
								</Link>
							</li>
							<li>
								<Link href="/pages/faq">{t('faq')}</Link>
							</li>
							<li>
								<Link href="/pages/coming-soon-boxed" target="_blank">
									{t('coming_soon_boxed')}
								</Link>
							</li>
							<li>
								<Link href="/pages/coming-soon-cover" target="_blank">
									{t('coming_soon_cover')}
								</Link>
							</li>
							<li>
								<Link href="/pages/maintenence" target="_blank">
									{t('maintenence')}
								</Link>
							</li>
							<li className="relative">
								<button type="button">
									{t('error')}
									<div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
										<IconCaretDown />
									</div>
								</button>
								<ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
									<li>
										<Link href="/pages/error404" target="_blank">
											{t('404')}
										</Link>
									</li>
									<li>
										<Link href="/pages/error500" target="_blank">
											{t('500')}
										</Link>
									</li>
									<li>
										<Link href="/pages/error503" target="_blank">
											{t('503')}
										</Link>
									</li>
								</ul>
							</li>
							<li className="relative">
								<button type="button">
									{t('login')}
									<div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
										<IconCaretDown />
									</div>
								</button>
								<ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
									<li>
										<Link href="/auth/cover-login" target="_blank">
											{t('login_cover')}
										</Link>
									</li>
									<li>
										<Link href="/auth/boxed-signin" target="_blank">
											{t('login_boxed')}
										</Link>
									</li>
								</ul>
							</li>
							<li className="relative">
								<button type="button">
									{t('register')}
									<div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
										<IconCaretDown />
									</div>
								</button>
								<ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
									<li>
										<Link href="/auth/cover-register" target="_blank">
											{t('register_cover')}
										</Link>
									</li>
									<li>
										<Link href="/auth/boxed-signup" target="_blank">
											{t('register_boxed')}
										</Link>
									</li>
								</ul>
							</li>
							<li className="relative">
								<button type="button">
									{t('password_recovery')}
									<div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
										<IconCaretDown />
									</div>
								</button>
								<ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
									<li>
										<Link href="/auth/cover-password-reset" target="_blank">
											{t('recover_id_cover')}
										</Link>
									</li>
									<li>
										<Link href="/auth/boxed-password-reset" target="_blank">
											{t('recover_id_boxed')}
										</Link>
									</li>
								</ul>
							</li>
							<li className="relative">
								<button type="button">
									{t('lockscreen')}
									<div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
										<IconCaretDown />
									</div>
								</button>
								<ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
									<li>
										<Link href="/auth/cover-lockscreen" target="_blank">
											{t('unlock_cover')}
										</Link>
									</li>
									<li>
										<Link href="/auth/boxed-lockscreen" target="_blank">
											{t('unlock_boxed')}
										</Link>
									</li>
								</ul>
							</li>
						</ul>
					</li>
					<li className="menu nav-item relative">
						<button type="button" className="nav-link">
							<div className="flex items-center">
								<IconMenuMore className="shrink-0" />
								<span className="px-1">{t('more')}</span>
							</div>
							<div className="right_arrow">
								<IconCaretDown />
							</div>
						</button>
						<ul className="sub-menu">
							<li>
								<Link href="/dragndrop">{t('drag_and_drop')}</Link>
							</li>
							<li>
								<Link href="/charts">{t('charts')}</Link>
							</li>
							<li>
								<Link href="/font-icons">{t('font_icons')}</Link>
							</li>
							<li>
								<Link href="/widgets">{t('widgets')}</Link>
							</li>
							<li>
								<Link href="https://vristo.sbthemes.com" target="_blank">
									{t('documentation')}
								</Link>
							</li>
						</ul>
					</li>
				</ul> */}
            </div>
        </header>
    );
};

export default Header;
