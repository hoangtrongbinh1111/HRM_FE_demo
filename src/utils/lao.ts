export declare type Locale = {
    weekdays: {
        shorthand: [string, string, string, string, string, string, string];
        longhand: [string, string, string, string, string, string, string];
    };
    months: {
        shorthand: [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
        ];
        longhand: [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
        ];
    };
    daysInMonth: [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number
    ];
    firstDayOfWeek: number;
    ordinal: (nth: number) => string;
    rangeSeparator: string;
    weekAbbreviation: string;
    scrollTitle: string;
    toggleTitle: string;
    amPM: [string, string];
    yearAriaLabel: string;
    monthAriaLabel: string;
    hourAriaLabel: string;
    minuteAriaLabel: string;
    time_24hr: boolean;
};
export declare type CustomLocale = {
    ordinal?: Locale["ordinal"];
    daysInMonth?: Locale["daysInMonth"];
    firstDayOfWeek?: Locale["firstDayOfWeek"];
    rangeSeparator?: Locale["rangeSeparator"];
    weekAbbreviation?: Locale["weekAbbreviation"];
    toggleTitle?: Locale["toggleTitle"];
    scrollTitle?: Locale["scrollTitle"];
    yearAriaLabel?: string;
    monthAriaLabel?: string;
    hourAriaLabel?: string;
    minuteAriaLabel?: string;
    amPM?: Locale["amPM"];
    time_24hr?: Locale["time_24hr"];
    weekdays: {
        shorthand: [string, string, string, string, string, string, string];
        longhand: [string, string, string, string, string, string, string];
    };
    months: {
        shorthand: [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
        ];
        longhand: [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string
        ];
    };
};
export const Lao: CustomLocale = {
    weekdays: {
        shorthand: ["ວັນທີ 1", "ວັນທີ 2", "ວັນທີ 3", "ວັນທີ 4", "ວັນທີ 5", "ວັນທີ 6", "ວັນທີ 7"],
        longhand: [
            "ວັນອາທິດ",
            "ວັນຈັນ",
            "ວັນອັງຄານ",
            "ວັນພຸດ",
            "ວັນພະຫັດ",
            "ວັນສຸກ",
            "ວັນເສົາ",
        ],
    },
    months: {
        shorthand: [
            "ມັງກອນ",
            "ກຸມພາ",
            "ມີນາ",
            "ເມສາ",
            "ພຶດສະພາ",
            "ມິຖຸນາ",
            "ກໍລະກົດ",
            "ສິງຫາ",
            "ກັນຍາ",
            "ຕຸລາ",
            "ພະຈິກ",
            "ທັນວາ",
        ],
        longhand: [
            "ເດືອນມັງກອນ",
            "ເດືອນກຸມພາ",
            "ເດືອນມີນາ",
            "ເດືອນເມສາ",
            "ເດືອນພຶດສະພາ",
            "ເດືອນມິຖຸນາ",
            "ເດືອນກໍລະກົດ",
            "ເດືອນສິງຫາ",
            "ເດືອນກັນຍາ",
            "ເດືອນຕຸລາ",
            "ເດືອນພະຈິກ",
            "ເດືອນທັນວາ",
        ],
    },
    firstDayOfWeek: 1,
    rangeSeparator: " ຫາ ",
};
