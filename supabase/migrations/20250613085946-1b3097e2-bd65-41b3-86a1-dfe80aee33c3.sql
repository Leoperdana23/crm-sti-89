
-- Enable RLS on products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to view products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to create products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON public.products;

-- Create policies for products table
-- Allow authenticated users to view all active products
CREATE POLICY "Allow authenticated users to view products" 
ON public.products 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- Allow authenticated users to create products
CREATE POLICY "Allow authenticated users to create products" 
ON public.products 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to update products
CREATE POLICY "Allow authenticated users to update products" 
ON public.products 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to delete products (soft delete by setting is_active = false)
CREATE POLICY "Allow authenticated users to delete products" 
ON public.products 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Also ensure product_categories has proper RLS policies
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for product_categories if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow authenticated users to create categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update categories" ON public.product_categories;

-- Create policies for product_categories table
CREATE POLICY "Allow authenticated users to view categories" 
ON public.product_categories 
FOR SELECT 
TO authenticated 
USING (is_active = true);

CREATE POLICY "Allow authenticated users to create categories" 
ON public.product_categories 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update categories" 
ON public.product_categories 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);
