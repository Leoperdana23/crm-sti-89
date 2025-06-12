
-- Add reseller_id column to catalog_tokens table
ALTER TABLE public.catalog_tokens 
ADD COLUMN reseller_id uuid REFERENCES public.resellers(id);

-- Create index for better performance on reseller_id lookups
CREATE INDEX idx_catalog_tokens_reseller_id ON public.catalog_tokens(reseller_id);

-- Update existing tokens to have a proper relationship (optional, for cleanup)
-- You can run this if you want to clean up any existing test tokens
-- DELETE FROM public.catalog_tokens WHERE reseller_id IS NULL;
