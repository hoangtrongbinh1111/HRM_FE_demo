import { object } from 'yup';
import moment from 'moment';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface Department {
    createdAt: string;
    id: number;
    name: string;
    code: string | null;
    abbreviation: string | null;
    description: string | null;
    headOfDepartmentId: number | null;
    avatarId: number | null;
    parentId: number | null;
    users: any[];
    children?: Department[];
    level?: number;
    value?: number;
    label?: string | null;
}

const LIST_WEEK_DAYS = ['cn', 't2', 't3', 't4', 't5', 't6', 't7']

export const formatTimeHHmm = (timeString: any) => {
    if (!timeString) return "";
    return timeString.slice(0, 5); // Cắt chuỗi để lấy phần "HH:mm"
};
export function formatDate(date: Date): string {
    const weekDays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    const weekDayName = weekDays[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}`;
}
export function convertDayjsToArray(dayjsObj: any) {
    const dayOfWeek = dayjsObj.day();  // Thứ (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
    const day = dayjsObj.date();       // Ngày
    const month = dayjsObj.month() + 1; // Tháng (0-based index, so add 1)
    const year = dayjsObj.year();      // Năm

    return [dayOfWeek, day, month, year];
}
// từ ngày 30 tháng trước đến ngày 30 tháng sau
// export function getDaysOfMonth(year: number, month: number): string[] {
//     const daysArray: string[] = [];
//     const isLeapYear = (year: number): boolean => {
//         return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
//     };

//     let startDate: Date;
//     let endDate: Date;

//     if (month === 2) {
//         startDate = new Date(year, month - 2, 30);
//         endDate = new Date(year, month - 1, isLeapYear(year) ? 28 : 27);
//     } else {
//         startDate = new Date(year, month - 2, 30);
//         endDate = new Date(year, month - 1, 29);
//     }

//     for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
//         const formattedDate = formatDate(date);
//         daysArray.push(formattedDate);
//     }

//     return daysArray;
// }
export function getDaysOfMonth(year: number, month: number): string[] {
    const daysArray: string[] = [];

    // Lấy ngày đầu tiên và ngày cuối cùng của tháng
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Ngày 0 của tháng tiếp theo là ngày cuối cùng của tháng hiện tại

    // Lặp qua từng ngày trong tháng và thêm vào mảng
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const formattedDate = formatDate(date); // Hàm formatDate là hàm bạn tự định nghĩa
        daysArray.push(formattedDate);
    }

    return daysArray;
}


export function getWeekDaysOfMonth(year: number, month: number): { date: string; dayOfWeek: string }[] {
    const daysArray: { date: string; dayOfWeek: string, month: any, yearNum: any }[] = [];
    const isLeapYear = (year: number): boolean => {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    };

    let startDate: Date;
    let endDate: Date;

    if (month === 2) {
        startDate = new Date(year, month - 1, 30);
        endDate = new Date(year, month - 1, isLeapYear(year) ? 28 : 27);
    } else {
        startDate = new Date(year, month - 2, 30);
        endDate = new Date(year, month - 1, 29);
    }

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const formattedDate = formatDate(date);
        const lang = localStorage.getItem('i18nextLng') === "la" ? "en" : localStorage.getItem('i18nextLng')
        // const dayOfWeek = date.toLocaleDateString(`${lang}`, { weekday: 'short' });
        const dayOfWeek = LIST_WEEK_DAYS[date.getDay()]

        daysArray.push({
            date: formattedDate,
            dayOfWeek: dayOfWeek,
            month: date?.getMonth() + 1,
            yearNum: year
        });
    }

    return daysArray;
}
export function getDayBetweenDates(startDate: string, endDate: string): { date: string; dayOfWeek: string; month: number; yearNum: number; fullDay: string }[] {
    const daysArray: { date: string; dayOfWeek: string; month: number; yearNum: number; fullDay: string }[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const formattedDate = formatDate(date);
        const lang = localStorage.getItem('i18nextLng') === "la" ? "en" : localStorage.getItem('i18nextLng');
        // const dayOfWeek = /date.toLocaleDateString(`${lang}`, { weekday: 'short' });
        const dayOfWeek = LIST_WEEK_DAYS[date.getDay()]
        daysArray.push({
            date: formattedDate,
            dayOfWeek: dayOfWeek,
            month: date.getMonth() + 1,
            yearNum: date.getFullYear(),
            fullDay: moment(date).format('YYYY-MM-DD'),
        });
    }

    return daysArray;
}
export function getDaysOfCurrentWeek(): { date: string; dayOfWeek: string; month: number; yearNum: number; fullDay: string }[] {
    const daysArray: { date: string; dayOfWeek: string; month: number; yearNum: number; fullDay: string }[] = [];

    const today = new Date();

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

    const lang = localStorage.getItem('i18nextLng') === "la" ? "en" : localStorage.getItem('i18nextLng');

    for (let date = new Date(firstDayOfWeek); date <= lastDayOfWeek; date.setDate(date.getDate() + 1)) {
        const formattedDate = formatDate(date);
        // const dayOfWeek = date.toLocaleDateString(`${lang}`, { weekday: 'short' });
        const dayOfWeek = LIST_WEEK_DAYS[date.getDay()]
        daysArray.push({
            date: formattedDate,
            dayOfWeek: dayOfWeek,
            month: date.getMonth() + 1,
            yearNum: date.getFullYear(),
            fullDay: moment(date).format('YYYY-MM-DD'),
        });
    }

    return daysArray;
}


export function addOneDay(dateString: any) {
    // Tạo đối tượng Date từ chuỗi ngày tháng
    const date = new Date(dateString);

    // Cộng thêm 1 ngày (24 giờ)
    date.setDate(date.getDate() + 1);

    // Trả về chuỗi ngày tháng dưới định dạng ISO
    return date.toISOString();
}

export function convertTimeToEndOfDay(dateString: any) {

    // Tạo đối tượng dayjs từ chuỗi ngày ban đầu
    const date = dayjs(dateString);

    // Thiết lập giờ thành 23, phút thành 59, giây thành 59, và millisecond thành 999
    const updatedDate = date.hour(23).minute(59).second(59).millisecond(999);

    // Chuyển đổi lại đối tượng dayjs sang chuỗi định dạng ISO
    return updatedDate.toISOString();
};

export function toDateString(date: string | number | Date): string {
    const today = new Date(date);
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}
export function convertDateFormat(dateStr: any) {
    // Tách chuỗi ngày tháng thành các thành phần ngày, tháng, năm
    const [dd, mm, yyyy] = dateStr.split('-');

    // Ghép lại theo định dạng YYYY-MM-DD
    return `${yyyy}-${mm}-${dd}`;
}
export function convertDateFormat2(dateStr: any) {
    // Tạo một đối tượng Date từ chuỗi ISO 8601
    const date = new Date(dateStr);

    // Lấy các thành phần ngày, tháng, năm
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Tháng tính từ 0-11 nên phải +1
    const yyyy = date.getFullYear();

    // Ghép lại theo định dạng DD-MM-YYYY
    return `${dd}-${mm}-${yyyy}`;
}
export function toDateStringMonth(date: string | number | Date): string {
    const today = new Date(date);
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${mm}-${yyyy}`;
}
export function formatDate2(isoString: any) {
    const date = new Date(isoString);

    // Thêm 7 giờ (7 * 60 * 60 * 1000 milliseconds)
    date.setTime(date.getTime() + 7 * 60 * 60 * 1000);

    // Lấy các thành phần của ngày và giờ
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Tháng trong JavaScript bắt đầu từ 0
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export function formatEndDate(isoString: any) {

    // Tạo đối tượng Date từ chuỗi ngày tháng
    const date = new Date(isoString);

    // Cộng thêm 1 ngày (24 giờ)
    date.setDate(date.getDate() + 1);

    // Lấy các thành phần của ngày và giờ
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Tháng trong JavaScript bắt đầu từ 0
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T23:59:59.999Z`;
}
export function formatStartDate(isoString: any) {

    // Tạo đối tượng Date từ chuỗi ngày tháng
    const date = new Date(isoString);

    // Cộng thêm 1 ngày (24 giờ)
    date.setDate(date.getDate() + 1);

    // Lấy các thành phần của ngày và giờ
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Tháng trong JavaScript bắt đầu từ 0
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T00:00:00.000Z`;
}

export function getCurrentFormattedTime() {
    const now = new Date();

    const year = now.getFullYear();

    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');

    const hour = now.getHours().toString().padStart(2, '0');

    const minute = now.getMinutes().toString().padStart(2, '0');

    const formattedTime = `${year}-${month}-${day}`;

    return formattedTime;
}

export function makeRamdomText(length: any) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export function removeNullProperties(obj: any) {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === null) {
            delete obj[key];
        }
    });
}

