import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertCircle,
  FileText,
  Map,
  Car,
  Wrench,
  Radio,
  Siren,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  X,
  Palette,
  BellRing,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAuthenticated } = useAuth();
  const role = user?.role || 'CITIZEN';

  const citizenNav = [
    { to: '/citizen/dashboard', label: 'Citizen Dashboard', icon: LayoutDashboard },
    { to: '/citizen/report', label: 'Report an Issue', icon: AlertCircle, highlight: true },
    { to: '/citizen/my-reports', label: 'My Civic Reports', icon: FileText },
    { to: '/map', label: 'Live Mobility Map', icon: Map },
    { to: '/parking', label: 'Smart Parking', icon: Car },
  ];

  const municipalNav = [
    { to: '/authority/dashboard', label: 'Muni Operations', icon: LayoutDashboard },
    { to: '/authority/issues', label: 'Triage & Issues', icon: Wrench, highlight: true },
    { to: '/map', label: 'Live Mobility Map', icon: Map },
    { to: '/analytics', label: 'Civic Analytics', icon: BarChart3 },
  ];

  const trafficNav = [
    { to: '/traffic/dashboard', label: 'Traffic Operations', icon: LayoutDashboard },
    { to: '/traffic/verify', label: 'Incident Verification', icon: Radio, highlight: true },
    { to: '/map', label: 'Live Mobility Map', icon: Map },
  ];

  const emergencyNav = [
    { to: '/emergency/dashboard', label: 'EMS Dispatch Desk', icon: Siren, highlight: true },
    { to: '/map', label: 'Live Mobility Map', icon: Map },
  ];

  const adminNav = [
    { to: '/admin/dashboard', label: 'System Governance', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User & Role RBAC', icon: Users, highlight: true },
    { to: '/analytics', label: 'Civic Analytics', icon: BarChart3 },
    { to: '/map', label: 'Live Mobility Map', icon: Map },
  ];

  let mainNav = citizenNav;
  if (role === 'MUNICIPAL_AUTHORITY') mainNav = municipalNav;
  if (role === 'TRAFFIC_AUTHORITY') mainNav = trafficNav;
  if (role === 'EMERGENCY_SERVICE') mainNav = emergencyNav;
  if (role === 'ADMIN') mainNav = adminNav;

  const settingsNav = [
    { to: '/settings/appearance', label: 'Appearance', icon: Palette },
    { to: '/settings/notifications', label: 'Privacy & Alerts', icon: BellRing },
    { to: '/support', label: 'Helpdesk & Support', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-white/10">
          <BrandLogo variant="sidebar" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operations
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      } ${item.highlight && !location.pathname.includes(item.to) ? 'ring-1 ring-blue-500/30' : ''}`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              System & Preferences
            </div>
            <nav className="space-y-1">
              {settingsNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer with Active Ward */}
        <div className="p-4 border-t border-slate-100 dark:border-white/10">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Jurisdiction</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">Ward {user?.ward || 14}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Kanakia / Mira Road Zone
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
