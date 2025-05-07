import React, { useState } from 'react';
import { Search, Check, X, ArrowRight } from 'lucide-react';

interface Caregiver {
  id: string;
  name: string;
  email: string;
  specialty: string;
  assigned: boolean;
  supervisor?: string;
}

interface Supervisor {
  id: string;
  name: string;
  email: string;
  region: string;
  caregiverCount: number;
}

// Mock data
const MOCK_CAREGIVERS: Caregiver[] = [
  { id: '1', name: 'Michael Davis', email: 'michael@healthcare.com', specialty: 'Elderly Care', assigned: true, supervisor: 'Sarah Johnson' },
  { id: '2', name: 'Emma Wilson', email: 'emma@healthcare.com', specialty: 'Pediatric Care', assigned: true, supervisor: 'Sarah Johnson' },
  { id: '3', name: 'David Lee', email: 'david@healthcare.com', specialty: 'Physical Therapy', assigned: true, supervisor: 'Robert Chen' },
  { id: '4', name: 'Amanda White', email: 'amanda@healthcare.com', specialty: 'Post-Surgery Care', assigned: false },
  { id: '5', name: 'James Martin', email: 'james@healthcare.com', specialty: 'Chronic Disease Management', assigned: false },
  { id: '6', name: 'Olivia Brown', email: 'olivia@healthcare.com', specialty: 'Mental Health', assigned: true, supervisor: 'Robert Chen' },
  { id: '7', name: 'Lucas Garcia', email: 'lucas@healthcare.com', specialty: 'Elderly Care', assigned: false },
  { id: '8', name: 'Sophia Lopez', email: 'sophia@healthcare.com', specialty: 'Rehabilitation', assigned: true, supervisor: 'Sarah Johnson' },
];

const MOCK_SUPERVISORS: Supervisor[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@healthcare.com', region: 'North', caregiverCount: 3 },
  { id: '2', name: 'Robert Chen', email: 'robert@healthcare.com', region: 'South', caregiverCount: 2 },
  { id: '3', name: 'Lisa Thompson', email: 'lisa@healthcare.com', region: 'East', caregiverCount: 0 },
  { id: '4', name: 'Mark Wilson', email: 'mark@healthcare.com', region: 'West', caregiverCount: 0 },
];

