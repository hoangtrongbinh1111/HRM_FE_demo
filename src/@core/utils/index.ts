import moment from 'moment';
import Swal from 'sweetalert2';
import callApi from '../call-api';
import * as XLSX from 'xlsx';

export const isEmpty = (value: any) => {
    if (typeof value === 'object' && Object?.keys(value || {}).length === 0) return true;
    return [null, undefined, '', NaN].includes(value);
};

export const isNaNOr = (value: any, fallbackValue = 0) => (isNaN(value) ? fallbackValue : value);
export const deleteNullInObject = (obj: any) => {
    const newObj = { ...obj };
    Object.keys(newObj).forEach((key) => {
        if (isEmpty(newObj[key])) {
            delete newObj[key];
        }
    });
    return newObj;
};

export const getEndpoint = (endpoint: string, queries?: any) => {
    queries = deleteNullInObject(queries);
    const queriesStr = new URLSearchParams(queries).toString();
    return endpoint + '?' + decodeURIComponent(queriesStr);
};

export const mergeClassName = (...classNames: (string | any)[]) => classNames.filter(notNull).join(' ');

export const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

export const displayDate = (date?: any) => {
    if (!date) return null;
    return moment(date).format('HH:mm:ss DD/MM/YYYY');
};

export const unique = (value: any, index: number, self: any[]) => {
    return self.indexOf(value) === index;
};

export const notNull = (value: any, index: number, self: any[]) => {
    return !isEmpty(value);
};

/**
 *
 * @param time in minutes
 * @returns xxh yym zzs
 */
export const displayTime = (time: number) => {
    time = time * 60;

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    //check isNan
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return '';
    if (hours === 0 && minutes === 0 && seconds === 0) return '0s';
    if (hours === 0 && minutes === 0) return `${seconds}s`;
    if (hours === 0) return `${minutes}m ${seconds}s`;
    return `${hours}h ${minutes}m ${seconds}s`;
};

export const getAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${name}&background=random&length=1&rounded=true&size=128`;
};

export const randomArrayIndex = (random: number, length: number) => {
    const arr = Array.from({ length }, (_, i) => i);
    let randomNumber: any;
    if (length < 2) return arr;
    if (length === 2) randomNumber = random % length;
    if (length > 2) randomNumber = Math.max(random % length, 1);

    let loop = 0;
    while (loop < randomNumber) {
        const mid = Math.floor(length / 2);
        let loop1 = 0;
        while (loop1 < Math.max(randomNumber, 2)) {
            for (let i = 0; i < length; i++) {
                const tmp = arr[mid];
                arr[mid] = arr[i];
                arr[i] = arr[length - 1];
                arr[length - 1] = tmp;
            }
            loop1++;
        }

        for (let i = 0; i < length; i++) {
            const tmpi = Math.abs(randomNumber - length + 1);
            const tmp = Number(arr[i]);
            arr[i] = arr[tmpi];
            arr[tmpi] = tmp;
        }

        loop++;
    }
    return arr;
};

export const sortArray = (id: any, arr: any[]) => {
    if (!id) return arr;
    if (!arr) return [];
    const randomArrIndex = randomArrayIndex(id, arr.length);
    const newArr = randomArrIndex.map((index) => arr[index]);
    return newArr;
};

export const capitalize = (text: any) => {
    return text
        .replace('_', ' ')
        .replace('-', ' ')
        .toLowerCase()
        .split(' ')
        .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ');
};

export const formatDate = (date: any) => {
    if (date) {
        const dt = new Date(date);
        const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
        const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
        return day + '/' + month + '/' + dt.getFullYear();
    }
    return '';
};
export const convertTimeFormat = (time: any) => {
    if (time) {
        const [hours, minutes] = time?.split(':');
        return `${hours}:${minutes}`;
    }
    else return null;
};

export const showMessage = (msg = '', type = 'success') => {
    const toast: any = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        customClass: {
            container: 'toast',
            title: 'space-icon-title',
        },
    });
    toast.fire({
        icon: type,
        title: msg,
        width: '850px',
        padding: '10px 20px',
    });
};

export async function downloadFile(fileName: any, api: any) {
    return callApi(api, 'GET', null, null, true).then((response: any) => {
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        if (!response.error) {
            showMessage('Tải file thành công', 'success')
        }
    }).catch(() => {
        showMessage('Tải file thất bại', 'error')
    });
}

export function downloadFile2(nodeJSBuffer: any) {
    const buffer = Buffer.from(nodeJSBuffer);
    const blob = new Blob([buffer]);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = 'position.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
}
export function dateFormat(dt: any) {
    dt = new Date(dt);
    const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
    const date = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
    const hours = dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours();
    const mins = dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes();
    dt = dt.getFullYear() + '-' + month + '-' + date + 'T' + hours + ':' + mins;
    return dt;
}
export function dateFormatDay(dt: any) {
    const parts = dt.split('-');

    const formattedDate = parts.reverse().join('-');

    return formattedDate;
}

function isEmptyCell(value: any) {
    return (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
    );
}

export async function readExcelFile(filePath: string, schema: { [oldKey: string]: { prop: string; type: any } }, sheetIndex = 0, startFromRow = 1) {
    try {
        // Read the xlsx file
        const workbook = XLSX.read(filePath);
        const sheetName = workbook.SheetNames[sheetIndex];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const mappedData = rows
            .map((row: any, rowIndex: number) => {
                if (rowIndex < startFromRow) return null;
                const mappedRow: any = {};
                Object.keys(schema).forEach((key) => {
                    const cell = workbook.Sheets[sheetName]?.[`${key.toUpperCase()}${rowIndex}`]?.v;
                    mappedRow[schema[key].prop] = isEmptyCell(cell) ? null : schema[key].type(cell);
                });
                return mappedRow;
            })
            .filter((row: null) => row !== null)
            .filter((row: any) => Object.values(row).some((value) => value !== null));

        return mappedData;
    } catch (err) {
        console.log(err);
    }
}
