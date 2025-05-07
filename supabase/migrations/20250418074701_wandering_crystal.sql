/*
  # Add Time Tracking Features

  1. Changes to Existing Tables
    - Add status and check-in/out time fields to caregivers table
    
  2. New Tables
    - caregiver_time_logs
      - id (uuid, primary key)
      - caregiver_id (uuid, references caregivers)
      - check_in_time (timestamptz)
      - check_out_time (timestamptz)
      - duration (integer)
      - created_at (timestamptz)

  3. Security
    - Enable RLS on new table
    - Add policies for authenticated users based on role
*/

-- Add status and time tracking fields to caregivers table
ALTER TABLE caregivers 
  ADD COLUMN status text NOT NULL DEFAULT 'available' 
    CHECK (status IN ('checked_in', 'checked_out', 'available')),
  ADD COLUMN check_in_time timestamptz,
  ADD COLUMN check_out_time timestamptz;

-- Create caregiver time logs table
CREATE TABLE caregiver_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id uuid REFERENCES caregivers ON DELETE CASCADE,
  check_in_time timestamptz NOT NULL,
  check_out_time timestamptz NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  created_at timestamptz DEFAULT now(),
  
  -- Ensure check_out_time is after check_in_time
  CONSTRAINT check_time_order CHECK (check_out_time > check_in_time)
);

-- Enable RLS
ALTER TABLE caregiver_time_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for caregiver_time_logs
CREATE POLICY "Admins can do everything with time logs"
  ON caregiver_time_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Supervisors can read time logs for their caregivers"
  ON caregiver_time_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT supervisor_id 
      FROM caregivers 
      WHERE id = caregiver_time_logs.caregiver_id
    )
  );