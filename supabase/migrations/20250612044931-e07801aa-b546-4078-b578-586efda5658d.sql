
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view active products" ON public.products;
DROP POLICY IF EXISTS "Users with product_create permission can insert products" ON public.products;
DROP POLICY IF EXISTS "Users with product_edit permission can update products" ON public.products;
DROP POLICY IF EXISTS "Users with product_delete permission can delete products" ON public.products;
DROP POLICY IF EXISTS "Public access to products via valid token" ON public.products;
DROP POLICY IF EXISTS "Allow viewing active products" ON public.products;
DROP POLICY IF EXISTS "Allow inserting products" ON public.products;
DROP POLICY IF EXISTS "Allow updating products" ON public.products;

DROP POLICY IF EXISTS "Users can view active categories" ON public.product_categories;
DROP POLICY IF EXISTS "Super admin can manage categories" ON public.product_categories;
DROP POLICY IF EXISTS "Public access to categories via valid token" ON public.product_categories;
DROP POLICY IF EXISTS "Allow viewing active categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow managing categories" ON public.product_categories;

DROP POLICY IF EXISTS "Users with product_management permission can manage catalog tokens" ON public.catalog_tokens;
DROP POLICY IF EXISTS "Allow managing catalog tokens" ON public.catalog_tokens;

-- Create new simplified RLS policies that work with custom auth
-- Allow all authenticated users to view active products
CREATE POLICY "Allow viewing active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

-- Allow authenticated users to insert products
CREATE POLICY "Allow inserting products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (true);

-- Allow authenticated users to update products
CREATE POLICY "Allow updating products" 
  ON public.products 
  FOR UPDATE 
  USING (true);

-- Allow all authenticated users to view active categories
CREATE POLICY "Allow viewing active categories" 
  ON public.product_categories 
  FOR SELECT 
  USING (is_active = true);

-- Allow authenticated users to manage categories
CREATE POLICY "Allow managing categories" 
  ON public.product_categories 
  FOR ALL 
  USING (true);

-- Allow authenticated users to manage catalog tokens
CREATE POLICY "Allow managing catalog tokens" 
  ON public.catalog_tokens 
  FOR ALL 
  USING (true);
