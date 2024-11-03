
import { FC } from 'react';

interface IconMenuListExemptProps {
    className?: string;
}

const IconMenuListExempt: FC<IconMenuListExemptProps> = ({ className }) => {
    return (

<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
<rect width="14" height="14" fill="url(#ListExempt)"/>
<defs>
<pattern id="ListExempt" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlinkHref="#image0_25_491" transform="scale(0.01)"/>
</pattern>
<image id="image0_25_491" width="100" height="100" xlinkHref="data:image/png;base64,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"/>
</defs>
</svg>

    );
};

export default IconMenuListExempt;