/*
  # Remove users table and related constraints

  This migration removes the custom users table and its related constraints
  since we're switching to use Supabase Auth directly for user management.
  
  1. Changes
    - Drop all policies that reference the users table
    - Drop foreign key constraints that reference the users table
    - Drop the users table
    - Create new RLS policies using auth.uid() with proper UUID casting
  
  2. Security
    - Updated RLS policies to work with auth.uid()
    - Maintains security while simplifying the auth model
*/

-- First drop all policies that reference the users table
DROP POLICY IF EXISTS "Admins can do everything with caregivers" ON caregivers;
DROP POLICY IF EXISTS "Supervisors can read and update their assigned caregivers" ON caregivers;
DROP POLICY IF EXISTS "Admins and supervisors can read all patients" ON patients;
DROP POLICY IF EXISTS "Admins can do everything with tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can read all logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can read their own logs" ON activity_logs;
DROP POLICY IF EXISTS "Admins can update organization settings" ON organization_settings;
DROP POLICY IF EXISTS "Admins can do everything with time logs" ON caregiver_time_logs;

-- Remove foreign key constraints
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
ALTER TABLE caregivers DROP CONSTRAINT IF EXISTS caregivers_supervisor_id_fkey;
ALTER TABLE caregivers DROP CONSTRAINT IF EXISTS caregivers_user_id_fkey;

-- Now we can safely drop the users table
DROP TABLE IF EXISTS users;

-- Recreate policies using auth.uid() with proper UUID casting
CREATE POLICY "Users can read their own logs"
ON activity_logs
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()::uuid
  OR 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

CREATE POLICY "Admins can do everything with caregivers"
ON caregivers
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

CREATE POLICY "Supervisors can read and update their assigned caregivers"
ON caregivers
FOR SELECT
TO authenticated
USING (
  supervisor_id = auth.uid()::uuid
  OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

CREATE POLICY "Admins and supervisors can read all patients"
ON patients
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text IN ('admin', 'supervisor')
  )
);

CREATE POLICY "Admins can do everything with tasks"
ON tasks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

CREATE POLICY "Admins can update organization settings"
ON organization_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

CREATE POLICY "Admins can do everything with time logs"
ON caregiver_time_logs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);