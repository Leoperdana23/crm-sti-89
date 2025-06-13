
-- Drop existing policies yang mungkin terlalu restrictive
DROP POLICY IF EXISTS "Allow authenticated users to view products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to create products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON public.products;

-- Create new policies yang lebih permisif untuk authenticated users
CREATE POLICY "Enable all operations for authenticated users on products" 
ON public.products 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Juga pastikan policy untuk public read access tetap ada
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
ON public.products 
FOR SELECT 
TO public 
USING (true);
