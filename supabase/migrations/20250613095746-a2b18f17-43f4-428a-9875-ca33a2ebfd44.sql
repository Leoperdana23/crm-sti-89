
-- Add missing columns to existing tables for better functionality

-- Add missing fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS weight NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS warranty_period INTEGER,
ADD COLUMN IF NOT EXISTS supplier_id UUID,
ADD COLUMN IF NOT EXISTS cost_price NUMERIC(15,2);

-- Add missing fields to customers table  
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30;

-- Add missing fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS order_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Create suppliers table if not exists
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  payment_terms INTEGER DEFAULT 30,
  tax_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory movements table for stock tracking
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id),
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  reference_type TEXT, -- 'order', 'purchase', 'adjustment'
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES public.app_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES public.suppliers(id),
  status TEXT NOT NULL DEFAULT 'draft',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES public.app_users(id),
  approved_by UUID REFERENCES public.app_users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase order items table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(15,2) NOT NULL,
  total_cost NUMERIC(15,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotations table
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  status TEXT NOT NULL DEFAULT 'draft',
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  terms_conditions TEXT,
  created_by UUID REFERENCES public.app_users(id),
  approved_by UUID REFERENCES public.app_users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotation items table
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(15,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  total_price NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_number TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES public.orders(id),
  customer_id UUID REFERENCES public.customers(id),
  amount NUMERIC(15,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.app_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for supplier in products
ALTER TABLE public.products 
ADD CONSTRAINT fk_products_supplier 
FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for new tables
CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
    BEFORE UPDATE ON public.quotations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
-- Suppliers policies
CREATE POLICY "Allow authenticated users to view suppliers" 
ON public.suppliers FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage suppliers" 
ON public.suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inventory movements policies
CREATE POLICY "Allow authenticated users to view inventory movements" 
ON public.inventory_movements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to create inventory movements" 
ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (true);

-- Purchase orders policies
CREATE POLICY "Allow authenticated users to manage purchase orders" 
ON public.purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage purchase order items" 
ON public.purchase_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Quotations policies
CREATE POLICY "Allow authenticated users to manage quotations" 
ON public.quotations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage quotation items" 
ON public.quotation_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Payments policies
CREATE POLICY "Allow authenticated users to manage payments" 
ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON public.customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at);

-- Update existing data to ensure consistency
UPDATE public.products SET is_active = true WHERE is_active IS NULL;
UPDATE public.product_categories SET is_active = true WHERE is_active IS NULL;
UPDATE public.customers SET customer_type = 'individual' WHERE customer_type IS NULL;
UPDATE public.orders SET priority = 'normal' WHERE priority IS NULL;

-- Create function to automatically update stock when orders are completed
CREATE OR REPLACE FUNCTION public.update_stock_on_order_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Reduce stock for each order item
    UPDATE public.products 
    SET stock_quantity = stock_quantity - oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id 
    AND oi.product_id = products.id;
    
    -- Create inventory movement records
    INSERT INTO public.inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, notes)
    SELECT 
      oi.product_id,
      'out',
      -oi.quantity,
      'order',
      NEW.id,
      'Stock reduced due to order completion'
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock updates
DROP TRIGGER IF EXISTS trigger_update_stock_on_order_completion ON public.orders;
CREATE TRIGGER trigger_update_stock_on_order_completion
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_stock_on_order_completion();

-- Create function to generate automatic numbering
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('quote_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('po_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS po_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_payment_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('payment_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS payment_number_seq START 1;
