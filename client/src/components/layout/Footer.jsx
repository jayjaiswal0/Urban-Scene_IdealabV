import React from 'react';
import { Shield, Phone } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

export const Footer = () => {
  return (
    <footer className="w-full bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-t border-slate-200 dark:border-white/10 py-6 px-4 sm:px-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo variant="footer" />
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            Know what’s moving. &bull; Mira-Bhayandar Civic Grid
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <Phone className="w-3.5 h-3.5 text-rose-500" />
            Control Desk: 1800-22-3450 / 112
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="tnum font-medium">Urban Scene v2.5</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
