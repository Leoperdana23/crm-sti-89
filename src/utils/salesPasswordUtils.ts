
import { supabase } from '@/integrations/supabase/client';

export const debugSalesPassword = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('sales')
      .select('id, name, email, password_hash, is_active')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching sales data:', error);
      return null;
    }

    console.log('Sales debug info:', {
      id: data.id,
      name: data.name,
      email: data.email,
      hasPasswordHash: !!data.password_hash,
      passwordHashLength: data.password_hash?.length || 0,
      isActive: data.is_active
    });

    return data;
  } catch (error) {
    console.error('Error in debugSalesPassword:', error);
    return null;
  }
};

export const testPasswordHash = async (email: string, testPassword: string) => {
  try {
    console.log('Testing password for:', email);
    
    const { data, error } = await supabase.rpc('authenticate_sales_user', {
      email_input: email,
      password_input: testPassword
    });

    console.log('Test result:', { data, error });
    return { data, error };
  } catch (error) {
    console.error('Error testing password:', error);
    return { data: null, error };
  }
};
