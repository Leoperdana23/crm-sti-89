
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useResellerOrders = (resellerId: string | null) => {
  return useQuery({
    queryKey: ['reseller-orders', resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      
      console.log('Fetching reseller orders for reseller ID:', resellerId);
      
      // First get the catalog token for this reseller
      const { data: catalogTokenData, error: tokenError } = await supabase
        .from('catalog_tokens')
        .select('token')
        .eq('reseller_id', resellerId)
        .single();

      if (tokenError || !catalogTokenData) {
        console.error('Error fetching catalog token:', tokenError);
        return [];
      }

      console.log('Found catalog token:', catalogTokenData.token);

      // Then get orders using that token
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              points_value
            )
          )
        `)
        .eq('catalog_token', catalogTokenData.token)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reseller orders:', error);
        throw error;
      }

      console.log('Reseller orders fetched successfully:', data);
      return data || [];
    },
    enabled: !!resellerId,
    refetchInterval: 5000, // Refresh every 5 seconds to catch status changes
  });
};
