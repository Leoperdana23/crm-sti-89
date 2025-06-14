
-- Drop the existing policy that only shows active rewards
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.reward_catalog;

-- Create new policy that allows authenticated users to view all rewards
CREATE POLICY "Authenticated users can view all rewards" 
  ON public.reward_catalog 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);
