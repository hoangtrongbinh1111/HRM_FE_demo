import { FC } from 'react';

interface IconNewShiftTimekeepingProps {
    className?: string;
    color?: string;
    size?: number;
}

const IconNewShiftTimekeeping: FC<IconNewShiftTimekeepingProps> = ({ className, color, size = 15 }) => {
    return (
        <svg className={`${className}`} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7" fill={`${color}`} />
        </svg>

    );
};

export default IconNewShiftTimekeeping;
