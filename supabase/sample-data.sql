-- Sample data for testing the recruiting funnel
-- Run this in your Supabase SQL Editor

-- First, let's add some sample pipeline stages if they don't exist
INSERT INTO public.pipeline_stages (name, order_index)
VALUES
  ('Applications Received', 1),
  ('Phone Screens', 2),
  ('Technical Assessments', 3),
  ('Onsite Interviews', 4),
  ('Offers Extended', 5),
  ('Hires Made', 6)
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
    user_id, name, email, phone, current_stage_id,
    status, source, notes, created_at, updated_at
  ) VALUES
    -- Applications Received (5 candidates)
    (user_uuid, 'John Smith', 'john.smith@email.com', '555-0101', app_stage_id, 'active', 'LinkedIn', 'Strong background in React — Software Engineer applicant', now(), now()),
    (user_uuid, 'Sarah Johnson', 'sarah.j@email.com', '555-0102', app_stage_id, 'active', 'GitHub', 'Experienced PM with startup background — Product Manager applicant', now(), now()),
    (user_uuid, 'Mike Chen', 'mike.chen@email.com', '555-0103', app_stage_id, 'active', 'Stack Overflow', 'PhD in Statistics — Data Scientist applicant', now(), now()),
    (user_uuid, 'Emily Davis', 'emily.davis@email.com', '555-0104', app_stage_id, 'active', 'Dribbble', 'Portfolio shows great design skills — UX Designer applicant', now(), now()),
    (user_uuid, 'Alex Rodriguez', 'alex.r@email.com', '555-0105', app_stage_id, 'active', 'LinkedIn', 'AWS certified — DevOps Engineer applicant', now(), now()),

    -- Phone Screens (3 candidates)
    (user_uuid, 'Jessica Brown', 'jessica.brown@email.com', '555-0106', phone_stage_id, 'active', 'LinkedIn', 'Passed initial screening — Software Engineer applicant', now(), now()),
    (user_uuid, 'David Wilson', 'david.wilson@email.com', '555-0107', phone_stage_id, 'active', 'GitHub', 'Strong communication skills — Product Manager applicant', now(), now()),
    (user_uuid, 'Lisa Anderson', 'lisa.anderson@email.com', '555-0108', phone_stage_id, 'active', 'Stack Overflow', 'Technical phone screen completed — Data Scientist applicant', now(), now()),

    -- Technical Assessments (2 candidates)
    (user_uuid, 'Tom Martinez', 'tom.martinez@email.com', '555-0109', tech_stage_id, 'active', 'LinkedIn', 'Excellent coding assessment — Software Engineer applicant', now(), now()),
    (user_uuid, 'Rachel Green', 'rachel.green@email.com', '555-0110', tech_stage_id, 'active', 'GitHub', 'Strong system design knowledge — DevOps Engineer applicant', now(), now()),

    -- Onsite Interviews (1 candidate)
    (user_uuid, 'Kevin Lee', 'kevin.lee@email.com', '555-0111', onsite_stage_id, 'active', 'LinkedIn', 'Final interview scheduled — Software Engineer applicant', now(), now()),

    -- Offers Extended (1 candidate)
    (user_uuid, 'Amanda Taylor', 'amanda.taylor@email.com', '555-0112', offer_stage_id, 'active', 'LinkedIn', 'Offer pending response — Product Manager applicant', now(), now()),

    -- Hires Made (1 candidate)
    (user_uuid, 'Chris Miller', 'chris.miller@email.com', '555-0113', hire_stage_id, 'hired', 'Stack Overflow', 'Accepted offer and started — Data Scientist', now(), now()),

    -- Rejected candidates (3 candidates)
    (user_uuid, 'Mark Thompson', 'mark.thompson@email.com', '555-0114', app_stage_id, 'rejected', 'LinkedIn', 'Did not meet minimum requirements — Software Engineer applicant', now(), now()),
    (user_uuid, 'Jennifer White', 'jennifer.white@email.com', '555-0115', phone_stage_id, 'rejected', 'Dribbble', 'Portfolio not suitable — UX Designer applicant', now(), now()),
    (user_uuid, 'Robert Garcia', 'robert.garcia@email.com', '555-0116', tech_stage_id, 'rejected', 'GitHub', 'Technical skills insufficient — DevOps Engineer applicant', now(), now()),

    -- Withdrawn candidates (2 candidates)
    (user_uuid, 'Michelle Clark', 'michelle.clark@email.com', '555-0117', app_stage_id, 'withdrawn', 'LinkedIn', 'Accepted another offer — Product Manager applicant', now(), now()),
    (user_uuid, 'James Lewis', 'james.lewis@email.com', '555-0118', phone_stage_id, 'withdrawn', 'GitHub', 'Decided not to proceed — Software Engineer applicant', now(), now());

END $$;



