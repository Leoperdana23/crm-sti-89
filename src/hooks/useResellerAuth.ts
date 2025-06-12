
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
      // Find reseller by phone number
      const { data: resellerData, error: resellerError } = await supabase
        .from('resellers')
        .select('*')
        .eq('phone', phone)
        .eq('is_active', true)
        .single();

      if (resellerError || !resellerData) {
        throw new Error('Reseller tidak ditemukan atau tidak aktif');
      }

      // Simple password verification (enhance this with proper hashing)
      if (password !== '123456') {
        throw new Error('Password salah');
      }

      // Generate or get catalog token
      let catalogToken = '';
      
      const { data: existingToken } = await supabase
        .from('catalog_tokens')
        .select('*')
        .eq('reseller_id', resellerData.id)
        .eq('is_active', true)
        .maybeSingle();

      if (existingToken && existingToken.expires_at && new Date(existingToken.expires_at) > new Date()) {
        catalogToken = existingToken.token;
      } else {
        const { data: newToken, error: createTokenError } = await supabase
          .from('catalog_tokens')
          .insert({
            reseller_id: resellerData.id,
            token: `reseller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true
          })
          .select()
          .single();

        if (createTokenError || !newToken) {
          throw new Error('Gagal membuat token akses');
        }

        catalogToken = newToken.token;
      }

      const sessionData: ResellerSession = {
        id: resellerData.id,
        name: resellerData.name,
        phone: resellerData.phone,
        catalogToken: catalogToken
      };

      localStorage.setItem('resellerSession', JSON.stringify(sessionData));
      setSession(sessionData);

      return { success: true, session: sessionData };
    } catch (error: any) {
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
