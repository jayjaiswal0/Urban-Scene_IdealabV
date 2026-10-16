import React from 'react';
import { Shield, Phone, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-white/10 py-6 px-4 sm:px-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>
            Mira-Bhayandar Municipal Corporation (MBMC) &bull; Urban Mobility Coordination Platform
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <Phone className="w-3.5 h-3.5 text-rose-500" />
            Control Room: 1800-22-3450 / 112
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="tnum">Platform v2.4.0 (Stitch Certified)</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
