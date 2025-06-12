
-- Disable RLS for branches table to allow all authenticated users to add branches
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;

-- Disable RLS for customers table to allow all authenticated users to add customers  
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Disable RLS for sales table to allow all authenticated users to add sales
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;

-- Optional: If you want to re-enable RLS later with proper policies, you can use these policies:
-- For branches - allow all authenticated users to manage branches
-- CREATE POLICY "Allow all authenticated users to manage branches" 
--   ON public.branches 
--   FOR ALL 
--   TO authenticated 
--   USING (true) 
--   WITH CHECK (true);

-- For customers - allow all authenticated users to manage customers
-- CREATE POLICY "Allow all authenticated users to manage customers" 
--   ON public.customers 
--   FOR ALL 
--   TO authenticated 
--   USING (true) 
--   WITH CHECK (true);

-- For sales - allow all authenticated users to manage sales
-- CREATE POLICY "Allow all authenticated users to manage sales" 
--   ON public.sales 
--   FOR ALL 
--   TO authenticated 
--   USING (true) 
--   WITH CHECK (true);
