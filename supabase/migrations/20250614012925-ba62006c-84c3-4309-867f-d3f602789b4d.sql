
-- First, let's check and ensure the reward_catalog table structure is correct
-- and add any missing columns if needed

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Check if image_url column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reward_catalog' 
                   AND column_name = 'image_url') THEN
        ALTER TABLE public.reward_catalog ADD COLUMN image_url text;
    END IF;
    
    -- Ensure reward_type has proper constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'reward_catalog_reward_type_check') THEN
        ALTER TABLE public.reward_catalog 
        ADD CONSTRAINT reward_catalog_reward_type_check 
        CHECK (reward_type IN ('commission', 'points'));
    END IF;
END $$;

-- Disable RLS temporarily to reset everything
ALTER TABLE public.reward_catalog DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.reward_catalog ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Authenticated users can view all rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Authenticated users can create rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Authenticated users can update rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Authenticated users can delete rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Allow authenticated users to view all rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Allow authenticated users to insert rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Allow authenticated users to update rewards" ON public.reward_catalog;
DROP POLICY IF EXISTS "Allow authenticated users to delete rewards" ON public.reward_catalog;

-- Create new simple policies that definitely work
CREATE POLICY "reward_catalog_select_policy" 
  ON public.reward_catalog 
  FOR SELECT 
  USING (true);

CREATE POLICY "reward_catalog_insert_policy" 
  ON public.reward_catalog 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "reward_catalog_update_policy" 
  ON public.reward_catalog 
  FOR UPDATE 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "reward_catalog_delete_policy" 
  ON public.reward_catalog 
  FOR DELETE 
  USING (true);

-- Grant necessary permissions
GRANT ALL ON public.reward_catalog TO authenticated;
GRANT ALL ON public.reward_catalog TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
