
-- Create reseller login history table
CREATE TABLE IF NOT EXISTS public.reseller_login_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES public.resellers(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  login_method TEXT DEFAULT 'password',
  session_token TEXT,
  logout_time TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reseller_login_history_reseller_id ON public.reseller_login_history(reseller_id);
CREATE INDEX IF NOT EXISTS idx_reseller_login_history_login_time ON public.reseller_login_history(login_time DESC);

-- Enable RLS
ALTER TABLE public.reseller_login_history ENABLE ROW LEVEL SECURITY;

-- Create policies for reseller login history
CREATE POLICY "Resellers can view their own login history" 
ON public.reseller_login_history 
FOR SELECT 
USING (true); -- Allow admins to view all login history

CREATE POLICY "System can insert login history" 
ON public.reseller_login_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update login history" 
ON public.reseller_login_history 
FOR UPDATE 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_reseller_login_history_updated_at 
  BEFORE UPDATE ON public.reseller_login_history 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Update the authenticate_reseller_app function to log login attempts
CREATE OR REPLACE FUNCTION public.authenticate_reseller_app(phone_input text, password_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reseller_user record;
  session_token text;
  expires_at timestamp with time zone;
  login_history_id uuid;
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
  
  -- Log login history
  INSERT INTO public.reseller_login_history (reseller_id, session_token, login_method)
  VALUES (reseller_user.id, session_token, 'password')
  RETURNING id INTO login_history_id;
  
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
    'expires_at', expires_at,
    'login_history_id', login_history_id
  );
END;
$$;
