import { FC } from 'react';

interface IconNewArrowUpProps {
    className?: string;
}

const IconNewArrowUp: FC<IconNewArrowUpProps> = ({ className }) => {
    return (
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 7L7 1L13 7" stroke="#476704" stroke-linecap="round" />
        </svg>
    );
};

export default IconNewArrowUp;