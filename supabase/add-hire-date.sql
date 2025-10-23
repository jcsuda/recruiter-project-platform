-- Add hire_date column to requisitions table

ALTER TABLE public.requisitions
ADD COLUMN IF NOT EXISTS hire_date date;

-- Add a comment to describe the column
COMMENT ON COLUMN public.requisitions.hire_date IS 'The actual date when the position was filled';

