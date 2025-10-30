import type { SVGProps, ImgHTMLAttributes } from 'react';

type SalonFlowLogoProps = {
  src?: string;
  alt?: string;
  className?: string;
} & Omit<SVGProps<SVGSVGElement> & ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'className'>;

export function SalonFlowLogo(props: SalonFlowLogoProps) {
  const { src, alt = 'Logo', className, ...restProps } = props;
  
  // If src is provided, render as image
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        {...(restProps as ImgHTMLAttributes<HTMLImageElement>)}
      />
    );
  }

  // Otherwise, render as SVG (fallback)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...(restProps as SVGProps<SVGSVGElement>)}
    >
      <circle cx="6" cy="6" r="3" />
      <path d="M8.12 8.12 12 12" />
      <path d="M20 4 4 20" />
      <circle cx="6" cy="18" r="3" />
      <path d="M8.12 15.88 12 12" />
    </svg>
  );
}
