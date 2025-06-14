
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, Bell, Shield, Globe } from 'lucide-react';
import { useAppSettings, useUpdateAppSettings } from '@/hooks/useAppSettings';
import { useContactSettings, useUpdateContactSettings } from '@/hooks/useContactSettings';

const AppSettings = () => {
  const { data: appSettings } = useAppSettings();
  const { data: contactSettings } = useContactSettings();
  const updateSettings = useUpdateAppSettings();
  const updateContactSettings = useUpdateContactSettings();
  const [isLoading, setIsLoading] = useState(false);

  const handleAppSettingsUpdate = async (settings: any) => {
    setIsLoading(true);
    try {
      await updateSettings.mutateAsync(settings);
    } catch (error) {
      console.error('Error updating app settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSettingsUpdate = async (settings: any) => {
    setIsLoading(true);
    try {
      await updateContactSettings.mutateAsync(settings);
    } catch (error) {
      console.error('Error updating contact settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Aplikasi</h1>
        <p className="text-gray-600">Kelola pengaturan dan konfigurasi SEDEKAT App</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Umum
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Tampilan
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifikasi
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Kontak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Aplikasi</Label>
                <Input 
                  defaultValue={appSettings?.catalog?.siteName || 'SEDEKAT App'} 
                  placeholder="Nama aplikasi"
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea 
                  defaultValue="Aplikasi marketplace untuk reseller"
                  placeholder="Deskripsi aplikasi"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <Label>Aktifkan registrasi reseller baru</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <Label>Moderasi produk otomatis</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Warna Primer</Label>
                <Input 
                  type="color" 
                  defaultValue={appSettings?.catalog?.primaryColor || '#16a34a'}
                />
              </div>
              <div className="space-y-2">
                <Label>Warna Sekunder</Label>
                <Input 
                  type="color" 
                  defaultValue={appSettings?.catalog?.secondaryColor || '#059669'}
                />
              </div>
              <div className="space-y-2">
                <Label>URL Logo</Label>
                <Input 
                  defaultValue={appSettings?.catalog?.bannerUrl || ''}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label>Pesan Selamat Datang</Label>
                <Textarea 
                  defaultValue={appSettings?.catalog?.welcomeText || 'Selamat datang di aplikasi SEDEKAT'}
                  placeholder="Pesan yang ditampilkan di halaman utama"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch defaultChecked={appSettings?.notifications?.push} />
                <Label>Push Notification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked={appSettings?.notifications?.email} />
                <Label>Email Notification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch defaultChecked={appSettings?.notifications?.whatsapp} />
                <Label>WhatsApp Notification</Label>
              </div>
              <div className="space-y-2">
                <Label>Template Pesan Otomatis</Label>
                <Textarea 
                  defaultValue={appSettings?.auto_reply?.message || 'Terima kasih telah menghubungi kami'}
                  placeholder="Template pesan balasan otomatis"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nomor WhatsApp</Label>
                <Input 
                  defaultValue={contactSettings?.whatsapp_number || ''}
                  placeholder="+62812345678"
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Telepon</Label>
                <Input 
                  defaultValue={contactSettings?.phone_number || ''}
                  placeholder="+62212345678"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  defaultValue={contactSettings?.email || ''}
                  placeholder="support@sedekat.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={() => handleAppSettingsUpdate({})} disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  );
};

export default AppSettings;
