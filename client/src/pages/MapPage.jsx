import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Activity,
  AlertTriangle,
  Car,
  Compass,
  ArrowRight,
  TrendingDown,
  Clock,
  PlusCircle,
} from 'lucide-react';
import api from '../services/api';
import MobilityMap from '../components/map/MobilityMap';
import StatusBadge from '../components/common/StatusBadge';
import SeverityBadge from '../components/common/SeverityBadge';

export const MapPage = () => {
  const [reports, setReports] = useState([]);
  const [parking, setParking] = useState([]);
  const [corridors, setCorridors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [repRes, parkRes, corrRes] = await Promise.all([
          api.get('/reports/map'),
          api.get('/parking'),
          api.get('/traffic/corridors'),
        ]);

        if (repRes.success) setReports(repRes.data || []);
        if (parkRes.success) setParking(parkRes.data || []);
        if (corrRes.success) setCorridors(corrRes.data || []);
      } catch (err) {
        console.error('Error fetching map telemetry:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Live Mobility GIS Viewport
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry showing waterlogging choke points, road craters, and smart MLCP vacancy.
          </p>
        </div>

        <Link
          to="/citizen/report"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Hazard</span>
        </Link>
      </div>

      {/* Main Grid: Left Map, Right Corridor Telemetry & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive Map Viewport */}
        <div className="lg:col-span-3">
          <MobilityMap
            reports={reports}
            parking={parking}
            height="h-[640px]"
            showLayers={true}
          />
        </div>

        {/* Right Sidebar: Arterial Speed Index & Nearby Incidents */}
        <div className="space-y-6">
          {/* Corridor Speed Index */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Arterial Speed Index
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {corridors.map((c) => {
                const isHeavy = c.congestionLevel === 'HEAVY';
                return (
                  <div
                    key={c.corridorId || c._id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                        {c.corridorName}
                      </span>
                      <span
                        className={`font-mono font-bold tnum ${
                          isHeavy ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {c.speedIndexKmH} km/h
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isHeavy ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, (c.speedIndexKmH / (c.baselineSpeedKmH || 50)) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Baseline: {c.baselineSpeedKmH || 45} km/h</span>
                      <span className="font-semibold text-rose-500 flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" />
                        <span>-{Math.round((1 - c.speedIndexKmH / (c.baselineSpeedKmH || 50)) * 100)}% Drop</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Hazards Ticker */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Active Ward Hazards
              </h3>
              <span className="text-xs text-slate-400 tnum">{reports.length} pinned</span>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {reports.slice(0, 5).map((r) => (
                <Link
                  key={r.id || r.referenceId}
                  to={`/citizen/reports/${r.id}`}
                  className="block p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {r.referenceId}
                    </span>
                    <SeverityBadge severity={r.severity} />
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {r.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">
                    {r.address}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
