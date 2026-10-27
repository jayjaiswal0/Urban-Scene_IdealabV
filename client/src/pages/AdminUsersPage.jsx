import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Add User Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'MUNICIPAL_AUTHORITY',
    ward: 14,
    employeeId: '',
    department: 'PUBLIC_WORKS',
    password: 'Password@123',
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success && res.data) {
        setUsers(res.data.items || []);
      }
    } catch (e) {
      console.error('Error fetching user directory:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await api.post('/admin/users', newUserData);
      setShowAddModal(false);
      setNewUserData({
        fullName: '',
        email: '',
        phone: '',
        role: 'MUNICIPAL_AUTHORITY',
        ward: 14,
        employeeId: '',
        department: 'PUBLIC_WORKS',
        password: 'Password@123',
      });
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}/status`);
      fetchUsers();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (e) {
      alert('Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">
            <span>Urban Scene &bull; Know what’s moving.</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            User Directory & RBAC Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Provision staff accounts, assign municipal departments, and enforce role authorization boundaries.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Roles' },
            { id: 'CITIZEN', label: 'Citizens' },
            { id: 'MUNICIPAL_AUTHORITY', label: 'Municipal' },
            { id: 'TRAFFIC_AUTHORITY', label: 'Traffic' },
            { id: 'EMERGENCY_SERVICE', label: 'Emergency' },
            { id: 'ADMIN', label: 'Admin' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === tab.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by name, email, employee ID..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 dark:bg-[#171f33] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* User Directory Table */}
      <div className="rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/10">
                <tr>
                  <th className="py-3.5 px-6">User / Identifier</th>
                  <th className="py-3.5 px-6">Canonical Role</th>
                  <th className="py-3.5 px-6">Ward Jurisdiction</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                      {u.employeeId && (
                        <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                          ID: {u.employeeId}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-blue-600 dark:text-blue-400"
                      >
                        <option value="CITIZEN">CITIZEN</option>
                        <option value="MUNICIPAL_AUTHORITY">MUNICIPAL_AUTHORITY</option>
                        <option value="TRAFFIC_AUTHORITY">TRAFFIC_AUTHORITY</option>
                        <option value="EMERGENCY_SERVICE">EMERGENCY_SERVICE</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 font-semibold">Ward {u.ward}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                      {u.department || 'NONE'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                          u.isActive
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Provision Staff Account">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1 block">Full Legal Name</label>
            <input
              type="text"
              value={newUserData.fullName}
              onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">Email</label>
              <input
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Employee ID</label>
              <input
                type="text"
                value={newUserData.employeeId}
                onChange={(e) => setNewUserData({ ...newUserData, employeeId: e.target.value })}
                placeholder="MBMC-ENG-XXXX"
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">Role Tier</label>
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
              >
                <option value="MUNICIPAL_AUTHORITY">MUNICIPAL_AUTHORITY</option>
                <option value="TRAFFIC_AUTHORITY">TRAFFIC_AUTHORITY</option>
                <option value="EMERGENCY_SERVICE">EMERGENCY_SERVICE</option>
                <option value="ADMIN">ADMIN</option>
                <option value="CITIZEN">CITIZEN</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Ward Jurisdiction</label>
              <select
                value={newUserData.ward}
                onChange={(e) => setNewUserData({ ...newUserData, ward: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs"
              >
                <option value={14}>Ward 14 (Kanakia)</option>
                <option value={4}>Ward 4 (Bhayandar West)</option>
                <option value={1}>Ward 1 (Bhayandar East)</option>
                <option value={9}>Ward 9 (Penkarpada)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block">Temporary Password</label>
            <input
              type="text"
              value={newUserData.password}
              onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border text-xs font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={addLoading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
          >
            {addLoading ? 'Provisioning...' : 'Provision Account & Grant Privileges'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
