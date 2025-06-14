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
import { useToast } from '@/hooks/use-toast';

const AppSettings = () => {
  const { data: appSettings, isLoading: appLoading } = useAppSettings();
  const { data: contactSettings, isLoading: contactLoading } = useContactSettings();
  const updateSettings = useUpdateAppSettings();
  const updateContactSettings = useUpdateContactSettings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for each tab
  const [generalForm, setGeneralForm] = useState({
    siteName: 'SEDEKAT App',
    description: '',
    allowRegistration: true,
    autoModeration: true
  });

  const [appearanceForm, setAppearanceForm] = useState({
    primaryColor: '#16a34a',
    secondaryColor: '#059669',
    bannerUrl: '',
    welcomeText: 'Selamat datang di aplikasi SEDEKAT'
  });

  const [notificationForm, setNotificationForm] = useState({
    push: true,
    email: false,
    whatsapp: true,
    autoReplyMessage: 'Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Anda.'
  });

  const [contactForm, setContactForm] = useState({
    whatsappNumber: '',
    phoneNumber: '',
    email: ''
  });

  // Update form states when data is loaded
  useEffect(() => {
    if (appSettings) {
      console.log('Loading app settings data:', appSettings);
      
      // Update general form
      setGeneralForm(prev => ({
        ...prev,
        siteName: appSettings.catalog?.siteName || 'SEDEKAT App',
        description: appSettings.catalog?.description || '',
        allowRegistration: appSettings.allow_registration !== undefined ? appSettings.allow_registration : true,
        autoModeration: appSettings.auto_moderation !== undefined ? appSettings.auto_moderation : true
      }));

      // Update appearance form
      setAppearanceForm({
        primaryColor: appSettings.catalog?.primaryColor || '#16a34a',
        secondaryColor: appSettings.catalog?.secondaryColor || '#059669',
        bannerUrl: appSettings.catalog?.bannerUrl || '',
        welcomeText: appSettings.catalog?.welcomeText || 'Selamat datang di aplikasi SEDEKAT'
      });

      // Update notification form
      setNotificationForm({
        push: appSettings.notifications?.push !== undefined ? appSettings.notifications.push : true,
        email: appSettings.notifications?.email !== undefined ? appSettings.notifications.email : false,
        whatsapp: appSettings.notifications?.whatsapp !== undefined ? appSettings.notifications.whatsapp : true,
        autoReplyMessage: appSettings.auto_reply?.message || 'Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Anda.'
      });
    }
  }, [appSettings]);

  useEffect(() => {
    if (contactSettings) {
      console.log('Loading contact settings data:', contactSettings);
      setContactForm({
        whatsappNumber: contactSettings.whatsapp_number || '',
        phoneNumber: contactSettings.phone_number || '',
        email: contactSettings.email || ''
      });
    }
  }, [contactSettings]);

  const handleGeneralSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Submitting general settings:', generalForm);
      
      await updateSettings.mutateAsync({
        catalog: {
          ...appSettings?.catalog,
          siteName: generalForm.siteName,
          description: generalForm.description,
          welcomeText: appSettings?.catalog?.welcomeText || 'Selamat datang di aplikasi SEDEKAT',
          bannerUrl: appSettings?.catalog?.bannerUrl || '',
          primaryColor: appSettings?.catalog?.primaryColor || '#16a34a',
          secondaryColor: appSettings?.catalog?.secondaryColor || '#059669'
        },
        allow_registration: generalForm.allowRegistration,
        auto_moderation: generalForm.autoModeration
      });

      toast({
        title: "Berhasil",
        description: "Pengaturan umum berhasil disimpan",
      });
    } catch (error) {
      console.error('Error updating general settings:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan umum",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppearanceSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Submitting appearance settings:', appearanceForm);
      
      await updateSettings.mutateAsync({
        catalog: {
          ...appSettings?.catalog,
          primaryColor: appearanceForm.primaryColor,
          secondaryColor: appearanceForm.secondaryColor,
          bannerUrl: appearanceForm.bannerUrl,
          welcomeText: appearanceForm.welcomeText,
          siteName: appSettings?.catalog?.siteName || 'SEDEKAT App',
          description: appSettings?.catalog?.description || ''
        }
      });

      toast({
        title: "Berhasil",
        description: "Pengaturan tampilan berhasil disimpan",
      });
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan tampilan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Submitting notification settings:', notificationForm);
      
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

      toast({
        title: "Berhasil",
        description: "Pengaturan notifikasi berhasil disimpan",
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan notifikasi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log('Submitting contact settings:', contactForm);
      
      await updateContactSettings.mutateAsync({
        whatsapp_number: contactForm.whatsappNumber,
        phone_number: contactForm.phoneNumber,
        email: contactForm.email
      });

      toast({
        title: "Berhasil",
        description: "Pengaturan kontak berhasil disimpan",
      });
    } catch (error) {
      console.error('Error updating contact settings:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan kontak",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (appLoading || contactLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Aplikasi</h1>
          <p className="text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

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
              <Button 
                onClick={handleGeneralSubmit} 
                disabled={isSubmitting || updateSettings.isPending}
              >
                {isSubmitting || updateSettings.isPending ? 'Menyimpan...' : 'Simpan Pengaturan Umum'}
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
              <Button 
                onClick={handleAppearanceSubmit} 
                disabled={isSubmitting || updateSettings.isPending}
              >
                {isSubmitting || updateSettings.isPending ? 'Menyimpan...' : 'Simpan Pengaturan Tampilan'}
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
              <Button 
                onClick={handleNotificationSubmit} 
                disabled={isSubmitting || updateSettings.isPending}
              >
                {isSubmitting || updateSettings.isPending ? 'Menyimpan...' : 'Simpan Pengaturan Notifikasi'}
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
              <Button 
                onClick={handleContactSubmit} 
                disabled={isSubmitting || updateContactSettings.isPending}
              >
                {isSubmitting || updateContactSettings.isPending ? 'Menyimpan...' : 'Simpan Pengaturan Kontak'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppSettings;
