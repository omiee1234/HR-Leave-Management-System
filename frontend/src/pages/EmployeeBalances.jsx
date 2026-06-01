import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { managerAPI } from '../services/api';
import { Users, ArrowLeft, RefreshCw, Search, Palmtree, Stethoscope, Briefcase } from 'lucide-react';

const EmployeeBalances = () => {
  const [balances, setBalances] = useState([]);
  const [filteredBalances, setFilteredBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const response = await managerAPI.getBalances();
      setBalances(response.data);
      setError('');
    } catch (err) {
      console.error("Error loading employee balances:", err);
      setError("Failed to load employee directory records. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  // Filter staff balances list by search queries
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBalances(balances);
    } else {
      const q = searchQuery.toLowerCase();
      const result = balances.filter(
        (b) =>
          b.user.name.toLowerCase().includes(q) ||
          b.user.email.toLowerCase().includes(q)
      );
      setFilteredBalances(result);
    }
  }, [balances, searchQuery]);

  if (loading && balances.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500"></div>
          <p className="text-slate-400 text-sm font-medium">Loading staff directory...</p>
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
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Staff Leave Directory</h1>
            <p className="text-slate-400 text-sm mt-1">Review remaining leave allocations for all active company employees</p>
          </div>
        </div>
        <button 
          onClick={fetchBalances} 
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

      {/* Dynamic Search Input bar */}
      <div className="relative max-w-md mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-lg"
          placeholder="Lookup employee by name or email..."
        />
      </div>

      {/* Main glass-panel table view */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {filteredBalances.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-35 text-slate-400" />
              <h3 className="font-bold text-slate-400 text-lg">No staff found</h3>
              <p className="text-sm mt-1 max-w-xs mx-auto">There are no employee leave balance records matching your lookup filter.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-850">
                  <th className="px-8 py-4">Employee</th>
                  <th className="px-6 py-4">Role Badge</th>
                  <th className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 justify-center">
                      <Palmtree className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Vacation (Max 12)</span>
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 justify-center">
                      <Stethoscope className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Sick (Max 8)</span>
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 justify-center">
                      <Briefcase className="h-3.5 w-3.5 text-amber-400" />
                      <span>Casual (Max 6)</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredBalances.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/10 transition-colors">
                    
                    {/* Employee Profile details */}
                    <td className="px-8 py-5">
                      <div className="text-sm font-semibold text-slate-200">{item.user.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.user.email}</div>
                    </td>

                    {/* Role Tag */}
                    <td className="px-6 py-5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/50">
                        {item.user.role}
                      </span>
                    </td>

                    {/* Vacation balance */}
                    <td className="px-6 py-5 text-center">
                      <span className={`text-base font-extrabold px-3 py-1 rounded-xl ${
                        item.vacation_balance === 0 ? 'text-rose-400 bg-rose-500/5' : 'text-slate-100'
                      }`}>
                        {item.vacation_balance}
                      </span>
                    </td>

                    {/* Sick balance */}
                    <td className="px-6 py-5 text-center">
                      <span className={`text-base font-extrabold px-3 py-1 rounded-xl ${
                        item.sick_balance === 0 ? 'text-rose-400 bg-rose-500/5' : 'text-slate-100'
                      }`}>
                        {item.sick_balance}
                      </span>
                    </td>

                    {/* Casual balance */}
                    <td className="px-6 py-5 text-center">
                      <span className={`text-base font-extrabold px-3 py-1 rounded-xl ${
                        item.casual_balance === 0 ? 'text-rose-400 bg-rose-500/5' : 'text-slate-100'
                      }`}>
                        {item.casual_balance}
                      </span>
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

export default EmployeeBalances;
