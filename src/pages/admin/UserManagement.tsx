import React, { useState } from 'react';
import { 
  User, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Lock,
  X 
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const MOCK_USERS: UserData[] = [
  { id: '1', name: 'John Smith', email: 'john@healthcare.com', role: 'Admin', status: 'active', lastLogin: '2025-03-15 08:30 AM' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@healthcare.com', role: 'Supervisor', status: 'active', lastLogin: '2025-03-14 09:45 AM' },
  { id: '3', name: 'Michael Davis', email: 'michael@healthcare.com', role: 'Caregiver', status: 'active', lastLogin: '2025-03-15 07:15 AM' },
  { id: '4', name: 'Emma Wilson', email: 'emma@healthcare.com', role: 'Caregiver', status: 'active', lastLogin: '2025-03-15 06:50 AM' },
  { id: '5', name: 'Robert Chen', email: 'robert@healthcare.com', role: 'Supervisor', status: 'active', lastLogin: '2025-03-14 02:30 PM' },
  { id: '6', name: 'Jessica Miller', email: 'jessica@healthcare.com', role: 'Caregiver', status: 'inactive', lastLogin: '2025-03-10 11:15 AM' },
  { id: '7', name: 'David Lee', email: 'david@healthcare.com', role: 'Caregiver', status: 'active', lastLogin: '2025-03-15 05:40 AM' },
  { id: '8', name: 'Amanda White', email: 'amanda@healthcare.com', role: 'Caregiver', status: 'active', lastLogin: '2025-03-13 08:20 AM' },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = selectedRole === '' || user.role === selectedRole;
    const matchesStatus = selectedStatus === '' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  const openUserModal = (user?: UserData) => {
    if (user) {
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }
    setIsModalOpen(true);
  };
  
  const openPasswordModal = (user: UserData) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };
  
  const handleResetPassword = () => {
    // In a real app, this would call an API to reset the password
    console.log(`Password for ${selectedUser?.name} has been reset to ${newPassword}`);
    setNewPassword('');
    setIsPasswordModalOpen(false);
  };
  
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save user to database
    setIsModalOpen(false);
  };
  
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'Caregiver':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <button 
          onClick={() => openUserModal()}
          className="btn btn-primary mt-4 md:mt-0 flex items-center"
        >
          <UserPlus size={16} className="mr-2" />
          Add New User
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Role Filter */}
          <div className="w-full md:w-48">
            <select
              className="form-input"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Caregiver">Caregiver</option>
            </select>
          </div>
          
          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              className="form-input"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          {/* Clear Filters */}
          {(searchTerm || selectedRole || selectedStatus) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('');
                setSelectedStatus('');
              }}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <X size={16} className="mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User size={20} className="text-primary" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openPasswordModal(user)}
                        className="text-gray-600 hover:text-accent p-1 rounded"
                        title="Reset Password"
                      >
                        <Lock size={18} />
                      </button>
                      <button
                        onClick={() => openUserModal(user)}
                        className="text-gray-600 hover:text-primary p-1 rounded"
                        title="Edit User"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="text-gray-600 hover:text-error p-1 rounded"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found matching the current filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('');
                setSelectedStatus('');
              }}
              className="mt-2 text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      
      {/* User Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold">
                {selectedUser ? `Edit User: ${selectedUser.name}` : 'Create New User'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    id="name"
                    className="form-input"
                    defaultValue={selectedUser?.name}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    defaultValue={selectedUser?.email}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="form-label">Role</label>
                  <select
                    id="role"
                    className="form-input"
                    defaultValue={selectedUser?.role || ''}
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="Admin">Admin</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Caregiver">Caregiver</option>
                  </select>
                </div>
                
                {!selectedUser && (
                  <div>
                    <label htmlFor="password" className="form-label">Initial Password</label>
                    <input
                      id="password"
                      type="password"
                      className="form-input"
                      required={!selectedUser}
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    className="form-input"
                    defaultValue={selectedUser?.status || 'active'}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {selectedUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Password Reset Modal */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-semibold">Reset Password</h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="mb-4">
                Reset password for: <span className="font-medium">{selectedUser.name}</span>
              </p>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleResetPassword}
                  disabled={!newPassword}
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;