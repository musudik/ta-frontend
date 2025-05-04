import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import TALogo from '../../assets/TA.png';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-[#ddd6fe] bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src={TALogo} alt="Tax Adviser Logo" className="w-8 h-8 mr-3 rounded-lg shadow-sm" />
            <h1 className="text-2xl font-medium text-neutral-900 font-['Switzer-Medium']">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600 font-['Switzer-Regular']">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={logout}
              className="auth-btn px-4 py-2 text-sm !bg-[#ff6384] hover:!bg-[#e63c6d]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management Card */}
          <div className="card rounded-lg border border-[#ddd6fe] bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-lg font-medium text-neutral-800 mb-4 font-['Switzer-Medium']">User Management</h2>
            <p className="text-neutral-600 font-['Switzer-Regular']">Manage users and permissions.</p>
            <div className="mt-4">
              <button className="auth-btn-secondary text-sm">View Users</button>
            </div>
          </div>

          {/* System Statistics Card */}
          <div className="card rounded-lg border border-[#ddd6fe] bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-lg font-medium text-neutral-800 mb-4 font-['Switzer-Medium']">System Statistics</h2>
            <p className="text-neutral-600 font-['Switzer-Regular']">View system performance metrics.</p>
            <div className="mt-4">
              <button className="auth-btn-secondary text-sm">View Statistics</button>
            </div>
          </div>

          {/* API Management Card */}
          <div className="card rounded-lg border border-[#ddd6fe] bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-lg font-medium text-neutral-800 mb-4 font-['Switzer-Medium']">API Integration</h2>
            <p className="text-neutral-600 font-['Switzer-Regular']">Manage DATEV and Agenta API settings.</p>
            <div className="mt-4">
              <button className="auth-btn-secondary text-sm">Configure APIs</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 