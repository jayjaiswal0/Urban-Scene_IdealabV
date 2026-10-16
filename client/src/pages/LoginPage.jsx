import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  User,
  Wrench,
  Radio,
  Siren,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('CITIZEN');
  const [email, setEmail] = useState('citizen@mbmc.gov.in');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect');

  const rolePresets = {
    CITIZEN: {
      email: 'citizen@mbmc.gov.in',
      badge: 'Public Resident Tier',
      notice: null,
      defaultRoute: '/citizen/dashboard',
    },
    MUNICIPAL_AUTHORITY: {
      email: 'officer.muni@mbmc.gov.in',
      badge: 'Authority Tier — 2FA Required',
      notice: 'Government Employee ID authentication enabled for Ward 14 Public Works.',
      defaultRoute: '/authority/dashboard',
    },
    TRAFFIC_AUTHORITY: {
      email: 'inspector.traffic@mbmc.gov.in',
      badge: 'Traffic Enforcement Division',
      notice: 'Connected to MMR Live CCTV Feed & Corridor Pre-emption Desk.',
      defaultRoute: '/traffic/dashboard',
    },
    EMERGENCY_SERVICE: {
      email: 'dispatcher.ems@mbmc.gov.in',
      badge: 'Priority EMS Operations',
      notice: 'High Priority Access for Green Hospital Corridor Directives.',
      defaultRoute: '/emergency/dashboard',
    },
    ADMIN: {
      email: 'admin@mbmc.gov.in',
      badge: 'System Governance & RBAC',
      notice: 'Administrator access for platform configuration and audit logs.',
      defaultRoute: '/admin/dashboard',
    },
  };

  const handleRoleTabClick = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail(rolePresets[roleKey].email);
    setPassword('Password@123');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await login(email, password);
      setSuccess(true);

      setTimeout(() => {
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          navigate(rolePresets[loggedInUser.role]?.defaultRoute || '/citizen/dashboard');
        }
      }, 700);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Sign In to UMCP</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Municipal Transit & Civil Incident Coordination Portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mt-6">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">
            Select Terminal Role
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleRoleTabClick('CITIZEN')}
              className={`py-2 px-3 rounded-xl transition-all ${
                selectedRole === 'CITIZEN'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabClick('MUNICIPAL_AUTHORITY')}
              className={`py-2 px-3 rounded-xl transition-all ${
                selectedRole === 'MUNICIPAL_AUTHORITY'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Municipal
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabClick('TRAFFIC_AUTHORITY')}
              className={`py-2 px-3 rounded-xl transition-all ${
                selectedRole === 'TRAFFIC_AUTHORITY'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Traffic
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabClick('EMERGENCY_SERVICE')}
              className={`py-2 px-3 rounded-xl transition-all ${
                selectedRole === 'EMERGENCY_SERVICE'
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Emergency
            </button>
          </div>
        </div>

        {/* Dynamic Role Badge & Notice */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Selected Profile:
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {rolePresets[selectedRole]?.badge}
            </span>
          </div>
          {rolePresets[selectedRole]?.notice && (
            <div className="mt-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-700 dark:text-blue-300">
              {rolePresets[selectedRole]?.notice}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Credentials verified. Redirecting to workspace...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Official Email or ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="officer@mbmc.gov.in"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Remember terminal</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Authenticated</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 text-center space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Create Citizen Account
            </Link>
          </p>
          <div>
            <Link
              to="/map"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              &larr; Browse Public Transit Portal as Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
