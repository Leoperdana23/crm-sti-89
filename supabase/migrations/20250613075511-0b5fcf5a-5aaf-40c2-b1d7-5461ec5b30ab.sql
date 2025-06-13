
-- Add points column to products table
ALTER TABLE public.products 
ADD COLUMN points_value integer DEFAULT 0;

-- Add points tracking to order_items table
ALTER TABLE public.order_items 
ADD COLUMN points_earned integer DEFAULT 0;

-- Update reseller points when order is completed
CREATE OR REPLACE FUNCTION update_reseller_points_on_order_completion()
RETURNS TRIGGER AS $$
DECLARE
  reseller_id_var uuid;
  total_points integer := 0;
  catalog_token_var text;
BEGIN
  -- Only process when status changes to 'selesai' (completed)
  IF NEW.status = 'selesai' AND (OLD.status IS NULL OR OLD.status != 'selesai') THEN
    catalog_token_var := NEW.catalog_token;
    
    -- Get reseller_id from catalog_token
    SELECT ct.reseller_id INTO reseller_id_var
    FROM catalog_tokens ct
    WHERE ct.token = catalog_token_var;
    
    IF reseller_id_var IS NOT NULL THEN
      -- Calculate total points from order items
      SELECT COALESCE(SUM(oi.points_earned), 0) INTO total_points
      FROM order_items oi
      WHERE oi.order_id = NEW.id;
      
      -- Update reseller total points
      UPDATE resellers 
      SET total_points = COALESCE(total_points, 0) + total_points
      WHERE id = reseller_id_var;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating reseller points
DROP TRIGGER IF EXISTS trigger_update_reseller_points ON orders;
CREATE TRIGGER trigger_update_reseller_points
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_reseller_points_on_order_completion();

-- Function to calculate and update points for order items
CREATE OR REPLACE FUNCTION calculate_order_item_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Get points value from product and calculate based on quantity
  SELECT 
    COALESCE(p.points_value, 0) * NEW.quantity 
  INTO NEW.points_earned
  FROM products p 
  WHERE p.id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calculating order item points
DROP TRIGGER IF EXISTS trigger_calculate_order_item_points ON order_items;
CREATE TRIGGER trigger_calculate_order_item_points
  BEFORE INSERT OR UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_order_item_points();
