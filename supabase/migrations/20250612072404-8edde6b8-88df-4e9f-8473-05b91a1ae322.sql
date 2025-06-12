
-- Add RLS policies for orders table to allow authenticated users to update orders
CREATE POLICY "Authenticated users can update orders" 
  ON public.orders 
  FOR UPDATE 
  USING (true);

-- Also ensure authenticated users can update order items if needed
CREATE POLICY "Authenticated users can update order items" 
  ON public.order_items 
  FOR UPDATE 
  USING (true);
