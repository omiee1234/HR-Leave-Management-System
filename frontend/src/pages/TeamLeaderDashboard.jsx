import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, Clock, Users, ThumbsUp, ThumbsDown, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const API = 'https://hr-leave-management-system-2.onrender.com/api';

const statusBadge = (status) => {
  const map = {
    Pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    TL_Approved: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Cancelled: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };
  const labels = {
    Pending: 'Pending TL Review',
    TL_Approved: 'TL Approved',
    Approved: 'Fully Approved',
    Rejected: 'Rejected',
    Cancelled: 'Cancelled',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[status] || map.Pending}`}>
      {labels[status] || status}
    </span>
  );
};

export default function TeamLeaderDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [actionLeave, setActionLeave] = useState(null); // {id, action: 'approve'|'reject'}
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchAll = async () => {
    try {
      const [statsRes, leavesRes] = await Promise.all([
        axios.get(`${API}/tl/stats/`),
        axios.get(`${API}/tl/leaves/`),
      ]);
      setStats(statsRes.data);
      setLeaves(leavesRes.data);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = leaves.filter(l => filter === 'All' ? true : l.status === filter);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await axios.put(`${API}/tl/approve/${id}/`);
      setMsg({ type: 'success', text: 'Leave approved — now awaiting Manager final approval.' });
      setActionLeave(null);
      fetchAll();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Failed to approve.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      setMsg({ type: 'error', text: 'Please provide a rejection reason.' });
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(`${API}/tl/reject/${id}/`, { rejection_reason: rejectReason });
      setMsg({ type: 'success', text: 'Leave rejected.' });
      setActionLeave(null);
      setRejectReason('');
      fetchAll();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Failed to reject.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-amber-500 border-t-transparent"></div>
    </div>
  );

  const statCards = [
    { label: 'Pending My Review', value: stats?.pending ?? 0, icon: <Clock className="h-6 w-6" />, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { label: 'TL Approved', value: stats?.tl_approved ?? 0, icon: <ThumbsUp className="h-6 w-6" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { label: 'Fully Approved', value: stats?.fully_approved ?? 0, icon: <CheckCircle className="h-6 w-6" />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Rejected', value: stats?.rejected ?? 0, icon: <XCircle className="h-6 w-6" />, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Team Leader Dashboard</h1>
            <p className="text-slate-400 text-sm">Welcome back, <span className="text-amber-400 font-medium">{user?.name}</span></p>
          </div>
        </div>
      </div>

      {/* Alert */}
      {msg && (
        <div className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-auto text-current opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Approval flow notice */}
      <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-sm flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Dual Approval Flow:</span> Your approval moves requests to <span className="font-semibold text-blue-400">TL Approved</span> status. The Manager then gives final approval and deducts balance.
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
            <div className="mb-3">{s.icon}</div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['Pending', 'TL_Approved', 'Approved', 'Rejected', 'All'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {f === 'TL_Approved' ? 'TL Approved' : f}
          </button>
        ))}
      </div>

      {/* Leave Requests Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No {filter === 'All' ? '' : filter.toLowerCase()} leave requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-4">Employee</th>
                  <th className="text-left px-5 py-4">Type</th>
                  <th className="text-left px-5 py-4">Dates</th>
                  <th className="text-left px-5 py-4">Days</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-left px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(leave => (
                  <React.Fragment key={leave.id}>
                    <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{leave.employee?.name}</div>
                        <div className="text-xs text-slate-500">{leave.employee?.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="capitalize text-slate-300">{leave.leave_type}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {leave.start_date} → {leave.end_date}
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-medium">{leave.total_days}d</td>
                      <td className="px-5 py-4">{statusBadge(leave.status)}</td>
                      <td className="px-5 py-4">
                        {leave.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setActionLeave({ id: leave.id, action: 'approve' }); setMsg(null); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-medium transition-all"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => { setActionLeave({ id: leave.id, action: 'reject' }); setMsg(null); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg text-xs font-medium transition-all"
                            >
                              <ThumbsDown className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Inline action panel */}
                    {actionLeave?.id === leave.id && (
                      <tr className="bg-slate-800/40">
                        <td colSpan={6} className="px-5 py-4">
                          {actionLeave.action === 'approve' ? (
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-slate-300">
                                Approve <span className="text-white font-medium">{leave.employee?.name}</span>'s {leave.leave_type} leave ({leave.total_days} days)?
                                <div className="text-xs text-slate-500 mt-1">This will forward to Manager for final approval.</div>
                              </div>
                              <div className="flex gap-2 ml-auto">
                                <button onClick={() => handleApprove(leave.id)} disabled={actionLoading}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                  {actionLoading ? '...' : 'Confirm Approve'}
                                </button>
                                <button onClick={() => setActionLeave(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-end gap-4">
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-400 mb-2">Rejection Reason *</label>
                                <input
                                  type="text" value={rejectReason}
                                  onChange={e => setRejectReason(e.target.value)}
                                  placeholder="Explain why this leave is being rejected..."
                                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleReject(leave.id)} disabled={actionLoading}
                                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                  {actionLoading ? '...' : 'Confirm Reject'}
                                </button>
                                <button onClick={() => { setActionLeave(null); setRejectReason(''); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm">Cancel</button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
