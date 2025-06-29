
-- Update promo_benefit_settings table to include all new point-based fields
ALTER TABLE public.promo_benefit_settings 
ADD COLUMN IF NOT EXISTS points_per_order INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS points_target_10 INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS points_target_20 INTEGER DEFAULT 200,
ADD COLUMN IF NOT EXISTS commission_per_point NUMERIC(10,2) DEFAULT 1000.00,
ADD COLUMN IF NOT EXISTS gift_target_10 TEXT DEFAULT 'Voucher Belanja Rp 100.000',
ADD COLUMN IF NOT EXISTS gift_target_20 TEXT DEFAULT 'Smartphone + Bonus Komisi 100%';

-- Update default promo description to reflect point-based system
UPDATE public.promo_benefit_settings 
SET promo_description = '🎉 Target 100 Poin = Voucher Belanja Rp 100.000\n🏆 Target 200 Poin = Smartphone + Bonus Ekstra'
WHERE promo_description = '🎉 Target 10 Order = Bonus Komisi 50%\n🏆 Target 20 Order = Hadiah Spesial + Bonus Komisi 100%';

-- Insert default record if table is empty
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
  cta_button_2_text,
  gift_target_10,
  gift_target_20,
  points_per_order,
  points_target_10,
  points_target_20,
  commission_per_point
) 
SELECT 
  true,
  50.00,
  true,
  true,
  50.00,
  100.00,
  'Promo Khusus Bulan Ini',
  '🎉 Target 100 Poin = Voucher Belanja Rp 100.000\n🏆 Target 200 Poin = Smartphone + Bonus Ekstra',
  'Jadikan belanjamu banyak untung',
  'Order Sekarang',
  'Lihat Progress',
  'Voucher Belanja Rp 100.000',
  'Smartphone + Bonus Komisi 100%',
  10,
  100,
  200,
  1000.00
WHERE NOT EXISTS (SELECT 1 FROM public.promo_benefit_settings);
