import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  ArrowRight,
  Settings,
} from 'lucide-react';
import api from '../services/api';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.items || []);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      alert('Failed to mark all as read');
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      // Ignore
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'REPORT_UPDATE') return n.type === 'REPORT_UPDATE';
    if (activeFilter === 'TRAFFIC_ADVISORY') return n.type === 'TRAFFIC_ADVISORY';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Civic Notifications & Advisories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time updates regarding your filed reports and municipal ward alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Mark all as read
          </button>
          <Link
            to="/settings/notifications"
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
            title="Notification Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Notifications' },
          { id: 'REPORT_UPDATE', label: 'Report Status Updates' },
          { id: 'TRAFFIC_ADVISORY', label: 'Ward & Traffic Advisories' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 text-center space-y-3">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">
              No notifications in this category
            </h3>
            <p className="text-xs text-slate-400">You are all caught up with municipal updates.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item._id}
              className={`p-5 rounded-2xl border transition-all ${
                item.isRead
                  ? 'bg-white dark:bg-[#131b2e] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-slate-900 dark:text-slate-100 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2 tnum">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {item.actionUrl && (
                  <Link
                    to={item.actionUrl}
                    onClick={() => handleMarkSingleRead(item._id)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
