
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ResellerLoginHistory {
  id: string;
  reseller_id: string;
  login_time: string;
  ip_address?: string;
  user_agent?: string;
  login_method: string;
  session_token?: string;
  logout_time?: string;
  session_duration?: number;
  created_at: string;
  updated_at: string;
  resellers?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export const useResellerLoginHistory = () => {
  return useQuery({
    queryKey: ['reseller-login-history'],
    queryFn: async () => {
      console.log('Fetching reseller login history...');
      const { data, error } = await supabase
        .from('reseller_login_history')
        .select(`
          *,
          resellers (
            name,
            phone,
            email
          )
        `)
        .order('login_time', { ascending: false });

      if (error) {
        console.error('Error fetching reseller login history:', error);
        throw error;
      }

      console.log('Reseller login history fetched successfully:', data);
      return data as ResellerLoginHistory[];
    },
  });
};

export const useResellerLoginHistoryByReseller = (resellerId: string) => {
  return useQuery({
    queryKey: ['reseller-login-history', resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      
      console.log('Fetching login history for reseller:', resellerId);
      const { data, error } = await supabase
        .from('reseller_login_history')
        .select('*')
        .eq('reseller_id', resellerId)
        .order('login_time', { ascending: false });

      if (error) {
        console.error('Error fetching reseller login history:', error);
        throw error;
      }

      return data as ResellerLoginHistory[];
    },
    enabled: !!resellerId,
  });
};
