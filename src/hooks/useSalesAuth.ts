
import { supabase } from '@/integrations/supabase/client';

interface SalesAuthResponse {
  success: boolean;
  message?: string;
  user_id?: string;
  email?: string;
  name?: string;
  sales_id?: string;
}

export const useSalesAuth = () => {
  const authenticateSales = async (email: string, password: string) => {
    try {
      // Call the Supabase function to authenticate sales user
      const { data, error } = await supabase.rpc('authenticate_sales_user', {
        email_input: email,
        password_input: password
      });

      if (error) {
        console.error('Error calling authenticate_sales_user:', error);
        throw new Error('Terjadi kesalahan saat login');
      }

      // Cast the data to our expected type
      const authResult = data as SalesAuthResponse;

      // Check if authentication was successful
      if (!authResult || !authResult.success) {
        throw new Error(authResult?.message || 'Login gagal');
      }

      // Create a temporary session for the sales user
      // Note: This is a simplified approach for sales users
      return {
        success: true,
        user: {
          id: authResult.user_id,
          email: authResult.email,
          user_metadata: {
            full_name: authResult.name,
            sales_id: authResult.sales_id
          }
        }
      };
    } catch (error: any) {
      console.error('Error in authenticateSales:', error);
      throw error;
    }
  };

  return {
    authenticateSales
  };
};
