import { FC } from 'react';

interface IconMenuFormProps {
    className?: string;
}

const IconMenuForm: FC<IconMenuFormProps> = ({ className }) => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className={className}>
        <rect width="16" height="16" fill="url(#pattern7)"/>
        <defs>
        <pattern id="pattern7" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlinkHref="#image0_25_401" transform="scale(0.0104167)"/>
        </pattern>
        <image id="image0_25_401" width="96" height="96" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAABz0lEQVR4nO2Yy23DQAwFeUhRPvrmUtLEqyJID24gKYbA9iJfgyAfWYD9uMsZgA3MmJSsCAAAAAAAgIPoetpmnPfP8/byerp7yv1Q3CJ1cHJcDkWIaswcIA9EiGrMHiDvjBDVWCFA3hEhqrFKgNwZIaqxUoDcESGqsVqA/CdCVGPFAPlHhKjGqgHylwhRjZUD5A8RohqrB8hvEaIaHQLklwhRjS4Bcly2t48zAWQOF9VwCxEB/FLEBvjFiBPUY6IabiEigF+K2AC/GHGCekxUwy1EBHj8J4B84LTbALfwJIBfOhsw/OI5QaPG8AwYBOAhfOUtaOMEPek1dPaJariFiAB+KWID/GLECeoxUQ23EBHAL0VsgF+MOEH7JLg/PSTfgvzS+Rg3/OL5GjpqTLvXULfwJIBfOhsw/OI5QaPGtHsGzD5RDbcQEcAvRWyAX4w4QT0mquEWIgL4pYgN8IsRJ2ifBPcfr+z+R8wtPAngl84GDL94TtCoMTwDBgF4CF95C9o4QU96DZ19ohpuISKAX4rYAL8YcYJ6TFTDLUQE8EsRG+AXI05Qj4lquIWIAH4pYgP8YsQJ6jFRDbcQEcAvRWyAX4y6niAAAAAAAIhZuAE/gDPn/6m7sAAAAABJRU5ErkJggg=="/>
        </defs>
        </svg>

    );
};

export default IconMenuForm;
