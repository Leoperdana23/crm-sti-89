
-- Update the catalog_tokens table to use shorter tokens
ALTER TABLE public.catalog_tokens
ALTER COLUMN token SET DEFAULT encode(gen_random_bytes(8), 'hex');

-- Update any SQL function that might be using the token generation
CREATE OR REPLACE FUNCTION generate_short_token() 
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Update existing tokens to shorter format (optional)
-- Only do this if you want to update existing tokens
UPDATE public.catalog_tokens
SET token = encode(gen_random_bytes(8), 'hex')
WHERE length(token) > 16;
