import { FC } from 'react';

interface IconNewUnionProps {
    className?: string;
    color?: string;
    size?: number;
}

const IconNewUnion: FC<IconNewUnionProps> = ({ className, color, size = 12 }) => {
    return (
        <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 1C6.5 0.447715 6.05228 0 5.5 0C4.94772 0 4.5 0.447715 4.5 1L4.5 4H1.5C0.947715 4 0.5 4.44772 0.5 5C0.5 5.55228 0.947715 6 1.5 6H4.5L4.5 9C4.5 9.55229 4.94771 10 5.5 10C6.05228 10 6.5 9.55229 6.5 9V6H9.5C10.0523 6 10.5 5.55228 10.5 5C10.5 4.44772 10.0523 4 9.5 4H6.5V1Z" fill="#BABABA" />
        </svg>
    );
};

export default IconNewUnion;
