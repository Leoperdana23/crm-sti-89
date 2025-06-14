
-- Fix RLS policies for reward_redemptions table to allow proper access

-- Disable RLS temporarily to reset everything
ALTER TABLE public.reward_redemptions DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "Authenticated users can view redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Authenticated users can create redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Authenticated users can update redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Allow authenticated users to view all redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Allow authenticated users to insert redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Allow authenticated users to update redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Allow authenticated users to delete redemptions" ON public.reward_redemptions;

-- Create new simple policies that definitely work
CREATE POLICY "reward_redemptions_select_policy" 
  ON public.reward_redemptions 
  FOR SELECT 
  USING (true);

CREATE POLICY "reward_redemptions_insert_policy" 
  ON public.reward_redemptions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "reward_redemptions_update_policy" 
  ON public.reward_redemptions 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "reward_redemptions_delete_policy" 
  ON public.reward_redemptions 
  FOR DELETE 
  USING (true);

-- Grant necessary permissions
GRANT ALL ON public.reward_redemptions TO authenticated;
GRANT ALL ON public.reward_redemptions TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
