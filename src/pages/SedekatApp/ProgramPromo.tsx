
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Gift, Zap, TrendingUp } from 'lucide-react';
import { usePromoBenefitSettings, useUpdatePromoBenefitSettings } from '@/hooks/usePromoBenefitSettings';
import { useToast } from '@/hooks/use-toast';

const ProgramPromo = () => {
  const { data: promoBenefitSettings, isLoading } = usePromoBenefitSettings();
  const updateSettings = useUpdatePromoBenefitSettings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [promoSettings, setPromoSettings] = useState({
    bonus_commission_enabled: true,
    bonus_commission_rate: 50,
    points_system_enabled: true,
    monthly_target_enabled: true,
    monthly_target_10: 50,
    monthly_target_20: 100,
    promo_title: 'Promo Khusus Bulan Ini',
    promo_description: '🎉 Target 100 Poin = Voucher Belanja Rp 100.000\n🏆 Target 200 Poin = Smartphone + Bonus Ekstra',
    welcome_message: 'Jadikan belanjamu banyak untung',
    cta_button_1_text: 'Order Sekarang',
    cta_button_2_text: 'Lihat Progress',
    gift_target_10: 'Voucher Belanja Rp 100.000',
    gift_target_20: 'Smartphone + Bonus Komisi 100%',
    points_per_order: 10,
    points_target_10: 100,
    points_target_20: 200,
    commission_per_point: 1000
  });

  // Update form states when data is loaded
  useEffect(() => {
    if (promoBenefitSettings) {
      setPromoSettings({
        bonus_commission_enabled: promoBenefitSettings.bonus_commission_enabled,
        bonus_commission_rate: promoBenefitSettings.bonus_commission_rate,
        points_system_enabled: promoBenefitSettings.points_system_enabled,
        monthly_target_enabled: promoBenefitSettings.monthly_target_enabled,
        monthly_target_10: promoBenefitSettings.monthly_target_10,
        monthly_target_20: promoBenefitSettings.monthly_target_20,
        promo_title: promoBenefitSettings.promo_title,
        promo_description: promoBenefitSettings.promo_description,
        welcome_message: promoBenefitSettings.welcome_message,
        cta_button_1_text: promoBenefitSettings.cta_button_1_text,
        cta_button_2_text: promoBenefitSettings.cta_button_2_text,
        gift_target_10: promoBenefitSettings.gift_target_10 || 'Voucher Belanja Rp 100.000',
        gift_target_20: promoBenefitSettings.gift_target_20 || 'Smartphone + Bonus Komisi 100%',
        points_per_order: promoBenefitSettings.points_per_order || 10,
        points_target_10: promoBenefitSettings.points_target_10 || 100,
        points_target_20: promoBenefitSettings.points_target_20 || 200,
        commission_per_point: promoBenefitSettings.commission_per_point || 1000
      });
    }
  }, [promoBenefitSettings]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateSettings.mutateAsync(promoSettings);

      toast({
        title: "Berhasil",
        description: "Pengaturan program promo berhasil disimpan",
      });
    } catch (error) {
      console.error('Error updating promo settings:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan program promo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Program Promo & Benefit</h1>
          <p className="text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Program Promo & Benefit</h1>
        <p className="text-gray-600">Kelola pengaturan program promo dan benefit untuk reseller (Berbasis Poin)</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Umum
          </TabsTrigger>
          <TabsTrigger value="bonus" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Hadiah & Komisi Poin
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Tampilan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={promoSettings.bonus_commission_enabled}
                  onCheckedChange={(checked) => setPromoSettings(prev => ({ ...prev, bonus_commission_enabled: checked }))}
                />
                <Label>Aktifkan Program Bonus Komisi</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={promoSettings.points_system_enabled}
                  onCheckedChange={(checked) => setPromoSettings(prev => ({ ...prev, points_system_enabled: checked }))}
                />
                <Label>Aktifkan Sistem Poin</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={promoSettings.monthly_target_enabled}
                  onCheckedChange={(checked) => setPromoSettings(prev => ({ ...prev, monthly_target_enabled: checked }))}
                />
                <Label>Aktifkan Target Bulanan</Label>
              </div>

              <div className="space-y-2">
                <Label>Pesan Selamat Datang</Label>
                <Input 
                  value={promoSettings.welcome_message}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, welcome_message: e.target.value }))}
                  placeholder="Pesan selamat datang untuk reseller"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bonus">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Hadiah & Komisi (Berbasis Poin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Poin per Order</Label>
                <Input 
                  type="number"
                  value={promoSettings.points_per_order}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, points_per_order: Number(e.target.value) }))}
                  placeholder="10"
                />
                <p className="text-sm text-gray-500">Jumlah poin yang didapat reseller untuk setiap order</p>
              </div>

              <div className="space-y-2">
                <Label>Komisi per Poin (Rp)</Label>
                <Input 
                  type="number"
                  value={promoSettings.commission_per_point}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, commission_per_point: Number(e.target.value) }))}
                  placeholder="1000"
                />
                <p className="text-sm text-gray-500">Nilai komisi dalam rupiah untuk setiap poin</p>
              </div>

              <div className="space-y-2">
                <Label>Target Poin untuk Hadiah Pertama</Label>
                <Input 
                  type="number"
                  value={promoSettings.points_target_10}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, points_target_10: Number(e.target.value) }))}
                  placeholder="100"
                />
                <p className="text-sm text-gray-500">Jumlah poin yang diperlukan untuk mendapatkan hadiah pertama</p>
              </div>

              <div className="space-y-2">
                <Label>Hadiah Target Poin Pertama</Label>
                <Input 
                  value={promoSettings.gift_target_10}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, gift_target_10: e.target.value }))}
                  placeholder="Voucher Belanja Rp 100.000"
                />
                <p className="text-sm text-gray-500">Hadiah yang diberikan saat mencapai target poin pertama</p>
              </div>

              <div className="space-y-2">
                <Label>Target Poin untuk Hadiah Kedua</Label>
                <Input 
                  type="number"
                  value={promoSettings.points_target_20}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, points_target_20: Number(e.target.value) }))}
                  placeholder="200"
                />
                <p className="text-sm text-gray-500">Jumlah poin yang diperlukan untuk mendapatkan hadiah kedua</p>
              </div>

              <div className="space-y-2">
                <Label>Hadiah Target Poin Kedua</Label>
                <Input 
                  value={promoSettings.gift_target_20}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, gift_target_20: e.target.value }))}
                  placeholder="Smartphone + Bonus Komisi 100%"
                />
                <p className="text-sm text-gray-500">Hadiah yang diberikan saat mencapai target poin kedua</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Simulasi Perhitungan:</h4>
                <div className="space-y-1 text-sm text-blue-700">
                  <p>• {promoSettings.points_per_order} poin per order</p>
                  <p>• Komisi: Rp {promoSettings.commission_per_point.toLocaleString()} per poin</p>
                  <p>• Target 1: {promoSettings.points_target_10} poin = {promoSettings.gift_target_10}</p>
                  <p>• Target 2: {promoSettings.points_target_20} poin = {promoSettings.gift_target_20}</p>
                  <p>• Total komisi jika mencapai target 2: Rp {(promoSettings.points_target_20 * promoSettings.commission_per_point).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Judul Promo</Label>
                <Input 
                  value={promoSettings.promo_title}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, promo_title: e.target.value }))}
                  placeholder="Promo Khusus Bulan Ini"
                />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi Promo</Label>
                <Textarea 
                  value={promoSettings.promo_description}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, promo_description: e.target.value }))}
                  placeholder="Deskripsi program promo..."
                  rows={4}
                />
                <p className="text-sm text-gray-500">Gunakan \n untuk membuat baris baru</p>
              </div>

              <div className="space-y-2">
                <Label>Teks Tombol Utama</Label>
                <Input 
                  value={promoSettings.cta_button_1_text}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, cta_button_1_text: e.target.value }))}
                  placeholder="Order Sekarang"
                />
              </div>

              <div className="space-y-2">
                <Label>Teks Tombol Sekunder</Label>
                <Input 
                  value={promoSettings.cta_button_2_text}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, cta_button_2_text: e.target.value }))}
                  placeholder="Lihat Progress"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || updateSettings.isPending}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {isSubmitting || updateSettings.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </div>
  );
};

export default ProgramPromo;
