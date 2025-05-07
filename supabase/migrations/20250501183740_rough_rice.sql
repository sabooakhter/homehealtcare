/*
  # Fix User Permissions

  1. Changes
    - Drop existing user policies
    - Create new policies that allow:
      - Users to read their own data
      - Admins to manage all users
      - Supervisors to read user data for their caregivers
      - Supervisors to read user data for other supervisors
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Supervisors can read caregiver user data" ON users;

-- Create new policies
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
  );

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND (au.raw_user_meta_data->>'role')::text = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND (au.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

CREATE POLICY "Supervisors can read all user data"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND (au.raw_user_meta_data->>'role')::text = 'supervisor'
    )
  );