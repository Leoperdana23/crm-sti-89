
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types/order';

export const useResellerOrders = (catalogToken: string | null) => {
  return useQuery({
    queryKey: ['reseller-orders', catalogToken],
    queryFn: async () => {
      if (!catalogToken) return [];
      
      console.log('Fetching reseller orders for token:', catalogToken);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *
          )
        `)
        .eq('catalog_token', catalogToken)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reseller orders:', error);
        throw error;
      }

      console.log('Reseller orders fetched successfully:', data);
      return data as (Order & { order_items: OrderItem[] })[];
    },
    enabled: !!catalogToken,
  });
};
