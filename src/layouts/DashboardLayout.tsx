import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Activity, 
  Users, 
  UserCog,
  ClipboardList,
  Home,
  MapPin,
  Calendar,
  BarChart3,
  Building2,
  Search,
  LogOut,
  Menu,
  X,
  Bell 
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const userRole = user?.user_metadata?.role || 'supervisor';
  const userName = user?.user_metadata?.name || 'Guest';
  const isAdmin = userRole === 'admin';
  
  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
    { path: '/admin/assign', label: 'Assign Caregivers', icon: <UserCog size={20} /> },
    { path: '/admin/logs', label: 'Activity Logs', icon: <ClipboardList size={20} /> },
  ];
  
  const supervisorLinks = [
    { path: '/supervisor', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/supervisor/caregivers', label: 'Caregivers', icon: <MapPin size={20} /> },
    { path: '/supervisor/patients', label: 'Patient Management', icon: <Calendar size={20} /> },
    { path: '/supervisor/accounting', label: 'Accounting', icon: <BarChart3 size={20} /> },
    { path: '/supervisor/organization', label: 'Organization', icon: <Building2 size={20} /> },
  ];
  
  const links = isAdmin ? adminLinks : supervisorLinks;
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would implement global search functionality
    console.log('Searching for:', searchQuery);
    // Reset search input
    setSearchQuery('');
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden mr-2 p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-primary mr-2" />
              <span className="font-semibold text-lg">HomeCare Connect</span>
            </div>
          </div>
          
          {/* Search Bar - Only show for supervisors */}
          {!isAdmin && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Search patients, caregivers, tasks..."
                />
              </div>
            </form>
          )}
          
          <div className="flex items-center">
            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-gray-100 relative mr-2">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Menu */}
            <div className="flex items-center">
              <div className="mr-4 text-right hidden sm:block">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-md hover:bg-gray-100 flex items-center text-sm"
                aria-label="Logout"
              >
                <LogOut size={18} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside 
          className={`bg-white w-64 shadow-sm flex flex-col transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'fixed inset-y-0 left-0 z-50 transform translate-x-0' : 'fixed -translate-x-full lg:translate-x-0 lg:static'}
          `}
        >
          {/* Close button for mobile */}
          <button 
            onClick={toggleSidebar}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>

          <div className="p-4 pt-8 lg:pt-4">
            <div className="flex items-center px-2 mb-8 lg:hidden">
              <Activity className="h-8 w-8 text-primary mr-2" />
              <span className="font-semibold text-lg">HomeCare Connect</span>
            </div>
            
            <div className="space-y-1">
              {links.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`sidebar-link w-full ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.icon}
                  <span className="ml-3">{link.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Sidebar Footer */}
          <div className="mt-auto p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {userName.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{userName}</p>
                <button
                  onClick={logout}
                  className="text-xs text-gray-500 hover:text-primary flex items-center mt-1"
                >
                  <LogOut size={12} className="mr-1" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;