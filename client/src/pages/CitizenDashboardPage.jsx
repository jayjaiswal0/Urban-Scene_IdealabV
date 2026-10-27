import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  MapPin,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import KpiCard from '../components/common/KpiCard';
import StatusBadge from '../components/common/StatusBadge';
import SeverityBadge from '../components/common/SeverityBadge';

export const CitizenDashboardPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
  });

  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        api.get('/reports/citizen/stats'),
        api.get('/reports/citizen/recent'),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (reportsRes.success) setRecentReports(reportsRes.data);
    } catch (err) {
      console.error('Error fetching citizen dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time synchronization: instantly update KPI badges and recent reports
  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        fetchDashboardData();
      };

      socket.on('report:created', handleUpdate);
      socket.on('citizen:report:created', handleUpdate);
      socket.on('report:statusChanged', handleUpdate);

      return () => {
        socket.off('report:created', handleUpdate);
        socket.off('citizen:report:created', handleUpdate);
        socket.off('report:statusChanged', handleUpdate);
      };
    }
  }, [socket]);

  const quickCategories = [
    { id: 'POTHOLE', label: 'Pothole / Crater', icon: '🕳️', desc: 'Damaged asphalt' },
    { id: 'WATERLOGGING', label: 'Waterlogging', icon: '💧', desc: 'Monsoon drain choke' },
    { id: 'TRAFFIC_SIGNAL', label: 'Broken Signal', icon: '🚦', desc: 'Signal failure' },
    { id: 'GARBAGE', label: 'Solid Waste Dumping', icon: '🗑️', desc: 'Illegal debris' },
    { id: 'STREETLIGHT', label: 'Streetlight Dark', icon: '💡', desc: 'Electrical outage' },
    { id: 'ROAD_HAZARD', label: 'Road Obstruction', icon: '⚠️', desc: 'Tree fall / barricade' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-600/20">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider backdrop-blur-md text-white">
              Urban Scene &bull; Know what’s moving.
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold tracking-wide backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-blue-200" />
              <span>Ward {user?.ward || 14} &bull; Kanakia Jurisdiction</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Resident'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Track your civic reports, monitor road repairs, and explore live MBMT transit on Urban Scene.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Link
            to="/map"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md transition-all border border-white/20"
          >
            <Compass className="w-4 h-4 text-blue-200" />
            <span>Live Mobility Map</span>
          </Link>
          <Link
            to="/citizen/report"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Report New Issue</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Total Submitted"
          value={stats.total}
          subtitle="Reports in database"
          icon={FileText}
          color="blue"
          onClick={() => navigate('/citizen/my-reports?status=ALL')}
        />
        <KpiCard
          title="Under Review"
          value={stats.underReview}
          subtitle="Awaiting field inspection"
          icon={Clock}
          color="amber"
          onClick={() => navigate('/citizen/my-reports?status=UNDER_REVIEW')}
        />
        <KpiCard
          title="In Progress"
          value={stats.inProgress}
          subtitle="Work squads deployed"
          icon={Wrench}
          color="purple"
          onClick={() => navigate('/citizen/my-reports?status=IN_PROGRESS')}
        />
        <KpiCard
          title="Resolved"
          value={stats.resolved}
          subtitle="Repairs verified"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate('/citizen/my-reports?status=RESOLVED')}
        />
      </div>

      {/* Quick Launch Category Tiles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Quick Report Launchers
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            One-tap category preselection
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {quickCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/citizen/report?category=${cat.id}`}
              className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all text-center group"
            >
              <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {cat.label}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                {cat.desc}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Mobility Map GIS Spotlight */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Live GIS Mobility Telemetry Active
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Mira-Bhayandar Ward 14 Real-Time Telemetry Map
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Track all active municipal hazard pins, road craters, drainage clogs, streetlight outages, and smart parking vacancy in real-time.
          </p>
        </div>

        <Link
          to="/map"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all self-start md:self-auto hover:scale-[1.02] shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Open Full Interactive Map &rarr;</span>
        </Link>
      </div>

      {/* Recent Reports Table */}
      <div className="rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/10">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Civic Submissions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live updates directly synchronized with municipal maintenance database
            </p>
          </div>
          <Link
            to="/citizen/my-reports"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All Reports &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading recent reports...</div>
        ) : recentReports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No civic reports filed yet
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Help your ward by reporting road craters, drainage clogs, or hazardous signals.
            </p>
            <Link
              to="/citizen/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              + File First Report
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/10">
                <tr>
                  <th className="py-3 px-6">Reference ID</th>
                  <th className="py-3 px-6">Incident Summary</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Severity</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {recentReports.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      {report.referenceId}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {report.title}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{report.address}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {report.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <SeverityBadge severity={report.severity} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 tnum">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/citizen/reports/${report._id}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboardPage;
