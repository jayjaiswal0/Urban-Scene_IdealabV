import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  MessageSquarePlus,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldCheck,
  Star,
  Send,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/common/StatusBadge';
import SeverityBadge from '../components/common/SeverityBadge';
import Modal from '../components/common/Modal';

export const ReportDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Note modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  // Real-time synchronization: instant timeline update when status is mutated by authority
  useEffect(() => {
    if (socket && id) {
      const handleStatusChange = (data) => {
        if (data.reportId === id) {
          fetchReportDetails();
        }
      };

      socket.on('report:statusChanged', handleStatusChange);
      return () => {
        socket.off('report:statusChanged', handleStatusChange);
      };
    }
  }, [socket, id]);

  const fetchReportDetails = async () => {
    try {
      const res = await api.get(`/reports/${id}`);
      if (res.success && res.data) {
        setReport(res.data.report);
        setHistory(res.data.history || []);
        if (res.data.report.citizenFeedback?.rating) {
          setFeedbackSubmitted(true);
          setRating(res.data.report.citizenFeedback.rating);
          setFeedbackComment(res.data.report.citizenFeedback.comment || '');
        }
      }
    } catch (err) {
      setError(err.message || 'Report not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNoteLoading(true);
    try {
      await api.post(`/reports/${id}/notes`, { note: newNote });
      setNewNote('');
      setShowNoteModal(false);
      fetchReportDetails();
    } catch (e) {
      alert('Failed to append note');
    } finally {
      setNoteLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reports/${id}/feedback`, { rating, comment: feedbackComment });
      setFeedbackSubmitted(true);
    } catch (e) {
      alert('Failed to submit feedback');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-500">Loading report details & audit timeline...</div>;
  }

  if (error || !report) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Report Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
        <Link to="/citizen/my-reports" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Return to My Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/citizen/my-reports"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Reports</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintReceipt}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Official Receipt</span>
          </button>

          <button
            onClick={() => setShowNoteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </button>
        </div>
      </div>

      {/* Main Report Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                {report.referenceId}
              </span>
              <SeverityBadge severity={report.severity} />
              <StatusBadge status={report.status} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {report.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{report.address} (Ward {report.ward})</span>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400">
            <div>Filed: <strong className="text-slate-700 dark:text-slate-200 tnum">{new Date(report.createdAt).toLocaleString()}</strong></div>
            <div className="mt-1">Department: <strong className="text-blue-600 dark:text-blue-400">{report.assignedDepartment}</strong></div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Incident Description
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5">
            {report.description}
          </p>
        </div>

        {/* Evidence Photo Gallery */}
        {report.evidence && report.evidence.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>Citizen Evidence Gallery</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {report.evidence.map((ev, i) => (
                <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 relative group">
                  <img src={ev.fileUrl} alt="Evidence" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-white font-mono">
                    {ev.evidenceType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5-Stage Interactive Lifecycle Timeline */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Audit Lifecycle & Field Inspection Timeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable chronological progression logged by authorized municipal personnel
          </p>
        </div>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
          {history.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[27px] top-1.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-md shadow-blue-600/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>

              {/* Content Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    Status Transition: {step.toStatus.replace('_', ' ')}
                  </div>
                  <span className="text-[11px] text-slate-400 tnum">
                    {new Date(step.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  {step.remarks || 'Status update logged.'}
                </p>

                {step.changedBy && (
                  <div className="mt-3 pt-2 border-t border-slate-200/40 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Officer: <strong className="text-slate-700 dark:text-slate-300">{step.changedBy.fullName || 'Authorized System'}</strong></span>
                    <span className="uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                      {step.changedBy.department || step.changedBy.role}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen Feedback Rating Widget */}
      {report.status === 'RESOLVED' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Municipal Resolution Feedback
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rate the quality and speed of this road restoration work
              </p>
            </div>
          </div>

          {feedbackSubmitted ? (
            <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-1 mb-1 font-bold">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                  />
                ))}
                <span className="ml-2">({rating} / 5 Stars)</span>
              </div>
              <p>{feedbackComment || 'Thank you for rating municipal squad performance.'}</p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= rating ? 'text-amber-500 fill-amber-500' : ''}`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Was the crater filled completely? Any asphalt debris left behind?"
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Submit Citizen Rating
              </button>
            </form>
          )}
        </div>
      )}

      {/* Add Note Modal */}
      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Append Note to Case">
        <form onSubmit={handleAddNote} className="space-y-4">
          <p className="text-xs text-slate-500">
            Add additional context or observations for the inspecting engineer.
          </p>
          <textarea
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            required
            placeholder="e.g. Water accumulation has expanded by 2 meters since heavy morning rains..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={noteLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            {noteLoading ? 'Saving...' : 'Append Official Note'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ReportDetailPage;
