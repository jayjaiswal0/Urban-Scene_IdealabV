import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, CheckCircle2, Save, Shield, Smartphone, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotificationSettingsPage = () => {
  const { user, updateProfile } = useAuth();

  const [channels, setChannels] = useState({
    sms: user?.preferences?.notifications?.sms ?? true,
    whatsapp: user?.preferences?.notifications?.whatsapp ?? true,
    email: user?.preferences?.notifications?.email ?? true,
    inApp: user?.preferences?.notifications?.inApp ?? true,
  });

  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [dataConsent, setDataConsent] = useState(true);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = (key) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        preferences: {
          ...user?.preferences,
          notifications: channels,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert('Failed to save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Notifications & Privacy Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Control multi-channel delivery for roadwork progress, detour alerts, and emergency directives.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <NavLink
          to="/settings/appearance"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
        >
          Appearance
        </NavLink>
        <NavLink
          to="/settings/notifications"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white"
        >
          Notifications & Privacy
        </NavLink>
      </div>

      {saved && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Notification & privacy preferences updated.</span>
        </div>
      )}

      {/* Delivery Channels Matrix */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Delivery Channels Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select the channels on which you wish to receive municipal dispatch alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => handleToggle('inApp')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              channels.inApp
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  In-App Notification Feed
                </div>
                <div className="text-[11px] text-slate-400">Live top-bar notification center</div>
              </div>
            </div>
            <input type="checkbox" checked={channels.inApp} readOnly className="rounded text-blue-600 w-4 h-4" />
          </div>

          <div
            onClick={() => handleToggle('sms')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              channels.sms
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  SMS Text Notifications
                </div>
                <div className="text-[11px] text-slate-400">High-priority status changes</div>
              </div>
            </div>
            <input type="checkbox" checked={channels.sms} readOnly className="rounded text-blue-600 w-4 h-4" />
          </div>

          <div
            onClick={() => handleToggle('whatsapp')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              channels.whatsapp
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  WhatsApp Bot Updates
                </div>
                <div className="text-[11px] text-slate-400">Automated repair confirmation photos</div>
              </div>
            </div>
            <input type="checkbox" checked={channels.whatsapp} readOnly className="rounded text-blue-600 w-4 h-4" />
          </div>

          <div
            onClick={() => handleToggle('email')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              channels.email
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  Email Summary Reports
                </div>
                <div className="text-[11px] text-slate-400">Official work order receipts & logs</div>
              </div>
            </div>
            <input type="checkbox" checked={channels.email} readOnly className="rounded text-blue-600 w-4 h-4" />
          </div>
        </div>

        {/* Emergency Broadcasts Toggle */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              <span>National Disaster & Monsoon High-Water Advisories</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Receive automated early warnings during extreme precipitation or severe flood choke points.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emergencyAlerts}
              onChange={(e) => setEmergencyAlerts(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Saving...' : 'Save Channel Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
