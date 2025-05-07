import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Clipboard, 
  AlertCircle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Siren,
  BarChart4
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SupervisorDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data
  const stats = [
    { id: 1, label: 'Assigned Caregivers', value: 8, icon: <Users size={24} />, color: 'bg-blue-50 text-blue-700' },
    { id: 2, label: 'Active Patients', value: 15, icon: <Clipboard size={24} />, color: 'bg-green-50 text-green-700' },
    { id: 3, label: 'Today\'s Visits', value: 12, icon: <Calendar size={24} />, color: 'bg-purple-50 text-purple-700' },
    { id: 4, label: 'Urgent Issues', value: 2, icon: <AlertCircle size={24} />, color: 'bg-red-50 text-red-700' },
  ];
  
  const upcomingVisits = [
    { id: 1, patient: 'Eleanor Thompson', caregiver: 'Michael Davis', type: 'Routine Check', time: '10:30 AM', status: 'scheduled' },
    { id: 2, patient: 'Robert Johnson', caregiver: 'Emma Wilson', type: 'Medication', time: '11:45 AM', status: 'in-progress' },
    { id: 3, patient: 'Martha Lewis', caregiver: 'David Lee', type: 'Physical Therapy', time: '1:15 PM', status: 'scheduled' },
    { id: 4, patient: 'George Walker', caregiver: 'Amanda White', type: 'Post-Surgery Check', time: '2:30 PM', status: 'scheduled' },
  ];
  
  const alerts = [
    { id: 1, title: 'Medication Schedule Updated', patient: 'Eleanor Thompson', priority: 'medium' },
    { id: 2, title: 'Missed Visit Alert', patient: 'William Harris', priority: 'high' },
    { id: 3, title: 'Equipment Request', patient: 'Martha Lewis', priority: 'low' },
  ];
  
  const timeoffRequests = [
    { id: 1, caregiver: 'Michael Davis', date: 'Mar 20-22, 2025', reason: 'Personal', status: 'pending' },
    { id: 2, caregiver: 'Emma Wilson', date: 'Apr 5, 2025', reason: 'Doctor Appointment', status: 'approved' },
  ];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Clock size={16} className="text-blue-500" />;
      case 'scheduled':
        return <Calendar size={16} className="text-gray-500" />;
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'missed':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTimeoffStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Supervisor Dashboard</h1>
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
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium">Today's Schedule</h2>
            <Link 
              to="/supervisor/patients" 
              className="text-sm text-primary flex items-center hover:underline"
            >
              Full Schedule
              <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {upcomingVisits.map((visit) => (
              <div key={visit.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{visit.patient}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{visit.type}</span> with {visit.caregiver}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{visit.time}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusClass(visit.status)}`}>
                      {getStatusIcon(visit.status)}
                      <span className="ml-1 capitalize">{visit.status.replace('-', ' ')}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Weekly Hours Summary */}
          <div className="p-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Weekly Hours Summary</h3>
              <Link 
                to="/supervisor/accounting" 
                className="text-sm text-primary flex items-center hover:underline"
              >
                View Details
                <ArrowUpRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Scheduled Hours</p>
                  <p className="text-xl font-semibold">124 hrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed Hours</p>
                  <p className="text-xl font-semibold">96 hrs</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: '77%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">77% of scheduled hours completed this week</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium">Alerts</h2>
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {alerts.length}
              </span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <Siren size={18} className={
                        alert.priority === 'high' 
                          ? 'text-red-500' 
                          : alert.priority === 'medium'
                            ? 'text-amber-500'
                            : 'text-blue-500'
                      } />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-500">Patient: {alert.patient}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${getPriorityClass(alert.priority)}`}>
                        {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Off Requests */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium">Time Off Requests</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {timeoffRequests.map((request) => (
                <div key={request.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{request.caregiver}</p>
                      <p className="text-sm text-gray-500">{request.date}</p>
                      <p className="text-xs text-gray-500 mt-1">Reason: {request.reason}</p>
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getTimeoffStatusClass(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <button className="btn btn-outline w-full">
                View All Requests
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium">Quick Links</h2>
            </div>
            <div className="p-4 space-y-2">
              <Link 
                to="/supervisor/caregivers" 
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <Users size={18} className="text-primary mr-3" />
                  <span>Manage Caregivers</span>
                </div>
              </Link>
              <Link 
                to="/supervisor/patients" 
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <Calendar size={18} className="text-secondary mr-3" />
                  <span>Patient Schedules</span>
                </div>
              </Link>
              <Link 
                to="/supervisor/accounting" 
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center">
                  <BarChart4 size={18} className="text-accent mr-3" />
                  <span>View Reports</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;