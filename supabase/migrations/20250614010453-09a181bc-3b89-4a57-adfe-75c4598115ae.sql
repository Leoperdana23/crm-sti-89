
-- Fix RLS policy for inventory_movements table to allow system to create records
-- when order status is updated to completed

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.inventory_movements;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.inventory_movements;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.inventory_movements;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.inventory_movements;
DROP POLICY IF EXISTS "Allow public to create inventory movements" ON public.inventory_movements;

ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Enable read access for authenticated users" ON public.inventory_movements
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.inventory_movements
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.inventory_movements
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.inventory_movements
FOR DELETE USING (true);

-- Allow public/anon users to create inventory movements (for order completion triggers)
CREATE POLICY "Allow public to create inventory movements" ON public.inventory_movements
FOR INSERT 
TO anon, public
WITH CHECK (true);
