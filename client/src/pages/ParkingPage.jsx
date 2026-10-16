import React, { useEffect, useState } from 'react';
import {
  Car,
  Zap,
  CreditCard,
  MapPin,
  RefreshCw,
  Navigation,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import KpiCard from '../components/common/KpiCard';
import Modal from '../components/common/Modal';

export const ParkingPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [facilities, setFacilities] = useState([]);
  const [summary, setSummary] = useState({
    totalBays: 630,
    liveAvailable: 204,
    evBays: 54,
    fastTagCompliance: 100,
  });

  const [wardFilter, setWardFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Operator Update Modal
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [newOccupancy, setNewOccupancy] = useState(0);
  const [updateLoading, setUpdateLoading] = useState(false);

  const isAuthority = user && ['MUNICIPAL_AUTHORITY', 'ADMIN'].includes(user.role);

  useEffect(() => {
    fetchParkingData();
  }, [wardFilter]);

  // Listen to real-time occupancy updates
  useEffect(() => {
    if (socket) {
      socket.on('parking:occupancyUpdated', (data) => {
        setFacilities((prev) =>
          prev.map((f) =>
            f.facilityId === data.facilityId
              ? {
                  ...f,
                  occupiedBays: data.occupiedBays,
                  vacantBays: data.vacantBays,
                  occupancyPercentage: Math.round((data.occupiedBays / f.totalBays) * 100),
                }
              : f
          )
        );
      });

      return () => {
        socket.off('parking:occupancyUpdated');
      };
    }
  }, [socket]);

  const fetchParkingData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (wardFilter !== 'ALL') params.append('ward', wardFilter);
      if (search) params.append('search', search);

      const [listRes, sumRes] = await Promise.all([
        api.get(`/parking?${params.toString()}`),
        api.get('/parking/summary'),
      ]);

      if (listRes.success) setFacilities(listRes.data || []);
      if (sumRes.success) setSummary(sumRes.data || summary);
    } catch (e) {
      console.error('Error loading parking facilities:', e);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleManualSync = () => {
    setSyncing(true);
    fetchParkingData();
  };

  const handleOpenUpdateModal = (facility) => {
    setSelectedFacility(facility);
    setNewOccupancy(facility.occupiedBays);
  };

  const handleSaveOccupancy = async (e) => {
    e.preventDefault();
    if (!selectedFacility) return;
    setUpdateLoading(true);
    try {
      await api.patch(`/parking/${selectedFacility._id}/occupancy`, {
        occupiedBays: Number(newOccupancy),
      });
      setSelectedFacility(null);
      fetchParkingData();
    } catch (err) {
      alert(err.message || 'Failed to update occupancy');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Smart Municipal Parking Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time inductive loop sensor readings and FastTag occupancy across MMR multi-level facilities.
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync Sensor Hub'}</span>
        </button>
      </div>

      {/* 4 Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title="Total Registered Bays"
          value={summary.totalBays}
          subtitle="Across 4 active facilities"
          icon={Car}
          color="blue"
        />
        <KpiCard
          title="Live Available Bays"
          value={summary.liveAvailable}
          subtitle="Immediate vacancy"
          icon={CheckCircle2}
          color="emerald"
        />
        <KpiCard
          title="Dedicated EV Bays"
          value={summary.evBays}
          subtitle="Fast charger equipped"
          icon={Zap}
          color="purple"
        />
        <KpiCard
          title="FastTag Integrated"
          value={`${summary.fastTagCompliance}%`}
          subtitle="Automated barrier gates"
          icon={CreditCard}
          color="amber"
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Ward Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Facilities' },
            { id: '14', label: 'Ward 14 (Kanakia)' },
            { id: '1', label: 'Ward 1 (Bhayandar East)' },
            { id: '9', label: 'Ward 9 (Penkarpada)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setWardFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                wardFilter === tab.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchParkingData()}
            placeholder="Search facility by name..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Facility Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-500">Loading parking bays...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((fac) => {
            const vacant = fac.vacantBays !== undefined ? fac.vacantBays : Math.max(0, fac.totalBays - fac.occupiedBays);
            const occupancyPct = fac.occupancyPercentage || Math.round((fac.occupiedBays / fac.totalBays) * 100);
            const isFull = vacant === 0;

            return (
              <div
                key={fac._id || fac.facilityId}
                className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {fac.facilityId}
                      </span>
                      {fac.hasFastTag && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          FastTag Enabled
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {fac.facilityName}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{fac.address}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        isFull
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}
                    >
                      {isFull ? 'Lot Full' : `${vacant} Bays Vacant`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Occupancy: {occupancyPct}%</span>
                    <span className="tnum">{fac.occupiedBays} / {fac.totalBays} slots taken</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        occupancyPct > 90
                          ? 'bg-rose-500'
                          : occupancyPct > 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Tariffs & EV Badges */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Hourly 4W</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">₹{fac.tariffs?.hourlyRate || 30}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Daily Cap</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">₹{fac.tariffs?.dailyRate || 200}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">EV Chargers</div>
                    <div className="font-bold text-purple-600 dark:text-purple-400 mt-0.5">{fac.evChargingBays || 0} Ports</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${fac.location?.coordinates[1]},${fac.location?.coordinates[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>

                  {isAuthority && (
                    <button
                      onClick={() => handleOpenUpdateModal(fac)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      Update Occupancy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Operator Update Modal */}
      <Modal
        isOpen={!!selectedFacility}
        onClose={() => setSelectedFacility(null)}
        title={`Update Occupancy: ${selectedFacility?.facilityName}`}
      >
        <form onSubmit={handleSaveOccupancy} className="space-y-4">
          <p className="text-xs text-slate-500">
            Authorized municipal operators can manually calibrate live occupied bay counts.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Occupied Bays (Max: {selectedFacility?.totalBays})
            </label>
            <input
              type="number"
              min={0}
              max={selectedFacility?.totalBays || 500}
              value={newOccupancy}
              onChange={(e) => setNewOccupancy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updateLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
          >
            {updateLoading ? 'Syncing...' : 'Save & Broadcast Update'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ParkingPage;
