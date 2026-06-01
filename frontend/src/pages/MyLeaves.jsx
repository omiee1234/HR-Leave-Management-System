import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeAPI } from '../services/api';
import { CalendarDays, ArrowLeft, XCircle, RefreshCw } from 'lucide-react';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getLeaves();
      setLeaves(response.data);
      setError('');
    } catch (err) {
      console.error("Error loading leave requests:", err);
      setError("Failed to load leave applications. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleCancelRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this pending leave request?")) return;
    try {
      setCancellingId(id);
      await employeeAPI.cancelLeave(id);
      await fetchLeaves(); // Refresh
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel request.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Cancelled':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: // Pending
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  if (loading && leaves.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500"></div>
          <p className="text-slate-400 text-sm font-medium">Loading leave applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Navigation breadcrumb */}
      <Link to="/employee" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Leave History</h1>
            <p className="text-slate-400 text-sm mt-1">Review all your previous and active leave applications</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchLeaves} 
            className="flex items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link 
            to="/employee/apply" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            Apply for Leave
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Main glass-panel table view */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {leaves.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-35 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-400">No applications found</h3>
              <p className="text-sm mt-1 max-w-sm mx-auto">You haven't filed any leave applications yet. All submitted requests will appear here.</p>
              <Link to="/employee/apply" className="mt-4 inline-flex bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all">
                Submit Request Now
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-850">
                  <th className="px-8 py-4">Application Date</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Duration Range</th>
                  <th className="px-6 py-4 text-center">Total Days</th>
                  <th className="px-6 py-4">Reason & Notes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-800/10 transition-colors">
                    
                    {/* Applied date */}
                    <td className="px-8 py-5 text-sm text-slate-400">
                      {new Date(leave.applied_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {new Date(leave.applied_at).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Leave type */}
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold capitalize text-indigo-300">
                        {leave.leave_type}
                      </span>
                    </td>

                    {/* Inclusive Dates */}
                    <td className="px-6 py-5 text-sm font-medium text-slate-200">
                      {leave.start_date} <span className="text-slate-500 font-normal px-1">to</span> {leave.end_date}
                    </td>

                    {/* Total days requested */}
                    <td className="px-6 py-5 text-center text-sm font-bold text-white">
                      {leave.total_days}
                    </td>

                    {/* Reason / manager rejection note */}
                    <td className="px-6 py-5 max-w-[280px]">
                      <p className="text-sm text-slate-300" title={leave.reason}>
                        {leave.reason}
                      </p>
                      {leave.status === 'Rejected' && leave.rejection_reason && (
                        <div className="mt-1.5 p-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs">
                          <span className="font-semibold text-rose-400 block mb-0.5">Manager Feedback:</span>
                          <span className="text-rose-300">{leave.rejection_reason}</span>
                        </div>
                      )}
                      {leave.status === 'Approved' && leave.approved_by && (
                        <div className="mt-1 text-[10px] text-slate-500">
                          Approved by {leave.approved_by.name}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-5">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusClass(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>

                    {/* Actions cancellation */}
                    <td className="px-8 py-5 text-right">
                      {leave.status === 'Pending' ? (
                        <button
                          onClick={() => handleCancelRequest(leave.id)}
                          disabled={cancellingId === leave.id}
                          className="flex items-center gap-1.5 ml-auto text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 py-1.5 px-3 rounded-lg transition-all"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>{cancellingId === leave.id ? 'Cancelling...' : 'Cancel'}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default MyLeaves;
