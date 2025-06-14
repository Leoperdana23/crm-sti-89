
-- Create dedicated table for reseller order history
CREATE TABLE IF NOT EXISTS public.reseller_order_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  commission_earned NUMERIC NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  order_status TEXT NOT NULL DEFAULT 'pending',
  order_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reseller_id, order_id)
);

-- Enable RLS for reseller order history
ALTER TABLE public.reseller_order_history ENABLE ROW LEVEL SECURITY;

-- Create policies for reseller order history
CREATE POLICY "Resellers can view their own order history" 
  ON public.reseller_order_history 
  FOR SELECT 
  USING (true); -- Allow admin panel to see all, restrict in app logic

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reseller_order_history_reseller_id ON public.reseller_order_history(reseller_id);
CREATE INDEX IF NOT EXISTS idx_reseller_order_history_order_date ON public.reseller_order_history(order_date);
CREATE INDEX IF NOT EXISTS idx_reseller_order_history_status ON public.reseller_order_history(order_status);

-- Create function to sync order to reseller history
CREATE OR REPLACE FUNCTION public.sync_reseller_order_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  reseller_record RECORD;
  total_commission NUMERIC := 0;
  total_points INTEGER := 0;
  order_items_data JSONB;
BEGIN
  -- Only process if catalog_token exists
  IF NEW.catalog_token IS NOT NULL THEN
    -- Get reseller info from catalog token
    SELECT r.*, ct.reseller_id
    INTO reseller_record
    FROM catalog_tokens ct
    JOIN resellers r ON r.id = ct.reseller_id
    WHERE ct.token = NEW.catalog_token;
    
    IF reseller_record.id IS NOT NULL THEN
      -- Calculate commission and points from order items
      SELECT 
        COALESCE(SUM(oi.product_commission_snapshot * oi.quantity), 0),
        COALESCE(SUM(oi.product_points_snapshot * oi.quantity), 0),
        jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'product_price', oi.product_price,
            'quantity', oi.quantity,
            'subtotal', oi.subtotal,
            'commission_snapshot', oi.product_commission_snapshot,
            'points_snapshot', oi.product_points_snapshot
          )
        )
      INTO total_commission, total_points, order_items_data
      FROM order_items oi
      WHERE oi.order_id = NEW.id;
      
      -- Insert or update reseller order history
      INSERT INTO public.reseller_order_history (
        reseller_id,
        order_id,
        order_date,
        customer_name,
        customer_phone,
        total_amount,
        commission_earned,
        points_earned,
        order_status,
        order_items
      ) VALUES (
        reseller_record.id,
        NEW.id,
        NEW.created_at,
        NEW.customer_name,
        NEW.customer_phone,
        NEW.total_amount,
        total_commission,
        total_points,
        NEW.status,
        COALESCE(order_items_data, '[]'::jsonb)
      )
      ON CONFLICT (reseller_id, order_id) 
      DO UPDATE SET
        order_status = NEW.status,
        total_amount = NEW.total_amount,
        commission_earned = total_commission,
        points_earned = total_points,
        order_items = COALESCE(order_items_data, '[]'::jsonb),
        updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync order changes to reseller history
DROP TRIGGER IF EXISTS trigger_sync_reseller_order_history ON public.orders;
CREATE TRIGGER trigger_sync_reseller_order_history
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_reseller_order_history();

-- Sync existing orders to history table
INSERT INTO public.reseller_order_history (
  reseller_id,
  order_id,
  order_date,
  customer_name,
  customer_phone,
  total_amount,
  commission_earned,
  points_earned,
  order_status,
  order_items
)
SELECT 
  r.id as reseller_id,
  o.id as order_id,
  o.created_at as order_date,
  o.customer_name,
  o.customer_phone,
  o.total_amount,
  COALESCE(
    (SELECT SUM(oi.product_commission_snapshot * oi.quantity) 
     FROM order_items oi WHERE oi.order_id = o.id), 0
  ) as commission_earned,
  COALESCE(
    (SELECT SUM(oi.product_points_snapshot * oi.quantity) 
     FROM order_items oi WHERE oi.order_id = o.id), 0
  ) as points_earned,
  o.status as order_status,
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'product_name', oi.product_name,
        'product_price', oi.product_price,
        'quantity', oi.quantity,
        'subtotal', oi.subtotal,
        'commission_snapshot', oi.product_commission_snapshot,
        'points_snapshot', oi.product_points_snapshot
      )
    ) FROM order_items oi WHERE oi.order_id = o.id), '[]'::jsonb
  ) as order_items
FROM orders o
JOIN catalog_tokens ct ON ct.token = o.catalog_token
JOIN resellers r ON r.id = ct.reseller_id
WHERE o.catalog_token IS NOT NULL
ON CONFLICT (reseller_id, order_id) DO NOTHING;
