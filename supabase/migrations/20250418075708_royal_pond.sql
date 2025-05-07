-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_name text;
BEGIN
  -- Set default role if not provided
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'supervisor');
  
  -- Validate role
  IF user_role NOT IN ('admin', 'supervisor') THEN
    user_role := 'supervisor';
  END IF;
  
  -- Set name, defaulting to email if not provided
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
  
  -- Insert new user if they don't exist
  INSERT INTO public.users (id, email, name, role, auth_id, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    NEW.email,
    user_name,
    user_role,
    NEW.id,
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    auth_id = NEW.id,
    updated_at = now()
  WHERE users.auth_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
