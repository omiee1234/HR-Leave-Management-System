import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ApplyLeave from './pages/ApplyLeave';
import MyLeaves from './pages/MyLeaves';
import ManagerDashboard from './pages/ManagerDashboard';
import LeaveRequests from './pages/LeaveRequests';
import EmployeeBalances from './pages/EmployeeBalances';

// Home helper component that redirects active authenticated sessions
const HomeRedirect = () => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'manager' ? '/manager' : '/employee'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
          
          {/* Global role-sensitive navigation bar */}
          <Navbar />
          
          <main className="flex-1 w-full">
            <Routes>
              
              {/* Public Authentications */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Securing Employee features */}
              <Route 
                path="/employee" 
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employee/apply" 
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <ApplyLeave />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employee/leaves" 
                element={
                  <ProtectedRoute allowedRoles={['employee']}>
                    <MyLeaves />
                  </ProtectedRoute>
                } 
              />

              {/* Securing Manager features */}
              <Route 
                path="/manager" 
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/requests" 
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <LeaveRequests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager/balances" 
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <EmployeeBalances />
                  </ProtectedRoute>
                } 
              />

              {/* Central fallbacks */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </main>
          
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
