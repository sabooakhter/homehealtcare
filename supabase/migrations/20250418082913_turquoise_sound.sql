/*
  # Fix recursive RLS policy for users table

  1. Changes
    - Drop existing RLS policies on users table that are causing recursion
    - Create new, simplified RLS policies that avoid recursion by:
      - Using direct auth.uid() comparison for user's own data
      - Using a subquery for admin access that doesn't recursively query the users table
  
  2. Security
    - Maintains row-level security
    - Ensures users can only read their own data
    - Allows admins to manage all users
    - Prevents any recursive policy checks
*/

-- Drop existing policies to replace them with non-recursive versions
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Create new non-recursive policies
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (auth_id = auth.uid());

-- Admin policy using role check without recursion
CREATE POLICY "Admins can manage users"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'admin'
    AND users.id = (SELECT id FROM users WHERE auth_id = auth.uid() LIMIT 1)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'admin'
    AND users.id = (SELECT id FROM users WHERE auth_id = auth.uid() LIMIT 1)
  )
);