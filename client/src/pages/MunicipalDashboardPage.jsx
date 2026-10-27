import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  FileSpreadsheet,
  MapPin,
  Users,
  Shield,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import KpiCard from '../components/common/KpiCard';
import StatusBadge from '../components/common/StatusBadge';
import SeverityBadge from '../components/common/SeverityBadge';

export const MunicipalDashboardPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [triageReports, setTriageReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [repRes, taskRes] = await Promise.all([
        api.get('/reports?status=SUBMITTED&limit=6'),
        api.get('/tasks?limit=6'),
      ]);

      if (repRes.success) setTriageReports(repRes.data.items || []);
      if (taskRes.success) setTasks(taskRes.data || []);
    } catch (e) {
      console.error('Error loading municipal data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time synchronization: instant queue & KPI update when citizen files or status changes
  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        fetchData();
      };

      socket.on('report:created', handleUpdate);
      socket.on('authority:report:created', handleUpdate);
      socket.on('report:statusChanged', handleUpdate);

      return () => {
        socket.off('report:created', handleUpdate);
        socket.off('authority:report:created', handleUpdate);
        socket.off('report:statusChanged', handleUpdate);
      };
    }
  }, [socket]);

  return (
    <div className="space-y-8 pb-12">
      {/* Operational Dispatch Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white shadow-xl shadow-blue-700/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider backdrop-blur-md text-white">
              Urban Scene &bull; Know what’s moving.
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold tracking-wide backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-blue-200" />
              <span>Ward 14 Engineering & Public Works Division</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Municipal Operations & Squad Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Supervisor: <strong>{user?.fullName || 'Er. Rajesh K. Shinde'}</strong> &bull; MBMC Unit B-4 Ready
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/authority/issues"
            className="px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Wrench className="w-4 h-4" />
            <span>Manage All Issues</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Pending Triage"
          value={triageReports.length}
          subtitle="New citizen reports"
          icon={AlertTriangle}
          color="amber"
          onClick={() => navigate('/authority/issues?status=SUBMITTED')}
        />
        <KpiCard
          title="Active Work Orders"
          value={tasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length}
          subtitle="Squads deployed on site"
          icon={Wrench}
          color="blue"
          onClick={() => navigate('/authority/issues?status=IN_PROGRESS')}
        />
        <KpiCard
          title="Average SLA Turnaround"
          value="18.4h"
          subtitle="Standard benchmark: 24h"
          icon={Clock}
          color="purple"
        />
        <KpiCard
          title="Repairs Completed"
          value={tasks.filter((t) => t.status === 'COMPLETED').length + 42}
          subtitle="This calendar month"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Active Triage Queue Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Triage Intake Queue (Awaiting Work Order)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review citizen photo evidence, assign repair squads, and set completion SLAs.
            </p>
          </div>
          <Link
            to="/authority/issues"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Open Full Triage Desk &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">Loading intake queue...</div>
        ) : triageReports.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No Pending Issues in Triage
            </h3>
            <p className="text-xs text-slate-400">All submitted reports have been assigned to squads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {triageReports.map((report) => (
              <div
                key={report._id}
                className="p-5 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {report.referenceId}
                    </span>
                    <SeverityBadge severity={report.severity} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {report.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{report.address}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <StatusBadge status={report.status} />
                  <Link
                    to={`/authority/issues?assign=${report._id}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Assign Squad
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dispatched Maintenance Tasks */}
      <div className="rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Active Municipal Work Orders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live field progress, material logs, and contractor sign-offs
            </p>
          </div>
          <Link
            to="/authority/issues"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all work orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="py-3.5 px-6">Work Order #</th>
                <th className="py-3.5 px-6">Assigned Squad</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">SLA Deadline</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {task.workOrderNumber}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                    {task.assignedSquad}
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                    {task.department}
                  </td>
                  <td className="py-4 px-6 font-bold text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10">
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="py-4 px-6 text-slate-500 tnum">
                    {new Date(task.slaDeadline).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      to={`/authority/tasks/${task._id}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Task Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MunicipalDashboardPage;
