
-- Create table for reseller sessions/tokens
CREATE TABLE IF NOT EXISTS public.reseller_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id uuid REFERENCES public.resellers(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for reseller orders
CREATE TABLE IF NOT EXISTS public.reseller_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id uuid REFERENCES public.resellers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  commission_rate numeric DEFAULT 0,
  commission_amount numeric DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for reseller stats
CREATE TABLE IF NOT EXISTS public.reseller_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id uuid REFERENCES public.resellers(id) ON DELETE CASCADE,
  total_orders integer DEFAULT 0,
  total_commission numeric DEFAULT 0,
  total_points integer DEFAULT 0,
  month_year text NOT NULL, -- Format: YYYY-MM
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(reseller_id, month_year)
);

-- Add password field to resellers table if not exists
ALTER TABLE public.resellers 
ADD COLUMN IF NOT EXISTS password_hash text,
ADD COLUMN IF NOT EXISTS pin_hash text,
ADD COLUMN IF NOT EXISTS commission_rate numeric DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reseller_sessions_token ON public.reseller_sessions(token);
CREATE INDEX IF NOT EXISTS idx_reseller_sessions_reseller_id ON public.reseller_sessions(reseller_id);
CREATE INDEX IF NOT EXISTS idx_reseller_orders_reseller_id ON public.reseller_orders(reseller_id);
CREATE INDEX IF NOT EXISTS idx_reseller_stats_reseller_id ON public.reseller_stats(reseller_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
DROP TRIGGER IF EXISTS update_reseller_sessions_updated_at ON public.reseller_sessions;
CREATE TRIGGER update_reseller_sessions_updated_at
    BEFORE UPDATE ON public.reseller_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reseller_orders_updated_at ON public.reseller_orders;
CREATE TRIGGER update_reseller_orders_updated_at
    BEFORE UPDATE ON public.reseller_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reseller_stats_updated_at ON public.reseller_stats;
CREATE TRIGGER update_reseller_stats_updated_at
    BEFORE UPDATE ON public.reseller_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to authenticate reseller with phone and password/pin
CREATE OR REPLACE FUNCTION public.authenticate_reseller_app(phone_input text, password_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reseller_user record;
  session_token text;
  expires_at timestamp with time zone;
BEGIN
  -- Find reseller by phone number
  SELECT * INTO reseller_user
  FROM public.resellers
  WHERE phone = phone_input 
  AND is_active = true;
  
  IF reseller_user IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Nomor HP tidak terdaftar atau tidak aktif');
  END IF;
  
  -- Check password/pin (simple check for now, can be enhanced with proper hashing)
  IF reseller_user.password_hash IS NOT NULL THEN
    IF reseller_user.password_hash != password_input THEN
      RETURN json_build_object('success', false, 'message', 'Password salah');
    END IF;
  ELSIF reseller_user.pin_hash IS NOT NULL THEN
    IF reseller_user.pin_hash != password_input THEN
      RETURN json_build_object('success', false, 'message', 'PIN salah');
    END IF;
  ELSE
    -- Default password for demo (should be set properly in production)
    IF password_input != '123456' THEN
      RETURN json_build_object('success', false, 'message', 'Password default adalah 123456');
    END IF;
  END IF;
  
  -- Generate session token
  session_token := encode(gen_random_bytes(32), 'hex');
  expires_at := now() + interval '30 days';
  
  -- Create session
  INSERT INTO public.reseller_sessions (reseller_id, token, expires_at)
  VALUES (reseller_user.id, session_token, expires_at);
  
  RETURN json_build_object(
    'success', true,
    'reseller', json_build_object(
      'id', reseller_user.id,
      'name', reseller_user.name,
      'phone', reseller_user.phone,
      'email', reseller_user.email,
      'address', reseller_user.address,
      'commission_rate', reseller_user.commission_rate,
      'total_points', reseller_user.total_points
    ),
    'token', session_token,
    'expires_at', expires_at
  );
END;
$$;

-- Function to get reseller stats
CREATE OR REPLACE FUNCTION public.get_reseller_stats(reseller_id_input uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_orders integer := 0;
  total_commission numeric := 0;
  current_month_orders integer := 0;
  current_month_commission numeric := 0;
BEGIN
  -- Get total stats
  SELECT 
    COALESCE(COUNT(*), 0),
    COALESCE(SUM(commission_amount), 0)
  INTO total_orders, total_commission
  FROM public.reseller_orders
  WHERE reseller_id = reseller_id_input;
  
  -- Get current month stats
  SELECT 
    COALESCE(COUNT(*), 0),
    COALESCE(SUM(commission_amount), 0)
  INTO current_month_orders, current_month_commission
  FROM public.reseller_orders
  WHERE reseller_id = reseller_id_input
  AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN json_build_object(
    'total_orders', total_orders,
    'total_commission', total_commission,
    'current_month_orders', current_month_orders,
    'current_month_commission', current_month_commission
  );
END;
$$;
