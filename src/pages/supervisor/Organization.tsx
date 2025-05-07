import React, { useState } from 'react';
import { 
  Save, 
  Upload, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  AlertTriangle,
  Activity
} from 'lucide-react';

interface OrganizationData {
  name: string;
  logo: string;
  tagline: string;
  description: string;
  contact: {
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    website: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Mock organization data
const INITIAL_ORGANIZATION_DATA: OrganizationData = {
  name: 'HomeCare Connect',
  logo: 'https://example.com/logo.png', // This would be a real logo URL in a production app
  tagline: 'Compassionate care in the comfort of home',
  description: 'HomeCare Connect provides professional home healthcare services with a focus on compassionate, personalized care. Our dedicated team of caregivers works to ensure your loved ones receive the best possible care in the comfort of their own homes.',
  contact: {
    address: '123 Main Street, Suite 200',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    phone: '(555) 123-4567',
    email: 'info@homecareconnect.com',
    website: 'www.homecareconnect.com'
  },
  colors: {
    primary: '#0891B2', // cyan-600
    secondary: '#059669', // emerald-600
    accent: '#7C3AED', // violet-600
  }
};

const Organization: React.FC = () => {
  const [organization, setOrganization] = useState<OrganizationData>(INITIAL_ORGANIZATION_DATA);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrganization({
        ...organization,
        [parent]: {
          ...organization[parent as keyof OrganizationData],
          [child]: value
        }
      });
    } else {
      setOrganization({
        ...organization,
        [name]: value
      });
    }
    
    setHasChanges(true);
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!organization.name.trim()) {
      newErrors['name'] = 'Organization name is required';
    }
    
    if (!organization.contact.email.trim()) {
      newErrors['contact.email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(organization.contact.email)) {
      newErrors['contact.email'] = 'Email is invalid';
    }
    
    if (!organization.contact.phone.trim()) {
      newErrors['contact.phone'] = 'Phone number is required';
    }
    
    // Check color formats
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(organization.colors.primary)) {
      newErrors['colors.primary'] = 'Invalid color format (use #RRGGBB)';
    }
    
    if (!colorRegex.test(organization.colors.secondary)) {
      newErrors['colors.secondary'] = 'Invalid color format (use #RRGGBB)';
    }
    
    if (!colorRegex.test(organization.colors.accent)) {
      newErrors['colors.accent'] = 'Invalid color format (use #RRGGBB)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // In a real app, this would save to database
    setSuccessMessage('Organization information updated successfully!');
    setHasChanges(false);
    setIsEditing(false);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // Cancel editing
  const handleCancel = () => {
    setOrganization(INITIAL_ORGANIZATION_DATA);
    setIsEditing(false);
    setHasChanges(false);
    setErrors({});
  };
  
  // Handle logo upload (mock)
  const handleLogoUpload = () => {
    // In a real app, this would open a file picker and upload the image
    alert('This would open a file upload dialog in a real application.');
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Organization</h1>
        
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn btn-primary mt-4 md:mt-0"
          >
            Edit Organization Info
          </button>
        ) : (
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button 
              onClick={handleCancel}
              className="btn btn-outline"
              disabled={!hasChanges}
            >
              <X size={16} className="mr-2" />
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={!hasChanges}
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-start">
          <Check size={18} className="text-green-500 mt-0.5 mr-2" />
          <span>{successMessage}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Preview */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium">Organization Preview</h2>
          </div>
          
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              {organization.logo ? (
                <img 
                  src={organization.logo} 
                  alt={`${organization.name} logo`} 
                  className="max-w-full max-h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = ''; 
                    (e.target as HTMLImageElement).alt = 'Logo not available';
                  }}
                />
              ) : (
                <Activity size={48} className="text-primary" />
              )}
            </div>
            
            <h3 className="text-xl font-semibold mb-1" style={{ color: organization.colors.primary }}>
              {organization.name}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {organization.tagline}
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              {organization.description}
            </p>
            
            <div className="w-full space-y-2 border-t border-gray-100 pt-6">
              <div className="flex items-center text-sm">
                <MapPin size={16} className="text-gray-400 mr-2" />
                <span>{`${organization.contact.address}, ${organization.contact.city}, ${organization.contact.state} ${organization.contact.zip}`}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Phone size={16} className="text-gray-400 mr-2" />
                <span>{organization.contact.phone}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Mail size={16} className="text-gray-400 mr-2" />
                <span>{organization.contact.email}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Globe size={16} className="text-gray-400 mr-2" />
                <span>{organization.contact.website}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <h3 className="text-sm font-medium mb-3">Brand Colors</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div 
                  className="h-8 rounded-md mb-1" 
                  style={{ backgroundColor: organization.colors.primary }}
                ></div>
                <p className="text-xs text-center">Primary</p>
              </div>
              <div>
                <div 
                  className="h-8 rounded-md mb-1" 
                  style={{ backgroundColor: organization.colors.secondary }}
                ></div>
                <p className="text-xs text-center">Secondary</p>
              </div>
              <div>
                <div 
                  className="h-8 rounded-md mb-1" 
                  style={{ backgroundColor: organization.colors.accent }}
                ></div>
                <p className="text-xs text-center">Accent</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Organization Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-medium">Organization Information</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="form-label">Organization Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={organization.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? 'border-red-300' : ''}`}
                      disabled={!isEditing}
                    />
                    {errors.name && (
                      <p className="form-error">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="logo" className="form-label">Organization Logo</label>
                    <div className="mt-1 flex items-center">
                      <span className="inline-block w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                        {organization.logo ? (
                          <img 
                            src={organization.logo} 
                            alt="Logo"
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = ''; 
                              (e.target as HTMLImageElement).alt = 'Logo not available';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-100">
                            <Activity size={24} className="text-gray-400" />
                          </div>
                        )}
                      </span>
                      
