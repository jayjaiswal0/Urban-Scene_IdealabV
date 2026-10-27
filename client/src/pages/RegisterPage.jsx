import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import AuthBackdrop from '../components/common/AuthBackdrop';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ward: 14,
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    urgentAlerts: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: 'Empty', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score === 1) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, text: 'Moderate', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, text: 'Strong', color: 'bg-emerald-500' };
    return { score: 0, text: 'Weak', color: 'bg-rose-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service to register');
      return;
    }

    setLoading(true);

    try {
      const user = await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone}`,
        ward: Number(formData.ward),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeTerms: formData.agreeTerms,
        urgentAlerts: formData.urgentAlerts,
      });

      setRegisteredUser(user);
      setShowOtpModal(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    setShowOtpModal(false);
    navigate('/citizen/dashboard');
  };

  return (
    <>
      <AuthBackdrop
        maxWidth="max-w-lg"
        title="Create Urban Scene Citizen Account"
        subtitle="Official civic registration with Mira-Bhayandar Municipal Corporation"
      >

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Full Legal Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Aarav Sharma"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="citizen@domain.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Mobile Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="98200 12345"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Residential Ward
            </label>
            <select
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={14}>Ward 14 — Kanakia Park / Beverly Park</option>
              <option value={4}>Ward 4 — Bhayandar West (Station Cross)</option>
              <option value={1}>Ward 1 — Bhayandar East (Navghar Road)</option>
              <option value={9}>Ward 9 — Penkarpada (WEH Junction)</option>
              <option value={18}>Ward 18 — Kashimira & Dahisar Checkpost</option>
              <option value={22}>Ward 22 — Uttan Coastal Zone</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Security Score:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{strength.text}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 h-1.5">
                <div
                  className={`rounded-full transition-colors ${
                    strength.score >= 1 ? strength.color : 'bg-slate-200 dark:bg-white/10'
                  }`}
                />
                <div
                  className={`rounded-full transition-colors ${
                    strength.score >= 2 ? strength.color : 'bg-slate-200 dark:bg-white/10'
                  }`}
                />
                <div
                  className={`rounded-full transition-colors ${
                    strength.score >= 3 ? strength.color : 'bg-slate-200 dark:bg-white/10'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Terms & Alerts Checkboxes */}
          <div className="space-y-2 pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5"
              />
              <span>
                I agree to the Municipal Citizen Charter & Data Privacy Guidelines.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                name="urgentAlerts"
                checked={formData.urgentAlerts}
                onChange={handleChange}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-0.5"
              />
              <span>Receive high-priority SMS / WhatsApp alerts regarding road detours.</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account & Verify Mobile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Sign In to Portal
            </Link>
          </p>
        </div>
      </AuthBackdrop>

      {/* Simulated OTP Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Mobile Verification (Simulation)"
      >
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            A 6-digit verification code has been dispatched to{' '}
            <strong>{formData.phone || '+91 98200 12345'}</strong> (Development demonstration: enter any 6 digits such as <code className="bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded font-mono">123456</code>).
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              6-Digit One-Time Password
            </label>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className="w-full text-center tracking-widest font-mono text-lg py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md"
          >
            Verify & Access Citizen Dashboard
          </button>
        </form>
      </Modal>
    </>
  );
};

export default RegisterPage;
