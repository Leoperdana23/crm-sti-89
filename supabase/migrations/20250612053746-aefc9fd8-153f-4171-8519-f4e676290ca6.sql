
-- Create orders table to store order information
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  catalog_token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table to store individual items in each order
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) for orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing orders (accessible to authenticated users)
CREATE POLICY "Authenticated users can view orders" 
  ON public.orders 
  FOR SELECT 
  USING (true);

-- Create policy for creating orders (public access for catalog orders)
CREATE POLICY "Anyone can create orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS for order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing order items
CREATE POLICY "Authenticated users can view order items" 
  ON public.order_items 
  FOR SELECT 
  USING (true);

-- Create policy for creating order items
CREATE POLICY "Anyone can create order items" 
  ON public.order_items 
  FOR INSERT 
  WITH CHECK (true);

-- Add trigger to update updated_at column
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
