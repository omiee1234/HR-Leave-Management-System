import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { employeeAPI } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import { CalendarDays, Palmtree, Stethoscope, Briefcase, PlusCircle, History, XCircle } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balRes, leaveRes] = await Promise.all([
        employeeAPI.getBalance(),
        employeeAPI.getLeaves()
      ]);
      setBalance(balRes.data);
      setLeaves(leaveRes.data.slice(0, 5)); // Show 5 most recent requests
      setError('');
    } catch (err) {
      console.error("Error loading dashboard details:", err);
      setError("Failed to load leave records. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this pending leave request?")) return;
    try {
      await employeeAPI.cancelLeave(id);
      fetchData(); // Reload updated stats
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel request.");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500"></div>
          <p className="text-slate-400 text-sm font-medium">Fetching dashboard statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Welcome Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 bg-gradient-to-r from-indigo-900/40 via-purple-900/10 to-slate-900 p-8 rounded-3xl border border-indigo-500/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 blur-3xl rounded-full"></div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-slate-400 text-sm mt-1.5">Here is an overview of your current leave balances and applications.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/employee/apply" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Apply Leave</span>
          </Link>
          <Link 
            to="/employee/leaves" 
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm px-5 py-3 rounded-xl transition-all border border-slate-700/50 hover:scale-[1.02]"
          >
            <History className="h-4 w-4" />
            <span>Leave History</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Leave Balance Showcase Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <DashboardCard
          title="Vacation Leave"
          value={balance?.vacation_balance ?? 0}
          max={12}
          icon={Palmtree}
          colorClass="bg-indigo-500 text-indigo-500"
        />
        <DashboardCard
          title="Sick Leave"
          value={balance?.sick_balance ?? 0}
          max={8}
          icon={Stethoscope}
          colorClass="bg-emerald-500 text-emerald-500"
        />
        <DashboardCard
          title="Casual Leave"
          value={balance?.casual_balance ?? 0}
          max={6}
          icon={Briefcase}
          colorClass="bg-amber-500 text-amber-500"
        />
      </div>

      {/* Recent Leave Requests List Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-850 flex justify-between items-center bg-slate-900/20">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Requests</h2>
            <p className="text-slate-400 text-xs mt-0.5">Track your 5 most recently filed leave applications</p>
          </div>
          <Link to="/employee/leaves" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            View All Requests
          </Link>
        </div>

        <div className="overflow-x-auto">
          {leaves.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-sm">You haven't filed any leave requests yet.</p>
              <Link to="/employee/apply" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline mt-1.5 block">
                Submit your first request
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-850">
                  <th className="px-8 py-4">Dates</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4 text-center">Days</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="text-sm font-semibold text-slate-200">
                        {leave.start_date} <span className="text-slate-500 font-normal px-1">to</span> {leave.end_date}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Applied on {new Date(leave.applied_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold capitalize text-indigo-300">
                        {leave.leave_type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-white">
                      {leave.total_days}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-300 truncate max-w-[200px]" title={leave.reason}>
                        {leave.reason}
                      </p>
                      {leave.status === 'Rejected' && leave.rejection_reason && (
                        <p className="text-xs text-rose-400 mt-1 font-medium bg-rose-500/5 py-0.5 px-2 rounded-lg border border-rose-500/10 inline-block">
                          Reason: {leave.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusClass(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {leave.status === 'Pending' ? (
                        <button
                          onClick={() => handleCancelRequest(leave.id)}
                          className="flex items-center gap-1.5 ml-auto text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 py-1.5 px-3 rounded-lg transition-all"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Cancel</span>
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

export default EmployeeDashboard;
