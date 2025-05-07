import React from 'react';
import { Outlet } from 'react-router-dom';
import { Activity } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center mb-8">
            <Activity size={40} className="mr-3" />
            <h1 className="text-3xl font-bold">HomeCare Connect</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-6">
            Administrative Dashboard
          </h2>
          <p className="text-primary-light mb-6">
            Streamline your home healthcare operations with our comprehensive
            management platform designed for administrators and supervisors.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-white">For Admins</h3>
              <ul className="list-disc list-inside text-primary-light">
                <li>Assign caregivers to supervisors</li>
                <li>Manage user accounts and permissions</li>
                <li>Monitor system activity logs</li>
              </ul>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-white">For Supervisors</h3>
              <ul className="list-disc list-inside text-primary-light">
                <li>Track caregiver locations</li>
                <li>Manage patient schedules</li>
                <li>Monitor payroll and accounting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;