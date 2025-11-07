-- Sample data for testing the recruiting funnel
-- Run this in your Supabase SQL Editor

-- First, let's add some sample pipeline stages if they don't exist
INSERT INTO public.pipeline_stages (name, description, order_index) 
VALUES 
  ('Applications Received', 'Initial applications submitted', 1),
  ('Phone Screens', 'Initial phone screening interviews', 2),
  ('Technical Assessments', 'Technical coding challenges or assessments', 3),
  ('Onsite Interviews', 'In-person or video final interviews', 4),
  ('Offers Extended', 'Job offers sent to candidates', 5),
  ('Hires Made', 'Candidates who accepted offers and were hired', 6)
ON CONFLICT (name) DO NOTHING;

-- Add some sample candidates with different stages and statuses
-- Note: You'll need to replace 'your-user-id-here' with your actual user ID from auth.users
-- You can get this by running: SELECT id FROM auth.users LIMIT 1;

DO $$
DECLARE
  user_uuid uuid;
  app_stage_id uuid;
  phone_stage_id uuid;
  tech_stage_id uuid;
  onsite_stage_id uuid;
  offer_stage_id uuid;
  hire_stage_id uuid;
BEGIN
  -- Get the first user ID
  SELECT id INTO user_uuid FROM auth.users LIMIT 1;
  
  -- Get stage IDs
  SELECT id INTO app_stage_id FROM pipeline_stages WHERE name = 'Applications Received';
  SELECT id INTO phone_stage_id FROM pipeline_stages WHERE name = 'Phone Screens';
  SELECT id INTO tech_stage_id FROM pipeline_stages WHERE name = 'Technical Assessments';
  SELECT id INTO onsite_stage_id FROM pipeline_stages WHERE name = 'Onsite Interviews';
  SELECT id INTO offer_stage_id FROM pipeline_stages WHERE name = 'Offers Extended';
  SELECT id INTO hire_stage_id FROM pipeline_stages WHERE name = 'Hires Made';

  -- Insert sample candidates
  INSERT INTO public.candidates (
    user_id, name, email, phone, position_applied, current_stage_id, 
    status, source, notes, created_at, updated_at
  ) VALUES 
    -- Applications Received (5 candidates)
    (user_uuid, 'John Smith', 'john.smith@email.com', '555-0101', 'Software Engineer', app_stage_id, 'active', 'LinkedIn', 'Strong background in React', now(), now()),
    (user_uuid, 'Sarah Johnson', 'sarah.j@email.com', '555-0102', 'Product Manager', app_stage_id, 'active', 'GitHub', 'Experienced PM with startup background', now(), now()),
    (user_uuid, 'Mike Chen', 'mike.chen@email.com', '555-0103', 'Data Scientist', app_stage_id, 'active', 'Stack Overflow', 'PhD in Statistics', now(), now()),
    (user_uuid, 'Emily Davis', 'emily.davis@email.com', '555-0104', 'UX Designer', app_stage_id, 'active', 'Dribbble', 'Portfolio shows great design skills', now(), now()),
    (user_uuid, 'Alex Rodriguez', 'alex.r@email.com', '555-0105', 'DevOps Engineer', app_stage_id, 'active', 'LinkedIn', 'AWS certified', now(), now()),

    -- Phone Screens (3 candidates)
    (user_uuid, 'Jessica Brown', 'jessica.brown@email.com', '555-0106', 'Software Engineer', phone_stage_id, 'active', 'LinkedIn', 'Passed initial screening', now(), now()),
    (user_uuid, 'David Wilson', 'david.wilson@email.com', '555-0107', 'Product Manager', phone_stage_id, 'active', 'GitHub', 'Strong communication skills', now(), now()),
    (user_uuid, 'Lisa Anderson', 'lisa.anderson@email.com', '555-0108', 'Data Scientist', phone_stage_id, 'active', 'Stack Overflow', 'Technical phone screen completed', now(), now()),

    -- Technical Assessments (2 candidates)
    (user_uuid, 'Tom Martinez', 'tom.martinez@email.com', '555-0109', 'Software Engineer', tech_stage_id, 'active', 'LinkedIn', 'Excellent coding assessment', now(), now()),
    (user_uuid, 'Rachel Green', 'rachel.green@email.com', '555-0110', 'DevOps Engineer', tech_stage_id, 'active', 'GitHub', 'Strong system design knowledge', now(), now()),

    -- Onsite Interviews (1 candidate)
    (user_uuid, 'Kevin Lee', 'kevin.lee@email.com', '555-0111', 'Software Engineer', onsite_stage_id, 'active', 'LinkedIn', 'Final interview scheduled', now(), now()),

    -- Offers Extended (1 candidate)
    (user_uuid, 'Amanda Taylor', 'amanda.taylor@email.com', '555-0112', 'Product Manager', offer_stage_id, 'active', 'LinkedIn', 'Offer pending response', now(), now()),

    -- Hires Made (1 candidate)
    (user_uuid, 'Chris Miller', 'chris.miller@email.com', '555-0113', 'Data Scientist', hire_stage_id, 'hired', 'Stack Overflow', 'Accepted offer and started', now(), now()),

    -- Rejected candidates (3 candidates)
    (user_uuid, 'Mark Thompson', 'mark.thompson@email.com', '555-0114', 'Software Engineer', app_stage_id, 'rejected', 'LinkedIn', 'Did not meet minimum requirements', now(), now()),
    (user_uuid, 'Jennifer White', 'jennifer.white@email.com', '555-0115', 'UX Designer', phone_stage_id, 'rejected', 'Dribbble', 'Portfolio not suitable', now(), now()),
    (user_uuid, 'Robert Garcia', 'robert.garcia@email.com', '555-0116', 'DevOps Engineer', tech_stage_id, 'rejected', 'GitHub', 'Technical skills insufficient', now(), now()),

    -- Withdrawn candidates (2 candidates)
    (user_uuid, 'Michelle Clark', 'michelle.clark@email.com', '555-0117', 'Product Manager', app_stage_id, 'withdrawn', 'LinkedIn', 'Accepted another offer', now(), now()),
    (user_uuid, 'James Lewis', 'james.lewis@email.com', '555-0118', 'Software Engineer', phone_stage_id, 'withdrawn', 'GitHub', 'Decided not to proceed', now(), now());

END $$;


