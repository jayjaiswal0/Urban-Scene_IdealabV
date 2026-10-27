import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_ASSETS } from '../../utils/brandAssets';

/**
 * Global application background artwork system.
 * Renders the theme-aware Urban Scene mobility scene across all viewports
 * with a high-readability translucent scrim that preserves WCAG contrast
 * while ensuring the roads, vehicles, and coordinate grid remain visible.
 */
export const AppBackground = () => {
  const { isDark } = useTheme();
  const bgUrl = isDark ? BRAND_ASSETS.background.dark : BRAND_ASSETS.background.light;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden transition-all duration-700"
    >
      {/* Primary high-resolution urban scene artwork layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed transform scale-100 transition-all duration-700"
        style={{
          backgroundImage: `url(${bgUrl})`,
        }}
      />

      {/* Atmospheric lighting gradient and contrast-enhancing scrim */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-b from-[#0b1326]/80 via-[#0b1326]/85 to-[#080d1a]/90 backdrop-blur-[3px]'
            : 'bg-gradient-to-b from-white/75 via-white/80 to-[#f8f9ff]/85 backdrop-blur-[3px]'
        }`}
      />

      {/* Subtle civic grid pattern overlay for high-tech coordination ambiance */}
      <div
        className={`absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]`}
      />
    </div>
  );
};

export default AppBackground;
