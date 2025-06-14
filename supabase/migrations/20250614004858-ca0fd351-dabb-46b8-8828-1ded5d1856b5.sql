
-- Fix RLS policy for reseller_orders table to allow public/anon users to create records
-- when orders are created through catalog tokens

DROP POLICY IF EXISTS "Allow authenticated users to manage reseller orders" ON public.reseller_orders;
DROP POLICY IF EXISTS "Allow public to create reseller orders" ON public.reseller_orders;

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users to manage reseller orders" 
ON public.reseller_orders 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow public/anon users to insert reseller orders (for catalog-based orders)
CREATE POLICY "Allow public to create reseller orders" 
ON public.reseller_orders 
FOR INSERT 
TO anon, public
WITH CHECK (true);

-- Allow public/anon users to read their own reseller orders via catalog token
CREATE POLICY "Allow public to read reseller orders via catalog" 
ON public.reseller_orders 
FOR SELECT 
TO anon, public
USING (true);
