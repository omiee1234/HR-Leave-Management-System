import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { KeyRound, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      if (result.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/employee');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
      
      {/* Background ambient glowing nodes */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"></div>

      <div className="w-full max-w-md z-10">
        
        {/* Portal Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 mb-3 text-indigo-400">
            <ShieldCheck className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-2">Sign in to your leave portal dashboard</p>
        </div>

        {/* Login glassmorphism card */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-slate-800/80">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email field */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                  placeholder="employee@company.com"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Action submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
          </form>

          {/* Test Accounts Tip */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-500">
              Need an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Create one now
              </Link>
            </p>
          </div>
          
        </div>

        {/* Dummy Credentials help board */}
        <div className="mt-6 text-center bg-slate-900/50 rounded-2xl p-4 border border-slate-800/30">
          <p className="text-xs font-semibold text-slate-400 mb-1">Demo Credentials:</p>
          <div className="flex justify-center gap-4 text-[11px] text-slate-500">
            <span>Employee: <b className="text-slate-400">employee@company.com</b> (password123)</span>
            <span>Manager: <b className="text-slate-400">manager@company.com</b> (password123)</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
