import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hqqexldcxslbnewmkfkm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxcWV4bGRjeHNsYm5ld21rZmttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NDExNzUsImV4cCI6MjA2MDUxNzE3NX0.W8gKXgstX1x_3jWVFq9F6QP-QWtXnOJji4WWikcPZvU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});