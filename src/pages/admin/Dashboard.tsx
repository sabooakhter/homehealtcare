import React from 'react';
import { 
  Users, 
  UserCog, 
  ClipboardList, 
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data for dashboard
  const stats = [
    { id: 1, label: 'Total Users', value: 42, icon: <Users size={24} />, color: 'bg-blue-50 text-blue-700' },
    { id: 2, label: 'Caregivers', value: 28, icon: <UserCog size={24} />, color: 'bg-green-50 text-green-700' },
    { id: 3, label: 'Supervisors', value: 6, icon: <Users size={24} />, color: 'bg-purple-50 text-purple-700' },
    { id: 4, label: 'Recent Activities', value: 164, icon: <ClipboardList size={24} />, color: 'bg-amber-50 text-amber-700' },
  ];
  
  const recentLogs = [
    { id: 1, user: 'Jane Cooper', action: 'Changed password for Mark Stevens', time: '30 minutes ago', role: 'Admin' },
    { id: 2, user: 'Sarah Thompson', action: 'Assigned 3 caregivers to Robert Chen', time: '2 hours ago', role: 'Admin' },
    { id: 3, user: 'Marcus Reid', action: 'Created new caregiver account', time: '5 hours ago', role: 'Admin' },
    { id: 4, user: 'Emma Williams', action: 'Updated organization settings', time: '1 day ago', role: 'Supervisor' },
  ];
  
  const issues = [
    { id: 1, title: 'Credential Reset Needed', description: 'Three users have reported login issues', priority: 'High' },
    { id: 2, title: 'Missing Schedule Data', description: 'Patient schedules from March 15-18 not showing', priority: 'Medium' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1 sm:mt-0">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium">Recent Activity</h2>
            <Link 
              to="/admin/logs" 
              className="text-sm text-primary flex items-center hover:underline"
            >
              View all logs
              <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex justify-between">
                  <p className="font-medium text-gray-900">{log.user}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    log.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {log.role}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{log.action}</p>
                <p className="text-xs text-gray-500 mt-1">{log.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Issues & Quick Links */}
        <div className="space-y-6">
          {/* System Issues */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium">System Issues</h2>
            </div>
            <div className="p-4 space-y-4">
              {issues.map((issue) => (
                <div key={issue.id} className="flex items-start p-3 rounded-lg border border-gray-100">
                  <AlertCircle className={`flex-shrink-0 mr-3 ${
                    issue.priority === 'High' ? 'text-red-500' : 'text-yellow-500'
                  }`} size={20} />
                  <div>
                    <h3 className="font-medium">{issue.title}</h3>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                    <div className="flex mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        issue.priority === 'High' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {issue.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium">Quick Links</h2>
            </div>
            <div className="p-4 space-y-2">
              <Link 
                to="/admin/users" 
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <Users size={18} className="text-primary mr-3" />
                  <span>Manage Users</span>
                </div>
              </Link>
              <Link 
                to="/admin/assign" 
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <UserCog size={18} className="text-secondary mr-3" />
                  <span>Assign Caregivers</span>
                </div>
              </Link>
              <Link 
                to="/admin/logs" 
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <ClipboardList size={18} className="text-accent mr-3" />
                  <span>View Activity Logs</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;