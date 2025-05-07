/*
  # Seed Data Migration
  
  1. Content
    - Insert demo users
    - Insert demo caregivers
    - Insert demo patients and their conditions
    - Insert patient-caregiver relationships
    - Insert demo tasks
    - Insert organization settings
*/

-- Insert demo users
INSERT INTO users (id, email, name, role, status, last_login) VALUES
  ('d7b5d3f1-2b9a-4c1e-9f3d-b5d8e3f1c9a2', 'admin@healthcare.com', 'Admin User', 'admin', 'active', now()),
  ('e8c6e4f2-3c0b-5d2f-0e4e-c6d9f4e2d0b3', 'supervisor@healthcare.com', 'Supervisor User', 'supervisor', 'active', now());

-- Insert demo caregivers
INSERT INTO caregivers (id, user_id, supervisor_id, specialty, hourly_rate) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', NULL, 'e8c6e4f2-3c0b-5d2f-0e4e-c6d9f4e2d0b3', 'Elderly Care', 25),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', NULL, 'e8c6e4f2-3c0b-5d2f-0e4e-c6d9f4e2d0b3', 'Pediatric Care', 28),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', NULL, 'e8c6e4f2-3c0b-5d2f-0e4e-c6d9f4e2d0b3', 'Physical Therapy', 26),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', NULL, 'e8c6e4f2-3c0b-5d2f-0e4e-c6d9f4e2d0b3', 'Post-Surgery Care', 24),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', NULL, 'e8c6e4f2-3c0b-5d2f-0e4e-c6d9f4e2d0b3', 'Mental Health', 30);

-- Insert demo patients
INSERT INTO patients (id, name, age, address, city, state, zip, phone) VALUES
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'Eleanor Thompson', 78, '123 Main St, Apt 4B', 'New York', 'NY', '10001', '(555) 123-4567'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c2', 'Robert Johnson', 65, '456 Park Ave', 'New York', 'NY', '10002', '(555) 234-5678'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2', 'Martha Lewis', 72, '789 Broadway', 'Brooklyn', 'NY', '11201', '(555) 345-6789'),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3', 'George Walker', 82, '101 Hudson St', 'Jersey City', 'NJ', '07302', '(555) 456-7890'),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4', 'William Harris', 60, '222 W 14th St', 'New York', 'NY', '10011', '(555) 567-8901');

-- Insert patient conditions
INSERT INTO patient_conditions (patient_id, condition) VALUES
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'Hypertension'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'Arthritis'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'Type 2 Diabetes'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c2', 'COPD'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c2', 'Heart Disease'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2', 'Post-surgery recovery'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2', 'Hypertension'),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3', 'Alzheimer''s'),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3', 'Osteoporosis'),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4', 'Depression'),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4', 'Anxiety'),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4', 'Chronic Pain');

-- Insert patient-caregiver relationships
INSERT INTO patient_caregivers (patient_id, caregiver_id) VALUES
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e'),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c2', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f'),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a'),
  ('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b');

-- Insert demo tasks
INSERT INTO tasks (patient_id, caregiver_id, title, type, scheduled_at, duration, notes, completed) VALUES
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Morning Medication', 'medication', now() + interval '1 hour', 15, 'Administer blood pressure medication', false),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Routine Check', 'visit', now() + interval '3 hours', 60, NULL, false),
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c2', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'Physical Therapy Session', 'therapy', now() + interval '5 hours', 45, 'Focus on mobility exercises', false),
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Post-Surgery Check', 'checkup', now() + interval '6 hours', 30, 'Check incision site', false),
  ('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'Mental Health Session', 'therapy', now() + interval '8 hours', 60, NULL, false);

-- Insert organization settings
INSERT INTO organization_settings (
  id, name, tagline, description, address, city, state, zip, phone, email, website,
  primary_color, secondary_color, accent_color
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'HomeCare Connect',
  'Compassionate care in the comfort of home',
  'HomeCare Connect provides professional home healthcare services with a focus on compassionate, personalized care. Our dedicated team of caregivers works to ensure your loved ones receive the best possible care in the comfort of their own homes.',
  '123 Main Street, Suite 200',
  'New York',
  'NY',
  '10001',
  '(555) 123-4567',
  'info@homecareconnect.com',
  'www.homecareconnect.com',
  '#0891B2',
  '#059669',
  '#7C3AED'
);