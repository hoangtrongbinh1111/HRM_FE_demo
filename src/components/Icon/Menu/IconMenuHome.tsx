import { FC } from 'react';

interface IconMenuHomeProps {
    className?: string;
}

const IconMenuHome: FC<IconMenuHomeProps> = ({ className }) => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className={className}>
        <rect width="16" height="16" fill="url(#pattern6)"/>
        <defs>
        <pattern id="pattern6" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlinkHref="#image0_25_499" transform="scale(0.0104167)"/>
        </pattern>
        <image id="image0_25_499" width="96" height="96" xlinkHref="data:image/png;base64,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"/>
        </defs>
        </svg>



    );
};

export default IconMenuHome;
