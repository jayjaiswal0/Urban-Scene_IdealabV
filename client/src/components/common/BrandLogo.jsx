import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_ASSETS, BRAND_NAME, BRAND_TAGLINE } from '../../utils/brandAssets';

/**
 * Reusable theme-aware BrandLogo component for Urban Scene.
 *
 * @param {Object} props
 * @param {'header'|'hero'|'auth'|'sidebar'|'footer'|'compact'} [props.variant='header'] - Display context
 * @param {boolean} [props.showTagline=false] - Whether to show the official tagline below the logo
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.animated=false] - Whether to apply subtle entrance animation
 */
export const BrandLogo = ({
  variant = 'header',
  showTagline = false,
  className = '',
  animated = false,
}) => {
  const { isDark } = useTheme();

  const logoSrc = isDark ? BRAND_ASSETS.logo.dark : BRAND_ASSETS.logo.light;

  // Variant size configurations matching exact Priority 1 sizing targets
  // Header: 160–190px wide, 42–58px high
  // Sidebar: 125–155px wide, 32–48px high
  // Hero / Landing: 280–360px wide
  // Auth: 200–280px wide
  const variantStyles = {
    header: 'h-11 sm:h-12 w-auto max-w-[185px] max-h-[52px]',
    sidebar: 'h-9 sm:h-10 w-auto max-w-[150px] max-h-[44px]',
    auth: 'h-14 sm:h-16 w-auto max-w-[260px] max-h-[72px]',
    hero: 'h-16 sm:h-20 md:h-24 w-auto max-w-[340px] sm:max-w-[360px] max-h-[100px]',
    footer: 'h-9 w-auto max-w-[150px] max-h-[42px]',
    compact: 'h-8 w-auto max-w-[130px] max-h-[36px]',
  };

  const imgClass = variantStyles[variant] || variantStyles.header;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${
        animated ? 'animate-fade-in' : ''
      } ${className}`}
    >
      <img
        src={logoSrc}
        alt={`${BRAND_NAME} — ${BRAND_TAGLINE}`}
        className={`${imgClass} object-contain transition-opacity duration-300 select-none`}
        loading="eager"
      />
    </div>
  );
};

export default BrandLogo;
