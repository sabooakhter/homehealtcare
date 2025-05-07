/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - name (text)
      - role (text)
      - status (text)
      - last_login (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - caregivers
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - supervisor_id (uuid, references users)
      - specialty (text)
      - hourly_rate (numeric)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - patients
      - id (uuid, primary key)
      - name (text)
      - age (integer)
      - address (text)
      - city (text)
      - state (text)
      - zip (text)
      - phone (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - patient_conditions
      - id (uuid, primary key)
      - patient_id (uuid, references patients)
      - condition (text)
      - created_at (timestamptz)

    - patient_caregivers
      - id (uuid, primary key)
      - patient_id (uuid, references patients)
      - caregiver_id (uuid, references caregivers)
      - created_at (timestamptz)

    - tasks
      - id (uuid, primary key)
      - patient_id (uuid, references patients)
      - caregiver_id (uuid, references caregivers)
      - title (text)
      - type (text)
      - scheduled_at (timestamptz)
      - duration (integer)
      - notes (text)
      - completed (boolean)
      - created_at (timestamptz)
      - updated_at (timestamptz)

    - activity_logs
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - action (text)
      - resource (text)
      - details (text)
      - ip_address (text)
      - severity (text)
      - created_at (timestamptz)

    - organization_settings
      - id (uuid, primary key)
      - name (text)
      - tagline (text)
      - description (text)
      - logo_url (text)
      - address (text)
      - city (text)
      - state (text)
      - zip (text)
      - phone (text)
      - email (text)
      - website (text)
      - primary_color (text)
      - secondary_color (text)
      - accent_color (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on role
*/

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'supervisor')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create caregivers table
CREATE TABLE caregivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE,
  supervisor_id uuid REFERENCES users,
  specialty text NOT NULL,
  hourly_rate numeric NOT NULL CHECK (hourly_rate > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL CHECK (age > 0),
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patient conditions table
CREATE TABLE patient_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients ON DELETE CASCADE,
  condition text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create patient caregivers table
CREATE TABLE patient_caregivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients ON DELETE CASCADE,
  caregiver_id uuid REFERENCES caregivers ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients ON DELETE CASCADE,
  caregiver_id uuid REFERENCES caregivers,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('visit', 'medication', 'therapy', 'checkup')),
  scheduled_at timestamptz NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  notes text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity logs table
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE SET NULL,
  action text NOT NULL,
  resource text NOT NULL,
  details text,
  ip_address text,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  created_at timestamptz DEFAULT now()
);

-- Create organization settings table
CREATE TABLE organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tagline text,
  description text,
  logo_url text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  website text,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  accent_color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000000')
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users table policies
CREATE POLICY "Admins can do everything with users"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Caregivers table policies
CREATE POLICY "Admins can do everything with caregivers"
  ON caregivers
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Supervisors can read and update their assigned caregivers"
  ON caregivers
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = supervisor_id OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- Patients table policies
CREATE POLICY "Admins and supervisors can read all patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Supervisors can manage their patients"
  ON patients
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT c.supervisor_id 
      FROM patient_caregivers pc
      JOIN caregivers c ON c.id = pc.caregiver_id
      WHERE pc.patient_id = patients.id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT c.supervisor_id 
      FROM patient_caregivers pc
      JOIN caregivers c ON c.id = pc.caregiver_id
      WHERE pc.patient_id = patients.id
    )
  );

-- Tasks table policies
CREATE POLICY "Admins can do everything with tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Supervisors can manage tasks for their caregivers"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT supervisor_id 
      FROM caregivers 
      WHERE id = tasks.caregiver_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT supervisor_id 
      FROM caregivers 
      WHERE id = tasks.caregiver_id
    )
  );

-- Activity logs policies
CREATE POLICY "Admins can read all logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Users can read their own logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Organization settings policies
CREATE POLICY "Anyone can read organization settings"
  ON organization_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update organization settings"
  ON organization_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));