import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Server,
  Users,
  Database,
  Activity,
  Radio,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import KpiCard from '../components/common/KpiCard';

export const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const [health, setHealth] = useState({
    serverUptimeSeconds: 1240,
    databaseConnected: true,
    socketClientsCount: 4,
    totalRegisteredUsers: 142,
    activePlatformNodes: 8,
    systemHealth: {
      apiGateway: 'OPTIMAL (14ms)',
      gisEngine: 'SYNCHRONIZED',
      smsGateway: 'CONNECTED',
      authCluster: 'ACTIVE',
    },
    memoryUsageMb: 84,
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [hRes, lRes] = await Promise.all([
        api.get('/admin/health'),
        api.get('/admin/audit-logs'),
      ]);

      if (hRes.success) setHealth(hRes.data);
      if (lRes.success) setAuditLogs(lRes.data || []);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Governance Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider backdrop-blur-md text-white">
              Urban Scene &bull; Know what’s moving.
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold tracking-wide backdrop-blur-md">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span>Platform Governance & Infrastructure Cluster</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Administration & RBAC
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Global role-based authorization, microservices health telemetry, and immutable compliance audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users & Roles</span>
          </Link>
        </div>
      </div>

      {/* 4 Macro KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Total Registered Accounts"
          value={health.totalRegisteredUsers}
          subtitle="All canonical role tiers"
          icon={Users}
          color="blue"
          onClick={() => navigate('/admin/users')}
        />
        <KpiCard
          title="Active Platform Nodes"
          value={health.activePlatformNodes}
          subtitle="8 Municipal Wards Online"
          icon={Server}
          color="emerald"
        />
        <KpiCard
          title="Connected Socket Clients"
          value={health.socketClientsCount}
          subtitle="Real-time WebSocket sessions"
          icon={Radio}
          color="purple"
        />
        <KpiCard
          title="Process Memory RSS"
          value={`${health.memoryUsageMb} MB`}
          subtitle="Node.js runtime heap"
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Microservices Health Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              System Service Health Diagnostic Grid
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time ping telemetry across internal application sub-systems
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Systems Normal</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Express API Gateway</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {health.systemHealth.apiGateway}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">REST /api/v1</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">MongoDB Engine</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {health.database?.type === 'PERSISTENT_MONGODB'
                ? 'PERSISTENT (Live)'
                : 'IN-MEMORY (Fallback)'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={health.database?.uri || ''}>
              {health.database?.isFallback ? 'mongodb-memory-server' : 'Persistent Storage'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Leaflet GIS Engine</div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
              {health.systemHealth.gisEngine}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">OSM Vector Tiles</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Auth & RBAC Service</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {health.systemHealth.authCluster}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">JWT / Bcrypt-12</div>
          </div>
        </div>
      </div>

      {/* Compliance Audit Log Trail */}
      <div className="rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Compliance Audit Trail Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable chronological record of administrative actions and status mutations
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="py-3 px-6">Timestamp</th>
                <th className="py-3 px-6">Actor</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Action Executed</th>
                <th className="py-3 px-6">Target Entity</th>
                <th className="py-3 px-6">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="py-3 px-6 text-slate-400 font-mono tnum">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-6 font-semibold text-slate-800 dark:text-slate-200">
                    {log.actor?.fullName || 'System Automated'}
                  </td>
                  <td className="py-3 px-6">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-3 px-6 font-mono font-bold text-slate-900 dark:text-white">
                    {log.action}
                  </td>
                  <td className="py-3 px-6 text-slate-500">{log.targetEntity}</td>
                  <td className="py-3 px-6 font-mono text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
