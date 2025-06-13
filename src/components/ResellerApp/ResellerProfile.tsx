
import React, { useState } from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useResellerApp } from '@/hooks/useResellerApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, Mail, MapPin, Calendar, LogOut, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResellerProfileProps {
  reseller: ResellerSession;
}

const ResellerProfile: React.FC<ResellerProfileProps> = ({ reseller }) => {
  const { logout } = useResellerApp();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: reseller.name,
    email: reseller.email || '',
    phone: reseller.phone,
    address: reseller.address,
    birth_date: ''
  });
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari aplikasi",
    });
    
    // Force a page refresh to ensure proper state reset
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('resellers')
        .update({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone,
          address: formData.address,
          birth_date: formData.birth_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reseller.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: reseller.name,
      email: reseller.email || '',
      phone: reseller.phone,
      address: reseller.address,
      birth_date: ''
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{reseller.name}</h2>
            <p className="text-green-100">Reseller Aktif</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Informasi Profil</CardTitle>
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birth_date">Tanggal Lahir</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Nama Lengkap</p>
                  <p className="font-medium">{reseller.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Nomor HP</p>
                  <p className="font-medium">{reseller.phone}</p>
                </div>
              </div>
              
              {reseller.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{reseller.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Tanggal Lahir</p>
                  <p className="font-medium">{formatDate(null)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Alamat</p>
                  <p className="font-medium">{reseller.address}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleLogout}
            variant="destructive" 
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar dari Aplikasi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResellerProfile;
