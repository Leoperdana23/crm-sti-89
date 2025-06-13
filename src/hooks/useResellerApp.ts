
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ResellerSession, ResellerStats, ResellerOrder } from '@/types/resellerApp';

export const useResellerApp = () => {
  const [session, setSession] = useState<ResellerSession | null>(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('reseller_session');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (parsed.expires_at && new Date(parsed.expires_at) > new Date()) {
          setSession(parsed);
        } else {
          localStorage.removeItem('reseller_session');
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem('reseller_session');
      }
    }
  }, []);

  const login = (sessionData: ResellerSession) => {
    setSession(sessionData);
    localStorage.setItem('reseller_session', JSON.stringify(sessionData));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('reseller_session');
  };

  return { session, login, logout };
};

export const useResellerStats = (resellerId: string | null) => {
  return useQuery({
    queryKey: ['reseller-stats', resellerId],
    queryFn: async () => {
      if (!resellerId) return null;
      
      console.log('Fetching reseller stats for ID:', resellerId);
      
      const { data, error } = await supabase
        .rpc('get_reseller_stats', { reseller_id_input: resellerId });

      if (error) {
        console.error('Error fetching reseller stats:', error);
        throw error;
      }

      console.log('Reseller stats fetched:', data);
      return data as ResellerStats;
    },
    enabled: !!resellerId,
  });
};

export const useResellerOrders = (resellerId: string | null) => {
  return useQuery({
    queryKey: ['reseller-orders-list', resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      
      console.log('Fetching reseller orders for ID:', resellerId);
      
      const { data, error } = await supabase
        .from('reseller_orders')
        .select(`
          *,
          orders (
            *,
            order_items (
              *,
              products (
                points_value
              )
            )
          )
        `)
        .eq('reseller_id', resellerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reseller orders:', error);
        throw error;
      }

      console.log('Reseller orders fetched:', data);
      return data as ResellerOrder[];
    },
    enabled: !!resellerId,
  });
};
