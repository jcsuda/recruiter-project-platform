-- Final test user setup with correct table structure
-- Run this in your Supabase SQL Editor

-- First, let's check if the test user exists
SELECT id, email, created_at FROM auth.users WHERE email = 'test@recruiter.com';

-- If the user exists, let's get their ID and populate data
DO $$
DECLARE
  test_user_id uuid;
  app_stage_id uuid;
  phone_stage_id uuid;
  tech_stage_id uuid;
  onsite_stage_id uuid;
  offer_stage_id uuid;
  hire_stage_id uuid;
BEGIN
  -- Get the test user ID
  SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@recruiter.com' LIMIT 1;
  
  -- Check if user exists
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'Test user not found. Please create a user with email: test@recruiter.com first in Supabase Auth UI';
    RAISE NOTICE 'Go to: Authentication > Users > Add User';
    RAISE NOTICE 'Email: test@recruiter.com';
    RAISE NOTICE 'Password: testpassword123';
    RAISE NOTICE 'Auto Confirm User: Yes';
    RETURN;
  END IF;

  RAISE NOTICE 'Found test user with ID: %', test_user_id;

  -- Clear existing data for this user
  DELETE FROM public.candidates WHERE user_id = test_user_id;
  DELETE FROM public.requisitions WHERE user_id = test_user_id;
  DELETE FROM public.saved_searches WHERE user_id = test_user_id;

  -- Get existing stage IDs (they should already exist from the schema)
  SELECT id INTO app_stage_id FROM pipeline_stages WHERE name = 'Applications Received';
  SELECT id INTO phone_stage_id FROM pipeline_stages WHERE name = 'Phone Screens';
  SELECT id INTO tech_stage_id FROM pipeline_stages WHERE name = 'Technical Assessments';
  SELECT id INTO onsite_stage_id FROM pipeline_stages WHERE name = 'Onsite Interviews';
  SELECT id INTO offer_stage_id FROM pipeline_stages WHERE name = 'Offers Extended';
  SELECT id INTO hire_stage_id FROM pipeline_stages WHERE name = 'Hires Made';

  -- Check if stages exist
  IF app_stage_id IS NULL THEN
    RAISE NOTICE 'Pipeline stages not found. Please run the dashboard schema first.';
    RETURN;
  END IF;

  RAISE NOTICE 'Found pipeline stages, proceeding with data insertion...';

  -- Insert sample requisitions
  INSERT INTO public.requisitions (
    user_id, position_title, hiring_manager, department, location, 
    priority, status, target_start_date, hire_date, description, created_at, updated_at
  ) VALUES 
    (test_user_id, 'Senior Software Engineer', 'Sarah Johnson', 'Engineering', 'San Francisco, CA', 'high', 'open', '2024-02-15', NULL, 'Looking for a senior engineer with React and Node.js experience', '2024-01-15', '2024-01-15'),
    (test_user_id, 'Product Manager', 'Mike Chen', 'Product', 'Austin, TX', 'medium', 'interviewing', '2024-03-01', NULL, 'Product manager for our mobile app team', '2024-01-10', '2024-01-20'),
    (test_user_id, 'UX Designer', 'Emily Davis', 'Design', 'New York, NY', 'high', 'offer_extended', '2024-02-28', '2024-02-20', 'Senior UX designer for web platform', '2024-01-05', '2024-01-25'),
    (test_user_id, 'Data Scientist', 'Alex Rodriguez', 'Analytics', 'Seattle, WA', 'low', 'closed', '2024-01-30', '2024-01-25', 'Data scientist for machine learning projects', '2023-12-20', '2024-01-25'),
    (test_user_id, 'DevOps Engineer', 'Jessica Brown', 'Engineering', 'Remote', 'medium', 'open', '2024-03-15', NULL, 'DevOps engineer for cloud infrastructure', '2024-01-20', '2024-01-20'),
    (test_user_id, 'Marketing Manager', 'David Wilson', 'Marketing', 'Los Angeles, CA', 'low', 'open', '2024-04-01', NULL, 'Marketing manager for growth initiatives', '2024-01-25', '2024-01-25');

  -- Insert sample candidates (without position_applied column)
  INSERT INTO public.candidates (
    user_id, name, email, phone, current_stage_id, 
    status, source, notes, created_at, updated_at
  ) VALUES 
    -- Applications Received (8 candidates)
    (test_user_id, 'John Smith', 'john.smith@email.com', '555-0101', app_stage_id, 'active', 'LinkedIn', 'Strong background in React and TypeScript', now(), now()),
    (test_user_id, 'Sarah Johnson', 'sarah.j@email.com', '555-0102', app_stage_id, 'active', 'GitHub', 'Experienced PM with startup background', now(), now()),
    (test_user_id, 'Mike Chen', 'mike.chen@email.com', '555-0103', app_stage_id, 'active', 'Stack Overflow', 'PhD in Statistics, 5 years experience', now(), now()),
    (test_user_id, 'Emily Davis', 'emily.davis@email.com', '555-0104', app_stage_id, 'active', 'Dribbble', 'Portfolio shows excellent design skills', now(), now()),
    (test_user_id, 'Alex Rodriguez', 'alex.r@email.com', '555-0105', app_stage_id, 'active', 'LinkedIn', 'AWS certified, Kubernetes expert', now(), now()),
    (test_user_id, 'Jessica Brown', 'jessica.brown@email.com', '555-0106', app_stage_id, 'active', 'LinkedIn', 'Digital marketing specialist', now(), now()),
    (test_user_id, 'David Wilson', 'david.wilson@email.com', '555-0107', app_stage_id, 'active', 'GitHub', 'Full-stack developer with 8 years experience', now(), now()),
    (test_user_id, 'Lisa Anderson', 'lisa.anderson@email.com', '555-0108', app_stage_id, 'active', 'Stack Overflow', 'Technical product manager background', now(), now()),

    -- Phone Screens (5 candidates)
    (test_user_id, 'Tom Martinez', 'tom.martinez@email.com', '555-0109', phone_stage_id, 'active', 'LinkedIn', 'Passed initial screening, strong communication', now(), now()),
    (test_user_id, 'Rachel Green', 'rachel.green@email.com', '555-0110', phone_stage_id, 'active', 'GitHub', 'Strong system design knowledge', now(), now()),
    (test_user_id, 'Kevin Lee', 'kevin.lee@email.com', '555-0111', phone_stage_id, 'active', 'Dribbble', 'User research experience', now(), now()),
    (test_user_id, 'Amanda Taylor', 'amanda.taylor@email.com', '555-0112', phone_stage_id, 'active', 'LinkedIn', 'B2B SaaS experience', now(), now()),
    (test_user_id, 'Chris Miller', 'chris.miller@email.com', '555-0113', phone_stage_id, 'active', 'Stack Overflow', 'Machine learning expertise', now(), now()),

    -- Technical Assessments (3 candidates)
    (test_user_id, 'Mark Thompson', 'mark.thompson@email.com', '555-0114', tech_stage_id, 'active', 'LinkedIn', 'Excellent coding assessment results', now(), now()),
    (test_user_id, 'Jennifer White', 'jennifer.white@email.com', '555-0115', tech_stage_id, 'active', 'GitHub', 'Strong infrastructure knowledge', now(), now()),
    (test_user_id, 'Robert Garcia', 'robert.garcia@email.com', '555-0116', tech_stage_id, 'active', 'Dribbble', 'Design system expertise', now(), now()),

    -- Onsite Interviews (2 candidates)
    (test_user_id, 'Michelle Clark', 'michelle.clark@email.com', '555-0117', onsite_stage_id, 'active', 'LinkedIn', 'Final interview scheduled for next week', now(), now()),
    (test_user_id, 'James Lewis', 'james.lewis@email.com', '555-0118', onsite_stage_id, 'active', 'GitHub', 'Panel interview completed', now(), now()),

    -- Offers Extended (1 candidate)
    (test_user_id, 'Nicole Adams', 'nicole.adams@email.com', '555-0119', offer_stage_id, 'active', 'Dribbble', 'Offer pending response, deadline Friday', now(), now()),

    -- Hires Made (1 candidate)
    (test_user_id, 'Daniel Kim', 'daniel.kim@email.com', '555-0120', hire_stage_id, 'hired', 'Stack Overflow', 'Accepted offer and started last week', now(), now()),

    -- Rejected candidates (4 candidates)
    (test_user_id, 'Steve Johnson', 'steve.johnson@email.com', '555-0121', app_stage_id, 'rejected', 'LinkedIn', 'Did not meet minimum requirements', now(), now()),
    (test_user_id, 'Maria Rodriguez', 'maria.rodriguez@email.com', '555-0122', phone_stage_id, 'rejected', 'Dribbble', 'Portfolio not suitable for our needs', now(), now()),
    (test_user_id, 'Paul Wilson', 'paul.wilson@email.com', '555-0123', tech_stage_id, 'rejected', 'GitHub', 'Technical skills insufficient', now(), now()),
    (test_user_id, 'Anna Davis', 'anna.davis@email.com', '555-0124', phone_stage_id, 'rejected', 'LinkedIn', 'Lacked relevant industry experience', now(), now()),

    -- Withdrawn candidates (3 candidates)
    (test_user_id, 'Carlos Martinez', 'carlos.martinez@email.com', '555-0125', app_stage_id, 'withdrawn', 'LinkedIn', 'Accepted another offer', now(), now()),
    (test_user_id, 'Sophie Brown', 'sophie.brown@email.com', '555-0126', phone_stage_id, 'withdrawn', 'GitHub', 'Decided not to proceed with application', now(), now()),
    (test_user_id, 'Ryan Taylor', 'ryan.taylor@email.com', '555-0127', app_stage_id, 'withdrawn', 'Stack Overflow', 'Changed career direction', now(), now());

  -- Insert sample saved searches
  INSERT INTO public.saved_searches (
    user_id, name, source_key, params, created_at
  ) VALUES 
    (test_user_id, 'React Developers SF', 'linkedin', '{"role": "React Developer", "include": ["React", "JavaScript", "TypeScript"], "exclude": ["recruiter"], "location": "San Francisco", "education": "bachelors"}', now()),
    (test_user_id, 'Product Managers Austin', 'linkedin', '{"role": "Product Manager", "include": ["Product Management", "Agile", "Scrum"], "exclude": ["recruiter"], "location": "Austin", "education": "masters"}', now()),
    (test_user_id, 'DevOps Engineers Remote', 'github', '{"role": "DevOps Engineer", "include": ["AWS", "Kubernetes", "Docker"], "exclude": ["recruiter"], "location": "Remote"}', now()),
    (test_user_id, 'JavaScript Questions', 'stackoverflow', '{"role": "javascript async await promises"}', now()),
    (test_user_id, 'UX Designers NYC', 'dribbble', '{"role": "UX Designer", "include": ["User Experience", "Figma", "Prototyping"], "exclude": ["recruiter"], "location": "New York"}', now());

  RAISE NOTICE 'SUCCESS: Test data setup complete for user: %', test_user_id;
  RAISE NOTICE 'Created: 6 requisitions, 25 candidates, 5 saved searches';
  
END $$;
