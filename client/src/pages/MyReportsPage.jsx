import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Download,
  MapPin,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/common/StatusBadge';
import SeverityBadge from '../components/common/SeverityBadge';

export const MyReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';
  const { socket } = useSocket();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchReports();
  }, [activeTab, wardFilter, sortOrder]);

  // Real-time synchronization: instant status update & new report injection without page reload
  useEffect(() => {
    if (socket) {
      const handleStatusChange = (data) => {
        setReports((prev) =>
          prev.map((r) => (r._id === data.reportId ? { ...r, status: data.status } : r))
        );
      };

      const handleNewReport = () => {
        fetchReports();
      };

      socket.on('report:statusChanged', handleStatusChange);
      socket.on('citizen:report:created', handleNewReport);
      socket.on('report:created', handleNewReport);

      return () => {
        socket.off('report:statusChanged', handleStatusChange);
        socket.off('citizen:report:created', handleNewReport);
        socket.off('report:created', handleNewReport);
      };
    }
  }, [socket]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'ALL') params.append('status', activeTab);
      if (wardFilter !== 'ALL') params.append('ward', wardFilter);
      if (search) params.append('search', search);
      params.append('sort', sortOrder);

      const res = await api.get(`/reports?${params.toString()}`);
      if (res.success && res.data) {
        setReports(res.data.items || []);
      }
    } catch (e) {
      console.error('Error fetching reports:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleExportCSV = () => {
    if (reports.length === 0) return;
    const headers = ['Reference ID', 'Title', 'Category', 'Severity', 'Status', 'Ward', 'Address', 'Date'];
    const rows = reports.map((r) => [
      r.referenceId,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.severity,
      r.status,
      r.ward,
      `"${r.address.replace(/"/g, '""')}"`,
      new Date(r.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `urban_scene_citizen_reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterTabs = [
    { id: 'ALL', label: 'All Reports' },
    { id: 'SUBMITTED', label: 'Submitted' },
    { id: 'UNDER_REVIEW', label: 'Under Review' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'RESOLVED', label: 'Resolved' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">
            <span>Urban Scene &bull; Know what’s moving.</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Civic Submissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track status progression, officer inspections, and municipal work order assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/citizen/report"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Report</span>
          </Link>
        </div>
      </div>

      {/* Newly Filed Report Live Synchronized Notice */}
      {searchParams.get('new') && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ✓
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Civic Report #{searchParams.get('new')} Filed & Persisted Successfully
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Dispatched to municipal operations queue and broadcast live to the GIS mobility map.
              </div>
            </div>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 self-start sm:self-auto transition-all shrink-0"
          >
            <span>View on Live Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ status: tab.id });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Ward Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-white/10">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-2 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference ID, title, or landmark..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Wards</option>
              <option value="14">Ward 14 (Kanakia)</option>
              <option value="4">Ward 4 (Bhayandar West)</option>
              <option value="1">Ward 1 (Bhayandar East)</option>
              <option value="9">Ward 9 (Penkarpada)</option>
            </select>
          </div>

          <div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">Loading civic reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
              No matching reports found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your filter settings or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/10">
                <tr>
                  <th className="py-3.5 px-6">Reference ID</th>
                  <th className="py-3.5 px-6">Hazard Details</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Severity</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Ward</th>
                  <th className="py-3.5 px-6">Submitted</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {reports.map((report) => (
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
                    <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Ward {report.ward}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 tnum">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/citizen/reports/${report._id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors inline-flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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

export default MyReportsPage;
