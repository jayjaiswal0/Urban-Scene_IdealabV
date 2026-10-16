import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import api from '../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [roleType, setRoleType] = useState('CITIZEN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('/auth/forgot-password', { email, role: roleType });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to dispatch reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Recover Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your registered official email to receive authorization credentials
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Reset Instructions Dispatched</span>
            </div>
            <p className="text-xs">{result.message}</p>
            {result.simulationToken && (
              <div className="mt-2 p-2 rounded-lg bg-white/60 dark:bg-black/30 font-mono text-[11px] break-all border border-emerald-300 dark:border-emerald-800">
                Token: {result.simulationToken}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Identity Tier
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5">
                <input
                  type="radio"
                  name="roleType"
                  value="CITIZEN"
                  checked={roleType === 'CITIZEN'}
                  onChange={() => setRoleType('CITIZEN')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Resident Citizen</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5">
                <input
                  type="radio"
                  name="roleType"
                  value="STAFF"
                  checked={roleType === 'STAFF'}
                  onChange={() => setRoleType('STAFF')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Authority / Staff</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Registered Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. citizen@mbmc.gov.in"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