                      {isEditing && (
                        <button
                          type="button"
                          className="ml-4 btn btn-outline"
                          onClick={handleLogoUpload}
                        >
                          <Upload size={16} className="mr-2" />
                          Upload
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="tagline" className="form-label">Tagline</label>
                    <input
                      type="text"
                      id="tagline"
                      name="tagline"
                      value={organization.tagline}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={organization.description}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={!isEditing}
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Contact Info Section */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="contact.address" className="form-label">Street Address</label>
                    <input
                      type="text"
                      id="contact.address"
                      name="contact.address"
                      value={organization.contact.address}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact.city" className="form-label">City</label>
                      <input
                        type="text"
                        id="contact.city"
                        name="contact.city"
                        value={organization.contact.city}
                        onChange={handleInputChange}
                        className="form-input"
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact.state" className="form-label">State</label>
                        <input
                          type="text"
                          id="contact.state"
                          name="contact.state"
                          value={organization.contact.state}
                          onChange={handleInputChange}
                          className="form-input"
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="contact.zip" className="form-label">ZIP</label>
                        <input
                          type="text"
                          id="contact.zip"
                          name="contact.zip"
                          value={organization.contact.zip}
                          onChange={handleInputChange}
                          className="form-input"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="contact.phone" className="form-label">Phone Number</label>
                    <input
                      type="text"
                      id="contact.phone"
                      name="contact.phone"
                      value={organization.contact.phone}
                      onChange={handleInputChange}
                      className={`form-input ${errors['contact.phone'] ? 'border-red-300' : ''}`}
                      disabled={!isEditing}
                    />
                    {errors['contact.phone'] && (
                      <p className="form-error">{errors['contact.phone']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="contact.email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="contact.email"
                      name="contact.email"
                      value={organization.contact.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors['contact.email'] ? 'border-red-300' : ''}`}
                      disabled={!isEditing}
                    />
                    {errors['contact.email'] && (
                      <p className="form-error">{errors['contact.email']}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="contact.website" className="form-label">Website</label>
                    <input
                      type="text"
                      id="contact.website"
                      name="contact.website"
                      value={organization.contact.website}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
              
              {/* Brand Colors Section */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-medium mb-4">Brand Colors</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="colors.primary" className="form-label">Primary Color</label>
                      <div className="flex">
                        <input
                          type="color"
                          id="colors.primary-picker"
                          value={organization.colors.primary}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'colors.primary',
                              value: e.target.value
                            }
                          } as React.ChangeEvent<HTMLInputElement>)}
                          className="h-10 w-10 border border-gray-300 rounded-l-md"
                          disabled={!isEditing}
                        />
                        <input
                          type="text"
                          id="colors.primary"
                          name="colors.primary"
                          value={organization.colors.primary}
                          onChange={handleInputChange}
                          className={`form-input rounded-l-none ${errors['colors.primary'] ? 'border-red-300' : ''}`}
                          disabled={!isEditing}
                        />
                      </div>
                      {errors['colors.primary'] && (
                        <p className="form-error">{errors['colors.primary']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="colors.secondary" className="form-label">Secondary Color</label>
                      <div className="flex">
                        <input
                          type="color"
                          id="colors.secondary-picker"
                          value={organization.colors.secondary}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'colors.secondary',
                              value: e.target.value
                            }
                          } as React.ChangeEvent<HTMLInputElement>)}
                          className="h-10 w-10 border border-gray-300 rounded-l-md"
                          disabled={!isEditing}
                        />
                        <input
                          type="text"
                          id="colors.secondary"
                          name="colors.secondary"
                          value={organization.colors.secondary}
                          onChange={handleInputChange}
                          className={`form-input rounded-l-none ${errors['colors.secondary'] ? 'border-red-300' : ''}`}
                          disabled={!isEditing}
                        />
                      </div>
                      {errors['colors.secondary'] && (
                        <p className="form-error">{errors['colors.secondary']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="colors.accent" className="form-label">Accent Color</label>
                      <div className="flex">
                        <input
                          type="color"
                          id="colors.accent-picker"
                          value={organization.colors.accent}
                          onChange={(e) => handleInputChange({
                            target: {
                              name: 'colors.accent',
                              value: e.target.value
                            }
                          } as React.ChangeEvent<HTMLInputElement>)}
                          className="h-10 w-10 border border-gray-300 rounded-l-md"
                          disabled={!isEditing}
                        />
                        <input
                          type="text"
                          id="colors.accent"
                          name="colors.accent"
                          value={organization.colors.accent}
                          onChange={handleInputChange}
                          className={`form-input rounded-l-none ${errors['colors.accent'] ? 'border-red-300' : ''}`}
                          disabled={!isEditing}
                        />
                      </div>
                      {errors['colors.accent'] && (
                        <p className="form-error">{errors['colors.accent']}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
                    <AlertTriangle size={18} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      Changing brand colors will update the appearance of reports, correspondence,
                      and patient-facing materials. Make sure to follow your organization's branding guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {isEditing && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <div className="flex space-x-2">
                <button 
                  onClick={handleCancel}
                  className="btn btn-outline"
                  disabled={!hasChanges}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={!hasChanges}
                >
                  <Save size={16} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Organization;