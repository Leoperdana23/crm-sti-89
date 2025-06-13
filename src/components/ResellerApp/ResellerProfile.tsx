
import React, { useState } from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useResellerApp } from '@/hooks/useResellerApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, Mail, MapPin, LogOut, Lock } from 'lucide-react';

interface ResellerProfileProps {
  reseller: ResellerSession;
}

const ResellerProfile: React.FC<ResellerProfileProps> = ({ reseller }) => {
  const { clearResellerSession } = useResellerApp();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: reseller.name,
    phone: reseller.phone,
    email: reseller.email || '',
    address: reseller.address,
  });

  const handleSaveProfile = async () => {
    try {
      // Here you would call an API to update the profile
      // For now, we'll just show a success message
      toast({
        title: "Profil Diperbarui",
        description: "Data profil Anda berhasil diperbarui",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    clearResellerSession();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari aplikasi",
    });
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Pengaturan Akun</h2>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Informasi Profil</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Batal' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                />
              </div>
              <Button onClick={handleSaveProfile} className="w-full">
                Simpan Perubahan
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-medium">{reseller.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Nomor HP</p>
                  <p className="font-medium">{reseller.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{reseller.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Alamat</p>
                  <p className="font-medium">{reseller.address}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reseller Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Info Reseller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Rate Komisi:</span>
            <span className="font-semibold text-green-600">{reseller.commission_rate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Poin:</span>
            <span className="font-semibold text-purple-600">{reseller.total_points}</span>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Keamanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="h-4 w-4 mr-2" />
            Ubah Password
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResellerProfile;
