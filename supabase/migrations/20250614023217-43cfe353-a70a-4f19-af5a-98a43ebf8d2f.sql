
-- Create table for contact settings
CREATE TABLE IF NOT EXISTS public.contact_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp_number TEXT,
  email TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for FAQ management
CREATE TABLE IF NOT EXISTS public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for usage tips
CREATE TABLE IF NOT EXISTS public.usage_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for broadcast messages
CREATE TABLE IF NOT EXISTS public.broadcast_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_audience TEXT[] NOT NULL DEFAULT '{}',
  channels TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_settings (admin only)
CREATE POLICY "Anyone can view contact settings" ON public.contact_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage contact settings" ON public.contact_settings FOR ALL USING (true);

-- Create policies for faq_items
CREATE POLICY "Anyone can view active FAQ items" ON public.faq_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage FAQ items" ON public.faq_items FOR ALL USING (true);

-- Create policies for usage_tips
CREATE POLICY "Anyone can view active usage tips" ON public.usage_tips FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage usage tips" ON public.usage_tips FOR ALL USING (true);

-- Create policies for broadcast_messages
CREATE POLICY "Admin can manage broadcast messages" ON public.broadcast_messages FOR ALL USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_settings_updated_at BEFORE UPDATE ON public.contact_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON public.faq_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_usage_tips_updated_at BEFORE UPDATE ON public.usage_tips FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_broadcast_messages_updated_at BEFORE UPDATE ON public.broadcast_messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert default contact settings
INSERT INTO public.contact_settings (whatsapp_number, email, phone_number)
VALUES ('+6281234567890', 'admin@sedekatapp.com', '+62218765432')
ON CONFLICT DO NOTHING;

-- Insert default FAQ items
INSERT INTO public.faq_items (question, answer, category) VALUES 
('Bagaimana cara menjadi reseller?', 'Untuk menjadi reseller, silakan hubungi admin melalui WhatsApp atau email.', 'Reseller'),
('Bagaimana cara melakukan pemesanan?', 'Anda dapat melakukan pemesanan melalui aplikasi atau menghubungi admin.', 'Pemesanan'),
('Berapa lama proses pengiriman?', 'Proses pengiriman biasanya memakan waktu 2-3 hari kerja.', 'Pengiriman')
ON CONFLICT DO NOTHING;

-- Insert default usage tips
INSERT INTO public.usage_tips (title, description, category) VALUES 
('Cara Login', 'Gunakan nomor HP dan password yang telah didaftarkan untuk masuk ke aplikasi.', 'Login'),
('Melihat Katalog', 'Browse produk dengan mudah melalui menu katalog dan gunakan filter untuk pencarian yang lebih spesifik.', 'Katalog'),
('Melakukan Pemesanan', 'Pilih produk, masukkan jumlah, isi data customer, dan submit pesanan Anda.', 'Pemesanan')
ON CONFLICT DO NOTHING;
