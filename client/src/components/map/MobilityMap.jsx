import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import {
  Navigation,
  Layers,
  MapPin,
  Car,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../common/StatusBadge';
import SeverityBadge from '../common/SeverityBadge';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG Markers
const createCustomIcon = (type, severity) => {
  let bgColor = '#2563eb';
  let iconHtml = '📍';

  if (type === 'WATERLOGGING') {
    bgColor = '#0284c7';
    iconHtml = '💧';
  } else if (type === 'POTHOLE' || type === 'ROAD_HAZARD') {
    bgColor = severity === 'URGENT' ? '#ef4444' : '#f59e0b';
    iconHtml = '⚠️';
  } else if (type === 'TRAFFIC_SIGNAL') {
    bgColor = '#f97316';
    iconHtml = '🚦';
  } else if (type === 'STREETLIGHT') {
    bgColor = '#eab308';
    iconHtml = '💡';
  } else if (type === 'GARBAGE') {
    bgColor = '#10b981';
    iconHtml = '🗑️';
  } else if (type === 'PARKING') {
    bgColor = '#3b82f6';
    iconHtml = '🅿️';
  } else {
    bgColor = severity === 'URGENT' ? '#ef4444' : '#6366f1';
    iconHtml = '📍';
  }

  const isUrgent = severity === 'URGENT';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px;">
        ${
          isUrgent
            ? `<div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(239, 68, 68, 0.4); animation: pulse-ring 2s infinite;"></div>`
            : ''
        }
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${bgColor};
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: white;
        ">
          ${iconHtml}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Location Picker Sub-component
const LocationMarkerPicker = ({ position, onPositionChange }) => {
  const map = useMapEvents({
    click(e) {
      if (onPositionChange) {
        onPositionChange([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          if (onPositionChange) {
            onPositionChange([pos.lat, pos.lng]);
          }
        },
      }}
      icon={createCustomIcon('REPORT', 'NORMAL')}
    />
  ) : null;
};

// Map controller for flyTo
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

export const MobilityMap = ({
  reports = [],
  parking = [],
  selectedPosition,
  onPositionSelect,
  isPickerMode = false,
  height = 'h-[600px]',
  showLayers = true,
  focusCoords = null,
  onNewReport = null,
}) => {
  const [activeLayer, setActiveLayer] = useState('ALL');
  const [center, setCenter] = useState([19.2812, 72.8561]); // MMR / Mira Road Center
  const { socket } = useSocket();
  const [liveReports, setLiveReports] = useState(reports);

  useEffect(() => {
    setLiveReports(reports);
  }, [reports]);

  useEffect(() => {
    if (focusCoords && Array.isArray(focusCoords) && focusCoords.length >= 2) {
      setCenter(focusCoords);
    }
  }, [focusCoords]);

  // Real-time Socket ingestion for instant marker insertion without reload
  useEffect(() => {
    if (socket) {
      const handleNewReport = (data) => {
        if (!data || !data.report) return;
        const r = data.report;
        const coords = Array.isArray(r.coordinates)
          ? r.coordinates
          : r.location?.coordinates
            ? [r.location.coordinates[1], r.location.coordinates[0]]
            : null;

        if (coords) {
          const markerId = r._id || r.id;
          const newMarker = {
            id: markerId,
            _id: markerId,
            referenceId: r.referenceId,
            title: r.title,
            category: r.category,
            severity: r.severity,
            status: r.status,
            coordinates: coords,
            address: r.address,
            ward: r.ward,
            createdAt: r.createdAt,
          };

          setLiveReports((prev) => {
            // Prevent duplicate markers
            const exists = prev.some((item) => (item.id && item.id === newMarker.id) || item.referenceId === newMarker.referenceId);
            if (exists) return prev;
            return [newMarker, ...prev];
          });

          if (onNewReport) {
            onNewReport(newMarker);
          }
        }
      };

      const handleStatusChange = (data) => {
        setLiveReports((prev) =>
          prev.map((r) => ((r.id === data.reportId || r._id === data.reportId) ? { ...r, status: data.status } : r))
        );
      };

      socket.on('report:created', handleNewReport);
      socket.on('authority:report:created', handleNewReport);
      socket.on('report:statusChanged', handleStatusChange);

      return () => {
        socket.off('report:created', handleNewReport);
        socket.off('authority:report:created', handleNewReport);
        socket.off('report:statusChanged', handleStatusChange);
      };
    }
  }, [socket, onNewReport]);

  // Filter markers according to active layer
  const filteredReports = liveReports.filter((r) => {
    if (activeLayer === 'ALL') return true;
    if (activeLayer === 'WATERLOGGING') return r.category === 'WATERLOGGING';
    if (activeLayer === 'ROADWORK') return r.category === 'POTHOLE' || r.category === 'ROAD_HAZARD';
    if (activeLayer === 'SIGNALS') return r.category === 'TRAFFIC_SIGNAL';
    if (activeLayer === 'LIGHTS') return r.category === 'STREETLIGHT';
    if (activeLayer === 'GARBAGE') return r.category === 'GARBAGE';
    return true;
  });

  const showParkingMarkers = activeLayer === 'ALL' || activeLayer === 'PARKING';

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCoords = [pos.coords.latitude, pos.coords.longitude];
          setCenter(userCoords);
          if (onPositionSelect) {
            onPositionSelect(userCoords);
          }
        },
        () => {
          alert('Could not acquire your current location. Please check browser permissions.');
        }
      );
    }
  };

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg`}>
      {/* Map Control Toolbar */}
      {showLayers && (
        <div className="absolute top-4 left-4 z-[1000] flex flex-wrap items-center gap-2">
          {/* Layer Selector */}
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white/95 dark:bg-[#171f33]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-md">
            {[
              { id: 'ALL', label: 'All Hazards' },
              { id: 'WATERLOGGING', label: '💧 Waterlogging' },
              { id: 'ROADWORK', label: '⚠️ Roadwork' },
              { id: 'SIGNALS', label: '🚦 Signals' },
              { id: 'LIGHTS', label: '💡 Streetlights' },
              { id: 'GARBAGE', label: '🗑️ Sanitation' },
              { id: 'PARKING', label: '🅿️ Parking Bays' },
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeLayer === layer.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* GPS Locate Me Button */}
          <button
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 dark:bg-[#171f33]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-md hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
            title="Locate my position via device GPS"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Locate Me</span>
          </button>
        </div>
      )}

      {/* Real-time pulse indicator badge */}
      <div className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#171f33]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live Telemetry Active ({filteredReports.length} incidents)</span>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} />

        {/* Picker Mode for report submission */}
        {isPickerMode && (
          <LocationMarkerPicker
            position={selectedPosition}
            onPositionChange={onPositionSelect}
          />
        )}

        {/* Render Civic Report Markers */}
        {!isPickerMode &&
          filteredReports.map((report) => {
            if (!report.coordinates || report.coordinates.length < 2) return null;
            return (
              <Marker
                key={report.id || report.referenceId}
                position={report.coordinates}
                icon={createCustomIcon(report.category, report.severity)}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[220px]">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {report.referenceId}
                      </span>
                      <SeverityBadge severity={report.severity} />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                      {report.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{report.address}</span>
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                      <StatusBadge status={report.status} />
                      <Link
                        to={`/citizen/reports/${report.id}`}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Render Parking Facility Markers */}
        {!isPickerMode &&
          showParkingMarkers &&
          parking.map((fac) => {
            if (!fac.location?.coordinates) return null;
            const coords = [fac.location.coordinates[1], fac.location.coordinates[0]];
            const vacant = Math.max(0, fac.totalBays - fac.occupiedBays);

            return (
              <Marker
                key={fac._id || fac.facilityId}
                position={coords}
                icon={createCustomIcon('PARKING', 'LOW')}
              >
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Car className="w-4 h-4" />
                      <span>Smart Parking Facility</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {fac.facilityName}
                    </h4>
                    <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                      <div className="flex justify-between font-bold text-emerald-800 dark:text-emerald-300">
                        <span>Available Bays:</span>
                        <span className="tnum font-extrabold">{vacant} / {fac.totalBays}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Hourly: ₹{fac.tariffs?.hourlyRate || 30} &bull; FastTag Enabled
                      </div>
                    </div>
                    <Link
                      to="/parking"
                      className="mt-2 block text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View tariff & directions &rarr;
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default MobilityMap;
