/*
  # Add Time Logs Data

  1. Changes
    - Add sample time log data for caregivers spanning a full year
    - Include regular and overtime hours
    - Simulate realistic work patterns
*/

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