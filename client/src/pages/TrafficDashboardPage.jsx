import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Radio,
  Activity,
  AlertTriangle,
  Video,
  Send,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import KpiCard from '../components/common/KpiCard';
import StatusBadge from '../components/common/StatusBadge';
import SeverityBadge from '../components/common/SeverityBadge';
import Modal from '../components/common/Modal';

export const TrafficDashboardPage = () => {
  const navigate = useNavigate();

  const [corridors, setCorridors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advisory Modal
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);
  const [advisoryTitle, setAdvisoryTitle] = useState('Heavy Congestion Alert & Route Diversion');
  const [advisoryDesc, setAdvisoryDesc] = useState('Western Express Highway northbound throttled near Kashimira flyover due to heavy spill. Diversion active via Station Road Feeder.');
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisorySuccess, setAdvisorySuccess] = useState(false);

  useEffect(() => {
    fetchTrafficData();
  }, []);

  const fetchTrafficData = async () => {
    try {
      const [corrRes, incRes] = await Promise.all([
        api.get('/traffic/corridors'),
        api.get('/reports?status=SUBMITTED&category=TRAFFIC_SIGNAL&limit=6'),
      ]);

      if (corrRes.success) setCorridors(corrRes.data || []);
      if (incRes.success) setIncidents(incRes.data.items || []);
    } catch (e) {
      console.error('Error loading traffic data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastAdvisory = async (e) => {
    e.preventDefault();
    setAdvisoryLoading(true);
    try {
      await api.post('/traffic/advisories', {
        title: advisoryTitle,
        description: advisoryDesc,
      });
      setAdvisorySuccess(true);
      setTimeout(() => {
        setAdvisorySuccess(false);
        setShowAdvisoryModal(false);
      }, 1500);
    } catch (err) {
      alert('Failed to broadcast advisory');
    } finally {
      setAdvisoryLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 text-white shadow-xl shadow-orange-600/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider backdrop-blur-md text-white">
              Urban Scene &bull; Know what’s moving.
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold tracking-wide backdrop-blur-md">
              <Radio className="w-3.5 h-3.5 text-amber-200" />
              <span>MMR Traffic Coordination & Enforcement Division</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Traffic Incident Desk & CCTV Feeds
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Arterial corridor speed monitoring, CCTV spatial triangulation, and live public detour broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdvisoryModal(true)}
            className="px-5 py-3 rounded-2xl bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Broadcast Advisory</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Active Bottlenecks"
          value="4 Corridors"
          subtitle="WEH, Station Rd, Ghodbunder"
          icon={AlertTriangle}
          color="rose"
        />
        <KpiCard
          title="Pending Verification"
          value={incidents.length + 2}
          subtitle="Citizen clusters requiring review"
          icon={Radio}
          color="amber"
          onClick={() => navigate('/traffic/verify')}
        />
        <KpiCard
          title="Corridor Flow Index"
          value="68%"
          subtitle="MMR arterial average"
          icon={Activity}
          color="blue"
        />
        <KpiCard
          title="Active Route Detours"
          value="2 Live"
          subtitle="Broadcasted to public map"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Arterial Corridors & CCTV Feed Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Speed Index Meters */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Arterial Corridor Velocity Telemetry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stochastic fluctuations calibrated against historical weekday speed baselines
              </p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Live Sensor Sync
            </span>
          </div>

          <div className="space-y-4">
            {corridors.map((c) => {
              const drop = Math.round((1 - c.speedIndexKmH / (c.baselineSpeedKmH || 50)) * 100);
              const isHeavy = c.congestionLevel === 'HEAVY';

              return (
                <div
                  key={c.corridorId || c._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {c.corridorName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Status: <strong className={isHeavy ? 'text-rose-500' : 'text-amber-500'}>{c.congestionLevel}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tnum">
                        {c.speedIndexKmH} km/h
                      </div>
                      <div className="text-[10px] text-rose-500 font-bold">
                        -{drop}% Velocity Drop
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isHeavy ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, (c.speedIndexKmH / (c.baselineSpeedKmH || 50)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulated CCTV Feed Player */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live CCTV Camera #04
              </h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800">
            {/* Visual simulation for CCTV */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10 p-3 flex flex-col justify-between">
              <div className="flex justify-between text-[10px] font-mono text-white/80">
                <span>CAM-WEH-KASHIMIRA-04</span>
                <span className="tnum">REC [●] 25 FPS</span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                LAT 19.2842° N | LNG 72.8595° E | LIVE STREAM
              </div>
            </div>

            {/* Video or Animated Road Simulation */}
            <div className="text-center space-y-2 p-4">
              <Video className="w-10 h-10 text-slate-600 mx-auto" />
              <span className="text-[11px] font-mono text-slate-400 block">
                Optical Feed Active &bull; Automated Vehicle Counter
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            AI-assisted license plate & congestion density analyzer connected to Western Express Highway flyover junction.
          </p>

          <Link
            to="/traffic/verify"
            className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>Inspect Corroboration Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Advisory Modal */}
      <Modal
        isOpen={showAdvisoryModal}
        onClose={() => setShowAdvisoryModal(false)}
        title="Broadcast Traffic Advisory & Route Detour"
      >
        <form onSubmit={handleBroadcastAdvisory} className="space-y-4">
          {advisorySuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
              Advisory published to public map and mobile notifications.
            </div>
          )}

          <div>
            <label className="text-xs font-semibold mb-1 block">Advisory Headline</label>
            <input
              type="text"
              value={advisoryTitle}
              onChange={(e) => setAdvisoryTitle(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block">Detour Instructions</label>
            <textarea
              rows={3}
              value={advisoryDesc}
              onChange={(e) => setAdvisoryDesc(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={advisoryLoading}
            className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md"
          >
            {advisoryLoading ? 'Broadcasting...' : 'Broadcast Immediate Advisory'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TrafficDashboardPage;
