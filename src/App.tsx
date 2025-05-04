import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types/auth';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ClientDashboard from './components/dashboard/ClientDashboard';
import TaxAgentDashboard from './components/dashboard/TaxAgentDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TaxFormBase from './components/forms/tax-form/TaxFormBase';
import TaxFormDetails from './components/forms/tax-form/TaxFormDetails';
import './styles/globals.css';

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard/client"
            element={
              <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tax-agent"
            element={
              <ProtectedRoute allowedRoles={[UserRole.TAX_AGENT]}>
                <TaxAgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Tax Form Route */}
          <Route
            path="/tax-form"
            element={
              <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                <TaxFormBase />
              </ProtectedRoute>
            }
          />
          
          {/* Add Tax Form Details View Route */}
          <Route
            path="/tax-form/view/:id"
            element={
              <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                <TaxFormDetails />
              </ProtectedRoute>
            }
          />
          
          {/* Add a catch-all route for debugging */}
          <Route path="*" element={<div>Page Not Found</div>} />

          {/* Root Redirect */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === UserRole.CLIENT
                      ? '/dashboard/client'
                      : user.role === UserRole.TAX_AGENT
                      ? '/dashboard/tax-agent'
                      : '/dashboard/admin'
                  }
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App; 