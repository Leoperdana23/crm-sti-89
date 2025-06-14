
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authenticateAppUser } = useAppAuth();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session || user) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate, user]);

  const handleAppUserAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('=== APP USER LOGIN DEBUG START ===');
      
      const result = await authenticateAppUser(email, password);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Login berhasil!",
        });
        
        // Store app user info in localStorage for simple session management
        localStorage.setItem('appUser', JSON.stringify(result.user));
        console.log('=== APP USER LOGIN SUCCESS ===');
        
        // Force redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('=== APP USER LOGIN ERROR ===', error);
      
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-2 md:p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CRM Dashboard
          </CardTitle>
          <CardDescription>
            Masuk ke sistem CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={handleAppUserAuth} 
            className="space-y-4"
            autoComplete="on"
          >
            <div className="space-y-2">
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Masukkan email"
                autoComplete="username"
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPassword">Password</Label>
              <Input
                id="userPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan password"
                autoComplete="current-password"
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full py-2 text-base" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Gunakan email dan password yang sudah terdaftar di master user</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
