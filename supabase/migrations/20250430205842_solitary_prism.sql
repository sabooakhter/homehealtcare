/*
  # Reset Database Schema with Mock Data

  1. Tables Created:
    - users
    - caregivers
    - patients
    - patient_conditions
    - patient_caregivers
    - tasks
    - activity_logs
    - organization_settings
    - caregiver_time_logs

  2. Mock Data:
    - Demo admin and supervisor users
    - Sample caregivers, patients, and tasks
    - Example time logs and activity records
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS caregiver_time_logs CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS patient_caregivers CASCADE;
DROP TABLE IF EXISTS patient_conditions CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS caregivers CASCADE;
DROP TABLE IF EXISTS organization_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'supervisor')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
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
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('checked_in', 'checked_out', 'available')),
  check_in_time timestamptz,
  check_out_time timestamptz,
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
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Create caregiver time logs table
CREATE TABLE caregiver_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id uuid REFERENCES caregivers ON DELETE CASCADE,
  check_in_time timestamptz NOT NULL,
  check_out_time timestamptz NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT check_time_order CHECK (check_out_time > check_in_time)
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
ALTER TABLE caregiver_time_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage users"
  ON users FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (au.raw_user_meta_data->>'role')::text = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid()
    AND (au.raw_user_meta_data->>'role')::text = 'admin'
  ));

CREATE POLICY "Admins can do everything with caregivers"
  ON caregivers FOR ALL TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Supervisors can read and update their caregivers"
  ON caregivers FOR SELECT TO authenticated
  USING (supervisor_id = auth.uid()::uuid);

CREATE POLICY "Admins and supervisors can read all patients"
  ON patients FOR SELECT TO authenticated
  USING ((auth.jwt()->>'role')::text IN ('admin', 'supervisor'));

CREATE POLICY "Supervisors can manage their patients"
  ON patients FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM caregivers c
    JOIN patient_caregivers pc ON c.id = pc.caregiver_id
    WHERE c.supervisor_id = auth.uid()::uuid
    AND pc.patient_id = patients.id
  ));

CREATE POLICY "Anyone can read organization settings"
  ON organization_settings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can update organization settings"
  ON organization_settings FOR ALL TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Admins can do everything with time logs"
  ON caregiver_time_logs FOR ALL TO authenticated
  USING ((auth.jwt()->>'role')::text = 'admin')
  WITH CHECK ((auth.jwt()->>'role')::text = 'admin');

CREATE POLICY "Supervisors can read time logs for their caregivers"
  ON caregiver_time_logs FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM caregivers
    WHERE caregivers.id = caregiver_time_logs.caregiver_id
    AND caregivers.supervisor_id = auth.uid()::uuid
  ));

-- Insert demo data
INSERT INTO users (id, email, name, role, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@healthcare.com', 'Admin User', 'admin', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'supervisor@healthcare.com', 'Supervisor User', 'supervisor', 'active');

INSERT INTO caregivers (id, supervisor_id, specialty, hourly_rate, status)
VALUES
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Elderly Care', 25.00, 'available'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Physical Therapy', 30.00, 'available');

INSERT INTO patients (id, name, age, address, city, state, zip, phone)
VALUES
  ('00000000-0000-0000-0000-000000000005', 'Eleanor Thompson', 78, '123 Main St', 'New York', 'NY', '10001', '(555) 123-4567'),
  ('00000000-0000-0000-0000-000000000006', 'Robert Johnson', 65, '456 Park Ave', 'New York', 'NY', '10002', '(555) 234-5678');

INSERT INTO patient_conditions (patient_id, condition)
VALUES
  ('00000000-0000-0000-0000-000000000005', 'Hypertension'),
  ('00000000-0000-0000-0000-000000000005', 'Arthritis'),
  ('00000000-0000-0000-0000-000000000006', 'Diabetes');

INSERT INTO patient_caregivers (patient_id, caregiver_id)
VALUES
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004');

INSERT INTO tasks (patient_id, caregiver_id, title, type, scheduled_at, duration, notes)
VALUES
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'Morning Check', 'visit', now(), 30, 'Regular morning checkup'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 'Physical Therapy Session', 'therapy', now() + interval '2 hours', 60, 'Focus on mobility exercises');

INSERT INTO organization_settings (
  id, name, tagline, description, address, city, state, zip, phone, email,
  primary_color, secondary_color, accent_color
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'HomeCare Connect',
  'Compassionate care in the comfort of home',
  'Professional home healthcare services with a focus on quality care',
  '789 Healthcare Ave',
  'New York',
  'NY',
  '10003',
  '(555) 987-6543',
  'info@homecareconnect.com',
  '#0891B2',
  '#059669',
  '#7C3AED'
);