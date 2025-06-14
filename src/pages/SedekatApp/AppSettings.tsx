
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, Bell, Globe } from 'lucide-react';
import { useAppSettings, useUpdateAppSettings } from '@/hooks/useAppSettings';
import { useContactSettings, useUpdateContactSettings } from '@/hooks/useContactSettings';

const AppSettings = () => {
  const { data: appSettings } = useAppSettings();
  const { data: contactSettings } = useContactSettings();
  const updateSettings = useUpdateAppSettings();
  const updateContactSettings = useUpdateContactSettings();
  const [isLoading, setIsLoading] = useState(false);

  // Form states for each tab
  const [generalForm, setGeneralForm] = useState({
    siteName: '',
    description: '',
    allowRegistration: true,
    autoModeration: true
  });

  const [appearanceForm, setAppearanceForm] = useState({
    primaryColor: '#16a34a',
    secondaryColor: '#059669',
    bannerUrl: '',
    welcomeText: ''
  });

  const [notificationForm, setNotificationForm] = useState({
    push: true,
    email: false,
    whatsapp: true,
    autoReplyMessage: ''
  });

  const [contactForm, setContactForm] = useState({
    whatsappNumber: '',
    phoneNumber: '',
    email: ''
  });

  // Update form states when data is loaded
  useEffect(() => {
    if (appSettings) {
      setGeneralForm(prev => ({
        ...prev,
        siteName: appSettings.catalog?.siteName || 'SEDEKAT App'
      }));

      setAppearanceForm({
        primaryColor: appSettings.catalog?.primaryColor || '#16a34a',
        secondaryColor: appSettings.catalog?.secondaryColor || '#059669',
        bannerUrl: appSettings.catalog?.bannerUrl || '',
        welcomeText: appSettings.catalog?.welcomeText || 'Selamat datang di aplikasi SEDEKAT'
      });

      setNotificationForm({
        push: appSettings.notifications?.push || false,
        email: appSettings.notifications?.email || false,
        whatsapp: appSettings.notifications?.whatsapp || false,
        autoReplyMessage: appSettings.auto_reply?.message || ''
      });
    }
  }, [appSettings]);

  useEffect(() => {
    if (contactSettings) {
      setContactForm({
        whatsappNumber: contactSettings.whatsapp_number || '',
        phoneNumber: contactSettings.phone_number || '',
        email: contactSettings.email || ''
      });
    }
  }, [contactSettings]);

  const handleGeneralSubmit = async () => {
    setIsLoading(true);
    try {
      await updateSettings.mutateAsync({
        catalog: {
          ...appSettings?.catalog,
          siteName: generalForm.siteName
        }
      });
    } catch (error) {
      console.error('Error updating general settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppearanceSubmit = async () => {
    setIsLoading(true);
    try {
      await updateSettings.mutateAsync({
        catalog: {
          ...appSettings?.catalog,
          primaryColor: appearanceForm.primaryColor,
          secondaryColor: appearanceForm.secondaryColor,
          bannerUrl: appearanceForm.bannerUrl,
          welcomeText: appearanceForm.welcomeText
        }
      });
    } catch (error) {
      console.error('Error updating appearance settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = async () => {
    setIsLoading(true);
    try {
      await updateSettings.mutateAsync({
        notifications: {
          push: notificationForm.push,
          email: notificationForm.email,
          whatsapp: notificationForm.whatsapp
        },
        auto_reply: {
          enabled: true,
          message: notificationForm.autoReplyMessage
        }
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSubmit = async () => {
    setIsLoading(true);
    try {
      await updateContactSettings.mutateAsync({
        whatsapp_number: contactForm.whatsappNumber,
        phone_number: contactForm.phoneNumber,
        email: contactForm.email
      });
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
                  value={generalForm.siteName}
                  onChange={(e) => setGeneralForm(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="Nama aplikasi"
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea 
                  value={generalForm.description}
                  onChange={(e) => setGeneralForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi aplikasi"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={generalForm.allowRegistration}
                  onCheckedChange={(checked) => setGeneralForm(prev => ({ ...prev, allowRegistration: checked }))}
                />
                <Label>Aktifkan registrasi reseller baru</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={generalForm.autoModeration}
                  onCheckedChange={(checked) => setGeneralForm(prev => ({ ...prev, autoModeration: checked }))}
                />
                <Label>Moderasi produk otomatis</Label>
              </div>
              <Button onClick={handleGeneralSubmit} disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan Umum'}
              </Button>
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
                  value={appearanceForm.primaryColor}
                  onChange={(e) => setAppearanceForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Warna Sekunder</Label>
                <Input 
                  type="color" 
                  value={appearanceForm.secondaryColor}
                  onChange={(e) => setAppearanceForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>URL Logo</Label>
                <Input 
                  value={appearanceForm.bannerUrl}
                  onChange={(e) => setAppearanceForm(prev => ({ ...prev, bannerUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label>Pesan Selamat Datang</Label>
                <Textarea 
                  value={appearanceForm.welcomeText}
                  onChange={(e) => setAppearanceForm(prev => ({ ...prev, welcomeText: e.target.value }))}
                  placeholder="Pesan yang ditampilkan di halaman utama"
                />
              </div>
              <Button onClick={handleAppearanceSubmit} disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan Tampilan'}
              </Button>
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
                <Switch 
                  checked={notificationForm.push}
                  onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, push: checked }))}
                />
                <Label>Push Notification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={notificationForm.email}
                  onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, email: checked }))}
                />
                <Label>Email Notification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={notificationForm.whatsapp}
                  onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, whatsapp: checked }))}
                />
                <Label>WhatsApp Notification</Label>
              </div>
              <div className="space-y-2">
                <Label>Template Pesan Otomatis</Label>
                <Textarea 
                  value={notificationForm.autoReplyMessage}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, autoReplyMessage: e.target.value }))}
                  placeholder="Template pesan balasan otomatis"
                />
              </div>
              <Button onClick={handleNotificationSubmit} disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan Notifikasi'}
              </Button>
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
                  value={contactForm.whatsappNumber}
                  onChange={(e) => setContactForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  placeholder="+62812345678"
                />
              </div>
              <div className="space-y-2">
                <Label>Nomor Telepon</Label>
                <Input 
                  value={contactForm.phoneNumber}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+62212345678"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="support@sedekat.com"
                />
              </div>
              <Button onClick={handleContactSubmit} disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan Pengaturan Kontak'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppSettings;
