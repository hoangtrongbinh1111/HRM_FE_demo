export enum GENDER {
    'Male' = 'Nam',
    'Female' = 'Nữ',
}

export const PAGE_SIZES = [10, 20, 30, 50, 100];
export const PAGE_SIZES_DEFAULT = 10;
export const PAGE_NUMBER_DEFAULT = 1;
export const LIST_STATUS = {
    DRAFT: 'DRAFT',
    IN_PROGRESS: 'IN_PROGRESS',
    REJECTED: 'REJECTED',
    APPROVED: 'APPROVED',
};

export const LIST_STATUS_MEAN = {
    [LIST_STATUS.DRAFT]: 'draft',
    [LIST_STATUS.IN_PROGRESS]: 'in_progress',
    [LIST_STATUS.APPROVED]: 'approved',
    [LIST_STATUS.REJECTED]: 'rejected',
};

export const LIST_STATUS_COLOR = {
    [LIST_STATUS.DRAFT]: 'warning',
    [LIST_STATUS.IN_PROGRESS]: 'warning',
    [LIST_STATUS.APPROVED]: 'success',
    [LIST_STATUS.REJECTED]: 'danger',
};

export const MONEY = [
    { value: 'vnd', label: 'VND' },
    { value: 'kip', label: 'Kíp' },
];
