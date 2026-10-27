export const BRAND_NAME = 'Urban Scene';
export const BRAND_TAGLINE = 'Know what’s moving.';
export const BRAND_SHORT_DESC = 'Urban Mobility & Municipal Coordination Platform';

export const BRAND_ASSETS = {
  logo: {
    light: '/branding/logo-light.png',
    dark: '/branding/logo-dark.png',
  },
  background: {
    light: '/branding/bg-light.png',
    dark: '/branding/bg-dark.png',
  },
  reference: '/branding/dashboard-reference.png',
};

/**
 * Returns the theme-aware logo and background URLs based on whether dark mode is active.
 * @param {boolean} isDark
 */
export const getBrandAssets = (isDark) => ({
  logoUrl: isDark ? BRAND_ASSETS.logo.dark : BRAND_ASSETS.logo.light,
  backgroundUrl: isDark ? BRAND_ASSETS.background.dark : BRAND_ASSETS.background.light,
  tagline: BRAND_TAGLINE,
  brandName: BRAND_NAME,
});

export default {
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_SHORT_DESC,
  BRAND_ASSETS,
  getBrandAssets,
};
