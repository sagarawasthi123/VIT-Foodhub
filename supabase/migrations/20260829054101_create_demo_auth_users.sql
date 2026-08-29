
-- Create demo auth users for testing
DO $$
DECLARE
  v_student_id uuid;
  v_shopkeeper_id uuid;
  v_admin_id uuid;
  v_burger_house_id uuid;
  v_existing_count integer;
BEGIN
  -- Student
  SELECT count(*) INTO v_existing_count FROM auth.users WHERE email = 'arjun.sharma2023@vitstudent.ac.in';
  IF v_existing_count = 0 THEN
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, raw_app_meta_data, raw_user_meta_data)
    VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'arjun.sharma2023@vitstudent.ac.in', crypt('password', gen_salt('bf')), now(), now(), '{}'::jsonb, '{}'::jsonb)
    RETURNING id INTO v_student_id;
  ELSE
    SELECT id INTO v_student_id FROM auth.users WHERE email = 'arjun.sharma2023@vitstudent.ac.in';
  END IF;

  -- Shopkeeper
  SELECT count(*) INTO v_existing_count FROM auth.users WHERE email = 'ravi.kumar@vit.ac.in';
  IF v_existing_count = 0 THEN
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, raw_app_meta_data, raw_user_meta_data)
    VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'ravi.kumar@vit.ac.in', crypt('password', gen_salt('bf')), now(), now(), '{}'::jsonb, '{}'::jsonb)
    RETURNING id INTO v_shopkeeper_id;
  ELSE
    SELECT id INTO v_shopkeeper_id FROM auth.users WHERE email = 'ravi.kumar@vit.ac.in';
  END IF;

  -- Admin
  SELECT count(*) INTO v_existing_count FROM auth.users WHERE email = 'sunita.menon@vit.ac.in';
  IF v_existing_count = 0 THEN
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, raw_app_meta_data, raw_user_meta_data)
    VALUES ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
      'sunita.menon@vit.ac.in', crypt('password', gen_salt('bf')), now(), now(), '{}'::jsonb, '{}'::jsonb)
    RETURNING id INTO v_admin_id;
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'sunita.menon@vit.ac.in';
  END IF;

  -- Profiles
  INSERT INTO profiles (id, name, email, role, reg_no, status)
  VALUES (v_student_id, 'Arjun Sharma', 'arjun.sharma2023@vitstudent.ac.in', 'student', '23BCE1045', 'active')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, name, email, role, reg_no, status)
  VALUES (v_shopkeeper_id, 'Ravi Kumar', 'ravi.kumar@vit.ac.in', 'shopkeeper', 'EMP2019', 'active')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO profiles (id, name, email, role, reg_no, status)
  VALUES (v_admin_id, 'Sunita Menon', 'sunita.menon@vit.ac.in', 'admin', 'EMP2017', 'active')
  ON CONFLICT (id) DO NOTHING;

  -- Assign shopkeeper to Burger House
  SELECT id INTO v_burger_house_id FROM shops WHERE name = 'Burger House' LIMIT 1;
  IF v_burger_house_id IS NOT NULL THEN
    UPDATE shops SET shopkeeper_id = v_shopkeeper_id WHERE id = v_burger_house_id;
  END IF;
END $$;
