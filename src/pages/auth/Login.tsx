import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Lock, Mail, AlertTriangle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Navigation is handled in the login function
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'supervisor') => {
    setError('');
    setIsLoading(true);
    
    try {
      const demoCredentials = {
        admin: { email: 'admin@healthcare.com', password: 'admin123' },
        supervisor: { email: 'supervisor@healthcare.com', password: 'super123' }
      };
      
      const { email, password } = demoCredentials[role];
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 animate-fade-in">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Activity size={36} className="text-primary mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">HomeCare Connect</h1>
        </div>
        <p className="text-gray-600">
          Log in to access your administrative dashboard
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertTriangle size={18} className="text-error mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input pl-10"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input pl-10"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full mb-4 flex justify-center items-center"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Sign In'
          )}
        </button>

        <p className="text-center text-sm text-gray-600 mb-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
            Create one
          </Link>
        </p>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Quick Demo Login</span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <button
            onClick={() => handleDemoLogin('admin')}
            disabled={isLoading}
            className="btn btn-outline"
          >
            Admin Demo
          </button>
          <button
            onClick={() => handleDemoLogin('supervisor')}
            disabled={isLoading}
            className="btn btn-outline"
          >
            Supervisor Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;