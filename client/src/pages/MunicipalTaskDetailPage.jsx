import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  PlusCircle,
  Camera,
  Layers,
  MapPin,
  Check,
  Send,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

export const MunicipalTaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Material Modal
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialName, setMaterialName] = useState('Cold Mix Asphalt');
  const [quantity, setQuantity] = useState(450);
  const [unit, setUnit] = useState('kg');
  const [materialLoading, setMaterialLoading] = useState(false);

  // Complete Task Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('Pothole cavity compacted with 450kg cold mix asphalt. Pavement leveled to grade.');
  const [completeLoading, setCompleteLoading] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    try {
      const res = await api.get(`/tasks/${id}`);
      if (res.success && res.data) {
        setTask(res.data);
      }
    } catch (err) {
      setError(err.message || 'Task not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    setMaterialLoading(true);
    try {
      await api.post(`/tasks/${id}/materials`, {
        materialName,
        quantity: Number(quantity),
        unit,
      });
      setShowMaterialModal(false);
      fetchTaskDetails();
    } catch (err) {
      alert('Failed to log material usage');
    } finally {
      setMaterialLoading(false);
    }
  };

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    setCompleteLoading(true);
    try {
      await api.patch(`/tasks/${id}/complete`, { completionNotes });
      setShowCompleteModal(false);
      fetchTaskDetails();
    } catch (err) {
      alert('Failed to mark task complete');
    } finally {
      setCompleteLoading(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-500">Loading work order details...</div>;
  }

  if (error || !task) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Work Order Not Found</h2>
        <Link to="/authority/issues" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Return to Issues
        </Link>
      </div>
    );
  }

  const isCompleted = task.status === 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/authority/issues"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Triage Issues</span>
        </Link>

        <div className="flex items-center gap-3">
          {!isCompleted && (
            <>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 text-xs font-semibold"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Log Materials</span>
              </button>

              <button
                onClick={() => setShowCompleteModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Completed & Sign-off</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                {task.workOrderNumber}
              </span>
              <StatusBadge status={task.status} />
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10">
                Priority: {task.priority}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {task.assignedSquad}
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Department: <strong>{task.department}</strong> &bull; Supervisor: <strong>{task.supervisor?.fullName || 'Er. Rajesh K. Shinde'}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-slate-400 block">SLA Benchmark:</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold font-mono tnum">
              Deadline: {new Date(task.slaDeadline).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Associated Incident Context */}
        {task.report && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Incident Context (#{task.report.referenceId})
              </span>
              <Link
                to={`/citizen/reports/${task.report._id}`}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Inspect Case Details &rarr;
              </Link>
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {task.report.title}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {task.report.description}
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{task.report.address} (Ward {task.report.ward})</span>
            </div>
          </div>
        )}

        {/* Material Usage Inventory Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Materials & Equipment Logged
            </h3>
            <span className="text-xs text-slate-400">
              {task.materialsUsed?.length || 0} items logged
            </span>
          </div>

          {task.materialsUsed && task.materialsUsed.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 text-[11px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Material / Item</th>
                    <th className="py-2.5 px-4">Quantity Used</th>
                    <th className="py-2.5 px-4">Unit</th>
                    <th className="py-2.5 px-4">Time Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {task.materialsUsed.map((mat, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {mat.materialName}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 tnum">
                        {mat.quantity}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{mat.unit}</td>
                      <td className="py-3 px-4 text-slate-400 tnum">
                        {new Date(mat.loggedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No materials logged yet for this work order.</p>
          )}
        </div>

        {/* Completion Notes */}
        {task.completionNotes && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 text-xs">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              Field Sign-off Notes:
            </div>
            <p className="text-slate-700 dark:text-slate-300">{task.completionNotes}</p>
          </div>
        )}
      </div>

      {/* Log Material Modal */}
      <Modal
        isOpen={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        title="Log Material / Resource Usage"
      >
        <form onSubmit={handleAddMaterial} className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1 block">Material Name</label>
            <input
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                placeholder="kg, bags, liters"
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={materialLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            {materialLoading ? 'Saving...' : 'Add Material to Roster'}
          </button>
        </form>
      </Modal>

      {/* Mark Completed Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Sign-off & Mark Work Order Completed"
      >
        <form onSubmit={handleCompleteTask} className="space-y-4">
          <p className="text-xs text-slate-500">
            This will mark the work order completed, transition the citizen report to RESOLVED, and notify the resident for rating.
          </p>
          <textarea
            rows={3}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
          />
          <button
            type="submit"
            disabled={completeLoading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            {completeLoading ? 'Submitting Sign-off...' : 'Confirm Resolution & Sign-off'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MunicipalTaskDetailPage;
