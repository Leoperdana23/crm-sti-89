
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
      console.log('Attempting sales authentication for email:', email);
      console.log('Password length:', password.length);
      
      // First, let's check if the sales user exists and get their stored password hash
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, name, email, password_hash, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      console.log('Sales data lookup:', { salesData, salesError });

      if (salesError || !salesData) {
        throw new Error('Sales tidak ditemukan atau tidak aktif');
      }

      if (!salesData.password_hash) {
        throw new Error('Password belum diatur untuk sales ini');
      }

      console.log('Found sales user:', salesData.name);
      console.log('Password hash exists:', !!salesData.password_hash);
      
      // Call the Supabase function to authenticate sales user
      const { data, error } = await supabase.rpc('authenticate_sales_user', {
        email_input: email,
        password_input: password
      });

      console.log('Authentication response:', { data, error });

      if (error) {
        console.error('Error calling authenticate_sales_user:', error);
        throw new Error('Terjadi kesalahan saat login: ' + error.message);
      }

      // Cast the data to our expected type
      const authResult = data as unknown as SalesAuthResponse;

      console.log('Auth result:', authResult);

      // Check if authentication was successful
      if (!authResult || !authResult.success) {
        console.error('Authentication failed:', authResult?.message);
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

  const resetSalesPassword = async (salesId: string, newPassword: string) => {
    try {
      console.log('Resetting password for sales ID:', salesId);
      
      const { data, error } = await supabase
        .from('sales')
        .update({ password_hash: newPassword })
        .eq('id', salesId)
        .select()
        .single();

      if (error) {
        console.error('Error resetting password:', error);
        throw error;
      }

      console.log('Password reset successful for sales:', data.name);
      return data;
    } catch (error: any) {
      console.error('Error in resetSalesPassword:', error);
      throw error;
    }
  };

  return {
    authenticateSales,
    resetSalesPassword
  };
};