export function flattenDepartments(departments: Department[], level = 0, flatArray: Department[] = []): Department[] {
    departments.forEach((department) => {
        const departmentCopy: Department = { ...department, level: level, value: department.id, label: department.name };
        delete departmentCopy.children;
        flatArray.push(departmentCopy);

        if (department.children && department.children.length > 0) {
            flattenDepartments(department.children, level + 1, flatArray);
        }
    });

    return flatArray;
}

export function formatTime(time: string): string {
    if (!time) return '';
    const time_arr = time.split(':');
    return `${time_arr[0]}:${time_arr[1]}`;
}

export function removeVietnameseTones(str: any) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một ký tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, ' ');
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, ký tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, ' ');
    return str;
}

export const isObjEmpty = (obj: any) => Object.keys(obj).length === 0;

export const kFormatter = (num: any) => (num > 999 ? `${(num / 1000).toFixed(1)}k` : num);

export const htmlToString = (html: any) => html.replace(/<\/?[^>]+(>|$)/g, '');

export function formatMoneyUnit(money: string) {
    return money && money + ' VNĐ';
}

export function formatNumber(num = '', split = ',') {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, split) : '';
}

export function formatNumberFloat(num = '', df = '', split = ',') {
    try {
        let [inter = 0, float = 0] = `${num}`.split('.');
        return inter.toString().replace(/\B(?=(\d{3})+(?!\d))/g, split) + '.' + float;
    } catch (error) {
        return df;
    }
}

