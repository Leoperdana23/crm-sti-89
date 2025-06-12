
-- Disable Row Level Security on product-related tables since we're using custom auth
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_tokens DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies since we're disabling RLS
DROP POLICY IF EXISTS "Allow viewing active products" ON public.products;
DROP POLICY IF EXISTS "Allow inserting products" ON public.products;
DROP POLICY IF EXISTS "Allow updating products" ON public.products;
DROP POLICY IF EXISTS "Allow viewing active categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow managing categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow managing catalog tokens" ON public.catalog_tokens;
