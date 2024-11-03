import IconPlus from '@/components/Icon/IconPlus';
import { setPageTitle } from '@/store/themeConfigSlice';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/react';
import { Calendar } from '@fullcalendar/core';
import viLocale from '@fullcalendar/core/locales/vi';
import enLocale from '@fullcalendar/core/locales/en-au';
import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
import IconXCircle from '@/components/Icon/IconXCircle';
import AddHolidayScheduleModal from './modal/AddHolidayScheduleModal';
import Link from 'next/link';
import IconNewPlus from '@/components/Icon/IconNewPlus';
import { Holidays } from '@/services/swr/holiday.swr';
import RBACWrapper from '@/@core/rbac/RBACWrapper';
import dayjs from 'dayjs';
import moment from 'moment';
import { setEndDate, setStartDate } from '@/store/calendarSlice';
import { IconLoading } from '@/components/Icon/IconLoading';

interface Holiday {
    id: number;
    title: string;
    users?: string;
    startDay: Date;
    endDay: Date;
    type: String;
    description: string;
}

interface User {
    fullName: string;
}

const HolidaySchedule = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { t } = useTranslation();
    const [language, setLanguage] = useState<any>("vi");

    useEffect(() => {
        dispatch(setPageTitle(`${t('holiday')}`));
    }, []);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lang_ = localStorage.getItem('i18nextLng')
            setLanguage(lang_ === "vi" ? "vi" : "en");
        }
    }, []);
    const now = new Date();

    const getMonth = (dt: Date, add: number = 0) => {
        let month = dt.getMonth() + 1 + add;
        const str = (month < 10 ? '0' + month : month).toString();
        return str;
    };

    var initialLocaleCode = 'vi';
    const { data: holidayys, pagination, isLoading } = Holidays({ page: 1, perPage: 100 });

    const holidaySchedules = holidayys?.data.map((item: Holiday) => ({
        title: item.title,
        user: item?.type === 'ALL' ? "Tất cả" : Array.isArray(item.users) ? item.users.map((i: any) => i.fullName).join(', ') : '',
        id: item.id,
        start: dayjs(item?.startDay).format('YYYY-MM-DDTHH:mm:ss'),
        end: dayjs(item?.endDay).format('YYYY-MM-DDTHH:mm:ss'),
        description: item.description,
    }));

    const [isAddHolidayScheduleModal, setIsAddHolidayScheduleModal] = useState(false);
    const [minStartDate, setMinStartDate] = useState<any>('');
    const [minEndDate, setMinEndDate] = useState<any>('');
    const defaultParams = {
        id: null,
        user: '',
        title: '',
        start: '',
        end: '',
        description: '',
    };

    const [params, setParams] = useState<any>(defaultParams);

    const dateFormat = (dt: any) => {
        dt = new Date(dt);
        const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
        const date = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
        const hours = dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours();
        const mins = dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes();
        dt = dt.getFullYear() + '-' + month + '-' + date + 'T' + hours + ':' + mins;
        return dt;
    };

    const editHolidaySchedule = (data: any = null) => {
        let params = JSON.parse(JSON.stringify(defaultParams));
        setParams(params);

        if (data) {
            let obj = JSON.parse(JSON.stringify(data.event));
            setParams({
                id: obj.id ? obj.id : null,
                title: obj.title ? obj.title : null,
                user: obj.extendedProps ? obj.extendedProps.user : null,
                start: dateFormat(obj.start),
                end: dateFormat(obj.end),
                description: obj.extendedProps ? obj.extendedProps.description : '',
            });
            setMinStartDate(new Date());
            setMinEndDate(dateFormat(obj.start));
        } else {
            setMinStartDate(new Date());
            setMinEndDate(new Date());
        }
        setIsAddHolidayScheduleModal(true);
    };

    const editDate = (data: any) => {
        let obj = {
            event: {
                start: data.start,
                end: data.end,
            },
        };
        editHolidaySchedule(obj);
    };

    const renderEventContent = (eventInfo: any) => {
        return (
            <>
                <div className="fc-event-main flex items-center text-black dark:text-white">
                    <div className="fc-event-user">
                        {eventInfo.event.title} {'['}
                        {dayjs(eventInfo.event.start).format('DD/MM/YYYY')} {'->'} {dayjs(eventInfo.event.end).format('DD/MM/YYYY')}
                        {/* {eventInfo.event.extendedProps.user.length > 50
                            ? `${eventInfo.event.extendedProps.user.slice(0, 50)}...`
                            : eventInfo.event.extendedProps.user
                        } */}
                        {']'} &nbsp;
                    </div>
                </div>
            </>
        );
    };

    const handleClickEvent = (event: any) => {
        let obj = JSON.parse(JSON.stringify(event.event));
        router.push(`/hrm/holiday/${obj.id}?status=true`)
    }
    const handleSelectDate = (data: any) => {
        const startDate = moment(data?.start).toISOString();
        const endDate = moment(moment(data?.end)?.subtract(1, "days")).toISOString();
        dispatch(setStartDate(startDate))
        dispatch(setEndDate(endDate));
        router.push('/hrm/holiday/create');
    }
    return (
        <Fragment>
             {/* {isLoading && (
                <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa] dark:bg-[#060818]">
                    <IconLoading />
                </div>
            )} */}
            <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="/hrm/dashboard" className="text-primary hover:underline">
                        {t('dashboard')}
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>{t('dayoff')}</span>
                </li>
            </ul>
            <div className="panel mb-5">
                <RBACWrapper permissionKey={['holiday:create']} type={'AND'}>
                    <div className="mb-4 flex flex-col items-center justify-center sm:flex-row sm:justify-between">
                        <Link href="/hrm/holiday/create">
                            <button type="button" className=" button-table button-create m-1">
                                <IconNewPlus />
                                <span className="uppercase">{t('add')}</span>
                            </button>
                        </Link>
                    </div>
                </RBACWrapper>
                <div className="calendar-wrapper">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        editable={true}
                        dayMaxEvents={true}
                        selectable={true}
                        droppable={true}
                        eventClick={(event: any) => handleClickEvent(event)}
                        select={(e: any) => handleSelectDate(e)}
                        events={holidaySchedules}
                        eventContent={renderEventContent}
                        locale={language}
                        locales={language === "vi" ? [viLocale] : [enLocale]}
                    />
                </div>
            </div>
        </Fragment>
    );
};

export default HolidaySchedule;
