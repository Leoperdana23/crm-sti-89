
-- Add new columns and tables for better CRM functionality
-- Add tracking and analytics tables
CREATE TABLE IF NOT EXISTS public.dashboard_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_customers integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  active_resellers integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add notification system
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Add activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Update products table for better catalog features
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock_level integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Update orders table for better tracking
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS fulfillment_status text DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Add public catalog settings
CREATE TABLE IF NOT EXISTS public.catalog_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name text DEFAULT 'Katalog Produk',
  site_description text,
  logo_url text,
  primary_color text DEFAULT '#16a34a',
  secondary_color text DEFAULT '#059669',
  contact_phone text,
  contact_email text,
  contact_address text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default catalog settings
INSERT INTO public.catalog_settings (site_name, site_description, contact_phone)
VALUES ('PT SLASH Katalog Produk', 'Katalog produk terlengkap dengan harga terbaik', '021-12345678')
ON CONFLICT DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON public.activity_logs(user_id, created_at);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dashboard_stats_updated_at BEFORE UPDATE ON public.dashboard_stats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_catalog_settings_updated_at BEFORE UPDATE ON public.catalog_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