const AssignCaregivers: React.FC = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>(MOCK_CAREGIVERS);
  const [supervisors, setSupervisors] = useState<Supervisor[]>(MOCK_SUPERVISORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaregivers, setSelectedCaregivers] = useState<string[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
  const [filterAssigned, setFilterAssigned] = useState<boolean | null>(null);
  
  // Filter caregivers based on search and assignment status
  const filteredCaregivers = caregivers.filter(caregiver => {
    const matchesSearch = searchTerm === '' || 
      caregiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caregiver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caregiver.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesAssigned = filterAssigned === null || caregiver.assigned === filterAssigned;
    
    return matchesSearch && matchesAssigned;
  });
  
  const handleSelectCaregiver = (id: string) => {
    if (selectedCaregivers.includes(id)) {
      setSelectedCaregivers(selectedCaregivers.filter(cId => cId !== id));
    } else {
      setSelectedCaregivers([...selectedCaregivers, id]);
    }
  };
  
  const handleSelectAllVisible = () => {
    if (filteredCaregivers.length === selectedCaregivers.length) {
      // Deselect all if all are selected
      setSelectedCaregivers([]);
    } else {
      // Select all visible caregivers
      const visibleIds = filteredCaregivers.map(c => c.id);
      setSelectedCaregivers(visibleIds);
    }
  };
  
  const handleAssignCaregivers = () => {
    if (!selectedSupervisor || selectedCaregivers.length === 0) return;
    
    // Find selected supervisor
    const supervisor = supervisors.find(s => s.id === selectedSupervisor);
    if (!supervisor) return;
    
    // Update caregivers
    setCaregivers(prev => 
      prev.map(caregiver => 
        selectedCaregivers.includes(caregiver.id)
          ? { ...caregiver, assigned: true, supervisor: supervisor.name }
          : caregiver
      )
    );
    
    // Update supervisor caregiver count
    setSupervisors(prev =>
      prev.map(s =>
        s.id === selectedSupervisor
          ? { ...s, caregiverCount: s.caregiverCount + selectedCaregivers.length }
          : s
      )
    );
    
    // Clear selections
    setSelectedCaregivers([]);
    setSelectedSupervisor('');
  };
  
  const handleUnassignCaregivers = () => {
    if (selectedCaregivers.length === 0) return;
    
    // Track supervisor caregiver count changes
    const supervisorChanges: Record<string, number> = {};
    
    // Find caregivers to unassign and their supervisors
    selectedCaregivers.forEach(id => {
      const caregiver = caregivers.find(c => c.id === id);
      if (caregiver?.assigned && caregiver.supervisor) {
        const supervisor = supervisors.find(s => s.name === caregiver.supervisor);
        if (supervisor) {
          supervisorChanges[supervisor.id] = (supervisorChanges[supervisor.id] || 0) + 1;
        }
      }
    });
    
    // Update caregivers
    setCaregivers(prev => 
      prev.map(caregiver => 
        selectedCaregivers.includes(caregiver.id)
          ? { ...caregiver, assigned: false, supervisor: undefined }
          : caregiver
      )
    );
    
    // Update supervisor caregiver counts
    setSupervisors(prev =>
      prev.map(s =>
        supervisorChanges[s.id]
          ? { ...s, caregiverCount: Math.max(0, s.caregiverCount - supervisorChanges[s.id]) }
          : s
      )
    );
    
    // Clear selections
    setSelectedCaregivers([]);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Assign Caregivers</h1>
          <p className="text-gray-500 mt-1">Assign caregivers to supervisors or change existing assignments</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Caregivers List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="form-input pl-10"
                  placeholder="Search caregivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Filter */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterAssigned(null)}
                  className={`btn ${filterAssigned === null ? 'btn-primary' : 'btn-outline'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterAssigned(true)}
                  className={`btn ${filterAssigned === true ? 'btn-primary' : 'btn-outline'}`}
                >
                  Assigned
                </button>
                <button
                  onClick={() => setFilterAssigned(false)}
                  className={`btn ${filterAssigned === false ? 'btn-primary' : 'btn-outline'}`}
                >
                  Unassigned
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="selectAll"
                  className="h-4 w-4"
                  checked={filteredCaregivers.length > 0 && selectedCaregivers.length === filteredCaregivers.length}
                  onChange={handleSelectAllVisible}
                />
                <label htmlFor="selectAll" className="ml-2 text-sm text-gray-700">
                  Select All
                </label>
              </div>
              
              <div className="text-sm text-gray-500">
                {selectedCaregivers.length} of {filteredCaregivers.length} selected
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-96">
            {filteredCaregivers.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredCaregivers.map((caregiver) => (
                  <li key={caregiver.id} className="hover:bg-gray-50 p-4">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedCaregivers.includes(caregiver.id)}
                        onChange={() => handleSelectCaregiver(caregiver.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {caregiver.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {caregiver.email}
                        </p>
                        <div className="mt-1 flex items-center">
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md">
                            {caregiver.specialty}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {caregiver.assigned ? (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check size={12} className="mr-1" />
                              Assigned
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {caregiver.supervisor}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No caregivers found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Assignment Panel */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Assignment Panel</h2>
          </div>
          
          <div className="p-4">
            {selectedCaregivers.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedCaregivers.length} caregiver{selectedCaregivers.length > 1 ? 's' : ''} selected
                </p>
                
                {/* Assignment Action */}
                <div className="mb-6">
                  <label htmlFor="supervisorSelect" className="form-label">
                    Assign to Supervisor
                  </label>
                  <select
                    id="supervisorSelect"
                    className="form-input mb-4"
                    value={selectedSupervisor}
                    onChange={(e) => setSelectedSupervisor(e.target.value)}
                  >
                    <option value="">Select a supervisor</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.name} ({supervisor.region}) - {supervisor.caregiverCount} assigned
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleAssignCaregivers}
                    disabled={!selectedSupervisor || selectedCaregivers.length === 0}
                    className={`btn w-full ${
                      selectedSupervisor && selectedCaregivers.length > 0
                        ? 'btn-primary'
                        : 'btn-outline opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <ArrowRight size={16} className="mr-2" />
                    Assign Selected Caregivers
                  </button>
                </div>
                
                {/* Unassignment Action */}
                <div className="border-t border-gray-100 pt-6">
                  <button
                    onClick={handleUnassignCaregivers}
                    className="btn btn-outline text-error border-error hover:bg-error/10 w-full"
                  >
                    <X size={16} className="mr-2" />
                    Unassign Selected Caregivers
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">Select caregivers to assign or unassign.</p>
              </div>
            )}
          </div>
          
          {/* Available Supervisors */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-medium mb-3">Available Supervisors</h3>
            <ul className="space-y-3">
              {supervisors.map((supervisor) => (
                <li key={supervisor.id} className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-sm">{supervisor.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{supervisor.region} Region</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {supervisor.caregiverCount} assigned
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignCaregivers;