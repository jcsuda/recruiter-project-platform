-- Fix Team RLS Policies
-- This script fixes the infinite recursion issue in team_members policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage team members" ON public.team_members;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view their own team memberships" ON public.team_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view team members of teams they own" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage team members" ON public.team_members
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams WHERE owner_id = auth.uid()
    )
  );

-- Also fix the teams policies to be simpler
DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
DROP POLICY IF EXISTS "Team owners can manage their teams" ON public.teams;

CREATE POLICY "Users can view teams they own" ON public.teams
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can manage their own teams" ON public.teams
  FOR ALL USING (owner_id = auth.uid());
