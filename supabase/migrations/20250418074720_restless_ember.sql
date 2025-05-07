CREATE OR REPLACE FUNCTION handle_check_out(
  p_caregiver_id uuid,
  p_check_in_time timestamptz,
  p_check_out_time timestamptz,
  p_duration integer
) RETURNS void AS $$
BEGIN
  -- Update caregiver status
  UPDATE caregivers
  SET 
    status = 'checked_out',
    check_out_time = p_check_out_time
  WHERE id = p_caregiver_id;

  -- Insert time log
  INSERT INTO caregiver_time_logs (
    caregiver_id,
    check_in_time,
    check_out_time,
    duration
  ) VALUES (
    p_caregiver_id,
    p_check_in_time,
    p_check_out_time,
    p_duration
  );
END;
$$ LANGUAGE plpgsql;