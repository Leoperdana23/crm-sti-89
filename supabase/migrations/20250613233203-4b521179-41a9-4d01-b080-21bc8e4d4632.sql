
-- Add columns to order_items table to store snapshot values
ALTER TABLE public.order_items 
ADD COLUMN product_commission_snapshot numeric DEFAULT 0,
ADD COLUMN product_points_snapshot integer DEFAULT 0;

-- Create function to capture product snapshot when order item is created
CREATE OR REPLACE FUNCTION capture_product_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Capture commission and points values from products table at time of order creation
  SELECT 
    COALESCE(p.commission_value, 0),
    COALESCE(p.points_value, 0)
  INTO 
    NEW.product_commission_snapshot,
    NEW.product_points_snapshot
  FROM products p 
  WHERE p.id = NEW.product_id;
  
  -- Calculate points earned based on snapshot value
  NEW.points_earned = NEW.product_points_snapshot * NEW.quantity;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically capture product snapshot on order item insert
DROP TRIGGER IF EXISTS trigger_capture_product_snapshot ON order_items;
CREATE TRIGGER trigger_capture_product_snapshot
  BEFORE INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION capture_product_snapshot();

-- Update existing order_items with current product values as snapshot
UPDATE order_items 
SET 
  product_commission_snapshot = COALESCE(p.commission_value, 0),
  product_points_snapshot = COALESCE(p.points_value, 0)
FROM products p 
WHERE order_items.product_id = p.id 
AND order_items.product_commission_snapshot IS NULL;
