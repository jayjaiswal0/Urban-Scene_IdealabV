import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, Monitor, Eye, CheckCircle2, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const AppearanceSettingsPage = () => {
  const { theme, setTheme, highContrast, setHighContrast } = useTheme();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Appearance & Theme Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize UI contrast, obsidian mission control dark mode, and typography scaling.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <NavLink
          to="/settings/appearance"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white"
        >
          Appearance
        </NavLink>
        <NavLink
          to="/settings/notifications"
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
        >
          Notifications & Privacy
        </NavLink>
      </div>

      {saved && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Appearance preferences saved successfully.</span>
        </div>
      )}

      {/* 3 Interactive Theme Cards */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Theme Mode</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose between Civic Minimalism and Obsidian Telemetry modes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Mode */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-5 rounded-2xl border text-left transition-all relative ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 bg-slate-50 dark:bg-white/5'
            }`}
          >
            {theme === 'light' && (
              <CheckCircle2 className="w-4 h-4 text-blue-600 absolute top-4 right-4" />
            )}
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
              <Sun className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Civic Light</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Clean white surfaces with high daytime readability.
            </div>
          </button>

          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-5 rounded-2xl border text-left transition-all relative ${
              theme === 'dark'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 bg-slate-50 dark:bg-white/5'
            }`}
          >
            {theme === 'dark' && (
              <CheckCircle2 className="w-4 h-4 text-blue-400 absolute top-4 right-4" />
            )}
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Moon className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Obsidian Dark</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Deep telemetry slate for low-light mission control desks.
            </div>
          </button>

          {/* System Sync */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-5 rounded-2xl border text-left transition-all relative ${
              theme === 'system'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 bg-slate-50 dark:bg-white/5'
            }`}
          >
            {theme === 'system' && (
              <CheckCircle2 className="w-4 h-4 text-blue-600 absolute top-4 right-4" />
            )}
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3">
              <Monitor className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">System Sync</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automatically track your operating system dark mode schedule.
            </div>
          </button>
        </div>

        {/* High Contrast Mode Toggle */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>WCAG 2.1 AAA High Contrast Palette</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Enhance border definition and font contrast for accessibility compliance.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Appearance Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettingsPage;
