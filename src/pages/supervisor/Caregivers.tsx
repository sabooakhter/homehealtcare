import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Clock, 
  Check, 
  User,
  ArrowRight,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet icon
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Mock caregiver data
interface Caregiver {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'on-duty';
  specialty: string;
  phone: string;
  email: string;
  currentPatient?: string;
  nextVisit?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  patients: number;
  weeklyHours: number;
}

const MOCK_CAREGIVERS: Caregiver[] = [
  {
    id: '1',
    name: 'Michael Davis',
    status: 'on-duty',
    specialty: 'Elderly Care',
    phone: '(555) 123-4567',
    email: 'michael@healthcare.com',
    currentPatient: 'Eleanor Thompson',
    nextVisit: 'Today, 1:30 PM',
    location: {
      lat: 40.7128,
      lng: -74.006,
      address: '123 Main St, New York, NY'
    },
    patients: 4,
    weeklyHours: 32,
  },
  {
    id: '2',
    name: 'Emma Wilson',
    status: 'on-duty',
    specialty: 'Pediatric Care',
    phone: '(555) 234-5678',
    email: 'emma@healthcare.com',
    currentPatient: 'Robert Johnson',
    nextVisit: 'Today, 2:45 PM',
    location: {
      lat: 40.7282,
      lng: -73.994,
      address: '456 Park Ave, New York, NY'
    },
    patients: 3,
    weeklyHours: 28,
  },
  {
    id: '3',
    name: 'David Lee',
    status: 'active',
    specialty: 'Physical Therapy',
    phone: '(555) 345-6789',
    email: 'david@healthcare.com',
    nextVisit: 'Today, 3:15 PM',
    location: {
      lat: 40.7023,
      lng: -73.987,
      address: '789 Broadway, Brooklyn, NY'
    },
    patients: 5,
    weeklyHours: 36,
  },
  {
    id: '4',
    name: 'Amanda White',
    status: 'inactive',
    specialty: 'Post-Surgery Care',
    phone: '(555) 456-7890',
    email: 'amanda@healthcare.com',
    location: {
      lat: 40.718,
      lng: -74.015,
      address: '101 Hudson St, Jersey City, NJ'
    },
    patients: 0,
    weeklyHours: 0,
  },
  {
    id: '5',
    name: 'James Martin',
    status: 'active',
    specialty: 'Chronic Disease Management',
    phone: '(555) 567-8901',
    email: 'james@healthcare.com',
    nextVisit: 'Tomorrow, 9:00 AM',
    location: {
      lat: 40.733,
      lng: -74.002,
      address: '222 W 14th St, New York, NY'
    },
    patients: 2,
    weeklyHours: 24,
  },
  {
    id: '6',
    name: 'Olivia Brown',
    status: 'on-duty',
    specialty: 'Mental Health',
    phone: '(555) 678-9012',
    email: 'olivia@healthcare.com',
    currentPatient: 'William Harris',
    nextVisit: 'Today, 4:00 PM',
    location: {
      lat: 40.708,
      lng: -73.957,
      address: '333 Bedford Ave, Brooklyn, NY'
    },
    patients: 4,
    weeklyHours: 30,
  },
];

const Caregivers: React.FC = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>(MOCK_CAREGIVERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]);
  const [mapZoom, setMapZoom] = useState(12);
  
  // Fix for marker icons
  useEffect(() => {
    const DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);
  
  // Filter caregivers based on search and status
  const filteredCaregivers = caregivers.filter(caregiver => {
    const matchesSearch = searchTerm === '' || 
      caregiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caregiver.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === '' || caregiver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Set selected caregiver and center map
  const handleSelectCaregiver = (caregiver: Caregiver) => {
    setSelectedCaregiver(caregiver);
    setMapCenter([caregiver.location.lat, caregiver.location.lng]);
    setMapZoom(14);
  };
  
  // Get icon color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-duty':
        return 'text-green-500';
      case 'active':
        return 'text-blue-500';
      case 'inactive':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Get badge class based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'on-duty':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-duty':
        return <Clock size={16} />;
      case 'active':
        return <Check size={16} />;
      case 'inactive':
        return <User size={16} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Caregivers</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <div className="relative">
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
          
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="on-duty">On Duty</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Caregivers List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-medium">Caregivers ({filteredCaregivers.length})</h2>
            
            <div className="flex space-x-1">
              <button className="p-1 rounded hover:bg-gray-100">
                <ChevronLeft size={20} className="text-gray-500" />
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <ChevronRight size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            {filteredCaregivers.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {filteredCaregivers.map((caregiver) => (
                  <li
                    key={caregiver.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                      selectedCaregiver?.id === caregiver.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                    }`}
                    onClick={() => handleSelectCaregiver(caregiver)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          caregiver.status === 'on-duty' 
                            ? 'bg-green-100' 
                            : caregiver.status === 'active'
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                        }`}>
                          <User size={20} className={getStatusColor(caregiver.status)} />
                        </div>
                      </div>
                      
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">{caregiver.name}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeClass(caregiver.status)}`}>
                            {getStatusIcon(caregiver.status)}
                            <span className="ml-1 capitalize">{caregiver.status.replace('-', ' ')}</span>
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">{caregiver.specialty}</p>
                        
                        {caregiver.status === 'on-duty' && (
                          <div className="mt-2 p-2 bg-green-50 rounded-md text-xs">
                            <p className="font-medium text-green-800">Currently with:</p>
                            <p className="text-green-700">{caregiver.currentPatient}</p>
                          </div>
                        )}
                        
                        {caregiver.nextVisit && (
                          <p className="text-xs text-gray-500 mt-2">
                            Next visit: {caregiver.nextVisit}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <p className="text-gray-500 mb-4">No caregivers found</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                  className="text-primary hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Map View */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-medium">
              {selectedCaregiver ? `${selectedCaregiver.name}'s Location` : 'Caregiver Locations'}
            </h2>
          </div>
          
          <div className="flex-grow p-0">
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%', minHeight: '500px' }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {filteredCaregivers.map((caregiver) => (
                <Marker 
                  key={caregiver.id}
                  position={[caregiver.location.lat, caregiver.location.lng]}
                  eventHandlers={{
                    click: () => {
                      setSelectedCaregiver(caregiver);
                    },
                  }}
                >
                  <Popup>
                    <div className="p-1">
                      <p className="font-medium">{caregiver.name}</p>
                      <p className="text-xs text-gray-500">{caregiver.location.address}</p>
                      {caregiver.status === 'on-duty' && (
                        <p className="text-xs text-green-600 mt-1">
                          Currently with: {caregiver.currentPatient}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          
          {/* Caregiver Details Panel */}
          {selectedCaregiver && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{selectedCaregiver.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedCaregiver.status)}`}>
                  {getStatusIcon(selectedCaregiver.status)}
                  <span className="ml-1 capitalize">{selectedCaregiver.status.replace('-', ' ')}</span>
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Contact Information</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm">
                      <Phone size={16} className="text-gray-400 mr-2" />
                      <span>{selectedCaregiver.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail size={16} className="text-gray-400 mr-2" />
                      <span>{selectedCaregiver.email}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Current Location</p>
                  <p className="text-sm mt-2">{selectedCaregiver.location.address}</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Specialty</p>
                  <p className="text-sm font-medium">{selectedCaregiver.specialty}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assigned Patients</p>
                  <p className="text-sm font-medium">{selectedCaregiver.patients}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Weekly Hours</p>
                  <p className="text-sm font-medium">{selectedCaregiver.weeklyHours} hrs</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button className="btn btn-primary flex items-center">
                  View Full Profile
                  <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Caregivers;