
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
    promo_description: '🎉 Target 10 Order = Bonus Komisi 50%\n🏆 Target 20 Order = Hadiah Spesial + Bonus Komisi 100%',
    welcome_message: 'Jadikan belanjamu banyak untung',
    cta_button_1_text: 'Order Sekarang',
    cta_button_2_text: 'Lihat Progress'
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
        cta_button_2_text: promoBenefitSettings.cta_button_2_text
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
        <p className="text-gray-600">Kelola pengaturan program promo dan benefit untuk reseller</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Umum
          </TabsTrigger>
          <TabsTrigger value="bonus" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Bonus & Komisi
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
              <CardTitle>Pengaturan Bonus & Komisi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bonus Komisi Rate (%)</Label>
                <Input 
                  type="number"
                  value={promoSettings.bonus_commission_rate}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, bonus_commission_rate: Number(e.target.value) }))}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label>Bonus Komisi Target 10 Order (%)</Label>
                <Input 
                  type="number"
                  value={promoSettings.monthly_target_10}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, monthly_target_10: Number(e.target.value) }))}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label>Bonus Komisi Target 20 Order (%)</Label>
                <Input 
                  type="number"
                  value={promoSettings.monthly_target_20}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, monthly_target_20: Number(e.target.value) }))}
                  placeholder="100"
                />
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
