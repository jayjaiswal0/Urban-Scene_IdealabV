import React from 'react';
import { Clock, CheckCircle2, ShieldCheck, Wrench, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export const StatusBadge = ({ status, className = '' }) => {
  const getBadgeConfig = (st) => {
    switch (st) {
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          icon: Clock,
          classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review',
          icon: Clock,
          classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        };
      case 'VERIFIED':
        return {
          label: 'Verified',
          icon: ShieldCheck,
          classes: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
        };
      case 'ASSIGNED':
        return {
          label: 'Squad Assigned',
          icon: Wrench,
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          icon: Wrench,
          classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
        };
      case 'RESOLVED':
        return {
          label: 'Resolved',
          icon: CheckCircle2,
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          icon: XCircle,
          classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        };
      case 'REQUESTED_INFORMATION':
        return {
          label: 'Info Requested',
          icon: HelpCircle,
          classes: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
        };
      default:
        return {
          label: st || 'Unknown',
          icon: Clock,
          classes: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.classes} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
