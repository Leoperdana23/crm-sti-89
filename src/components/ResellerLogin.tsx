
import React, { useState } from 'react';
import { useResellerAuth } from '@/hooks/useResellerAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Store } from 'lucide-react';

const ResellerLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { authenticateReseller } = useResellerAuth();

  const handleResellerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('=== RESELLER LOGIN DEBUG START ===');
      console.log('Phone:', phone);
      
      const result = await authenticateReseller(phone, password);
      
      if (result.success && result.session) {
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${result.session.name}!`,
        });

        // Page will refresh automatically as session state changes
      }

    } catch (error: any) {
      console.error('=== RESELLER LOGIN ERROR ===', error);
      
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Store className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Login Reseller
          </CardTitle>
          <CardDescription>
            Masuk untuk mengakses katalog produk reseller
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResellerLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Masukkan nomor HP terdaftar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan password"
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk ke Katalog
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Demo Login:</p>
            <p className="text-xs bg-gray-50 p-2 rounded">
              Gunakan nomor HP reseller yang terdaftar<br />
              Password: <strong>123456</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResellerLogin;
