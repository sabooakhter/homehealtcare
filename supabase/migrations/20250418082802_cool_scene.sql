-- Drop existing policies
DROP POLICY IF EXISTS "Admins can do everything with users" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;

-- Create improved policies without recursion
CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM users u
        WHERE u.auth_id = au.id
        AND u.role = 'admin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM users u
        WHERE u.auth_id = au.id
        AND u.role = 'admin'
      )
    )
  );

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- Ensure auth_id is not null and unique
ALTER TABLE users
  ALTER COLUMN auth_id SET NOT NULL,
  ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);

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
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  
  -- Insert new user
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    auth_id,
    status,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    NEW.email,
    user_name,
    user_role,
    NEW.id,
    'active',
    now(),
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();