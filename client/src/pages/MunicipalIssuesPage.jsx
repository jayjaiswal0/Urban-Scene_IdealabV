import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Wrench,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/common/StatusBadge';
import SeverityBadge from '../components/common/SeverityBadge';
import Modal from '../components/common/Modal';

export const MunicipalIssuesPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const assignParam = searchParams.get('assign');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Assign Squad Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [squadName, setSquadName] = useState('MBMC Works Unit B-4 (Cold Mix Asphalt Squad)');
  const [department, setDepartment] = useState('PUBLIC_WORKS');
  const [priority, setPriority] = useState('HIGH');
  const [slaHours, setSlaHours] = useState(24);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, categoryFilter]);

  // Real-time synchronization: instant table update when citizen files or status changes
  useEffect(() => {
    if (socket) {
      const handleStatusChange = (data) => {
        setReports((prev) =>
          prev.map((r) => (r._id === data.reportId ? { ...r, status: data.status } : r))
        );
      };

      const handleNewReport = () => {
        fetchIssues();
      };

      socket.on('report:statusChanged', handleStatusChange);
      socket.on('report:created', handleNewReport);
      socket.on('authority:report:created', handleNewReport);

      return () => {
        socket.off('report:statusChanged', handleStatusChange);
        socket.off('report:created', handleNewReport);
        socket.off('authority:report:created', handleNewReport);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (assignParam && reports.length > 0) {
      const match = reports.find((r) => r._id === assignParam);
      if (match) setSelectedReport(match);
    }
  }, [assignParam, reports]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/reports?${params.toString()}`);
      if (res.success && res.data) {
        setReports(res.data.items || []);
      }
    } catch (e) {
      console.error('Error fetching municipal issues:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = (report) => {
    setSelectedReport(report);
    if (report.category === 'WATERLOGGING') {
      setDepartment('DRAINAGE');
      setSquadName('MBMC Monsoon Dewatering Unit D-1');
    } else if (report.category === 'TRAFFIC_SIGNAL' || report.category === 'STREETLIGHT') {
      setDepartment('ELECTRICAL');
      setSquadName('MBMC Electrical Grid Squad E-2');
    } else {
      setDepartment('PUBLIC_WORKS');
      setSquadName('MBMC Works Unit B-4 (Cold Mix Asphalt Squad)');
    }
  };

  const handleCreateWorkOrder = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setAssignLoading(true);

    try {
      await api.post('/tasks', {
        reportId: selectedReport._id,
        department,
        assignedSquad: squadName,
        priority,
        slaHours: Number(slaHours),
      });

      setSelectedReport(null);
      fetchIssues();
    } catch (err) {
      alert(err.message || 'Failed to dispatch work order');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleQuickStatusChange = async (reportId, newStatus) => {
    try {
      await api.patch(`/reports/${reportId}/status`, {
        status: newStatus,
        remarks: `Updated by municipal officer ${user?.fullName}`,
      });
      fetchIssues();
    } catch (err) {
      alert(err.message || 'Status transition not allowed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">
          <span>Urban Scene &bull; Know what’s moving.</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Municipal Triage & Issue Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review reported hazards, dispatch municipal maintenance squads, and track resolution SLAs.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Issues' },
            { id: 'SUBMITTED', label: 'Pending Triage' },
            { id: 'UNDER_REVIEW', label: 'Under Review' },
            { id: 'ASSIGNED', label: 'Squad Assigned' },
            { id: 'IN_PROGRESS', label: 'Work In Progress' },
            { id: 'RESOLVED', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-white/10">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchIssues()}
              placeholder="Search by reference ID, title, or landmark..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="POTHOLE">Potholes / Road Cratering</option>
              <option value="WATERLOGGING">Waterlogging & Flooding</option>
              <option value="TRAFFIC_SIGNAL">Broken Traffic Signals</option>
              <option value="GARBAGE">Solid Waste Piles</option>
              <option value="ROAD_HAZARD">Obstructions & Detours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">Loading municipal issues...</div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No matching issues found
            </h3>
            <p className="text-xs text-slate-400">All reports have been addressed or filtered out.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/10">
                <tr>
                  <th className="py-3.5 px-6">Reference ID</th>
                  <th className="py-3.5 px-6">Incident Summary</th>
                  <th className="py-3.5 px-6">Ward</th>
                  <th className="py-3.5 px-6">Severity</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6 text-right">Quick Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      {report.referenceId}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {report.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {report.address}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold">Ward {report.ward}</td>
                    <td className="py-4 px-6">
                      <SeverityBadge severity={report.severity} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="py-4 px-6 font-semibold text-blue-600 dark:text-blue-400">
                      {report.assignedDepartment}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {report.status === 'SUBMITTED' || report.status === 'UNDER_REVIEW' ? (
                        <button
                          onClick={() => handleOpenAssignModal(report)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          Dispatch Squad
                        </button>
                      ) : report.activeTask ? (
                        <Link
                          to={`/authority/tasks/${report.activeTask}`}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-100 transition-colors"
                        >
                          View Task
                        </Link>
                      ) : (
                        <Link
                          to={`/citizen/reports/${report._id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors"
                        >
                          Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dispatch Work Order Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={`Dispatch Work Order: ${selectedReport?.referenceId}`}
      >
        <form onSubmit={handleCreateWorkOrder} className="space-y-4">
          <p className="text-xs text-slate-500">
            Create an official municipal maintenance work order and deploy a field squad.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Department Assignment
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="PUBLIC_WORKS">Public Works (Asphalt & Pavements)</option>
              <option value="DRAINAGE">Stormwater Drainage & Culverts</option>
              <option value="ELECTRICAL">Electrical Infrastructure & Signals</option>
              <option value="SOLID_WASTE">Solid Waste & Sanitation</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Assigned Field Squad
            </label>
            <input
              type="text"
              value={squadName}
              onChange={(e) => setSquadName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs"
              >
                <option value="HIGH">High (Immediate Dispatch)</option>
                <option value="MEDIUM">Medium (Standard 24h)</option>
                <option value="ROUTINE">Routine (72h SLA)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                SLA Window (Hours)
              </label>
              <input
                type="number"
                min={2}
                max={168}
                value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={assignLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all mt-2"
          >
            {assignLoading ? 'Creating Work Order...' : 'Dispatch Work Order & Notify Citizen'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MunicipalIssuesPage;
