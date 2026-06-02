import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { managerAPI } from '../services/api';
import { ClipboardList, ArrowLeft, RefreshCw, CheckCircle2, XCircle, Search } from 'lucide-react';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getLeaves();
      setLeaves(response.data);
      setError('');
    } catch (err) {
      console.error("Error loading leave requests:", err);
      setError("Failed to load requests directory. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Filter and search application logic
  useEffect(() => {
    let result = leaves;

    if (statusFilter !== 'All') {
      result = result.filter((l) => l.status === statusFilter);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.employee.name.toLowerCase().includes(q) ||
          l.employee.email.toLowerCase().includes(q)
      );
    }

    setFilteredLeaves(result);
  }, [leaves, statusFilter, searchQuery]);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this leave request and deduct the balance?")) return;
    try {
      setProcessingId(id);
      await managerAPI.approveLeave(id);
      await fetchLeaves(); // Reload updated entries
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve request.");
    } finally {
      setProcessingId(null);
    }
  };

  const triggerRejectModal = (id) => {
    setSelectedLeaveId(id);
    setRejectionReason('');
    setRejectionError('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setRejectionError('');

    if (!rejectionReason.trim()) {
      setRejectionError('Rejection reason is required.');
      return;
    }

    try {
      setProcessingId(selectedLeaveId);
      await managerAPI.rejectLeave(selectedLeaveId, rejectionReason);
      setShowRejectModal(false);
      await fetchLeaves(); // Reload
    } catch (err) {
      console.error("Failed to submit rejection feedback:", err);
      setRejectionError(err.response?.data?.rejection_reason?.[0] || "Failed to reject leave.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'TL_Approved':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
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
          <p className="text-slate-400 text-sm font-medium">Loading requests directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Return to Dashboard link */}
      <Link to="/manager" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Staff Leave Requests</h1>
            <p className="text-slate-400 text-sm mt-1">Review, approve, or reject employee leave applications across the company</p>
          </div>
        </div>
        <button 
          onClick={fetchLeaves} 
          className="flex items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 rounded-xl transition-all self-start md:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Dynamic Filters & Search Input bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
        
        {/* Search */}
        <div className="relative lg:col-span-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="Search by staff name or email..."
          />
        </div>

        {/* Filters buttons */}
        <div className="flex flex-wrap gap-1.5 lg:col-span-2 lg:justify-end">
          {['All', 'Pending', 'TL_Approved', 'Approved', 'Rejected', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
      </div>

      {/* Main glass-panel table view */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {filteredLeaves.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-30 text-slate-400" />
              <h3 className="font-bold text-slate-400 text-lg">No matching requests</h3>
              <p className="text-sm mt-1 max-w-xs mx-auto">There are no leave applications matching the active search filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-850">
                  <th className="px-8 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Inclusive Dates</th>
                  <th className="px-6 py-4 text-center">Days</th>
                  <th className="px-6 py-4">Reason / Notes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-800/10 transition-colors">
                    
                    {/* Employee Profile info */}
                    <td className="px-8 py-5">
                      <div className="text-sm font-semibold text-slate-200">{leave.employee.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{leave.employee.email}</div>
                    </td>

                    {/* Leave Type choice */}
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold capitalize text-indigo-300">
                        {leave.leave_type}
                      </span>
                    </td>

                    {/* Date intervals */}
                    <td className="px-6 py-5 text-sm font-medium text-slate-200">
                      {leave.start_date} <span className="text-slate-500 font-normal px-1">to</span> {leave.end_date}
                    </td>

                    {/* Total days requested */}
                    <td className="px-6 py-5 text-center text-sm font-bold text-white">
                      {leave.total_days}
                    </td>

                    {/* Reason / manager rejection note */}
                    <td className="px-6 py-5 max-w-[240px]">
                      <p className="text-sm text-slate-300" title={leave.reason}>
                        {leave.reason}
                      </p>
                      {leave.status === 'Rejected' && leave.rejection_reason && (
                        <div className="mt-1.5 p-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs">
                          <span className="font-semibold text-rose-400 block mb-0.5">Feedback:</span>
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

                    {/* Action buttons (Approve/Reject) */}
                    <td className="px-8 py-5 text-right">
                      {leave.status === 'TL_Approved' ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApprove(leave.id)}
                            disabled={processingId !== null}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-1.5 px-3 rounded-lg transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => triggerRejectModal(leave.id)}
                            disabled={processingId !== null}
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 py-1.5 px-3 rounded-lg font-semibold text-xs transition-all"
                          >
                            Reject
                          </button>
                        </div>
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

      {/* Modal Popup for submitting rejection reasons */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-8 border border-slate-800/80 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">Reject Leave Request</h3>
            <p className="text-slate-400 text-xs mb-6">Provide a detailed reason. This feedback will be shown to the employee.</p>

            {rejectionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {rejectionError}
              </div>
            )}

            <form onSubmit={handleRejectSubmit}>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all duration-200 h-28 resize-none mb-6"
                placeholder="Reason for rejection (required)..."
                required
              ></textarea>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2 px-4 rounded-xl transition-colors border border-slate-700/50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={processingId !== null}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-2 px-4 rounded-xl transition-all"
                >
                  {processingId !== null ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default LeaveRequests;
