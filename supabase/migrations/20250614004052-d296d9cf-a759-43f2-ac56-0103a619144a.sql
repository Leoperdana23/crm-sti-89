
-- Drop existing policies if they exist and recreate them

-- Branches table policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.branches;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.branches;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.branches;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.branches;

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.branches
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.branches
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.branches
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.branches
FOR DELETE USING (true);

-- Customers table policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.customers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.customers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.customers;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.customers
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.customers
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.customers
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.customers
FOR DELETE USING (true);

-- Resellers table policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.resellers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.resellers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.resellers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.resellers;

ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.resellers
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.resellers
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.resellers
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.resellers
FOR DELETE USING (true);

-- Products table policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.products;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.products
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.products
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.products
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.products
FOR DELETE USING (true);

-- Product categories table policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.product_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.product_categories;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.product_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.product_categories;

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.product_categories
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.product_categories
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.product_categories
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.product_categories
FOR DELETE USING (true);

-- Suppliers table policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.suppliers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.suppliers;

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.suppliers
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.suppliers
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.suppliers
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.suppliers
FOR DELETE USING (true);
