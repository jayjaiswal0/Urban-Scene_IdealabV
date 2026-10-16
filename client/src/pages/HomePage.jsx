import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Map,
  ShieldCheck,
  Bus,
  Car,
  Phone,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const [stats, setStats] = useState({
    totalReports: 1420,
    resolvedReports: 1335,
    resolutionRate: 94,
    totalCitizens: 4210,
    activeTransitFeedBuses: 48,
    totalParkingBays: 630,
    availableParkingBays: 204,
  });

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/public-summary');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (e) {
        // Fallback to initial defaults
      }
    };
    fetchStats();
  }, []);

  const handleReportClick = () => {
    if (isAuthenticated) {
      navigate('/citizen/report');
    } else {
      navigate('/login?redirect=/citizen/report');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-8 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent border-b border-slate-200/60 dark:border-white/5">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Mira-Bhayandar Unified Civic Mobility System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Empowering Citizens.{' '}
            <span className="text-blue-600 dark:text-blue-400">Coordinating Transit.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Report road craters, traffic bottlenecks, and drainage hazards in seconds. Connect directly
            with municipal triage squads, traffic enforcement, and green hospital corridors.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleReportClick}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Report an Issue Now</span>
            </button>

            <Link
              to="/map"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-[#171f33] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-white/10 shadow-sm transition-all"
            >
              <Map className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Explore Live Mobility Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Statistics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm text-center">
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 tnum">
              {stats.totalReports}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Reports Filed
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm text-center">
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tnum">
              {stats.resolutionRate}%
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Resolution Compliance
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm text-center">
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 tnum">
              {stats.activeTransitFeedBuses}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              MBMT Live Buses
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm text-center">
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 tnum">
              {stats.availableParkingBays}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Available Parking Bays
            </div>
          </div>
        </div>
      </section>

      {/* MBMT Transit Feed Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  MBMT Live Transit Feeder Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time municipal bus telemetry across Mira Road & Bhayandar
                </p>
              </div>
            </div>
            <Link
              to="/map"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              View live buses on map &rarr;
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-600 dark:text-blue-400">Route #10</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">On Time</span>
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                Bhayandar Stn (W) &rarr; Kanakia Park
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Next Arrival: <strong className="text-slate-700 dark:text-slate-200 tnum">3 mins</strong></span>
                <span>Capacity: 65%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-600 dark:text-blue-400">Route #14</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">+4m Delay (Detour)</span>
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                Mira Road Stn &rarr; Kashimira / WEH
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Next Arrival: <strong className="text-slate-700 dark:text-slate-200 tnum">7 mins</strong></span>
                <span>Capacity: 80%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-600 dark:text-blue-400">Route #28</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">On Time</span>
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                Uttan Beach Feeder &rarr; Bhayandar (E)
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Next Arrival: <strong className="text-slate-700 dark:text-slate-200 tnum">12 mins</strong></span>
                <span>Capacity: 45%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Quick Action Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/30">
              <Phone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Emergency Rapid Response & Disaster Control
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Direct hotline for ambulance green corridors, tree falls, and high-water rescues.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:112"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all"
            >
              Dial 112 (National Helpline)
            </a>
            <a
              href="tel:1800223450"
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#171f33] hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-white/10"
            >
              1800-22-3450 (MBMC Desk)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
