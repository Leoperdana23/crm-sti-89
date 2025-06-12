
-- Add delivery option and expedisi to orders table
ALTER TABLE public.orders 
ADD COLUMN delivery_method TEXT DEFAULT 'pickup',
ADD COLUMN expedisi TEXT;

-- Add comments to clarify the new columns
COMMENT ON COLUMN public.orders.delivery_method IS 'pickup or delivery';
COMMENT ON COLUMN public.orders.expedisi IS 'courier/expedisi name when delivery_method is delivery';
