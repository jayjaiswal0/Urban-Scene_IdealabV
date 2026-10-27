import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Award,
  Camera,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [ward, setWard] = useState(user?.ward || 14);
  const [language, setLanguage] = useState(user?.preferences?.language || 'en');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setWard(user.ward || 14);
      setLanguage(user.preferences?.language || 'en');
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.success && res.data?.avatarUrl) {
        setAvatarUrl(res.data.avatarUrl);
        await updateProfile({ avatarUrl: res.data.avatarUrl });
      }
    } catch (err) {
      alert('Failed to upload avatar photo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await updateProfile({
        phone,
        ward: Number(ward),
        language,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const trustScore = user?.trustScore || 820;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">
          <span>Urban Scene &bull; Know what’s moving.</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Citizen Profile & Identity
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Governed residential profile, DigiLocker credentials, and civic trust metrics.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile changes successfully persisted to municipal database.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar with Camera Button */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-blue-600/10 dark:bg-blue-400/10 border-2 border-blue-500/20 overflow-hidden flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              fullName?.charAt(0) || 'U'
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer transition-colors">
            <Camera className="w-3.5 h-3.5" />
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        {/* Identity Details */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{fullName}</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>DigiLocker Verified</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {user?.role?.replace('_', ' ')} &bull; Registered Jurisdiction: Ward {ward}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
            {(user?.badges || ['Civic Champion', 'Ward 14 Guardian', 'Fast-Track Reporter']).map(
              (badge, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[10px] font-semibold text-blue-700 dark:text-blue-300"
                >
                  {badge}
                </span>
              )
            )}
          </div>
        </div>

        {/* Civic Trust Score Gauge */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-center min-w-[140px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Civic Trust Score
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tnum mt-1">
            {trustScore} <span className="text-xs font-normal text-slate-400">/ 1000</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${(trustScore / 1000) * 100}%` }}
            />
          </div>
          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            Top 5% Reporter Tier
          </div>
        </div>
      </div>

      {/* Editable Contact Info Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Contact & Residential Jurisdiction
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Updating your ward ensures automated routing to the nearest municipal triage squad.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Legal Full Name (UIDAI Governed)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 cursor-not-allowed pr-9"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Primary Registered Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Mobile Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Residential Ward
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value={14}>Ward 14 (Kanakia Park)</option>
                <option value={4}>Ward 4 (Bhayandar West)</option>
                <option value={1}>Ward 1 (Bhayandar East)</option>
                <option value={9}>Ward 9 (Penkarpada)</option>
                <option value={18}>Ward 18 (Kashimira)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English (Official)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
