
-- Enable Row Level Security for reward_catalog table
ALTER TABLE public.reward_catalog ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing rewards (public access for now)
CREATE POLICY "Anyone can view active rewards" 
  ON public.reward_catalog 
  FOR SELECT 
  USING (is_active = true);

-- Create policy for inserting rewards (authenticated users only)
CREATE POLICY "Authenticated users can create rewards" 
  ON public.reward_catalog 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for updating rewards (authenticated users only)
CREATE POLICY "Authenticated users can update rewards" 
  ON public.reward_catalog 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Create policy for deleting rewards (authenticated users only)
CREATE POLICY "Authenticated users can delete rewards" 
  ON public.reward_catalog 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Also enable RLS for reward_redemptions if not already enabled
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies for reward_redemptions
CREATE POLICY "Authenticated users can view redemptions" 
  ON public.reward_redemptions 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create redemptions" 
  ON public.reward_redemptions 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update redemptions" 
  ON public.reward_redemptions 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);
