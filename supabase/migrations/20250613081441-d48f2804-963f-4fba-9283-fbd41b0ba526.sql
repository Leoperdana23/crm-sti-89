
-- Add commission_value field to products table
ALTER TABLE public.products 
ADD COLUMN commission_value numeric DEFAULT 0;

-- Update existing products to have 0 commission if null
UPDATE public.products 
SET commission_value = 0 
WHERE commission_value IS NULL;
