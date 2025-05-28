
import { supabase } from '@/integrations/supabase/client';

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

      // Check if authentication was successful
      if (!data || !data.success) {
        throw new Error(data?.message || 'Login gagal');
      }

      // Create a temporary session for the sales user
      // Note: This is a simplified approach for sales users
      return {
        success: true,
        user: {
          id: data.user_id,
          email: data.email,
          user_metadata: {
            full_name: data.name,
            sales_id: data.sales_id
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
