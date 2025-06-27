
-- Create table for promo & benefit settings
CREATE TABLE IF NOT EXISTS public.promo_benefit_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bonus_commission_enabled BOOLEAN DEFAULT true,
  bonus_commission_rate NUMERIC(5,2) DEFAULT 50.00,
  points_system_enabled BOOLEAN DEFAULT true,
  monthly_target_enabled BOOLEAN DEFAULT true,
  monthly_target_10 NUMERIC(5,2) DEFAULT 50.00,
  monthly_target_20 NUMERIC(5,2) DEFAULT 100.00,
  promo_title TEXT DEFAULT 'Promo Khusus Bulan Ini',
  promo_description TEXT DEFAULT '🎉 Target 10 Order = Bonus Komisi 50%\n🏆 Target 20 Order = Hadiah Spesial + Bonus Komisi 100%',
  welcome_message TEXT DEFAULT 'Jadikan belanjamu banyak untung',
  cta_button_1_text TEXT DEFAULT 'Order Sekarang',
  cta_button_2_text TEXT DEFAULT 'Lihat Progress',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.promo_benefit_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON public.promo_benefit_settings
  FOR ALL USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_promo_benefit_settings_updated_at
  BEFORE UPDATE ON public.promo_benefit_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings if table is empty
INSERT INTO public.promo_benefit_settings (
  bonus_commission_enabled,
  bonus_commission_rate,
  points_system_enabled,
  monthly_target_enabled,
  monthly_target_10,
  monthly_target_20,
  promo_title,
  promo_description,
  welcome_message,
  cta_button_1_text,
  cta_button_2_text
) 
SELECT 
  true,
  50.00,
  true,
  true,
  50.00,
  100.00,
  'Promo Khusus Bulan Ini',
  '🎉 Target 10 Order = Bonus Komisi 50%\n🏆 Target 20 Order = Hadiah Spesial + Bonus Komisi 100%',
  'Jadikan belanjamu banyak untung',
  'Order Sekarang',
  'Lihat Progress'
WHERE NOT EXISTS (SELECT 1 FROM public.promo_benefit_settings);
