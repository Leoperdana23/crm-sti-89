
-- Create a table for product categories
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.product_categories(id),
  price NUMERIC(15,2) NOT NULL,
  reseller_price NUMERIC(15,2),
  unit TEXT NOT NULL DEFAULT 'unit',
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add triggers for updated_at
CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON public.product_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for product_categories
CREATE POLICY "Anyone can view active product categories" 
  ON public.product_categories 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Super admin can manage product categories" 
  ON public.product_categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.app_users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Create policies for products
CREATE POLICY "Anyone can view active products" 
  ON public.products 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Super admin can manage products" 
  ON public.products 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.app_users 
      WHERE auth_user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Insert some sample product categories
INSERT INTO public.product_categories (name, description) VALUES 
('Solar Panel', 'Panel surya untuk pembangkit listrik tenaga surya'),
('Inverter', 'Inverter untuk konversi DC ke AC'),
('Battery', 'Baterai penyimpanan energi'),
('Mounting System', 'Sistem pemasangan panel surya'),
('Accessories', 'Aksesoris pendukung sistem solar');

-- Insert some sample products
INSERT INTO public.products (name, description, category_id, price, reseller_price, unit) VALUES 
('Solar Panel 100W Monocrystalline', 'Panel surya 100W dengan teknologi monocrystalline', 
 (SELECT id FROM public.product_categories WHERE name = 'Solar Panel'), 
 1500000, 1200000, 'unit'),
('Solar Panel 200W Polycrystalline', 'Panel surya 200W dengan teknologi polycrystalline', 
 (SELECT id FROM public.product_categories WHERE name = 'Solar Panel'), 
 2500000, 2000000, 'unit'),
('Inverter 1000W Pure Sine Wave', 'Inverter 1000W dengan gelombang sinus murni', 
 (SELECT id FROM public.product_categories WHERE name = 'Inverter'), 
 2000000, 1600000, 'unit'),
('Battery 100Ah Deep Cycle', 'Baterai deep cycle 100Ah untuk sistem solar', 
 (SELECT id FROM public.product_categories WHERE name = 'Battery'), 
 3000000, 2500000, 'unit'),
('Mounting Rail 4m', 'Rail pemasangan panel surya panjang 4 meter', 
 (SELECT id FROM public.product_categories WHERE name = 'Mounting System'), 
 500000, 400000, 'unit');
