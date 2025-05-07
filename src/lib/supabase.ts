import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Enable debug mode for more verbose errors
  debug: true
});

// Add error logging interceptor
supabase.handleError = ((error, requestDetails) => {
  console.group('Supabase Error');
  console.error('Error:', error);
  console.error('Request Details:', requestDetails);
  console.error('Stack:', new Error().stack);
  console.groupEnd();
  
  // Return a more descriptive error message
  return new Error(`Supabase Error: ${error.message}\nDetails: ${JSON.stringify(requestDetails, null, 2)}`);
});