import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session check failed:', sessionError);
        throw sessionError;
      }
      
      if (session?.user) {
        console.log('Session found:', session);
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = async (email: string, password: string, name: string, role: string) => {
    setIsLoading(true);
    console.log('Starting registration for:', email);
    
    try {
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (signUpError) {
        console.error('Registration error:', signUpError);
        throw signUpError;
      }
      
      if (!authUser) {
        console.error('No user data returned from signup');
        throw new Error('Registration failed: No user data returned');
      }

      console.log('Registration successful:', authUser);
      setUser(authUser);
      navigate(role === 'admin' ? '/admin' : '/supervisor');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Starting login for:', email);
    
    try {
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('Login error:', signInError);
        throw new Error('Invalid email or password');
      }

      if (!session?.user) {
        console.error('No session data returned');
        throw new Error('Login failed: No session data returned');
      }

      console.log('Login successful:', session);
      const userRole = session.user.user_metadata.role || 'supervisor';
      setUser(session.user);
      
      navigate(userRole === 'admin' ? '/admin' : '/supervisor');
    } catch (error) {
      console.error('Login failed:', error);
      throw error instanceof Error 
        ? error 
        : new Error('An unexpected error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Starting logout');
      await supabase.auth.signOut();
      console.log('Logout successful');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};