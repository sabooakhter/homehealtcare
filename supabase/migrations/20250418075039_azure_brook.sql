/*
  # Authentication Setup

  1. Create demo auth users and link them to application users
  2. Add auth_id column to users table to link with auth.users
*/

-- Add auth_id column to users table
ALTER TABLE users
ADD COLUMN auth_id uuid REFERENCES auth.users(id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, auth_id)
  VALUES (gen_random_uuid(), NEW.email, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'role', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new auth users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert initial admin user
DO $$
DECLARE
  admin_auth_id uuid;
  supervisor_auth_id uuid;
BEGIN
  -- Create admin auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@healthcare.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"name": "Admin User", "role": "admin"}'::jsonb,
    now(),
    now()
  ) RETURNING id INTO admin_auth_id;

  -- Create supervisor auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'supervisor@healthcare.com',
    crypt('super123', gen_salt('bf')),
    now(),
    '{"name": "Supervisor User", "role": "supervisor"}'::jsonb,
    now(),
    now()
  ) RETURNING id INTO supervisor_auth_id;

  -- Update existing users with auth IDs
  UPDATE public.users
  SET auth_id = admin_auth_id
  WHERE email = 'admin@healthcare.com';

  UPDATE public.users
  SET auth_id = supervisor_auth_id
  WHERE email = 'supervisor@healthcare.com';
END $$;