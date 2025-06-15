
import React, { useState } from 'react';
import { useResellerApp } from '@/hooks/useResellerApp';
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
  const { authenticateReseller } = useResellerApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authenticateReseller(phone, password);
      
      if (result.success && result.session) {
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${result.session.name}!`,
        });
        
        // Force a page refresh to ensure proper state reset
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error: any) {
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
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-sm sm:max-w-md">
        <Card className="w-full shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Store className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Reseller App
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600 px-2">
              Masuk untuk mengakses aplikasi reseller
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Nomor HP
                </Label>
                <Input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Masukkan nomor HP terdaftar"
                  className="h-11 sm:h-12 text-base border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password"
                  className="h-11 sm:h-12 text-base border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 sm:h-12 bg-green-600 hover:bg-green-700 text-white font-medium text-base transition-colors"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Masuk
              </Button>
            </form>
            
            <div className="mt-4 sm:mt-6 text-center">
              <div className="text-xs sm:text-sm text-gray-600 space-y-2">
                <p className="font-medium">Password Default:</p>
                <div className="bg-gray-50 p-2 sm:p-3 rounded-lg border">
                  <p className="text-xs sm:text-sm font-mono font-bold text-gray-800">
                    123456
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResellerLogin;
