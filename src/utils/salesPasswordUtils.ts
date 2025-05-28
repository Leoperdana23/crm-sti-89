
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
      isHashedPassword: data.password_hash?.startsWith('$2') || false,
      isActive: data.is_active
    });

    return data;
  } catch (error) {
    console.error('Error in debugSalesPassword:', error);
    return null;
  }
};

export const resetSalesPassword = async (email: string, newPassword: string) => {
  try {
    console.log('Resetting password for:', email);
    
    // Update the password directly - the database trigger should handle hashing
    const { data, error } = await supabase
      .from('sales')
      .update({ 
        password_hash: newPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Error resetting password:', error);
      throw error;
    }

    console.log('Password reset successful. Final hash length:', data.password_hash?.length);
    console.log('Is properly hashed:', data.password_hash?.startsWith('$2'));
    return data;
  } catch (error) {
    console.error('Error in resetSalesPassword:', error);
    throw error;
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
