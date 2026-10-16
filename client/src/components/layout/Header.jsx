import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Bell,
  LogOut,
  User,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

export const Header = ({ onToggleSidebar }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { connected, socket } = useSocket();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket) {
      socket.on('report:created', (data) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [
          {
            _id: Date.now(),
            title: 'New Hazard Filed',
            message: `Report #${data.report.referenceId} submitted in Ward ${data.report.ward}`,
            createdAt: new Date(),
            isRead: false,
          },
          ...prev,
        ]);
      });

      socket.on('report:statusChanged', (data) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [
          {
            _id: Date.now(),
            title: `Report Status: ${data.status}`,
            message: `Ticket updated to ${data.status}`,
            createdAt: new Date(),
            isRead: false,
          },
          ...prev,
        ]);
      });

      return () => {
        socket.off('report:created');
        socket.off('report:statusChanged');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.items || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // Fallback
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      // Ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#131b2e]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Mobile hamburger & Municipal brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden hover:bg-slate-100 dark:hover:bg-white/5"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  UMCP
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  MBMC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none hidden md:block">
                Urban Mobility Coordination Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Live telemetry hub status pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {connected ? 'Live Telemetry Hub Active' : 'Connecting to Gateway...'}
          </span>
          <span className="text-slate-400 dark:text-slate-500">|</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            Ward {user?.ward || 14}
          </span>
        </div>

        {/* Right: Quick actions, Theme switcher, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#171f33] border border-slate-200 dark:border-white/10 shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Notifications ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                        No notifications yet
                      </p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n._id}
                          className={`p-2.5 rounded-xl border text-xs transition-colors ${
                            n.isRead
                              ? 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-400'
                              : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/50 text-slate-900 dark:text-slate-200'
                          }`}
                        >
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {n.title}
                          </div>
                          <div className="mt-0.5 line-clamp-2">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/10 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all notifications &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile & Role Chip */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-400/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user?.fullName?.charAt(0) || 'U'
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                    {user?.fullName}
                  </div>
                  <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                    {user?.role?.replace('_', ' ')}
                  </div>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/30 transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
