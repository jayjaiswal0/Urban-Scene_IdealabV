import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Save,
  ArrowRight,
  Shield,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import MobilityMap from '../components/map/MobilityMap';

export const ReportIssuePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoryParam = searchParams.get('category');

  const [category, setCategory] = useState(categoryParam || 'POTHOLE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(user?.ward || 14);
  const [address, setAddress] = useState('Kanakia Road, Near Cinepolis, Ward 14');
  const [coords, setCoords] = useState([19.2812, 72.8561]); // [lat, lng]
  const [severity, setSeverity] = useState('NORMAL');
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [smsNotify, setSmsNotify] = useState(true);

  const [loading, setLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'POTHOLE', label: 'Pothole / Crater', icon: '🕳️', desc: 'Asphalt cavity or structural road damage' },
    { id: 'WATERLOGGING', label: 'Waterlogging', icon: '💧', desc: 'Drain choke & standing rainwater' },
    { id: 'TRAFFIC_SIGNAL', label: 'Broken Signal', icon: '🚦', desc: 'Traffic light dark or stuck amber' },
    { id: 'GARBAGE', label: 'Solid Waste Dumping', icon: '🗑️', desc: 'Commercial debris & illegal trash piles' },
    { id: 'STREETLIGHT', label: 'Streetlight Outage', icon: '💡', desc: 'Unlit pedestrian corridor or black spot' },
    { id: 'ROAD_HAZARD', label: 'General Hazard', icon: '⚠️', desc: 'Tree fall, loose cable or uncovered trench' },
  ];

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('umcp_report_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.category) setCategory(draft.category);
        if (draft.description) setDescription(draft.description);
        if (draft.address) setAddress(draft.address);
        if (draft.coords) setCoords(draft.coords);
        if (draft.severity) setSeverity(draft.severity);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleCategorySelect = (catId) => {
    setCategory(catId);
    if (!title || title.includes('Pothole') || title.includes('Waterlogging')) {
      const catObj = categories.find((c) => c.id === catId);
      setTitle(`${catObj?.label || 'Civic Issue'} on ${address.split(',')[0]}`);
    }
  };

  const handleGpsDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = [pos.coords.latitude, pos.coords.longitude];
          setCoords(newCoords);
          setAddress(`GPS Pinpoint: ${newCoords[0].toFixed(4)}° N, ${newCoords[1].toFixed(4)}° E (Ward ${ward})`);
        },
        () => {
          alert('GPS location permission denied or timed out. Please drag the pin on the map.');
        }
      );
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) {
      alert('You can upload a maximum of 3 photos.');
      return;
    }

    const newPhotos = [...photos, ...files].slice(0, 3);
    setPhotos(newPhotos);

    const previews = newPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const handleRemovePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    setPhotoPreviews(updatedPreviews);
  };

  const handleSaveDraft = () => {
    const draft = { category, title, description, ward, address, coords, severity };
    localStorage.setItem('umcp_report_draft', JSON.stringify(draft));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('title', title || `${category} on ${address}`);
      formData.append('description', description);
      formData.append('ward', ward);
      formData.append('address', address);
      formData.append('latitude', coords[0]);
      formData.append('longitude', coords[1]);
      formData.append('severity', severity);

      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const res = await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success && res.data) {
        localStorage.removeItem('umcp_report_draft');
        navigate(`/citizen/my-reports?new=${res.data.referenceId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <Link to="/citizen/dashboard" className="hover:underline">
            Citizen Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">Report an Issue</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          File Civic Hazard Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Provide location coordinates, photo evidence, and severity rating for rapid municipal triage.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Draft Saved Confirmation */}
      {draftSaved && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Draft progress saved locally. You can resume at any time.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Select Category */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Step 1 &bull; Categorize Civic Issue
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Selected: {categories.find((c) => c.id === category)?.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  category === cat.id
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">{cat.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {cat.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Location & Spatial Map Pinpoint */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Step 2 &bull; Incident Location & Coordinates
            </span>
            <button
              type="button"
              onClick={handleGpsDetect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Detect via GPS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Street Address / Landmark
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                MBMC Ward
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={14}>Ward 14 (Kanakia / Beverly Park)</option>
                <option value={4}>Ward 4 (Bhayandar West)</option>
                <option value={1}>Ward 1 (Bhayandar East)</option>
                <option value={9}>Ward 9 (Penkarpada / WEH)</option>
                <option value={18}>Ward 18 (Kashimira)</option>
                <option value={22}>Ward 22 (Uttan Coastal)</option>
              </select>
            </div>
          </div>

          {/* Interactive Coordinate Picker Map */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Drag the blue pin or click anywhere on the map to position exact coordinates:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 tnum">
                {coords[0].toFixed(4)}° N, {coords[1].toFixed(4)}° E
              </span>
            </div>
            <MobilityMap
              selectedPosition={coords}
              onPositionSelect={(newCoords) => setCoords(newCoords)}
              isPickerMode={true}
              height="h-[320px]"
              showLayers={false}
            />
          </div>
        </div>

        {/* Step 3: Triage Description & Severity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Step 3 &bull; Triage Details & Hazard Severity
            </span>
            <span className="text-xs text-slate-400 tnum">
              {description.length} / 1000 characters
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Incident Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={1000}
              placeholder="Describe the severity, lane blockage, water depth, or pedestrian skid danger..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 3-Tier Hazard Severity Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              Hazard Priority Tier
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: 'LOW',
                  label: 'Routine',
                  sla: '72h SLA',
                  classes: 'border-emerald-500 text-emerald-600 bg-emerald-50/30',
                },
                {
                  id: 'NORMAL',
                  label: 'Standard',
                  sla: '24h SLA',
                  classes: 'border-amber-500 text-amber-600 bg-amber-50/30',
                },
                {
                  id: 'URGENT',
                  label: 'Urgent Hazard',
                  sla: '4h Immediate Dispatch',
                  classes: 'border-rose-500 text-rose-600 bg-rose-50/30 ring-2 ring-rose-500/20',
                },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSeverity(tier.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    severity === tier.id
                      ? tier.classes
                      : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 opacity-70'
                  }`}
                >
                  <div className="font-bold text-xs">{tier.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{tier.sla}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Photographic Evidence */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Step 4 &bull; Photographic Evidence (Optional, Max 3)
            </span>
            <span className="text-xs text-slate-400">{photos.length} / 3 attached</span>
          </div>

          {/* Photo Previews */}
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {photoPreviews.map((url, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(i)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] text-white font-mono">
                    EXIF Geotagged
                  </span>
                </div>
              ))}
            </div>
          )}

          {photos.length < 3 && (
            <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-blue-500 cursor-pointer bg-slate-50/50 dark:bg-white/5 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Click or drag photos to attach
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG or WebP up to 5MB</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save as Draft</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <Link
              to="/citizen/dashboard"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl text-center text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit Civic Report</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReportIssuePage;
