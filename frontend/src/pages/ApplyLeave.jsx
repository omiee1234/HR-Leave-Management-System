import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { employeeAPI } from '../services/api';
import { Calendar, AlertCircle, ArrowLeft, Send } from 'lucide-react';

const ApplyLeave = () => {
  const [leaveType, setLeaveType] = useState('vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const navigate = useNavigate();

  // Dynamically estimate duration inclusive of start and end dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(diffDays);
      } else {
        setCalculatedDays(0);
      }
    } else {
      setCalculatedDays(0);
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setLoading(true);

    const leaveData = {
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason,
    };

    try {
      const response = await employeeAPI.applyLeave(leaveData);
      setSuccess('Leave request submitted successfully!');
      setTimeout(() => {
        navigate('/employee/leaves');
      }, 1500);
    } catch (err) {
      console.error("Leave application failure:", err);
      // Django REST Framework validation errors
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field_errors: ["An unexpected error occurred. Please try again."] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Return Back link */}
      <Link to="/employee" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Apply for Leave</h1>
          <p className="text-slate-400 text-sm mt-1">Submit a new request for manager approval</p>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl shadow-xl border border-slate-800">
        
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            {success}
          </div>
        )}

        {errors.non_field_errors && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{errors.non_field_errors[0]}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Leave Type Select */}
            <div className="md:col-span-2">
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
              >
                <option value="vacation">Vacation Leave (12 days/year)</option>
                <option value="sick">Sick Leave (8 days/year)</option>
                <option value="casual">Casual Leave (6 days/year)</option>
              </select>
              {errors.leave_type && <p className="text-xs text-rose-400 mt-1">{errors.leave_type[0]}</p>}
            </div>

            {/* Start Date picker */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                required
              />
              {errors.start_date && <p className="text-xs text-rose-400 mt-1">{errors.start_date[0]}</p>}
            </div>

            {/* End Date picker */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 cursor-pointer"
                required
              />
              {errors.end_date && <p className="text-xs text-rose-400 mt-1">{errors.end_date[0]}</p>}
            </div>
            
          </div>

          {/* Dynamic estimation feedback card */}
          {calculatedDays > 0 && (
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between text-slate-200">
              <span className="text-xs font-medium text-slate-400">Total Requested Leave Duration:</span>
              <span className="text-base font-extrabold text-indigo-400">{calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}</span>
            </div>
          )}

          {/* Reason field */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Reason for Leave</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 h-32 resize-none"
              placeholder="Provide a detailed reason for your application..."
              required
            ></textarea>
            {errors.reason && <p className="text-xs text-rose-400 mt-1">{errors.reason[0]}</p>}
          </div>

          {/* Submission button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
            <Link 
              to="/employee" 
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm py-3 px-6 rounded-xl border border-slate-700/50 transition-colors"
            >
              Cancel
            </Link>
          </div>

        </form>
        
      </div>
      
    </div>
  );
};

export default ApplyLeave;
