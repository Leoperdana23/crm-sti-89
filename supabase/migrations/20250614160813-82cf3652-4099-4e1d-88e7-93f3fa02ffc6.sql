
-- Create warranty suppliers table
CREATE TABLE warranty_suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  product_types TEXT[], -- Array of product types they supply
  default_warranty_months INTEGER DEFAULT 12,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warranty products table (incoming products from suppliers)
CREATE TABLE warranty_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  serial_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES warranty_suppliers(id),
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier_invoice_date DATE,
  warranty_months INTEGER NOT NULL DEFAULT 12,
  warranty_start_date DATE NOT NULL, -- Usually same as received_date or invoice_date
  warranty_end_date DATE NOT NULL, -- Calculated from warranty_start_date + warranty_months
  status TEXT NOT NULL DEFAULT 'in_stock', -- in_stock, sold, damaged, returned
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warranty sales table (when products are sold)
CREATE TABLE warranty_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warranty_product_id UUID REFERENCES warranty_products(id) NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id UUID REFERENCES customers(id),
  reseller_id UUID REFERENCES resellers(id),
  customer_name TEXT NOT NULL, -- Store name even if not linked to customer/reseller
  customer_phone TEXT,
  customer_warranty_start_date DATE NOT NULL, -- When warranty starts for customer
  customer_warranty_end_date DATE NOT NULL, -- When warranty ends for customer
  sale_price NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warranty claims table
CREATE TABLE warranty_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warranty_sale_id UUID REFERENCES warranty_sales(id) NOT NULL,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  problem_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing', -- processing, completed, rejected
  resolution_notes TEXT,
  technician_notes TEXT,
  replacement_serial_number TEXT,
  completed_date DATE,
  created_by UUID REFERENCES app_users(id),
  processed_by UUID REFERENCES app_users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warranty notifications table
CREATE TABLE warranty_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warranty_sale_id UUID REFERENCES warranty_sales(id) NOT NULL,
  notification_type TEXT NOT NULL, -- expiring_soon, expired
  notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  days_until_expiry INTEGER,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_warranty_products_serial ON warranty_products(serial_number);
CREATE INDEX idx_warranty_products_status ON warranty_products(status);
CREATE INDEX idx_warranty_sales_customer ON warranty_sales(customer_id);
CREATE INDEX idx_warranty_sales_reseller ON warranty_sales(reseller_id);
CREATE INDEX idx_warranty_claims_status ON warranty_claims(status);
CREATE INDEX idx_warranty_notifications_type ON warranty_notifications(notification_type);

-- Create triggers for updating timestamps
CREATE TRIGGER update_warranty_suppliers_updated_at
    BEFORE UPDATE ON warranty_suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warranty_products_updated_at
    BEFORE UPDATE ON warranty_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warranty_sales_updated_at
    BEFORE UPDATE ON warranty_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warranty_claims_updated_at
    BEFORE UPDATE ON warranty_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate warranty end dates
CREATE OR REPLACE FUNCTION calculate_warranty_end_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate warranty_end_date based on warranty_start_date + warranty_months
  NEW.warranty_end_date = NEW.warranty_start_date + (NEW.warranty_months * INTERVAL '1 month');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for warranty_products table
CREATE TRIGGER calculate_warranty_end_date_products
    BEFORE INSERT OR UPDATE ON warranty_products
    FOR EACH ROW
    EXECUTE FUNCTION calculate_warranty_end_date();

-- Function to automatically calculate customer warranty end date
CREATE OR REPLACE FUNCTION calculate_customer_warranty_end_date()
RETURNS TRIGGER AS $$
DECLARE
  product_warranty_months INTEGER;
BEGIN
  -- Get warranty months from the product
  SELECT warranty_months INTO product_warranty_months
  FROM warranty_products
  WHERE id = NEW.warranty_product_id;
  
  -- Calculate customer warranty end date
  NEW.customer_warranty_end_date = NEW.customer_warranty_start_date + (product_warranty_months * INTERVAL '1 month');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for warranty_sales table
CREATE TRIGGER calculate_customer_warranty_end_date_sales
    BEFORE INSERT OR UPDATE ON warranty_sales
    FOR EACH ROW
    EXECUTE FUNCTION calculate_customer_warranty_end_date();

-- Function to update product status when sold
CREATE OR REPLACE FUNCTION update_product_status_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Update warranty_products status to 'sold'
  UPDATE warranty_products
  SET status = 'sold'
  WHERE id = NEW.warranty_product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for warranty_sales table
CREATE TRIGGER update_product_status_on_sale_trigger
    AFTER INSERT ON warranty_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_product_status_on_sale();

-- Function to generate warranty notifications
CREATE OR REPLACE FUNCTION generate_warranty_notifications()
RETURNS void AS $$
DECLARE
  sale_record RECORD;
  days_diff INTEGER;
BEGIN
  -- Check for warranties expiring soon (30 days) or already expired
  FOR sale_record IN
    SELECT id, customer_warranty_end_date, customer_name
    FROM warranty_sales
    WHERE customer_warranty_end_date >= CURRENT_DATE - INTERVAL '30 days'
  LOOP
    days_diff := sale_record.customer_warranty_end_date - CURRENT_DATE;
    
    -- If warranty expires in 30 days or less and no notification sent
    IF days_diff <= 30 AND days_diff >= 0 THEN
      INSERT INTO warranty_notifications (warranty_sale_id, notification_type, days_until_expiry)
      SELECT sale_record.id, 'expiring_soon', days_diff
      WHERE NOT EXISTS (
        SELECT 1 FROM warranty_notifications
        WHERE warranty_sale_id = sale_record.id
        AND notification_type = 'expiring_soon'
        AND notification_date = CURRENT_DATE
      );
    END IF;
    
    -- If warranty has expired
    IF days_diff < 0 THEN
      INSERT INTO warranty_notifications (warranty_sale_id, notification_type, days_until_expiry)
      SELECT sale_record.id, 'expired', days_diff
      WHERE NOT EXISTS (
        SELECT 1 FROM warranty_notifications
        WHERE warranty_sale_id = sale_record.id
        AND notification_type = 'expired'
        AND notification_date = CURRENT_DATE
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS for all warranty tables
ALTER TABLE warranty_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing access for authenticated users)
CREATE POLICY "Allow full access to warranty_suppliers" ON warranty_suppliers FOR ALL USING (true);
CREATE POLICY "Allow full access to warranty_products" ON warranty_products FOR ALL USING (true);
CREATE POLICY "Allow full access to warranty_sales" ON warranty_sales FOR ALL USING (true);
CREATE POLICY "Allow full access to warranty_claims" ON warranty_claims FOR ALL USING (true);
CREATE POLICY "Allow full access to warranty_notifications" ON warranty_notifications FOR ALL USING (true);
