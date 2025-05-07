import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  User
} from 'lucide-react';

interface ActivityLog {
  id: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

// Mock data
const MOCK_LOGS: ActivityLog[] = [
  {
    id: '1',
    user: { id: '1', name: 'John Smith', role: 'Admin' },
    action: 'password_reset',
    resource: 'User',
    details: 'Reset password for user Emma Wilson',
    timestamp: '2025-03-15 14:30:25',
    ipAddress: '192.168.1.105',
    severity: 'info'
  },
  {
    id: '2',
    user: { id: '2', name: 'Sarah Johnson', role: 'Supervisor' },
    action: 'login',
    resource: 'System',
    details: 'Successful login',
    timestamp: '2025-03-15 14:15:10',
    ipAddress: '192.168.1.120',
    severity: 'info'
  },
  {
    id: '3',
    user: { id: '1', name: 'John Smith', role: 'Admin' },
    action: 'user_create',
    resource: 'User',
    details: 'Created new user James Martin',
    timestamp: '2025-03-15 13:45:00',
    ipAddress: '192.168.1.105',
    severity: 'info'
  },
  {
    id: '4',
    user: { id: '3', name: 'Michael Davis', role: 'Caregiver' },
    action: 'login_failed',
    resource: 'System',
    details: 'Failed login attempt (incorrect password)',
    timestamp: '2025-03-15 13:30:45',
    ipAddress: '192.168.1.130',
    severity: 'warning'
  },
  {
    id: '5',
    user: { id: '1', name: 'John Smith', role: 'Admin' },
    action: 'permission_change',
    resource: 'User',
    details: 'Changed role for Sarah Johnson from Caregiver to Supervisor',
    timestamp: '2025-03-15 12:15:30',
    ipAddress: '192.168.1.105',
    severity: 'warning'
  },
  {
    id: '6',
    user: { id: '1', name: 'John Smith', role: 'Admin' },
    action: 'database_backup',
    resource: 'System',
    details: 'Initiated database backup',
    timestamp: '2025-03-15 11:00:15',
    ipAddress: '192.168.1.105',
    severity: 'info'
  },
  {
    id: '7',
    user: { id: '4', name: 'Unknown', role: 'Unknown' },
    action: 'access_attempt',
    resource: 'System',
    details: 'Unauthorized access attempt to admin dashboard',
    timestamp: '2025-03-15 10:45:20',
    ipAddress: '198.51.100.25',
    severity: 'critical'
  },
  {
    id: '8',
    user: { id: '5', name: 'Robert Chen', role: 'Supervisor' },
    action: 'export_data',
    resource: 'Reports',
    details: 'Exported patient medication report',
    timestamp: '2025-03-15 09:30:00',
    ipAddress: '192.168.1.115',
    severity: 'info'
  },
];

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>(MOCK_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Compile unique actions for filter
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  
  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);
      
    const matchesDate = selectedDate === '' || log.timestamp.includes(selectedDate);
    const matchesSeverity = selectedSeverity === '' || log.severity === selectedSeverity;
    const matchesAction = selectedAction === '' || log.action === selectedAction;
    
    return matchesSearch && matchesDate && matchesSeverity && matchesAction;
  });
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would fetch fresh data
      setIsRefreshing(false);
    }, 1000);
  };
  
  const handleExport = () => {
    // In a real app, this would generate and download a CSV or PDF
    alert('Exporting logs...');
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info size={18} className="text-blue-500" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-500" />;
      case 'critical':
        return <AlertTriangle size={18} className="text-red-500" />;
      default:
        return <CheckCircle size={18} className="text-green-500" />;
    }
  };
  
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500 mt-1">View and monitor all system activities</p>
        </div>
        
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button 
            onClick={handleRefresh}
            className="btn btn-outline flex items-center"
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleExport}
            className="btn btn-outline flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Date Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-400" />
            </div>
            <input
              type="date"
              className="form-input pl-10"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          
          {/* Severity Filter */}
          <div>
            <select
              className="form-input"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          {/* Action Filter */}
          <div>
            <select
              className="form-input"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User size={18} className="text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                        <div className="text-xs text-gray-500">{log.user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {log.action.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(log.severity)}`}>
                      {getSeverityIcon(log.severity)}
                      <span className="ml-1 capitalize">{log.severity}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No activity logs found matching the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;