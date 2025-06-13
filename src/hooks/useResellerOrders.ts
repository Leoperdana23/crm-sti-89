
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useResellerOrders = (resellerId: string | null) => {
  return useQuery({
    queryKey: ['reseller-orders', resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      
      console.log('Fetching reseller orders for reseller ID:', resellerId);
      
      // Langsung ambil dari reseller_orders table dengan join ke orders
      const { data, error } = await supabase
        .from('reseller_orders')
        .select(`
          *,
          orders (
            *,
            order_items (
              *,
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
      
      // Transform data untuk mengembalikan format yang diharapkan dengan kalkulasi komisi berdasarkan produk
      return (data || []).map(resellerOrder => {
        const order = resellerOrder.orders;
        
        // Calculate total commission from product commission values
        const totalCommissionFromProducts = order.order_items?.reduce((total: number, item: any) => {
          const productCommission = item.products?.commission_value || 0;
          return total + (productCommission * item.quantity);
        }, 0) || 0;

        return {
          ...order,
          commission_rate: resellerOrder.commission_rate,
          commission_amount: totalCommissionFromProducts, // Use calculated commission from products
          reseller_order_status: resellerOrder.status
        };
      }) || [];
    },
    enabled: !!resellerId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};
