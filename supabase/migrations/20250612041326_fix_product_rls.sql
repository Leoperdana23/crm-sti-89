
-- Add RLS policies for products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view active products
CREATE POLICY "Users can view active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

-- Allow users with product_create permission to insert products
CREATE POLICY "Users with product_create permission can insert products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.app_users au
      JOIN public.role_permissions rp ON rp.role = au.role
      JOIN public.permissions p ON p.id = rp.permission_id
      WHERE au.auth_user_id = auth.uid()
      AND p.name = 'product_create'
      AND rp.can_create = true
    )
  );

-- Allow users with product_edit permission to update products
CREATE POLICY "Users with product_edit permission can update products" 
  ON public.products 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.app_users au
      JOIN public.role_permissions rp ON rp.role = au.role
      JOIN public.permissions p ON p.id = rp.permission_id
      WHERE au.auth_user_id = auth.uid()
      AND p.name = 'product_edit'
      AND rp.can_edit = true
    )
  );

-- Allow users with product_delete permission to delete products (soft delete by updating is_active)
CREATE POLICY "Users with product_delete permission can delete products" 
  ON public.products 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.app_users au
      JOIN public.role_permissions rp ON rp.role = au.role
      JOIN public.permissions p ON p.id = rp.permission_id
      WHERE au.auth_user_id = auth.uid()
      AND p.name = 'product_delete'
      AND rp.can_delete = true
    )
  );

-- Add RLS policies for product_categories table
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view active categories
CREATE POLICY "Users can view active categories" 
  ON public.product_categories 
  FOR SELECT 
  USING (is_active = true);

-- Allow admins to manage categories
CREATE POLICY "Super admin can manage categories" 
  ON public.product_categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.app_users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Fix catalog_tokens RLS policy to be more specific
DROP POLICY IF EXISTS "Super admin can manage catalog tokens" ON public.catalog_tokens;

CREATE POLICY "Users with product_management permission can manage catalog tokens" 
  ON public.catalog_tokens 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.app_users au
      JOIN public.role_permissions rp ON rp.role = au.role
      JOIN public.permissions p ON p.id = rp.permission_id
      WHERE au.auth_user_id = auth.uid()
      AND p.name = 'product_management'
      AND rp.can_create = true
    )
  );
