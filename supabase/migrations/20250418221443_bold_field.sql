/*
  # Add RLS policies for caregiver time logs

  1. Changes
    - Add RLS policies to allow supervisors to read time logs for their caregivers
    - Add RLS policies to allow admins to manage all time logs
  
  2. Security
    - Enable RLS on caregiver_time_logs table if not already enabled
    - Add policy for supervisors to read time logs of their caregivers
    - Add policy for admins to manage all time logs
*/

-- Enable RLS
ALTER TABLE caregiver_time_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Supervisors can read time logs for their caregivers" ON caregiver_time_logs;
  DROP POLICY IF EXISTS "Admins can do everything with time logs" ON caregiver_time_logs;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policy for supervisors to read time logs
CREATE POLICY "Supervisors can read time logs for their caregivers"
ON caregiver_time_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM caregivers
    WHERE caregivers.id = caregiver_time_logs.caregiver_id
    AND caregivers.supervisor_id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Create policy for admins to manage all time logs
CREATE POLICY "Admins can do everything with time logs"
ON caregiver_time_logs
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);