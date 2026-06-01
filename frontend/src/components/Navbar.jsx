import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Calendar, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // If no user is logged in, hide navbar completely
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => 
    `flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
      isActive(path)
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <nav className="glass-panel sticky top-0 z-50 border-b border-slate-800 px-6 py-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          <Calendar className="h-6 w-6 text-indigo-400" />
          <span>LMS Portal</span>
        </Link>

        {/* Dynamic Route Links based on active User role */}
        <div className="flex items-center gap-2">
          {user.role === 'employee' ? (
            <>
              <Link to="/employee" className={linkClass('/employee')}>
                Dashboard
              </Link>
              <Link to="/employee/apply" className={linkClass('/employee/apply')}>
                Apply Leave
              </Link>
              <Link to="/employee/leaves" className={linkClass('/employee/leaves')}>
                My Leaves
              </Link>
            </>
          ) : (
            <>
              <Link to="/manager" className={linkClass('/manager')}>
                Dashboard
              </Link>
              <Link to="/manager/requests" className={linkClass('/manager/requests')}>
                Leave Requests
              </Link>
              <Link to="/manager/balances" className={linkClass('/manager/balances')}>
                Employee Balances
              </Link>
            </>
          )}
        </div>

        {/* Right Section: User Info and Logout button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50">
            <UserIcon className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-slate-200">{user.name}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {user.role}
            </span>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;
