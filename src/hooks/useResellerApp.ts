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
        // Don't check expiration for reseller sessions - keep them persistent
        setSession(parsed);
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

  const clearResellerSession = () => {
    logout();
  };

  const createCatalogTokenIfNotExists = async (resellerId: string) => {
    console.log('Checking if catalog token exists for reseller:', resellerId);
    
    // Check if catalog token exists
    const { data: existingToken } = await supabase
      .from('catalog_tokens')
      .select('token')
      .eq('reseller_id', resellerId)
      .maybeSingle();

    if (!existingToken) {
      console.log('Creating new catalog token for reseller:', resellerId);
      // Create new catalog token
      const { data: newToken, error } = await supabase
        .from('catalog_tokens')
        .insert({
          reseller_id: resellerId,
          name: `Token untuk Reseller ${resellerId}`,
          description: 'Auto-generated token for reseller',
          is_active: true
        })
        .select('token')
        .single();

      if (error) {
        console.error('Error creating catalog token:', error);
      } else {
        console.log('Created new catalog token:', newToken.token);
      }
    }
  };

  const authenticateReseller = async (phone: string, password: string) => {
    console.log('Authenticating reseller with phone:', phone);
    
    const { data, error } = await supabase.rpc('authenticate_reseller_app', {
      phone_input: phone,
      password_input: password
    });

    if (error) {
      console.error('Authentication error:', error);
      throw new Error(error.message || 'Authentication failed');
    }

    // Type assertion for the response data
    const responseData = data as any;

    if (!responseData.success) {
      throw new Error(responseData.message || 'Authentication failed');
    }

    const sessionData: ResellerSession = {
      id: responseData.reseller.id,
      name: responseData.reseller.name,
      phone: responseData.reseller.phone,
      email: responseData.reseller.email,
      address: responseData.reseller.address,
      commission_rate: responseData.reseller.commission_rate,
      total_points: responseData.reseller.total_points,
      token: responseData.token,
      expires_at: responseData.expires_at,
    };

    // Ensure catalog token exists
    await createCatalogTokenIfNotExists(sessionData.id);

    login(sessionData);

    return {
      success: true,
      session: sessionData
    };
  };

  return { session, login, logout, clearResellerSession, authenticateReseller };
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
      return data as unknown as ResellerStats;
    },
    enabled: !!resellerId,
  });
};

// New hook to get reseller balance including redemptions
export const useResellerBalance = (resellerId: string | null) => {
  return useQuery({
    queryKey: ['reseller-balance', resellerId],
    queryFn: async () => {
      if (!resellerId) return null;
      
      console.log('Fetching reseller balance for ID:', resellerId);
      
      // Get all reseller orders to calculate total commission and points
      const { data: resellerOrders, error: ordersError } = await supabase
        .from('reseller_orders')
        .select(`
          *,
          orders (
            *,
            order_items (
              *,
              product_commission_snapshot,
              product_points_snapshot
            )
          )
        `)
        .eq('reseller_id', resellerId);

      if (ordersError) {
        console.error('Error fetching reseller orders:', ordersError);
        throw ordersError;
      }

      // Calculate total commission and points from orders
      let totalCommission = 0;
      let totalPoints = 0;

      resellerOrders?.forEach(resellerOrder => {
        const order = resellerOrder.orders;
        if (order && order.order_items) {
          // Calculate commission from snapshot values
          const orderCommission = order.order_items.reduce((total: number, item: any) => {
            const snapshotCommission = item.product_commission_snapshot || 0;
            return total + (snapshotCommission * item.quantity);
          }, 0);

          // Calculate points from snapshot values
          const orderPoints = order.order_items.reduce((total: number, item: any) => {
            const snapshotPoints = item.product_points_snapshot || 0;
            return total + (snapshotPoints * item.quantity);
          }, 0);

          totalCommission += orderCommission;
          totalPoints += orderPoints;
        }
      });

      // Get approved redemptions
      const { data: redemptions, error: redemptionsError } = await supabase
        .from('reward_redemptions')
        .select('*')
        .eq('reseller_id', resellerId)
        .eq('status', 'approved');

      if (redemptionsError) {
        console.error('Error fetching redemptions:', redemptionsError);
        throw redemptionsError;
      }

      // Calculate redeemed amounts
      const redeemedCommission = redemptions
        ?.filter(r => r.reward_type === 'commission')
        .reduce((sum, r) => sum + (r.amount_redeemed || 0), 0) || 0;

      const redeemedPoints = redemptions
        ?.filter(r => r.reward_type === 'points')
        .reduce((sum, r) => sum + (r.amount_redeemed || 0), 0) || 0;

      // Calculate remaining balances
      const remainingCommission = totalCommission - redeemedCommission;
      const remainingPoints = totalPoints - redeemedPoints;

      console.log('Reseller balance calculated:', {
        totalCommission,
        totalPoints,
        redeemedCommission,
        redeemedPoints,
        remainingCommission,
        remainingPoints
      });

      return {
        totalCommission,
        totalPoints,
        redeemedCommission,
        redeemedPoints,
        remainingCommission,
        remainingPoints
      };
    },
    enabled: !!resellerId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};
