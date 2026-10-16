import React, { useEffect, useState } from 'react';
import {
  Siren,
  ShieldAlert,
  Clock,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
  Radio,
  Send,
} from 'lucide-react';
import api from '../services/api';
import KpiCard from '../components/common/KpiCard';
import Modal from '../components/common/Modal';

export const EmergencyDashboardPage = () => {
  const [overview, setOverview] = useState({
    criticalHazardsCount: 2,
    activeCorridorsCount: 1,
    activeCorridors: [],
    vehicles: [],
    averageClearanceMinutes: 8.5,
  });

  const [loading, setLoading] = useState(true);

  // Clearance Directive Modal
  const [showModal, setShowModal] = useState(false);
  const [origin, setOrigin] = useState('Bhayandar West Municipal Trauma Hospital');
  const [destination, setDestination] = useState('MMR Tertiary Trauma Care Center (WEH)');
  const [priorityLevel, setPriorityLevel] = useState('LEVEL_II');
  const [directiveLoading, setDirectiveLoading] = useState(false);
  const [directiveSuccess, setDirectiveSuccess] = useState(false);

  useEffect(() => {
    fetchEmergencyOverview();
  }, []);

  const fetchEmergencyOverview = async () => {
    try {
      const res = await api.get('/emergency/overview');
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (e) {
      console.error('Error loading emergency data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueDirective = async (e) => {
    e.preventDefault();
    setDirectiveLoading(true);
    try {
      await api.post('/emergency/corridors', {
        originHospital: origin,
        destinationHospital: destination,
        signalPriorityLevel: priorityLevel,
      });

      setDirectiveSuccess(true);
      fetchEmergencyOverview();
      setTimeout(() => {
        setDirectiveSuccess(false);
        setShowModal(false);
      }, 1500);
    } catch (err) {
      alert('Failed to issue green corridor directive');
    } finally {
      setDirectiveLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Priority Alert Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-700 via-rose-800 to-slate-950 text-white shadow-xl shadow-rose-700/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-bold tracking-wide backdrop-blur-md mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Priority Emergency Level II &bull; Active Signal Pre-emption</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Emergency Operations & Green Corridors
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 mt-1">
            Real-time ambulance telemetry, continuous traffic signal green wave synchronization, and trauma route clearance.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 self-start md:self-auto shrink-0"
        >
          <Siren className="w-4 h-4 animate-pulse" />
          <span>Issue Clearance Directive</span>
        </button>
      </div>

      {/* 4 Emergency KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Critical Road Hazards"
          value={overview.criticalHazardsCount}
          subtitle="Severity Level: URGENT"
          icon={AlertTriangle}
          color="rose"
        />
        <KpiCard
          title="Active Green Corridors"
          value={overview.activeCorridorsCount}
          subtitle="Signal priority synchronized"
          icon={Siren}
          color="amber"
        />
        <KpiCard
          title="Average Clearance Time"
          value={`${overview.averageClearanceMinutes} mins`}
          subtitle="Bed-to-trauma center transit"
          icon={Clock}
          color="emerald"
        />
        <KpiCard
          title="Dispatched Ambulances"
          value={overview.vehicles?.length || 3}
          subtitle="GPS telemetry tracking"
          icon={Activity}
          color="blue"
        />
      </div>

      {/* Active Corridors & GPS Vehicle Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Directives */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Active Green Corridor Directives
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated signal timing overrides along primary hospital arterials
              </p>
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full animate-pulse">
              Corridor Active
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  CORR-DIRECTIVE-9402
                </span>
                <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Signals Pre-empted (100% Green)
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Bhayandar West Hospital &rarr; MMR Trauma Center (WEH)
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/40 dark:border-white/5">
                <span>Priority: <strong>Level II (Critical Patient)</strong></span>
                <span>Est Transit: <strong className="tnum text-emerald-600 font-bold">6.2 mins</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Ambulance Telemetry Roster */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Emergency Dispatch Fleet Telemetry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connected GPS transponders on municipal ambulances and fire units
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { callSign: 'EMS-AMB-104', type: 'Advanced Cardiac Ambulance', status: 'EN_ROUTE', speed: '58 km/h' },
              { callSign: 'EMS-AMB-208', type: 'Pediatric Life Support', status: 'IDLE', speed: '0 km/h' },
              { callSign: 'FIRE-TND-01', type: 'Disaster Rescue Tender', status: 'IDLE', speed: '0 km/h' },
            ].map((veh) => (
              <div
                key={veh.callSign}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    {veh.callSign}
                  </div>
                  <div className="text-[11px] text-slate-400">{veh.type}</div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      veh.status === 'EN_ROUTE'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 animate-pulse'
                        : 'bg-slate-100 text-slate-600 dark:bg-white/10'
                    }`}
                  >
                    {veh.status} ({veh.speed})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Directive Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Activate Green Corridor Clearance Directive"
      >
        <form onSubmit={handleIssueDirective} className="space-y-4">
          {directiveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
              Green Corridor directive activated! Traffic signals pre-empted.
            </div>
          )}

          <div>
            <label className="text-xs font-semibold mb-1 block">Origin Hospital / Facility</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block">Destination Trauma Center</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block">Signal Priority Level</label>
            <select
              value={priorityLevel}
              onChange={(e) => setPriorityLevel(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
            >
              <option value="LEVEL_I">Level I &bull; Critical Medical Emergency</option>
              <option value="LEVEL_II">Level II &bull; Trauma Transit with Green Wave</option>
              <option value="LEVEL_III">Level III &bull; Disaster Response Convoy</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={directiveLoading}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
          >
            {directiveLoading ? 'Activating Corridors...' : 'Activate Green Corridor & Synchronize Signals'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default EmergencyDashboardPage;
