import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className,
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/marketplace-logo.png"
            alt="Marketplace Académico"
            className={`object-contain ${className ?? ''}`}
            {...props}
        />
    );
}