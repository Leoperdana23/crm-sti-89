
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

export const hashPasswordWithBcrypt = async (plainPassword: string): Promise<string> => {
  try {
    // Use the Supabase function to hash the password properly
    const { data, error } = await supabase.rpc('hash_password_bcrypt', {
      password_input: plainPassword
    });

    if (error) {
      console.error('Error hashing password:', error);
      // Fallback: let the database trigger handle it
      return plainPassword;
    }

    return data || plainPassword;
  } catch (error) {
    console.error('Error in hashPasswordWithBcrypt:', error);
    // Fallback: let the database trigger handle it
    return plainPassword;
  }
};

export const resetSalesPassword = async (email: string, newPassword: string) => {
  try {
    console.log('Resetting password for:', email);
    
    // First, let's try to hash the password using a direct database call
    const { data: hashedPassword, error: hashError } = await supabase.rpc('hash_password_bcrypt', {
      password_input: newPassword
    });

    let passwordToStore = newPassword;
    if (!hashError && hashedPassword) {
      passwordToStore = hashedPassword;
      console.log('Password hashed successfully, length:', hashedPassword.length);
    } else {
      console.log('Hash function not available, using plain password (database trigger should handle)');
    }
    
    // Update the password
    const { data, error } = await supabase
      .from('sales')
      .update({ 
        password_hash: passwordToStore,
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

export const forcePasswordReset = async (email: string, password: string) => {
  try {
    console.log('Force resetting password with direct SQL for:', email);
    
    // Use a more direct approach with SQL
    const { data, error } = await supabase.rpc('force_reset_sales_password', {
      sales_email: email,
      new_password: password
    });

    if (error) {
      console.error('Error in force reset:', error);
      throw error;
    }

    console.log('Force password reset successful');
    return data;
  } catch (error) {
    console.error('Error in forcePasswordReset:', error);
    throw error;
  }
};
