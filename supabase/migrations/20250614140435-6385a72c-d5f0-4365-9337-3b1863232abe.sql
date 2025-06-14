
-- Update app_settings table structure to match the form requirements
ALTER TABLE public.app_settings 
ADD COLUMN IF NOT EXISTS allow_registration BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_moderation BOOLEAN DEFAULT true;

-- Update the catalog JSONB structure to include description field
UPDATE public.app_settings 
SET catalog = catalog || '{"description": ""}'::jsonb
WHERE catalog IS NOT NULL AND NOT catalog ? 'description';

-- Insert default settings if table is empty
INSERT INTO public.app_settings (
  notifications, 
  catalog, 
  operating_hours, 
  auto_reply,
  allow_registration,
  auto_moderation
)
SELECT 
  '{"whatsapp": true, "email": false, "push": true}',
  '{"siteName": "SEDEKAT App", "welcomeText": "Selamat datang di aplikasi SEDEKAT", "bannerUrl": "", "primaryColor": "#16a34a", "secondaryColor": "#059669", "description": ""}',
  '{"start": "08:00", "end": "17:00", "timezone": "Asia/Jakarta"}',
  '{"enabled": true, "message": "Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Anda."}',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- Create contact_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contact_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number TEXT,
  email TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for contact_settings
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view contact settings" ON public.contact_settings;
DROP POLICY IF EXISTS "Admin can manage contact settings" ON public.contact_settings;

-- Create policies for contact_settings
CREATE POLICY "Anyone can view contact settings" ON public.contact_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage contact settings" ON public.contact_settings FOR ALL USING (true);

-- Add trigger for updated_at on contact_settings
DROP TRIGGER IF EXISTS update_contact_settings_updated_at ON public.contact_settings;
CREATE TRIGGER update_contact_settings_updated_at 
  BEFORE UPDATE ON public.contact_settings 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert default contact settings if empty
INSERT INTO public.contact_settings (whatsapp_number, email, phone_number)
SELECT '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM public.contact_settings);
