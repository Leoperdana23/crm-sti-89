
-- Drop all existing policies for reward_catalog
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Authenticated users can view all rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Authenticated users can create rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Authenticated users can update rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Authenticated users can delete rewards" ON public.reward_catalog;

-- Create comprehensive policies for reward_catalog that allow all operations for authenticated users
CREATE POLICY "Allow authenticated users to view all rewards" 
  ON public.reward_catalog 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert rewards" 
  ON public.reward_catalog 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update rewards" 
  ON public.reward_catalog 
  FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete rewards" 
  ON public.reward_catalog 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Also update reward_redemptions policies to be more permissive for authenticated users
DROP POLICY IF EXISTS "Authenticated users can view redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Authenticated users can create redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Authenticated users can update redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Allow authenticated users to view all redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Allow authenticated users to insert redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Allow authenticated users to update redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Allow authenticated users to delete redemptions" ON public.reward_redemptions;

CREATE POLICY "Allow authenticated users to view all redemptions" 
  ON public.reward_redemptions 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to insert redemptions" 
  ON public.reward_redemptions 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update redemptions" 
  ON public.reward_redemptions 
  FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete redemptions" 
  ON public.reward_redemptions 
  FOR DELETE 
  TO authenticated 
  USING (true);
