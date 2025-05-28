
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSalesAuth } from '@/hooks/useSalesAuth';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('admin');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authenticateSales } = useSalesAuth();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Login berhasil!",
          });
          navigate('/');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username: username,
            }
          }
        });

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Akun berhasil dibuat! Silakan login.",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan yang tidak terduga.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalesAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authenticateSales(email, password);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Login sales berhasil!",
        });
        
        // Store sales user info in localStorage for simple session management
        localStorage.setItem('salesUser', JSON.stringify(result.user));
        navigate('/');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CRM Dashboard
          </CardTitle>
          <CardDescription>
            Masuk ke sistem CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
            </TabsList>
            
            <TabsContent value="admin">
              <form onSubmit={handleAdminAuth} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required={!isLogin}
                        placeholder="Masukkan username"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Masukkan email"
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLogin ? 'Masuk' : 'Daftar'}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk di sini'}
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="sales">
              <form onSubmit={handleSalesAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salesEmail">Email Sales</Label>
                  <Input
                    id="salesEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Masukkan email sales"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesPassword">Password</Label>
                  <Input
                    id="salesPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Masukkan password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Masuk sebagai Sales
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
