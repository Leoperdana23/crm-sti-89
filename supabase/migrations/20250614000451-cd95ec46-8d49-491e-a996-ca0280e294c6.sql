
-- Drop ALL existing policies untuk products table
DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON public.products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public to read products" ON public.products;

-- Create fresh policies untuk products
CREATE POLICY "Products: Allow authenticated users all operations" 
ON public.products 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Products: Allow public read access"
ON public.products 
FOR SELECT 
TO anon, public 
USING (true);

-- Update order_items table untuk snapshot commission dan points
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS product_commission_snapshot numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS product_points_snapshot integer DEFAULT 0;

-- Create function untuk capture product snapshot saat order dibuat
CREATE OR REPLACE FUNCTION capture_product_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Capture commission dan points values dari products table saat order creation
  SELECT 
    COALESCE(p.commission_value, 0),
    COALESCE(p.points_value, 0)
  INTO 
    NEW.product_commission_snapshot,
    NEW.product_points_snapshot
  FROM products p 
  WHERE p.id = NEW.product_id;
  
  -- Calculate points earned berdasarkan snapshot value
  NEW.points_earned = NEW.product_points_snapshot * NEW.quantity;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger untuk automatically capture product snapshot pada order item insert
DROP TRIGGER IF EXISTS trigger_capture_product_snapshot ON order_items;
CREATE TRIGGER trigger_capture_product_snapshot
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION capture_product_snapshot();

-- Update existing order_items dengan current product values sebagai snapshot
UPDATE order_items 
SET 
  product_commission_snapshot = COALESCE(p.commission_value, 0),
  product_points_snapshot = COALESCE(p.points_value, 0)
FROM products p 
WHERE order_items.product_id = p.id 
AND order_items.product_commission_snapshot IS NULL;

-- Create table untuk reward redemptions
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES public.resellers(id),
  reward_type TEXT NOT NULL,
  amount_redeemed NUMERIC NOT NULL,
  reward_description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS pada reward_redemptions
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reward redemptions: Allow authenticated users all operations" 
ON public.reward_redemptions 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create table untuk reward catalog
CREATE TABLE IF NOT EXISTS public.reward_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL,
  cost NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS pada reward_catalog
ALTER TABLE public.reward_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reward catalog: Allow all to read" 
ON public.reward_catalog 
FOR SELECT 
TO authenticated, anon, public
USING (true);

CREATE POLICY "Reward catalog: Allow authenticated users to manage" 
ON public.reward_catalog 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Insert sample reward items (dengan ON CONFLICT untuk avoid duplicate)
INSERT INTO public.reward_catalog (name, description, reward_type, cost) 
VALUES
('Voucher Belanja 50K', 'Voucher belanja senilai Rp 50.000', 'points', 1000),
('Voucher Belanja 100K', 'Voucher belanja senilai Rp 100.000', 'points', 2000),
('Bonus Komisi 5%', 'Bonus komisi tambahan 5% untuk bulan depan', 'points', 5000),
('Cash Out 100K', 'Pencairan komisi Rp 100.000', 'commission', 100000),
('Cash Out 500K', 'Pencairan komisi Rp 500.000', 'commission', 500000)
ON CONFLICT DO NOTHING;
