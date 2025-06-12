
-- Disable RLS for resellers table to allow all authenticated users to add resellers
ALTER TABLE public.resellers DISABLE ROW LEVEL SECURITY;

-- Disable RLS for app_users table to allow all authenticated users to add users
ALTER TABLE public.app_users DISABLE ROW LEVEL SECURITY;

-- Disable RLS for permissions table to allow all authenticated users to manage permissions
ALTER TABLE public.permissions DISABLE ROW LEVEL SECURITY;

-- Disable RLS for role_permissions table to allow all authenticated users to manage role permissions
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;
