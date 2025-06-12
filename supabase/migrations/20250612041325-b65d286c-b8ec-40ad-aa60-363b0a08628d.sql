
-- Add product management permissions
INSERT INTO public.permissions (name, description, menu_path) VALUES 
('product_management', 'Kelola Produk', '/product-catalog'),
('product_create', 'Tambah Produk', '/product-catalog'),
('product_edit', 'Edit Produk', '/product-catalog'),
('product_delete', 'Hapus Produk', '/product-catalog');

-- Set permissions for super_admin role
INSERT INTO public.role_permissions (role, permission_id, can_view, can_create, can_edit, can_delete)
SELECT 
  'super_admin'::app_role, 
  p.id, 
  true, 
  true, 
  true, 
  true
FROM public.permissions p 
WHERE p.name IN ('product_management', 'product_create', 'product_edit', 'product_delete');

-- Create table for public catalog tokens
CREATE TABLE public.catalog_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  name TEXT NOT NULL,
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.app_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_catalog_tokens_updated_at
    BEFORE UPDATE ON public.catalog_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.catalog_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for catalog_tokens
CREATE POLICY "Super admin can manage catalog tokens" 
  ON public.catalog_tokens 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.app_users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create public access policy for products via token
CREATE POLICY "Public access to products via valid token" 
  ON public.products 
  FOR SELECT 
  USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM public.catalog_tokens 
      WHERE token = current_setting('request.jwt.claims', true)::json->>'catalog_token'
      AND is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Create public access policy for categories via token
CREATE POLICY "Public access to categories via valid token" 
  ON public.product_categories 
  FOR SELECT 
  USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM public.catalog_tokens 
      WHERE token = current_setting('request.jwt.claims', true)::json->>'catalog_token'
      AND is_active = true 
      AND (expires_at IS NULL OR expires_at > now())
    )
  );
