
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResellerSession {
  id: string;
  name: string;
  phone: string;
  catalogToken: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  reseller?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address: string;
    commission_rate: number;
    total_points: number;
  };
  token?: string;
  expires_at?: string;
  login_history_id?: string;
}

export const useResellerAuth = () => {
  const [session, setSession] = useState<ResellerSession | null>(() => {
    const stored = localStorage.getItem('resellerSession');
    return stored ? JSON.parse(stored) : null;
  });

  const getResellerSession = (): ResellerSession | null => {
    const stored = localStorage.getItem('resellerSession');
    return stored ? JSON.parse(stored) : null;
  };

  const clearResellerSession = () => {
    localStorage.removeItem('resellerSession');
    setSession(null);
  };

  const authenticateReseller = async (phone: string, password: string) => {
    try {
      console.log('=== RESELLER AUTH START ===');
      console.log('Phone:', phone);

      // Get client IP and user agent for logging
      const userAgent = navigator.userAgent;
      let clientIP = 'Unknown';
      
      try {
        // Try to get client IP (this is optional and might not work in all environments)
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        clientIP = ipData.ip;
      } catch (error) {
        console.log('Could not fetch IP address:', error);
      }

      // Call the database function to authenticate and log the attempt
      const { data, error } = await supabase.rpc('authenticate_reseller_app', {
        phone_input: phone,
        password_input: password
      });

      console.log('Database authentication result:', { data, error });

      if (error) {
        throw new Error(error.message || 'Authentication failed');
      }

      // Type cast the response to our interface with proper type safety
      const authResult = data as unknown as AuthResponse;

      if (!authResult.success) {
        throw new Error(authResult.message || 'Authentication failed');
      }

      // Update the login history record with IP and user agent
      if (authResult.login_history_id) {
        await supabase
          .from('reseller_login_history')
          .update({
            ip_address: clientIP,
            user_agent: userAgent
          })
          .eq('id', authResult.login_history_id);
      }

      console.log('Login history updated with IP and user agent');

      // Create session data
      const sessionData: ResellerSession = {
        id: authResult.reseller!.id,
        name: authResult.reseller!.name,
        phone: authResult.reseller!.phone,
        catalogToken: authResult.token!
      };

      console.log('Session created:', sessionData);

      localStorage.setItem('resellerSession', JSON.stringify(sessionData));
      setSession(sessionData);

      return { success: true, session: sessionData };
    } catch (error: any) {
      console.error('=== RESELLER AUTH ERROR ===', error);
      throw error;
    }
  };

  return {
    session,
    getResellerSession,
    clearResellerSession,
    authenticateReseller
  };
};
