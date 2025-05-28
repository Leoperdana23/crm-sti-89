
import { supabase } from '@/integrations/supabase/client';

interface AppAuthResponse {
  success: boolean;
  message?: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  username?: string;
  role?: string;
  app_user_id?: string;
}

export const useAppAuth = () => {
  const authenticateAppUser = async (email: string, password: string) => {
    try {
      console.log('Attempting app user authentication for email:', email);
      
      // Call the Supabase function to authenticate app user
      const { data, error } = await supabase.rpc('authenticate_app_user', {
        email_input: email,
        password_input: password
      });

      console.log('Authentication response:', { data, error });

      if (error) {
        console.error('Error calling authenticate_app_user:', error);
        throw new Error('Terjadi kesalahan saat login: ' + error.message);
      }

      // Cast the data to our expected type
      const authResult = data as unknown as AppAuthResponse;

      console.log('Auth result:', authResult);

      // Check if authentication was successful
      if (!authResult || !authResult.success) {
        console.error('Authentication failed:', authResult?.message);
        throw new Error(authResult?.message || 'Login gagal');
      }

      // Create a temporary session for the app user
      return {
        success: true,
        user: {
          id: authResult.user_id,
          email: authResult.email,
          user_metadata: {
            full_name: authResult.full_name,
            username: authResult.username,
            role: authResult.role,
            app_user_id: authResult.app_user_id
          }
        }
      };
    } catch (error: any) {
      console.error('Error in authenticateAppUser:', error);
      throw error;
    }
  };

  return {
    authenticateAppUser
  };
};
