
-- Create table for app settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notifications JSONB DEFAULT '{"whatsapp": true, "email": false, "push": true}',
  catalog JSONB DEFAULT '{"siteName": "SEDEKAT App", "welcomeText": "Selamat datang di katalog produk kami", "bannerUrl": "", "primaryColor": "#16a34a", "secondaryColor": "#059669"}',
  operating_hours JSONB DEFAULT '{"start": "08:00", "end": "17:00", "timezone": "Asia/Jakarta"}',
  auto_reply JSONB DEFAULT '{"enabled": true, "message": "Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Anda."}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for app_settings
CREATE POLICY "Anyone can view app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage app settings" ON public.app_settings FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert default app settings
INSERT INTO public.app_settings (notifications, catalog, operating_hours, auto_reply)
VALUES (
  '{"whatsapp": true, "email": false, "push": true}',
  '{"siteName": "SEDEKAT App", "welcomeText": "Selamat datang di katalog produk kami", "bannerUrl": "", "primaryColor": "#16a34a", "secondaryColor": "#059669"}',
  '{"start": "08:00", "end": "17:00", "timezone": "Asia/Jakarta"}',
  '{"enabled": true, "message": "Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Anda."}'
)
ON CONFLICT DO NOTHING;
