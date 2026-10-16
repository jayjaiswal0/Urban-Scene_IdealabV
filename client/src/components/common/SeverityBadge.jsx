import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export const SeverityBadge = ({ severity, className = '' }) => {
  switch (severity) {
    case 'URGENT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Urgent Hazard</span>
        </span>
      );
    case 'NORMAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Normal SLA</span>
        </span>
      );
    case 'LOW':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Routine</span>
        </span>
      );
    default:
      return null;
  }
};

export default SeverityBadge;
