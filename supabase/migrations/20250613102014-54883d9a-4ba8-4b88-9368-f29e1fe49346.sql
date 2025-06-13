
-- Update RLS policies for products table to allow proper access
DROP POLICY IF EXISTS "Allow authenticated users to view products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to create products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON public.products;

-- Create more permissive policies for authenticated users
CREATE POLICY "Allow authenticated users to view products" 
ON public.products 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to create products" 
ON public.products 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update products" 
ON public.products 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete products" 
ON public.products 
FOR DELETE 
TO authenticated 
USING (true);
