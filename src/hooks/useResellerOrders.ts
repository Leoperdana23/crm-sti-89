
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useResellerOrders = (resellerId: string | null) => {
  return useQuery({
    queryKey: ['reseller-orders', resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      
      console.log('Fetching reseller orders for reseller ID:', resellerId);
      
      // Fetch from reseller_orders table with join to orders and order_items including snapshot data
      const { data, error } = await supabase
        .from('reseller_orders')
        .select(`
          *,
          orders (
            *,
            order_items (
              *,
              product_commission_snapshot,
              product_points_snapshot,
              products (
                points_value,
                commission_value
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

      console.log('Reseller orders fetched successfully:', data);
      
      // Transform data to return format expected with snapshot-based commission calculation
      return (data || []).map(resellerOrder => {
        const order = resellerOrder.orders;
        
        // Calculate total commission from snapshot values in order_items
        const totalCommissionFromSnapshot = order.order_items?.reduce((total: number, item: any) => {
          const snapshotCommission = item.product_commission_snapshot || 0;
          return total + (snapshotCommission * item.quantity);
        }, 0) || 0;

        return {
          ...order,
          commission_rate: resellerOrder.commission_rate,
          commission_amount: totalCommissionFromSnapshot, // Use snapshot-based commission
          reseller_order_status: resellerOrder.status
        };
      }) || [];
    },
    enabled: !!resellerId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};