export function moneyToNumber(num: string, split = ',') {
    return num ? num?.split(split).join('') : '';
}

export function moneyToText(so: any, type: string = 'vnd') {
    var mangso = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const dochangchuc = (so: any, daydu: any) => {
        var chuoi = '';
        var chuc = Math.floor(so / 10);
        var donvi = so % 10;
        if (chuc > 1) {
            chuoi = ' ' + mangso[chuc] + ' mươi';
            if (donvi == 1) {
                chuoi += ' mốt';
            }
        } else if (chuc == 1) {
            chuoi = ' mười';
            if (donvi == 1) {
                chuoi += ' một';
            }
        } else if (daydu && donvi > 0) {
            chuoi = ' lẻ';
        }
        if (donvi == 5 && chuc > 1) {
            chuoi += ' lăm';
        } else if (donvi > 1 || (donvi == 1 && chuc == 0)) {
            chuoi += ' ' + mangso[donvi];
        }
        return chuoi;
    };
    const docblock = (so: any, daydu: any) => {
        var chuoi = '';
        var tram = Math.floor(so / 100);
        so = so % 100;
        if (daydu || tram > 0) {
            chuoi = ' ' + mangso[tram] + ' trăm';
            chuoi += dochangchuc(so, true);
        } else {
            chuoi = dochangchuc(so, false);
        }
        return chuoi;
    };
    const dochangtrieu = (so: any, daydu: any) => {
        var chuoi = '';
        var trieu = Math.floor(so / 1000000);
        so = so % 1000000;
        if (trieu > 0) {
            chuoi = docblock(trieu, daydu) + ' triệu';
            daydu = true;
        }
        var nghin = Math.floor(so / 1000);
        so = so % 1000;
        if (nghin > 0) {
            chuoi += docblock(nghin, daydu) + ' nghìn';
            daydu = true;
        }
        if (so > 0) {
            chuoi += docblock(so, daydu);
        }
        return chuoi;
    };
    if (so == 0) return mangso[0];
    var chuoi = '',
        hauto = '';
    do {
        var ty = so % 1000000000;
        so = Math.floor(so / 1000000000);
        if (so > 0) {
            chuoi = dochangtrieu(ty, true) + hauto + chuoi;
        } else {
            chuoi = dochangtrieu(ty, false) + hauto + chuoi;
        }
        hauto = ' tỷ';
    } while (so > 0);
    chuoi = chuoi.trim();
    if (chuoi.length > 0) chuoi = chuoi[0].toUpperCase() + chuoi.substr(1);
    chuoi = type === 'vnd' ? (chuoi.trim().length > 0 ? chuoi.trim() + ' đồng' : '') : chuoi.trim().length > 0 ? chuoi.trim() + ' kýp' : '';
    return chuoi;
}
export function loadMore(datas: any, data: any, pagination: any, setData: any, id: any, name: any, setLoad: any) {
    if (pagination?.page === undefined) return;
    if (pagination?.page === 1) {
        setData(
            datas?.data.map((item: any) => ({
                value: item[id],
                label: item[name],
            })),
        );
        setLoad(false)
    } else {
        setData([
            ...data,
            ...datas?.data.map((item: any) => ({
                value: item[id],
                label: item[name],
            })),
        ]);
        setLoad(false)
    }
}

