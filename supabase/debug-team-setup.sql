-- Debug Team Setup for test@recruiter.com
-- This script will help us debug and fix the team setup

-- First, let's check if the test user exists
SELECT 
  id, 
  email, 
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'test@recruiter.com';

-- Check if any teams exist
SELECT 
  id, 
  name, 
  description, 
  owner_id, 
  created_at
FROM public.teams;

-- Check if any team members exist
SELECT 
  tm.id,
  tm.team_id,
  tm.user_id,
  tm.role,
  tm.status,
  u.email,
  t.name as team_name
FROM public.team_members tm
LEFT JOIN auth.users u ON tm.user_id = u.id
LEFT JOIN public.teams t ON tm.team_id = t.id;

-- Now let's create a team for the test user if it doesn't exist
DO $$
DECLARE
  test_user_id uuid;
  new_team_id uuid;
BEGIN
  -- Get the test user ID
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'test@recruiter.com';
  
  IF test_user_id IS NOT NULL THEN
    -- Check if team already exists
    SELECT id INTO new_team_id 
    FROM public.teams 
    WHERE owner_id = test_user_id;
    
    -- Create team if it doesn't exist
    IF new_team_id IS NULL THEN
      INSERT INTO public.teams (name, description, owner_id)
      VALUES ('Test Team', 'Default team for test user', test_user_id)
      RETURNING id INTO new_team_id;
      
      RAISE NOTICE 'Created team with ID: %', new_team_id;
    ELSE
      RAISE NOTICE 'Team already exists with ID: %', new_team_id;
    END IF;
    
    -- Check if team member already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = new_team_id AND user_id = test_user_id
    ) THEN
      -- Add user as team owner
      INSERT INTO public.team_members (team_id, user_id, role, status)
      VALUES (new_team_id, test_user_id, 'owner', 'active');
      
      RAISE NOTICE 'Added user as team owner';
    ELSE
      RAISE NOTICE 'User is already a team member';
    END IF;
  ELSE
    RAISE NOTICE 'Test user not found';
  END IF;
END $$;

-- Verify the setup
SELECT 
  'Teams:' as info,
  id, 
  name, 
  description, 
  owner_id
FROM public.teams;

SELECT 
  'Team Members:' as info,
  tm.id,
  tm.role,
  tm.status,
  u.email,
  t.name as team_name
FROM public.team_members tm
LEFT JOIN auth.users u ON tm.user_id = u.id
LEFT JOIN public.teams t ON tm.team_id = t.id;
