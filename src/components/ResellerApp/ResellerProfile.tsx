
import React from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useResellerApp } from '@/hooks/useResellerApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, MapPin, Award, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResellerProfileProps {
  reseller: ResellerSession;
}

const ResellerProfile: React.FC<ResellerProfileProps> = ({ reseller }) => {
  const { logout } = useResellerApp();
  const { toast } = useToast();

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
          <CardTitle>Informasi Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Alamat</p>
              <p className="font-medium">{reseller.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission & Points Info */}
      <Card>
        <CardHeader>
          <CardTitle>Info Komisi & Poin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Rate Komisi:</span>
            <Badge variant="secondary" className="text-green-600">
              {reseller.commission_rate}%
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-500" />
              <span className="text-gray-600">Total Poin:</span>
            </div>
            <span className="text-xl font-bold text-purple-600">
              {reseller.total_points}
            </span>
          </div>
          
          <div className="pt-3 border-t">
            <p className="text-sm text-gray-500">
              Anda mendapat komisi {reseller.commission_rate}% dari setiap penjualan dan poin dari produk tertentu.
            </p>
          </div>
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
