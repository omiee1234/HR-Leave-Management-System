import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { managerAPI } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import { ClipboardList, CheckCircle2, XCircle, Users, RefreshCw, AlertCircle, FileText } from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  // Dedicated Rejection Modal States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getLeaves();
      const allLeaves = response.data;
      setLeaves(allLeaves);

      // Compute statistics based on database records
      const counts = allLeaves.reduce((acc, curr) => {
        if (curr.status === 'TL_Approved') acc.pending++;
        else if (curr.status === 'Approved') acc.approved++;
        else if (curr.status === 'Rejected') acc.rejected++;
        return acc;
      }, { pending: 0, approved: 0, rejected: 0 });

      setStats(counts);
      setError('');
    } catch (err) {
      console.error("Manager dashboard data load failed:", err);
      setError("Failed to load request records. Please refresh the browser.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this leave request? This will deduct from the employee's balance.")) return;
    try {
      setProcessingId(id);
      await managerAPI.approveLeave(id);
      await fetchDashboardData(); // Refresh stats
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
      await fetchDashboardData(); // Refresh stats
    } catch (err) {
      console.error("Rejection action failed:", err);
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

  const pendingLeaves = leaves.filter(l => l.status === 'TL_Approved').slice(0, 5);

  if (loading && leaves.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500"></div>
          <p className="text-slate-400 text-sm font-medium">Fetching manager controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-gradient-to-r from-purple-900/30 via-indigo-900/10 to-slate-900 p-8 rounded-3xl border border-indigo-500/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 blur-3xl rounded-full"></div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manager Workspace</h1>
          <p className="text-slate-400 text-sm mt-1.5">You are logged in as administrator. Manage company leave policies and staff balances.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/manager/requests" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all shadow-lg hover:scale-[1.02]"
          >
            <ClipboardList className="h-4 w-4" />
            <span>All Requests</span>
          </Link>
          <Link 
            to="/manager/balances" 
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-5 py-3 rounded-xl transition-all border border-slate-700/50 hover:scale-[1.02]"
          >
            <Users className="h-4 w-4" />
            <span>Staff Balances</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Operational KPI Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <DashboardCard
          title="Pending Approvals"
          value={stats.pending}
          icon={ClipboardList}
          colorClass="bg-amber-500 text-amber-500 animate-glow"
        />
        <DashboardCard
          title="Total Approved"
          value={stats.approved}
          icon={CheckCircle2}
          colorClass="bg-emerald-500 text-emerald-500"
        />
        <DashboardCard
          title="Total Rejected"
          value={stats.rejected}
          icon={XCircle}
          colorClass="bg-rose-500 text-rose-500"
        />
      </div>

      {/* Pending Leave Requests Showcase */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden mb-10">
        <div className="px-8 py-6 border-b border-slate-850 flex justify-between items-center bg-slate-900/20">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Pending Action Checklist</span>
              {stats.pending > 0 && (
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                  {stats.pending} Actionable
                </span>
              )}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Urgent requests requiring approval or rejection</p>
          </div>
          <Link to="/manager/requests" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            View All Action Items
          </Link>
        </div>

        <div className="overflow-x-auto">
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-400 opacity-60" />
              <h3 className="font-bold text-slate-300 text-base">You are all caught up!</h3>
              <p className="text-xs text-slate-500 mt-1">There are no pending leave requests awaiting approval.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-850">
                  <th className="px-8 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Inclusive Dates</th>
                  <th className="px-6 py-4 text-center">Days</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-8 py-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {pendingLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-800/10 transition-colors">
                    
                    {/* Employee Profile */}
                    <td className="px-8 py-5">
                      <div className="text-sm font-semibold text-slate-200">{leave.employee.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{leave.employee.email}</div>
                    </td>

                    {/* Leave Type */}
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold capitalize text-indigo-300">
                        {leave.leave_type}
                      </span>
                    </td>

                    {/* Date limits */}
                    <td className="px-6 py-5 text-sm font-medium text-slate-200">
                      {leave.start_date} <span className="text-slate-500 font-normal px-1">to</span> {leave.end_date}
                    </td>

                    {/* Total days requested */}
                    <td className="px-6 py-5 text-center text-sm font-bold text-white">
                      {leave.total_days}
                    </td>

                    {/* Application Reason */}
                    <td className="px-6 py-5 max-w-[200px]">
                      <p className="text-sm text-slate-300 truncate" title={leave.reason}>
                        {leave.reason}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Applied {new Date(leave.applied_at).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Approve / Reject buttons */}
                    <td className="px-8 py-5 text-right">
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

export default ManagerDashboard;
