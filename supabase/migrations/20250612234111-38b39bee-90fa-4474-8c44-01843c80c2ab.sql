
-- Add unique constraint on permissions.name if it doesn't exist
ALTER TABLE public.permissions ADD CONSTRAINT permissions_name_unique UNIQUE (name);

-- Update permissions table with current menu structure
INSERT INTO public.permissions (name, description, menu_path) VALUES
  ('dashboard', 'Dashboard', '/dashboard'),
  ('orders', 'Daftar Pesanan', '/orders'),
  ('customers', 'Pelanggan', '/customers'),
  ('resellers', 'Reseller', '/resellers'),
  ('follow_up', 'Follow-Up', '/follow-up'),
  ('birthday', 'Ulang Tahun', '/birthday'),
  ('work_process', 'Proses Pekerjaan', '/work-process'),
  ('survey', 'Survei', '/survey'),
  ('product_catalog', 'Katalog Produk', '/catalog'),
  ('deal_history', 'Riwayat Deal', '/deal-history'),
  ('sales', 'Sales', '/sales'),
  ('branches', 'Cabang', '/branches'),
  ('reports', 'Laporan', '/reports'),
  ('users', 'Master User', '/users'),
  ('role_permissions', 'Hak Akses Role', '/role-permissions')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  menu_path = EXCLUDED.menu_path;

-- Clear existing role permissions to start fresh
DELETE FROM public.role_permissions;

-- Insert role permissions for super_admin (full access to everything)
INSERT INTO public.role_permissions (role, permission_id, can_view, can_create, can_edit, can_delete)
SELECT 'super_admin', p.id, true, true, true, true
FROM public.permissions p;

-- Insert role permissions for admin
INSERT INTO public.role_permissions (role, permission_id, can_view, can_create, can_edit, can_delete)
SELECT 'admin', p.id, 
  true, -- can_view
  CASE WHEN p.name NOT IN ('role_permissions') THEN true ELSE false END, -- can_create
  CASE WHEN p.name NOT IN ('role_permissions') THEN true ELSE false END, -- can_edit
  CASE WHEN p.name NOT IN ('role_permissions', 'users') THEN true ELSE false END -- can_delete
FROM public.permissions p;

-- Insert role permissions for manager
INSERT INTO public.role_permissions (role, permission_id, can_view, can_create, can_edit, can_delete)
SELECT 'manager', p.id,
  CASE WHEN p.name NOT IN ('users', 'role_permissions') THEN true ELSE false END, -- can_view
  CASE WHEN p.name NOT IN ('users', 'role_permissions') THEN true ELSE false END, -- can_create
  CASE WHEN p.name NOT IN ('users', 'role_permissions') THEN true ELSE false END, -- can_edit
  CASE WHEN p.name NOT IN ('users', 'role_permissions', 'sales', 'branches') THEN true ELSE false END -- can_delete
FROM public.permissions p;

-- Insert role permissions for staff (sesuai menu yang diminta)
INSERT INTO public.role_permissions (role, permission_id, can_view, can_create, can_edit, can_delete)
SELECT 'staff', p.id,
  CASE WHEN p.name IN ('dashboard', 'orders', 'customers', 'resellers', 'follow_up', 'birthday', 'work_process', 'survey', 'product_catalog') THEN true ELSE false END, -- can_view
  CASE WHEN p.name IN ('orders', 'customers', 'resellers', 'follow_up', 'work_process', 'survey') THEN true ELSE false END, -- can_create
  CASE WHEN p.name IN ('orders', 'customers', 'resellers', 'follow_up', 'work_process', 'survey') THEN true ELSE false END, -- can_edit
  false -- can_delete (staff tidak bisa delete apapun)
FROM public.permissions p;
