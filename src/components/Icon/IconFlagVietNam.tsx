import { FC } from 'react';

interface IconFlagVietNameProps {
    className?: string;
}

const IconFlagVietName: FC<IconFlagVietNameProps> = ({ className }) => {
    return (

<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
<g clip-path="url(#clip0_675_1399)">
<rect width="20" height="20" rx="10" fill="white"/>
<rect x="-6" y="-6" width="32" height="32" fill="url(#flag_vn)"/>
</g>
<defs>
<pattern id="flag_vn" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlinkHref="#image0_675_1399" transform="scale(0.0104167)"/>
</pattern>
<clipPath id="clip0_675_1399">
<rect width="20" height="20" rx="10" fill="white"/>
</clipPath>
<image id="image0_675_1399" width="96" height="96" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAG4ElEQVR4nO1d3W8UVRQfP6Loi1HRRI3WB6KkMOfMdrrtdqsgiYKggCCYmPjigxBFhCD8Ab6oiWBA4QGMPhg1agIR8QU1UQnVYJCy9+6WftDPhUIp9AMjlEB7zVl2KWwptN2Ze+5s55f8kqa7M7nnnJlzzz3n3rOWFSJEiBAhQoQIESJEiBAG4TDAgxJgngB4RwBsk4i/SkQhEZslYo9AvECkv7P/ExLgF/quAFgtEececpwHuOUIDA667t0Jx1ksEbeQMgXikERUhTB7j4RA3Jy07UV/xmJ3cctpFJRl3ZoEeEoCbBcA/YUq/KYGAegXiF9KgIXfL19+mzVZ0VpSMkU6zlsSscVvpd+AzRLgzcZp0+60JpObkQDrBUAno+Lz34pOAbCOxmYVM+i1lwCt3AqXozOdtO1lVrGhFvFxgbjHAAWrMb0RiLuTrvuYVQwQiC9lw0R2xcrxT9avWEEFTWzZcFIFmgDbAzdJ102ffr9E/ItdeejZ27A/WVp6nxUEHIlEHs6uVtkVJ701Qp2cMeNRy2SImTOnC8QObmVJ/4zQnrDtJy0TUYv4iABo41aS9JsAx1KRSIllms/PvKLcykFtb0LKmDkhG+0UzYQrx26EGiOiIwGwlVsZko9bWJVPy3YDlKBYCbCULb0gAfrYFYDsBuhlmZQF4o/swqMhBPiBI7/DLzgaRICFWpRPOfNJEe/juNmipdwpETcYIKwylGt9VT7FvQLguAGCKhNJlTUqtfpmgGwNl11QaTAF4krfdi8wF9BVPuuqnQwNM8BRZVm3eG4AiTiHWziZx/SGcpVeX84+jnwmbHuW9wYA+IJbMJnHs7srVf/uGPs48ikQP/NU+RRembbqTcUcNXQ8roY64ypVZZgBAPo9DUmz2wWVSexY6yrVXZ1hxxqXfTwjjID4gmcGMLG43r+z8ooB+nZWso/nOtzopQGMqvGmKlANpuNXDDB4rFqlKg2LhgBqPdsi7sUuZS/Z/vaw+8mxfZVZbkggDta77tTCn36AedzCyDz2fjfsfnLs/dY8NyQc59mCDUCHI7gFkVcxWe6oS23XKj/jhtrjKhk1yw0lEVd5YYBtJggjs2xbOdL95Ni2oox9fHn8pGAD0JEfAwRROfZ8PdL95NjzlVluSADsLdwAiNLPQXasdtWl1uGIRhfJZWlIYyQKNoCO4kvDXEf990eVNuWfq6lSDQsiOt6ClsINgHhGx+uaLEPVtSmqVJePyj9VrU7vqFDJcv/lIQqAbi8MQMdAlS62vl6mLtZ775IuNsVV2xt6J2mBOBA4A0hEdWSWo87+FPNM+f/ujakjc/SHqF4ZQIsLkvl0UHW+F81kOyeq+KGT1Rm3JiMM4/fMBTHvgDi6rEwN1I5/gr6QjKvmV9nXBS3Gh6FyDGx5rWzcBqBruMftSRhqwkKse1vFuA3QvbWiOBZiJqQiLiQm4IJkVXGkIriTcU1LIxOehJuWaFls+ZuM405Hn9ocHT22b4hnONrndG3g09HUb4ezIDPwT/yGsX1mzbDn+gm6gUNVrAUZOrpVsAE4S5KNi0a6n6ET14ntb7BmaFzIUyMQiIcsr0DNjjiE6NoYHfFEN708ul9vXBxR5/++dsLu+iga/KI8dZriEOL8geF0RO83FZm9QDe7JhXFTMItd935AzxuSDjOgkBvzGp4/rL7GWyvVul17oQK95daLrukhvma3RBAn+dnBSTi5zqFOPlBVJ3bX1WQ8uqpzvB7TJ14X+/+UQGww1PlZw3wjE4h2le7KukWfh+6B91L59gTtv20X9vTqTWkVmFkwCgAmnzZnk6gBnfcAkrDKRBXWH4hPKKENzNA2vf2BQLgXe6nTBpKyptZmtpOmtz5ULEoH/Gorwf0rkbCtudzCyyL+TzAWECtHbmFlqYQYJelG9RXkxpVsAuP7Oxh6yUnAV407eyA1EiSXSAuYVG+yceXpC4DAHxscSO7NqjhVobUz33J0tI7LBNw0HXvEQCHJ9GTnzSmad+ka1uJmDa2sTc1NaXmpkX85LcfBnjCMhl1rvsQ7QgrQuWnjG9dnAP5xyKbmPcJ277XChJ+mz37dgnwYZDXCeLy2LcYE+0U0GcimD/g4DjLrWIA9dUMVO4IYFdg/P14Uxemdd2S17JZe1ZTNzJbXBDXUht4ya/wHNPSttdoy+ebgEwKA3ElFTI4C+hUww30JOsFhG27FG0IgNMa/Hsf/ZQh7Vz2bfdCUNFaUjKFfDBlGanfDu0wLvgpRxykjbIScRNtF5xUbqZQ1LvuVOE4z9FBBwnwqQT4OZv0o8nyTO7nbLMnOZvpMzoWRN+la+gp92yLeIgQIUKECBEiRIgQIUJY3uB/yk69PMjTHLIAAAAASUVORK5CYII="/>
</defs>
</svg>

    );
};

export default IconFlagVietName;
