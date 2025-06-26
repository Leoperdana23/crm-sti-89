
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Gift, Zap, TrendingUp } from 'lucide-react';
import { useAppSettings, useUpdateAppSettings } from '@/hooks/useAppSettings';
import { useToast } from '@/hooks/use-toast';

const ProgramPromo = () => {
  const { data: appSettings, isLoading } = useAppSettings();
  const updateSettings = useUpdateAppSettings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [promoSettings, setPromoSettings] = useState({
    bonusCommissionEnabled: true,
    bonusCommissionRate: 50,
    pointsSystemEnabled: true,
    monthlyTargetEnabled: true,
    monthlyTarget10: 50,
    monthlyTarget20: 100,
    promoTitle: 'Promo Khusus Bulan Ini',
    promoDescription: '🎉 Target 10 Order = Bonus Komisi 50%\n🏆 Target 20 Order = Hadiah Spesial + Bonus Komisi 100%',
    welcomeMessage: 'Jadikan belanjamu banyak untung',
    ctaButton1Text: 'Order Sekarang',
    ctaButton2Text: 'Lihat Progress'
  });

  // Update form states when data is loaded
  useEffect(() => {
    if (appSettings?.promo_settings) {
      setPromoSettings(prev => ({
        ...prev,
        ...appSettings.promo_settings
      }));
    }
  }, [appSettings]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateSettings.mutateAsync({
        ...appSettings,
        promo_settings: promoSettings
      });

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
                  checked={promoSettings.bonusCommissionEnabled}
                  onCheckedChange={(checked) => setPromoSettings(prev => ({ ...prev, bonusCommissionEnabled: checked }))}
                />
                <Label>Aktifkan Program Bonus Komisi</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={promoSettings.pointsSystemEnabled}
                  onCheckedChange={(checked) => setPromoSettings(prev => ({ ...prev, pointsSystemEnabled: checked }))}
                />
                <Label>Aktifkan Sistem Poin</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={promoSettings.monthlyTargetEnabled}
                  onCheckedChange={(checked) => setPromoSettings(prev => ({ ...prev, monthlyTargetEnabled: checked }))}
                />
                <Label>Aktifkan Target Bulanan</Label>
              </div>

              <div className="space-y-2">
                <Label>Pesan Selamat Datang</Label>
                <Input 
                  value={promoSettings.welcomeMessage}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
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
                  value={promoSettings.bonusCommissionRate}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, bonusCommissionRate: Number(e.target.value) }))}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label>Bonus Komisi Target 10 Order (%)</Label>
                <Input 
                  type="number"
                  value={promoSettings.monthlyTarget10}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, monthlyTarget10: Number(e.target.value) }))}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <Label>Bonus Komisi Target 20 Order (%)</Label>
                <Input 
                  type="number"
                  value={promoSettings.monthlyTarget20}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, monthlyTarget20: Number(e.target.value) }))}
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
                  value={promoSettings.promoTitle}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, promoTitle: e.target.value }))}
                  placeholder="Promo Khusus Bulan Ini"
                />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi Promo</Label>
                <Textarea 
                  value={promoSettings.promoDescription}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, promoDescription: e.target.value }))}
                  placeholder="Deskripsi program promo..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Teks Tombol Utama</Label>
                <Input 
                  value={promoSettings.ctaButton1Text}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, ctaButton1Text: e.target.value }))}
                  placeholder="Order Sekarang"
                />
              </div>

              <div className="space-y-2">
                <Label>Teks Tombol Sekunder</Label>
                <Input 
                  value={promoSettings.ctaButton2Text}
                  onChange={(e) => setPromoSettings(prev => ({ ...prev, ctaButton2Text: e.target.value }))}
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
