# Dashboard Setup Guide

## Overview
The recruiting dashboard adds comprehensive requisition tracking, candidate pipeline visualization, and KPI monitoring to your HireLab platform.

## Features Added

### 1. **Dashboard Page** (`/dashboard`)
- Accessible only to authenticated users
- Real-time data synced with Supabase
- Navigation between Search Builder and Dashboard

### 2. **Requisition Management**
- Create, view, and filter requisitions
- Track status: Open, Interviewing, Offer Extended, Closed
- Set priority levels: Low, Medium, High, Urgent
- Assign hiring managers and departments
- Track target start dates

### 3. **Recruiting Funnel Visualization**
- Visual pipeline showing candidate flow through stages:
  - Applications Received
  - Phone Screens
  - Technical Assessments
  - Onsite Interviews
  - Offers Extended
  - Hires Made
- Conversion rates between stages
- Bar chart visualization

### 4. **Key Performance Indicators (KPIs)**
- Time to Fill (average days per requisition)
- Number of Open Requisitions
- Offer Acceptance Rate
- Total Candidates in Pipeline

## Database Setup

### Step 1: Run the Main Schema (if not already done)
In your Supabase SQL Editor, run:
```sql
-- From supabase/schema.sql
-- (Contains sources, saved_searches, synonyms tables and RLS policies)
```

### Step 2: Run the Dashboard Schema
In your Supabase SQL Editor, run the entire contents of:
```
supabase/dashboard-schema.sql
```

This creates:
- `requisitions` table
- `pipeline_stages` table (with default stages pre-populated)
- `candidates` table
- `candidate_stage_history` table
- All necessary RLS policies
- Indexes for performance

## Usage Guide

### Accessing the Dashboard
1. **Sign In**: Click "Sign In / Sign Up" in the header
2. Enter your email and check for the magic link
3. Once authenticated, click the "Dashboard" button in the header

### Creating Your First Requisition
1. Go to the Dashboard
2. Click "+ Add Requisition"
3. Fill in the form:
   - **Position Title** (required): e.g., "Senior Software Engineer"
   - **Hiring Manager**: e.g., "Jane Smith"
   - **Department**: e.g., "Engineering"
   - **Location**: e.g., "New York, NY"
   - **Priority**: Select from Low, Medium, High, or Urgent
   - **Status**: Select current status
   - **Target Start Date**: Optional
   - **Description**: Job details and requirements
4. Click "Create Requisition"

### Filtering Requisitions
- Use the dropdown filters above the table to filter by:
  - Status (all, open, interviewing, offer_extended, closed)
  - Priority (all, urgent, high, medium, low)

### Navigation
- **From Home → Dashboard**: Click "Dashboard" button (when signed in)
- **From Dashboard → Home**: Click "Search Builder" button or "← Back to Search Builder"

## Data Model

### Requisitions
- Unique to each user
- Tracks position details and hiring progress
- Can be filtered and sorted

### Pipeline Stages
- Shared system-wide (read-only)
- 6 default stages covering typical recruiting pipeline
- Used to track candidate progress

### Candidates
- Linked to requisitions
- Track through pipeline stages
- Source attribution (LinkedIn, referral, etc.)

### Candidate Stage History
- Audit trail of candidate movement
- Timestamps for each stage transition
- Used to calculate conversion rates and time-to-fill

## UI Components

### KPICards
Displays 4 key metrics in a responsive grid:
- Time to Fill
- Open Requisitions
- Offer Acceptance Rate
- Total Candidates

### RecruitingFunnel
Visual funnel chart showing:
- Candidate counts at each stage
- Conversion rates between stages
- Color-coded progress bars

### RequisitionList
Sortable/filterable table with:
- Position details
- Status and priority badges
- Color-coded for quick scanning

### AddRequisitionModal
Modal form for creating new requisitions with:
- Form validation
- Date picker for start dates
- Dropdown selections for status/priority

## Customization

### Adding Custom Pipeline Stages
To add custom stages, run SQL in Supabase:
```sql
INSERT INTO public.pipeline_stages (name, order_index)
VALUES ('Your Custom Stage', 7);
```

### Modifying KPI Calculations
Edit `/app/dashboard/page.tsx` in the `kpiData` calculation section to customize metrics.

### Styling
All components use inline styles for consistency. To modify:
- Edit the `styles` object in each component file
- Colors follow a consistent palette (blue primary, gray neutrals)

## Future Enhancements

Potential additions:
- **Candidate Management**: Full CRUD for candidates
- **Analytics**: Charts and trend analysis
- **Email Integration**: Direct candidate communication
- **Bulk Import**: CSV/Excel upload for requisitions and candidates
- **Reports**: PDF export of dashboards and metrics
- **Calendar Integration**: Interview scheduling
- **Team Collaboration**: Comments and notes on requisitions

## Troubleshooting

### Dashboard shows empty data
- Make sure you've run both SQL schema files in Supabase
- Check that RLS policies are enabled
- Verify you're signed in with the correct user

### Can't create requisitions
- Check browser console for errors
- Verify Supabase connection in `.env.local`
- Ensure you're authenticated

### Navigation not working
- Clear browser cache
- Check that Next.js dev server is running
- Verify no console errors

## File Structure
```
/app/dashboard/page.tsx              # Main dashboard page
/components/dashboard/
  ├── KPICards.tsx                   # KPI metrics display
  ├── RecruitingFunnel.tsx           # Pipeline visualization
  ├── RequisitionList.tsx            # Requisition table
  └── AddRequisitionModal.tsx        # Create requisition form
/lib/dashboard-types.ts              # TypeScript types
/supabase/dashboard-schema.sql       # Database schema
```

## Support
For issues or questions, refer to:
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs


