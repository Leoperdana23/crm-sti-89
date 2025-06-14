
-- Fix RLS policies untuk semua tabel utama yang digunakan aplikasi
-- Drop existing policies first, then recreate

-- Dashboard Stats
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read dashboard stats" ON public.dashboard_stats;
DROP POLICY IF EXISTS "Allow authenticated users to manage dashboard stats" ON public.dashboard_stats;

CREATE POLICY "Allow authenticated users to read dashboard stats" 
ON public.dashboard_stats 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to manage dashboard stats" 
ON public.dashboard_stats 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Inventory Movements
DROP POLICY IF EXISTS "Allow authenticated users to manage inventory movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Inventory movements: Allow authenticated users all operations" ON public.inventory_movements;

CREATE POLICY "Inventory movements: Allow authenticated users all operations" 
ON public.inventory_movements 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Reseller Stats
ALTER TABLE public.reseller_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read reseller stats" ON public.reseller_stats;
DROP POLICY IF EXISTS "Allow authenticated users to manage reseller stats" ON public.reseller_stats;

CREATE POLICY "Allow authenticated users to read reseller stats" 
ON public.reseller_stats 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to manage reseller stats" 
ON public.reseller_stats 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage notifications" ON public.notifications;

CREATE POLICY "Allow authenticated users to manage notifications" 
ON public.notifications 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Activity Logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage activity logs" ON public.activity_logs;

CREATE POLICY "Allow authenticated users to manage activity logs" 
ON public.activity_logs 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage branches" ON public.branches;

CREATE POLICY "Allow authenticated users to manage branches" 
ON public.branches 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage customers" ON public.customers;

CREATE POLICY "Allow authenticated users to manage customers" 
ON public.customers 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Interactions
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage interactions" ON public.interactions;

CREATE POLICY "Allow authenticated users to manage interactions" 
ON public.interactions 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public to create orders via catalog" ON public.orders;

CREATE POLICY "Allow authenticated users to manage orders" 
ON public.orders 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public to create orders via catalog" 
ON public.orders 
FOR INSERT 
TO anon, public
WITH CHECK (true);

-- Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public to create order items" ON public.order_items;

CREATE POLICY "Allow authenticated users to manage order items" 
ON public.order_items 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public to create order items" 
ON public.order_items 
FOR INSERT 
TO anon, public
WITH CHECK (true);

-- Resellers
ALTER TABLE public.resellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage resellers" ON public.resellers;

CREATE POLICY "Allow authenticated users to manage resellers" 
ON public.resellers 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Reseller Orders
ALTER TABLE public.reseller_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage reseller orders" ON public.reseller_orders;

CREATE POLICY "Allow authenticated users to manage reseller orders" 
ON public.reseller_orders 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Catalog Tokens
ALTER TABLE public.catalog_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage catalog tokens" ON public.catalog_tokens;
DROP POLICY IF EXISTS "Allow public to read active catalog tokens" ON public.catalog_tokens;

CREATE POLICY "Allow authenticated users to manage catalog tokens" 
ON public.catalog_tokens 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public to read active catalog tokens" 
ON public.catalog_tokens 
FOR SELECT 
TO anon, public
USING (is_active = true);

-- Product Categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON public.product_categories;
DROP POLICY IF EXISTS "Allow public to read active categories" ON public.product_categories;

CREATE POLICY "Allow authenticated users to manage categories" 
ON public.product_categories 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public to read active categories" 
ON public.product_categories 
FOR SELECT 
TO anon, public
USING (is_active = true);

-- Suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to manage suppliers" ON public.suppliers;

CREATE POLICY "Allow authenticated users to manage suppliers" 
ON public.suppliers 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create trigger untuk auto-create reseller_orders saat order dibuat
CREATE OR REPLACE FUNCTION create_reseller_order_on_order_creation()
RETURNS TRIGGER AS $$
DECLARE
  reseller_record record;
  commission_amount_calc numeric := 0;
BEGIN
  -- Only process if catalog_token exists and has reseller
  IF NEW.catalog_token IS NOT NULL THEN
    -- Get reseller info from catalog token
    SELECT r.*, ct.reseller_id
    INTO reseller_record
    FROM catalog_tokens ct
    JOIN resellers r ON r.id = ct.reseller_id
    WHERE ct.token = NEW.catalog_token;
    
    IF reseller_record.id IS NOT NULL THEN
      -- Calculate commission from order items with snapshot values
      SELECT COALESCE(SUM(oi.product_commission_snapshot * oi.quantity), 0)
      INTO commission_amount_calc
      FROM order_items oi
      WHERE oi.order_id = NEW.id;
      
      -- Create reseller order record
      INSERT INTO reseller_orders (
        reseller_id,
        order_id,
        commission_rate,
        commission_amount,
        status
      ) VALUES (
        reseller_record.id,
        NEW.id,
        COALESCE(reseller_record.commission_rate, 10.0),
        commission_amount_calc,
        NEW.status
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_reseller_order ON orders;
CREATE TRIGGER trigger_create_reseller_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_reseller_order_on_order_creation();

-- Update function untuk sync reseller order status dengan order status
CREATE OR REPLACE FUNCTION sync_reseller_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reseller order status when main order status changes
  UPDATE reseller_orders 
  SET 
    status = NEW.status,
    updated_at = now()
  WHERE order_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger untuk sync status
DROP TRIGGER IF EXISTS trigger_sync_reseller_order_status ON orders;
CREATE TRIGGER trigger_sync_reseller_order_status
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION sync_reseller_order_status();
