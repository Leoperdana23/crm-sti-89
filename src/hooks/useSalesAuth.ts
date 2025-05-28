

import { supabase } from '@/integrations/supabase/client';

interface AuthResponse {
  success: boolean;
  message?: string;
  user_id?: string;
  sales_id?: string;
  name?: string;
  email?: string;
}

export const useSalesAuth = () => {
  const authenticateSales = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.rpc('authenticate_sales_user', {
        email_input: email,
        password_input: password
      });

      if (error) {
        console.error('Error authenticating sales:', error);
        throw new Error('Terjadi kesalahan saat login');
      }

      const authResponse = data as unknown as AuthResponse;

      if (!authResponse.success) {
        throw new Error(authResponse.message || 'Login gagal');
      }

      // Now sign in with Supabase Auth using the sales email
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (signInError) {
        console.error('Supabase auth error:', signInError);
        throw new Error('Terjadi kesalahan saat login');
      }

      return authResponse;
    } catch (error) {
      console.error('Error in authenticateSales:', error);
      throw error;
    }
  };

  return {
    authenticateSales
  };
};

