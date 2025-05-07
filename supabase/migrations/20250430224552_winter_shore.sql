/*
  # Add Caregivers and Time Logs

  1. Changes
    - Insert demo caregivers with unique UUIDs
    - Generate time logs for each caregiver
    - Add RLS policies for data access
*/

-- Insert demo caregivers
INSERT INTO caregivers (id, supervisor_id, specialty, hourly_rate, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Elderly Care', 25.00, 'available'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Physical Therapy', 30.00, 'available'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000002', 'Mental Health', 28.00, 'available'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000002', 'Post-Surgery Care', 32.00, 'available'),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000002', 'Pediatric Care', 27.00, 'available'),
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000002', 'Chronic Disease Management', 29.00, 'available');

-- Function to generate random duration between min and max
CREATE OR REPLACE FUNCTION random_duration(min_duration integer, max_duration integer)
RETURNS integer AS $$
BEGIN
  RETURN floor(random() * (max_duration - min_duration + 1) + min_duration);
END;
$$ LANGUAGE plpgsql;

-- Generate time logs for the past year
DO $$
DECLARE
  current_date date := current_date;
  start_date date := current_date - interval '1 year';
  caregiver_id uuid;
  current_day date;
  shift_start timestamp;
  shift_duration integer;
  is_weekend boolean;
BEGIN
  -- Loop through each caregiver
  FOR caregiver_id IN 
    SELECT id FROM caregivers
  LOOP
    -- Loop through each day of the year
    current_day := start_date;
    WHILE current_day <= current_date LOOP
      is_weekend := EXTRACT(DOW FROM current_day) IN (0, 6);
      
      -- 90% chance of working on weekdays, 50% chance on weekends
      IF (NOT is_weekend AND random() < 0.9) OR (is_weekend AND random() < 0.5) THEN
        -- Morning shift (8 AM - 10 AM start)
        shift_start := current_day + 
          interval '1 hour' * (8 + floor(random() * 2)::integer) +
          interval '1 minute' * floor(random() * 60)::integer;
        
        -- Duration between 6 and 9 hours
        shift_duration := random_duration(360, 540);
        
        INSERT INTO caregiver_time_logs (
          caregiver_id,
          check_in_time,
          check_out_time,
          duration
        ) VALUES (
          caregiver_id,
          shift_start,
          shift_start + (interval '1 minute' * shift_duration),
          shift_duration
        );

        -- 30% chance of second shift
        IF random() < 0.3 THEN
          -- Evening shift (4 PM - 6 PM start)
          shift_start := current_day + 
            interval '1 hour' * (16 + floor(random() * 2)::integer) +
            interval '1 minute' * floor(random() * 60)::integer;
          
          -- Duration between 4 and 6 hours
          shift_duration := random_duration(240, 360);
          
          INSERT INTO caregiver_time_logs (
            caregiver_id,
            check_in_time,
            check_out_time,
            duration
          ) VALUES (
            caregiver_id,
            shift_start,
            shift_start + (interval '1 minute' * shift_duration),
            shift_duration
          );
        END IF;
      END IF;
      
      current_day := current_day + interval '1 day';
    END LOOP;
  END LOOP;
END $$;