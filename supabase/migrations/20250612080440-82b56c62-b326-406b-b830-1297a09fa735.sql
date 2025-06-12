
-- Enable RLS on all tables if not already enabled
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to access data
-- Resellers policies
DROP POLICY IF EXISTS "Allow authenticated users to view resellers" ON public.resellers;
CREATE POLICY "Allow authenticated users to view resellers"
ON public.resellers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Customers policies  
DROP POLICY IF EXISTS "Allow authenticated users to manage customers" ON public.customers;
CREATE POLICY "Allow authenticated users to manage customers"
ON public.customers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Branches policies
DROP POLICY IF EXISTS "Allow authenticated users to manage branches" ON public.branches;
CREATE POLICY "Allow authenticated users to manage branches"
ON public.branches FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Sales policies
DROP POLICY IF EXISTS "Allow authenticated users to manage sales" ON public.sales;
CREATE POLICY "Allow authenticated users to manage sales"
ON public.sales FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Products policies
DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON public.products;
CREATE POLICY "Allow authenticated users to manage products"
ON public.products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Product categories policies
DROP POLICY IF EXISTS "Allow authenticated users to manage product_categories" ON public.product_categories;
CREATE POLICY "Allow authenticated users to manage product_categories"
ON public.product_categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Orders policies
DROP POLICY IF EXISTS "Allow authenticated users to manage orders" ON public.orders;
CREATE POLICY "Allow authenticated users to manage orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Order items policies
DROP POLICY IF EXISTS "Allow authenticated users to manage order_items" ON public.order_items;
CREATE POLICY "Allow authenticated users to manage order_items"
ON public.order_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- App users policies
DROP POLICY IF EXISTS "Allow authenticated users to manage app_users" ON public.app_users;
CREATE POLICY "Allow authenticated users to manage app_users"
ON public.app_users FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Permissions policies
DROP POLICY IF EXISTS "Allow authenticated users to view permissions" ON public.permissions;
CREATE POLICY "Allow authenticated users to view permissions"
ON public.permissions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Role permissions policies
DROP POLICY IF EXISTS "Allow authenticated users to manage role_permissions" ON public.role_permissions;
CREATE POLICY "Allow authenticated users to manage role_permissions"
ON public.role_permissions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Surveys policies
DROP POLICY IF EXISTS "Allow authenticated users to manage surveys" ON public.surveys;
CREATE POLICY "Allow authenticated users to manage surveys"
ON public.surveys FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Interactions policies
DROP POLICY IF EXISTS "Allow authenticated users to manage interactions" ON public.interactions;
CREATE POLICY "Allow authenticated users to manage interactions"
ON public.interactions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Catalog tokens policies
DROP POLICY IF EXISTS "Allow authenticated users to manage catalog_tokens" ON public.catalog_tokens;
CREATE POLICY "Allow authenticated users to manage catalog_tokens"
ON public.catalog_tokens FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Employees policies
DROP POLICY IF EXISTS "Allow authenticated users to manage employees" ON public.employees;
CREATE POLICY "Allow authenticated users to manage employees"
ON public.employees FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Attendance policies
DROP POLICY IF EXISTS "Allow authenticated users to manage attendance" ON public.attendance;
CREATE POLICY "Allow authenticated users to manage attendance"
ON public.attendance FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Employee locations policies
DROP POLICY IF EXISTS "Allow authenticated users to manage employee_locations" ON public.employee_locations;
CREATE POLICY "Allow authenticated users to manage employee_locations"
ON public.employee_locations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Work schedules policies
DROP POLICY IF EXISTS "Allow authenticated users to manage work_schedules" ON public.work_schedules;
CREATE POLICY "Allow authenticated users to manage work_schedules"
ON public.work_schedules FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Overtime requests policies
DROP POLICY IF EXISTS "Allow authenticated users to manage overtime_requests" ON public.overtime_requests;
CREATE POLICY "Allow authenticated users to manage overtime_requests"
ON public.overtime_requests FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Leave requests policies
DROP POLICY IF EXISTS "Allow authenticated users to manage leave_requests" ON public.leave_requests;
CREATE POLICY "Allow authenticated users to manage leave_requests"
ON public.leave_requests FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Payroll policies
DROP POLICY IF EXISTS "Allow authenticated users to manage payroll" ON public.payroll;
CREATE POLICY "Allow authenticated users to manage payroll"
ON public.payroll FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Claims policies
DROP POLICY IF EXISTS "Allow authenticated users to manage claims" ON public.claims;
CREATE POLICY "Allow authenticated users to manage claims"
ON public.claims FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow public access to surveys for token-based access
DROP POLICY IF EXISTS "Allow public access to surveys with token" ON public.surveys;
CREATE POLICY "Allow public access to surveys with token"
ON public.surveys FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Allow public access to products and categories for catalog
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
ON public.products FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow public read access to product_categories" ON public.product_categories;
CREATE POLICY "Allow public read access to product_categories"
ON public.product_categories FOR SELECT
TO public
USING (true);

-- Allow public access to orders for catalog token access
DROP POLICY IF EXISTS "Allow public access to orders" ON public.orders;
CREATE POLICY "Allow public access to orders"
ON public.orders FOR ALL
TO public
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to order_items" ON public.order_items;
CREATE POLICY "Allow public access to order_items"
ON public.order_items FOR ALL
TO public
USING (true)
WITH CHECK (true);
