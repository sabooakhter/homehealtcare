import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout components
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AssignCaregivers from './pages/admin/AssignCaregivers';
import ActivityLogs from './pages/admin/ActivityLogs';

// Supervisor pages
import SupervisorDashboard from './pages/supervisor/Dashboard';
import Caregivers from './pages/supervisor/Caregivers';
import PatientManagement from './pages/supervisor/PatientManagement';
import Accounting from './pages/supervisor/Accounting';
import Organization from './pages/supervisor/Organization';

// Protect routes based on user role
const ProtectedRoute: React.FC<{ 
  element: React.ReactNode;
  allowedRoles: string[];
}> = ({ element, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const userRole = user?.user_metadata?.role || 'supervisor';
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{element}</>;
};

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-error mb-4">Unauthorized</h1>
              <p className="mb-4">You don't have permission to access this page.</p>
              <button 
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        } />
      </Route>
      
      {/* Admin routes */}
      <Route element={
        <ProtectedRoute 
          element={<DashboardLayout />} 
          allowedRoles={['admin']} 
        />
      }>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/assign" element={<AssignCaregivers />} />
        <Route path="/admin/logs" element={<ActivityLogs />} />
      </Route>
      
      {/* Supervisor routes */}
      <Route element={
        <ProtectedRoute 
          element={<DashboardLayout />} 
          allowedRoles={['supervisor']} 
        />
      }>
        <Route path="/supervisor" element={<SupervisorDashboard />} />
        <Route path="/supervisor/caregivers" element={<Caregivers />} />
        <Route path="/supervisor/patients" element={<PatientManagement />} />
        <Route path="/supervisor/accounting" element={<Accounting />} />
        <Route path="/supervisor/organization" element={<Organization />} />
      </Route>
      
      {/* Default route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;