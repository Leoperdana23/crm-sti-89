
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useResellerOrders = (resellerId: string | null) => {
  return useQuery({
    queryKey: ['reseller-orders', resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      
      console.log('Fetching reseller orders for reseller ID:', resellerId);
      
      const { data, error } = await supabase
        .from('reseller_orders')
        .select(`
          *,
          orders (
            *,
            order_items (*)
          )
        `)
        .eq('reseller_id', resellerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reseller orders:', error);
        throw error;
      }

      console.log('Reseller orders fetched successfully:', data);
      return data || [];
    },
    enabled: !!resellerId,
  });
};
