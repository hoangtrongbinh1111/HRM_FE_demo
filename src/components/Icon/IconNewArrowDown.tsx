import { FC } from 'react';

interface IconNewArrowDownProps {
    className?: string;
}

const IconNewArrowDown: FC<IconNewArrowDownProps> = ({ className }) => {
    return (
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L7 7L1 0.999999" stroke="#476704" stroke-linecap="round" />
        </svg>
    );
};

export default IconNewArrowDown;
