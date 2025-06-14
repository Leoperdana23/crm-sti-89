
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Bell, 
  MessageSquare, 
  Mail, 
  Clock, 
  Image,
  Save
} from 'lucide-react';
import { useAppSettings, useUpdateAppSettings } from '@/hooks/useAppSettings';

const AppSettings = () => {
  const { data: appSettings, isLoading } = useAppSettings();
  const updateAppSettings = useUpdateAppSettings();
  
  const [settings, setSettings] = useState({
    notifications: {
      whatsapp: true,
      email: false,
      push: true
    },
    catalog: {
      siteName: 'SEDEKAT App',
      welcomeText: 'Selamat datang di katalog produk kami',
      bannerUrl: '',
      primaryColor: '#16a34a',
      secondaryColor: '#059669'
    },
    operating_hours: {
      start: '08:00',
      end: '17:00',
      timezone: 'Asia/Jakarta'
    },
    auto_reply: {
      enabled: true,
      message: 'Terima kasih telah menghubungi kami. Kami akan segera merespons pesan Anda.'
    }
  });

  // Load settings from database
  useEffect(() => {
    if (appSettings) {
      setSettings({
        notifications: appSettings.notifications,
        catalog: appSettings.catalog,
        operating_hours: appSettings.operating_hours,
        auto_reply: appSettings.auto_reply
      });
    }
  }, [appSettings]);

  const handleSave = async () => {
    try {
      await updateAppSettings.mutateAsync(settings);
    } catch (error) {
      console.error('Failed to save app settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Aplikasi</h1>
          <p className="text-gray-600">Konfigurasi pengaturan SEDEKAT App</p>
        </div>
        <Button onClick={handleSave} disabled={updateAppSettings.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateAppSettings.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="catalog">Katalog</TabsTrigger>
          <TabsTrigger value="operating">Jam Operasional</TabsTrigger>
          <TabsTrigger value="messages">Pesan Otomatis</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Pengaturan Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Notifikasi WhatsApp
                  </Label>
                  <p className="text-sm text-gray-600">
                    Kirim notifikasi pesanan melalui WhatsApp
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.whatsapp}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, whatsapp: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Notifikasi Email
                  </Label>
                  <p className="text-sm text-gray-600">
                    Kirim notifikasi pesanan melalui email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Push Notification
                  </Label>
                  <p className="text-sm text-gray-600">
                    Kirim push notification ke aplikasi mobile
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Pengaturan Katalog
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Situs</Label>
                <Input
                  value={settings.catalog.siteName}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      catalog: { ...prev.catalog, siteName: e.target.value }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Teks Selamat Datang</Label>
                <Textarea
                  value={settings.catalog.welcomeText}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      catalog: { ...prev.catalog, welcomeText: e.target.value }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>URL Banner Promo</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={settings.catalog.bannerUrl}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      catalog: { ...prev.catalog, bannerUrl: e.target.value }
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Warna Primer</Label>
                  <Input
                    type="color"
                    value={settings.catalog.primaryColor}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        catalog: { ...prev.catalog, primaryColor: e.target.value }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Warna Sekunder</Label>
                  <Input
                    type="color"
                    value={settings.catalog.secondaryColor}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        catalog: { ...prev.catalog, secondaryColor: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operating" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Jam Operasional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jam Buka</Label>
                  <Input
                    type="time"
                    value={settings.operating_hours.start}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        operating_hours: { ...prev.operating_hours, start: e.target.value }
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jam Tutup</Label>
                  <Input
                    type="time"
                    value={settings.operating_hours.end}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        operating_hours: { ...prev.operating_hours, end: e.target.value }
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Zona Waktu</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={settings.operating_hours.timezone}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      operating_hours: { ...prev.operating_hours, timezone: e.target.value }
                    }))
                  }
                >
                  <option value="Asia/Jakarta">WIB (Jakarta)</option>
                  <option value="Asia/Makassar">WITA (Makassar)</option>
                  <option value="Asia/Jayapura">WIT (Jayapura)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Pesan Otomatis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Aktifkan Auto Reply</Label>
                  <p className="text-sm text-gray-600">
                    Kirim balasan otomatis untuk pesan masuk
                  </p>
                </div>
                <Switch
                  checked={settings.auto_reply.enabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      auto_reply: { ...prev.auto_reply, enabled: checked }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Pesan Auto Reply</Label>
                <Textarea
                  rows={4}
                  value={settings.auto_reply.message}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      auto_reply: { ...prev.auto_reply, message: e.target.value }
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppSettings;
