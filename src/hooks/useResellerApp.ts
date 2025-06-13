
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResellerSession, ResellerStats, ResellerOrder } from '@/types/resellerApp';

export const useResellerApp = () => {
  const [session, setSession] = useState<ResellerSession | null>(() => {
    const stored = localStorage.getItem('resellerAppSession');
    return stored ? JSON.parse(stored) : null;
  });

  const getResellerSession = (): ResellerSession | null => {
    const stored = localStorage.getItem('resellerAppSession');
    return stored ? JSON.parse(stored) : null;
  };

  const clearResellerSession = () => {
    localStorage.removeItem('resellerAppSession');
    setSession(null);
  };

  const authenticateReseller = async (phone: string, password: string) => {
    try {
      console.log('=== RESELLER APP AUTH START ===');
      console.log('Phone:', phone);
      
      const { data, error } = await supabase.rpc('authenticate_reseller_app', {
        phone_input: phone,
        password_input: password
      });

      if (error) {
        console.error('RPC Error:', error);
        throw new Error('Terjadi kesalahan sistem');
      }

      console.log('Auth result:', data);

      if (!data.success) {
        throw new Error(data.message);
      }

      const sessionData: ResellerSession = {
        id: data.reseller.id,
        name: data.reseller.name,
        phone: data.reseller.phone,
        email: data.reseller.email,
        address: data.reseller.address,
        commission_rate: data.reseller.commission_rate,
        total_points: data.reseller.total_points,
        token: data.token,
        expires_at: data.expires_at
      };

      localStorage.setItem('resellerAppSession', JSON.stringify(sessionData));
      setSession(sessionData);

      return { success: true, session: sessionData };
    } catch (error: any) {
      console.error('=== RESELLER APP AUTH ERROR ===', error);
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

export const useResellerStats = (resellerId: string | null) => {
  const [stats, setStats] = useState<ResellerStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resellerId) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_reseller_stats', {
          reseller_id_input: resellerId
        });

        if (error) throw error;
        setStats(data);
      } catch (error) {
        console.error('Error fetching reseller stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [resellerId]);

  return { stats, loading };
};

export const useResellerOrders = (resellerId: string | null) => {
  const [orders, setOrders] = useState<ResellerOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resellerId) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('reseller_orders')
          .select(`
            *,
            orders (
              customer_name,
              customer_phone,
              total_amount,
              status,
              order_items (
                product_name,
                quantity,
                product_price,
                subtotal
              )
            )
          `)
          .eq('reseller_id', resellerId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching reseller orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [resellerId]);

  return { orders, loading };
};
