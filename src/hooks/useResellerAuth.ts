
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ResellerSession {
  id: string;
  name: string;
  phone: string;
  catalogToken: string;
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
      
      // Find reseller by phone number
      const { data: resellerData, error: resellerError } = await supabase
        .from('resellers')
        .select('*')
        .eq('phone', phone)
        .eq('is_active', true)
        .single();

      console.log('Reseller query result:', { resellerData, resellerError });

      if (resellerError || !resellerData) {
        throw new Error('Reseller tidak ditemukan atau tidak aktif');
      }

      // Simple password verification (enhance this with proper hashing)
      if (password !== '123456') {
        throw new Error('Password salah');
      }

      console.log('Password verified, creating session...');

      // Create a simple session without requiring catalog token from database
      const sessionData: ResellerSession = {
        id: resellerData.id,
        name: resellerData.name,
        phone: resellerData.phone,
        catalogToken: `reseller_${resellerData.id}_${Date.now()}` // Simple token generation
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
