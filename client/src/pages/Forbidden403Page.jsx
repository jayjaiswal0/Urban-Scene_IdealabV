import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Map, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Forbidden403Page = () => {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const attempted = searchParams.get('attempted') || 'Protected Authority Endpoint';
  const required = searchParams.get('required') || 'AUTHORITY / STAFF';

  const handleSignOutSwitch = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full">
            HTTP 403 &bull; Access Forbidden
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Role Tier Authorization Denied
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            You do not possess the required government staff credentials or administrative role tier to inspect this municipal terminal.
          </p>
        </div>

        {/* Diagnostic Panel */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-left text-xs space-y-2.5 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Current Identity:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{user?.fullName || 'Anonymous / Guest'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Current Role Tier:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{user?.role || 'UNAUTHENTICATED'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Attempted Route:</span>
            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{attempted}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200/40 dark:border-white/5 pt-2">
            <span className="text-slate-400">Required Role:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">{required}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/citizen/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Citizen Portal</span>
          </Link>

          <Link
            to="/map"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Public Mobility Map</span>
          </Link>

          <button
            onClick={handleSignOutSwitch}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden403Page;