export function loadMoreShift(datas: any, data: any, pagination: any, setData: any, id: any, name: any, setLoad: any) {
    if (pagination?.page === undefined) return;
    if (pagination?.page === 1) {
        const data_ = datas?.data.map((item: any) => {
            const startTime = moment(item.startTime, "HH:mm:ss").format('HH:mm')
            const endTime = moment(item.endTime, "HH:mm:ss").format('HH:mm')

            return {
                value: item[id],
                label: `${item[name]} (${startTime} : ${endTime})`,
            }
        })
        setData(data_);
        setLoad(false);
    } else {
        setData([
            ...data,
            ...datas?.data.map((item: any) => ({
                value: item[id],
                label: item[name],
            })),
        ]);
        setLoad(false)
    }
}

export function isDayCanBlockTimekeeping() {
    const today = moment();
    const day = today.date();
    const month = today.month() + 1; // moment months are 0-based

    if (month === 2) {
        const lastDayOfFebruary = today.endOf('month').date();
        return day === lastDayOfFebruary;
    } else {
        return day === 31;
    }
};

export const convertTime = (date: Date) => {
    const formattedTime = moment(date).format('HH:mm DD/MM/YYYY');
    return formattedTime;
}

export const isArrayNullArray = (arr: any) => {
    return Array.isArray(arr) && arr.length === 1 && arr[0] === null;
}

export const objToQueryString = (obj: any) => {
    const params = new URLSearchParams(obj);
    return params.toString();
};

export const roundDecimal = (num: any) => {
    return Math.round(num * 10) / 10; // Làm tròn đến 1 chữ số thập phân
};

//  lấy ngày đầu tiên và cuối cùng của tháng
export function getStartEndMonth(year: number, month: number): string[] {
    const startDate = moment([year, month - 1]).startOf('month');
    const endDate = moment([year, month - 1]).endOf('month');
    return [startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')];
}

export function handleReturnFlowApprove(action: any, sign: number) {
    const { t } = useTranslation();
    switch (action) {
        case "FORWARD":
        case "SUBMIT":
        case "SUBMIT_RETURN":
        case "FORWARD_RETURN":
            return sign === 2 ? `${t('continue_approval')}` : `${t('continue_initial')}`;
        case "REJECT":
            return `${t('reject')}`
        case "APPROVE":
            return `${t('approve')}`
        case "REJECT_RETURN":
            return `${t('reject_return')}`
        case "APPROVE_RETURN":
            return `${t('approve_return')}`
        default:
            return `${t('approve')}`
    }
}

interface HasCode {
    code: string;
}

export function sortByCode(items: any): any {
    return items.sort((a: any, b: any) => {
        const regex = /([A-Za-z]+)(\d+)/;

        const [, lettersA, numbersA] = a.code.match(regex) || [];
        const [, lettersB, numbersB] = b.code.match(regex) || [];

        if (lettersA < lettersB) return -1;
        if (lettersA > lettersB) return 1;

        return parseInt(numbersA) - parseInt(numbersB);
    });
}
