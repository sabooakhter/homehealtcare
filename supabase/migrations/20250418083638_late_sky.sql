/*
  # Remove users table and related constraints

  This migration removes the custom users table and its related constraints
  since we're switching to use Supabase Auth directly for user management.
  
  1. Changes
    - Drop foreign key constraints that reference the users table
    - Drop the users table
    - Update RLS policies to use auth.uid() instead of users.id
  
  2. Security
    - Updated RLS policies to work with auth.uid()
    - Maintains security while simplifying the auth model
*/

-- First remove foreign key constraints that reference the users table
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
ALTER TABLE caregivers DROP CONSTRAINT IF EXISTS caregivers_supervisor_id_fkey;
ALTER TABLE caregivers DROP CONSTRAINT IF EXISTS caregivers_user_id_fkey;

-- Drop the users table
DROP TABLE IF EXISTS users;

-- Update RLS policies for activity_logs to use auth.uid()
DROP POLICY IF EXISTS "Admins can read all logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can read their own logs" ON activity_logs;

CREATE POLICY "Users can read their own logs"
ON activity_logs
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id::text
  OR 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);

-- Update RLS policies for caregivers to use auth.uid()
DROP POLICY IF EXISTS "Admins can do everything with caregivers" ON caregivers;
DROP POLICY IF EXISTS "Supervisors can read and update their assigned caregivers" ON caregivers;

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
  supervisor_id::text = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
  )
);