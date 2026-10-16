import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Radio,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Video,
  MapPin,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import SeverityBadge from '../components/common/SeverityBadge';

export const TrafficVerifyPage = () => {
  const navigate = useNavigate();

  const [clusterData, setClusterData] = useState({
    clusterSize: 3,
    corroborationConfidence: 92,
    reports: [],
  });

  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState(null);

  useEffect(() => {
    fetchTriangulation();
  }, []);

  const fetchTriangulation = async () => {
    try {
      const res = await api.get('/traffic/incidents/triangulate?lat=19.2842&lng=72.8595&radiusMeters=250');
      if (res.success && res.data) {
        setClusterData(res.data);
      }
    } catch (e) {
      console.error('Error fetching triangulation:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setDecision('VERIFIED');
    // If reports exist, verify the first one in cluster
    const targetReport = clusterData.reports?.[0];
    if (targetReport) {
      try {
        await api.patch(`/traffic/verify/${targetReport._id}`, {
          action: 'VERIFY',
          dispatchMarshal: true,
          remarks: 'Verified by Traffic Inspector Vikram Jadhav based on 3 corroborating citizen reports & CCTV review.',
        });
      } catch (e) {
        // Ignore
      }
    }
  };

  const handleDismiss = async () => {
    setDecision('DISMISSED');
    const targetReport = clusterData.reports?.[0];
    if (targetReport) {
      try {
        await api.patch(`/traffic/verify/${targetReport._id}`, {
          action: 'DISMISS',
          remarks: 'Dismissed by Traffic Inspector following optical review: minor routine slowdown without structural obstruction.',
        });
      } catch (e) {
        // Ignore
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link to="/traffic/dashboard" className="hover:underline">
            Traffic Coordination
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">Incident Verification Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Multi-Report Spatial Triangulation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Corroborate independent citizen filings against live MBMT telemetry drops and optical CCTV feeds.
        </p>
      </div>

      {decision && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            decision === 'VERIFIED'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/30 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {decision === 'VERIFIED'
                ? 'Incident verified! Traffic Marshals dispatched and priority detour alert triggered.'
                : 'Incident flagged as false alarm and dismissed from high-priority dispatch.'}
            </span>
          </div>
          <Link to="/traffic/dashboard" className="underline font-bold">
            Return to Desk
          </Link>
        </div>
      )}

      {/* Triangulation Metrics Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              Spatial Cluster #CL-8841
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              Western Express Highway / Kashimira Flyover Ramp
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Coordinates: 19.2842° N, 72.8595° E &bull; Radius: 200m
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-white/5 border border-amber-500/20 text-center min-w-[140px]">
            <div className="text-[10px] font-bold uppercase text-slate-400">Confidence Score</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tnum">
              {clusterData.corroborationConfidence}%
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">High Triangulation</div>
          </div>
        </div>

        {/* 3 Telemetry Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Independent Reports</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tnum">
              {clusterData.clusterSize || 3} Citizens
            </div>
            <div className="text-xs text-slate-500 mt-1">Filed within last 6 minutes</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase">MBMT Bus Speed Drop</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 tnum">
              -82% Velocity
            </div>
            <div className="text-xs text-slate-500 mt-1">Dropped from 48km/h to 8km/h</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-400 uppercase">CCTV Optical Validation</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              Congestion Confirmed
            </div>
            <div className="text-xs text-slate-500 mt-1">Obstruction on Lane 1 & 2</div>
          </div>
        </div>

        {/* Optical CCTV Player */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Video className="w-4 h-4 text-rose-500" />
              <span>Camera Stream #04 (Kashimira Overhead)</span>
            </span>
            <span className="font-mono text-emerald-500">LIVE HD [25 FPS]</span>
          </div>

          <div className="aspect-video rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-3 left-3 text-[10px] font-mono text-white/70">
              CAM_WEH_FLYOVER_NORTH
            </div>
            <div className="text-center p-6 space-y-2">
              <Video className="w-12 h-12 text-slate-700 mx-auto" />
              <div className="text-xs font-mono text-slate-400">
                Optical Feed Stream Active &bull; Heavy Bottleneck Detected
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Dismiss as False Alarm</span>
          </button>

          <button
            onClick={handleVerify}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify & Dispatch Traffic Marshal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrafficVerifyPage;
