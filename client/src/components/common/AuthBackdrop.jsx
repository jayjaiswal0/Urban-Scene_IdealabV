import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_ASSETS, BRAND_NAME, BRAND_TAGLINE } from '../../utils/brandAssets';
import BrandLogo from './BrandLogo';

/**
 * Reusable AuthBackdrop layout container for authentication screens.
 * Seamlessly integrates theme-aware background artwork and branding.
 */
export const AuthBackdrop = ({ children, maxWidth = 'max-w-md', title, subtitle }) => {
  const { isDark } = useTheme();

  const bgImage = isDark ? BRAND_ASSETS.background.dark : BRAND_ASSETS.background.light;

  return (
    <div
      className="relative min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-cover bg-center bg-no-repeat transition-all duration-500"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Visual Contrast Overlay: Preserves artwork ambiance while ensuring WCAG AAA legibility */}
      <div className="absolute inset-0 bg-white/75 dark:bg-[#0b1326]/85 backdrop-blur-[6px] transition-colors duration-500 pointer-events-none" />

      {/* Main Content Container */}
      <div className={`relative z-10 w-full ${maxWidth} flex flex-col items-center`}>
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <BrandLogo variant="auth" showTagline animated className="mb-2" />
          {title && (
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-3">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className="w-full rounded-3xl bg-white/95 dark:bg-[#131b2e]/95 border border-slate-200/90 dark:border-white/10 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthBackdrop;
