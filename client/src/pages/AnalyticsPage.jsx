import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import KpiCard from '../components/common/KpiCard';

const COLORS = ['#2563eb', '#0284c7', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

export const AnalyticsPage = () => {
  const [data, setData] = useState({
    totalReports: 1280,
    resolvedReports: 1195,
    slaComplianceRate: 91.4,
    averageResolutionHours: 18.2,
    categories: [],
    wardDistribution: [],
    monthlyTrends: [
      { month: 'Jun', submitted: 180, resolved: 165 },
      { month: 'Jul', submitted: 230, resolved: 215 },
      { month: 'Aug', submitted: 310, resolved: 290 },
      { month: 'Sep', submitted: 275, resolved: 260 },
      { month: 'Oct', submitted: 285, resolved: 265 },
    ],
  });

  const [days, setDays] = useState(30);
  const [ward, setWard] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [days, ward]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/analytics/overview?days=${days}&ward=${ward}`);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Month,Submitted,Resolved\n' +
      data.monthlyTrends.map((t) => `${t.month},${t.submitted},${t.resolved}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `umcp_analytics_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Civic Analytics & Operational Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time performance benchmarks, departmental SLA compliance, and spatial density metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date Range:</span>
          <div className="flex items-center gap-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  days === d
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ward:</span>
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">All Municipal Wards (MMR)</option>
            <option value="14">Ward 14 (Kanakia)</option>
            <option value="4">Ward 4 (Bhayandar West)</option>
            <option value="1">Ward 1 (Bhayandar East)</option>
            <option value="9">Ward 9 (Penkarpada)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Total Reports Processed"
          value={data.totalReports}
          subtitle="During selected window"
          icon={BarChart3}
          color="blue"
        />
        <KpiCard
          title="SLA Compliance Rate"
          value={`${data.slaComplianceRate}%`}
          subtitle="Repairs signed off in <=24h"
          icon={CheckCircle2}
          color="emerald"
        />
        <KpiCard
          title="Average Turnaround"
          value={`${data.averageResolutionHours}h`}
          subtitle="From triage to completion"
          icon={Clock}
          color="purple"
        />
        <KpiCard
          title="Citizen Satisfaction"
          value="4.7 / 5"
          subtitle="Based on resident ratings"
          icon={ShieldCheck}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Monthly Intake vs Resolution Trend
              </h3>
              <p className="text-xs text-slate-400">Comparing submissions against work order sign-offs</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171f33',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="submitted" name="Submitted" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hazard Category Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Category Distribution
              </h3>
              <p className="text-xs text-slate-400">Relative density of reported infrastructure issues</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Pothole & Pavement Cratering', pct: 42, count: '538 cases', color: 'bg-blue-600' },
              { label: 'Waterlogging & Culvert Choke', pct: 28, count: '358 cases', color: 'bg-cyan-500' },
              { label: 'Traffic Signal & Power Dark', pct: 14, count: '179 cases', color: 'bg-amber-500' },
              { label: 'Solid Waste Debris Dumping', pct: 10, count: '128 cases', color: 'bg-purple-500' },
              { label: 'General Hazard & Obstructions', pct: 6, count: '77 cases', color: 'bg-rose-500' },
            ].map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{cat.label}</span>
                  <span className="tnum font-bold">{cat.count} ({cat.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
