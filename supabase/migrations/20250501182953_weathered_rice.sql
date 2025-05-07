/*
  # Update User and Reference Data
  
  1. Changes
    - Create users for caregivers
    - Update foreign key references in correct order
    - Handle UUID casting properly
*/

-- Create users for caregivers
INSERT INTO users (id, email, name, role, status)
VALUES
  ('11111111-0000-0000-0000-111111111111'::uuid, 'michael.davis@healthcare.com', 'Michael Davis', 'supervisor', 'active'),
  ('22222222-0000-0000-0000-222222222222'::uuid, 'emma.wilson@healthcare.com', 'Emma Wilson', 'supervisor', 'active'),
  ('33333333-0000-0000-0000-333333333333'::uuid, 'david.lee@healthcare.com', 'David Lee', 'supervisor', 'active'),
  ('44444444-0000-0000-0000-444444444444'::uuid, 'amanda.white@healthcare.com', 'Amanda White', 'supervisor', 'active'),
  ('55555555-0000-0000-0000-555555555555'::uuid, 'james.martin@healthcare.com', 'James Martin', 'supervisor', 'active'),
  ('66666666-0000-0000-0000-666666666666'::uuid, 'olivia.brown@healthcare.com', 'Olivia Brown', 'supervisor', 'active');

-- First, update all child tables to remove foreign key constraints temporarily
ALTER TABLE patient_conditions 
  DROP CONSTRAINT patient_conditions_patient_id_fkey;

ALTER TABLE patient_caregivers 
  DROP CONSTRAINT patient_caregivers_patient_id_fkey,
  DROP CONSTRAINT patient_caregivers_caregiver_id_fkey;

ALTER TABLE tasks 
  DROP CONSTRAINT tasks_patient_id_fkey,
  DROP CONSTRAINT tasks_caregiver_id_fkey;

ALTER TABLE caregiver_time_logs
  DROP CONSTRAINT caregiver_time_logs_caregiver_id_fkey;

-- Update caregivers with user_id
UPDATE caregivers
SET user_id = CASE id::text
  WHEN '11111111-1111-1111-1111-111111111111' THEN '11111111-0000-0000-0000-111111111111'::uuid
  WHEN '22222222-2222-2222-2222-222222222222' THEN '22222222-0000-0000-0000-222222222222'::uuid
  WHEN '33333333-3333-3333-3333-333333333333' THEN '33333333-0000-0000-0000-333333333333'::uuid
  WHEN '44444444-4444-4444-4444-444444444444' THEN '44444444-0000-0000-0000-444444444444'::uuid
  WHEN '55555555-5555-5555-5555-555555555555' THEN '55555555-0000-0000-0000-555555555555'::uuid
  WHEN '66666666-6666-6666-6666-666666666666' THEN '66666666-0000-0000-0000-666666666666'::uuid
  ELSE user_id
END;

-- Update patients with unique UUIDs
UPDATE patients
SET id = CASE id::text
  WHEN '00000000-0000-0000-0000-000000000005' THEN '55555555-0000-0000-0000-000000000005'::uuid
  WHEN '00000000-0000-0000-0000-000000000006' THEN '66666666-0000-0000-0000-000000000006'::uuid
  ELSE id
END;

-- Update patient_conditions with new patient IDs
UPDATE patient_conditions
SET patient_id = CASE patient_id::text
  WHEN '00000000-0000-0000-0000-000000000005' THEN '55555555-0000-0000-0000-000000000005'::uuid
  WHEN '00000000-0000-0000-0000-000000000006' THEN '66666666-0000-0000-0000-000000000006'::uuid
  ELSE patient_id
END;

-- Update patient_caregivers with new IDs
UPDATE patient_caregivers
SET 
  patient_id = CASE patient_id::text
    WHEN '00000000-0000-0000-0000-000000000005' THEN '55555555-0000-0000-0000-000000000005'::uuid
    WHEN '00000000-0000-0000-0000-000000000006' THEN '66666666-0000-0000-0000-000000000006'::uuid
    ELSE patient_id
  END,
  caregiver_id = CASE caregiver_id::text
    WHEN '00000000-0000-0000-0000-000000000003' THEN '11111111-1111-1111-1111-111111111111'::uuid
    WHEN '00000000-0000-0000-0000-000000000004' THEN '22222222-2222-2222-2222-222222222222'::uuid
    ELSE caregiver_id
  END;

-- Update tasks with new IDs
UPDATE tasks
SET 
  patient_id = CASE patient_id::text
    WHEN '00000000-0000-0000-0000-000000000005' THEN '55555555-0000-0000-0000-000000000005'::uuid
    WHEN '00000000-0000-0000-0000-000000000006' THEN '66666666-0000-0000-0000-000000000006'::uuid
    ELSE patient_id
  END,
  caregiver_id = CASE caregiver_id::text
    WHEN '00000000-0000-0000-0000-000000000003' THEN '11111111-1111-1111-1111-111111111111'::uuid
    WHEN '00000000-0000-0000-0000-000000000004' THEN '22222222-2222-2222-2222-222222222222'::uuid
    ELSE caregiver_id
  END;

-- Update time_logs with new caregiver IDs
UPDATE caregiver_time_logs
SET caregiver_id = CASE caregiver_id::text
  WHEN '00000000-0000-0000-0000-000000000003' THEN '11111111-1111-1111-1111-111111111111'::uuid
  WHEN '00000000-0000-0000-0000-000000000004' THEN '22222222-2222-2222-2222-222222222222'::uuid
  ELSE caregiver_id
END;

-- Restore foreign key constraints
ALTER TABLE patient_conditions
  ADD CONSTRAINT patient_conditions_patient_id_fkey 
  FOREIGN KEY (patient_id) 
  REFERENCES patients(id) 
  ON DELETE CASCADE;

ALTER TABLE patient_caregivers
  ADD CONSTRAINT patient_caregivers_patient_id_fkey 
  FOREIGN KEY (patient_id) 
  REFERENCES patients(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT patient_caregivers_caregiver_id_fkey 
  FOREIGN KEY (caregiver_id) 
  REFERENCES caregivers(id) 
  ON DELETE CASCADE;

ALTER TABLE tasks
  ADD CONSTRAINT tasks_patient_id_fkey 
  FOREIGN KEY (patient_id) 
  REFERENCES patients(id) 
  ON DELETE CASCADE,
  ADD CONSTRAINT tasks_caregiver_id_fkey 
  FOREIGN KEY (caregiver_id) 
  REFERENCES caregivers(id);

ALTER TABLE caregiver_time_logs
  ADD CONSTRAINT caregiver_time_logs_caregiver_id_fkey 
  FOREIGN KEY (caregiver_id) 
  REFERENCES caregivers(id) 
  ON DELETE CASCADE;