
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ResellerOrderHistory {
  id: string;
  reseller_id: string;
  order_id: string;
  order_date: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  commission_earned: number;
  points_earned: number;
  order_status: string;
  order_items: any[];
  created_at: string;
  updated_at: string;
}

// Hook untuk mengambil semua histori order reseller (untuk admin panel)
export const useAllResellerOrderHistory = () => {
  return useQuery({
    queryKey: ['reseller-order-history-all'],
    queryFn: async () => {
      console.log('=== FETCHING ALL RESELLER ORDER HISTORY ===');
      
      const { data, error } = await supabase
        .from('reseller_order_history')
        .select(`
          *,
          resellers (
            id,
            name,
            phone,
            branch_id,
            branches (
              name
            )
          )
        `)
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error fetching reseller order history:', error);
        throw error;
      }

      console.log(`✓ Fetched ${data?.length || 0} reseller order history records`);
      console.log('Sample data:', data?.slice(0, 2));
      return data as (ResellerOrderHistory & { resellers: any })[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

// Hook untuk mengambil histori order specific reseller (untuk app reseller)
export const useResellerOrderHistory = (resellerId: string | null) => {
  return useQuery({
    queryKey: ['reseller-order-history', resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      
      console.log('=== FETCHING RESELLER ORDER HISTORY FOR:', resellerId, '===');
      
      const { data, error } = await supabase
        .from('reseller_order_history')
        .select('*')
        .eq('reseller_id', resellerId)
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error fetching reseller order history:', error);
        throw error;
      }

      console.log(`✓ Fetched ${data?.length || 0} order history records for reseller ${resellerId}`);
      console.log('Reseller order history data:', data);
      return data as ResellerOrderHistory[];
    },
    enabled: !!resellerId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

// Hook untuk menghitung statistik komisi dan poin berdasarkan histori
export const useResellerCommissionStats = () => {
  return useQuery({
    queryKey: ['reseller-commission-stats'],
    queryFn: async () => {
      console.log('=== CALCULATING COMMISSION STATS FROM HISTORY ===');
      
      const { data, error } = await supabase
        .from('reseller_order_history')
        .select(`
          reseller_id,
          commission_earned,
          points_earned,
          order_status,
          total_amount,
          resellers (
            id,
            name,
            phone,
            branch_id,
            branches (
              name
            )
          )
        `);

      if (error) {
        console.error('Error fetching commission stats:', error);
        throw error;
      }

      console.log(`✓ Found ${data?.length || 0} order history records for stats calculation`);

      // Group by reseller and calculate totals
      const statsMap = new Map();
      
      data?.forEach(record => {
        const resellerId = record.reseller_id;
        if (!statsMap.has(resellerId)) {
          statsMap.set(resellerId, {
            reseller: record.resellers,
            totalCommission: 0,
            totalPoints: 0,
            paidCommission: 0,
            paidPoints: 0,
            unpaidCommission: 0,
            unpaidPoints: 0,
            totalOrders: 0,
            completedOrders: 0,
            totalAmount: 0
          });
        }

        const stats = statsMap.get(resellerId);
        const commission = Number(record.commission_earned) || 0;
        const points = Number(record.points_earned) || 0;
        const amount = Number(record.total_amount) || 0;
        
        stats.totalCommission += commission;
        stats.totalPoints += points;
        stats.totalOrders += 1;
        stats.totalAmount += amount;

        // Consider completed/selesai orders as paid
        if (record.order_status === 'completed' || record.order_status === 'selesai') {
          stats.paidCommission += commission;
          stats.paidPoints += points;
          stats.completedOrders += 1;
        } else {
          stats.unpaidCommission += commission;
          stats.unpaidPoints += points;
        }
      });

      const result = Array.from(statsMap.values());
      console.log(`✓ Calculated stats for ${result.length} resellers`);
      console.log('Total commission calculated:', result.reduce((sum, stat) => sum + stat.totalCommission, 0));
      console.log('Sample stats:', result.slice(0, 2));
      return result;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

// Hook untuk manual trigger sinkronisasi data
export const useTriggerOrderSync = () => {
  return async () => {
    console.log('=== TRIGGERING MANUAL ORDER SYNC ===');
    
    try {
      // Get all orders with catalog tokens
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_commission_snapshot,
            product_points_snapshot
          )
        `)
        .not('catalog_token', 'is', null);

      if (ordersError) {
        console.error('Error fetching orders for sync:', ordersError);
        return;
      }

      console.log(`Found ${orders?.length || 0} orders with catalog tokens`);

      // Process each order to ensure it's in history
      for (const order of orders || []) {
        // Get reseller info from catalog token
        const { data: catalogData } = await supabase
          .from('catalog_tokens')
          .select(`
            reseller_id,
            resellers (
              id,
              name
            )
          `)
          .eq('token', order.catalog_token)
          .single();

        if (catalogData?.reseller_id) {
          // Calculate commission and points
          const totalCommission = (order.order_items || []).reduce((sum: number, item: any) => {
            return sum + ((item.product_commission_snapshot || 0) * item.quantity);
          }, 0);

          const totalPoints = (order.order_items || []).reduce((sum: number, item: any) => {
            return sum + ((item.product_points_snapshot || 0) * item.quantity);
          }, 0);

          const orderItems = (order.order_items || []).map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_price: item.product_price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            commission_snapshot: item.product_commission_snapshot,
            points_snapshot: item.product_points_snapshot
          }));

          // Insert or update in history
          const { error: historyError } = await supabase
            .from('reseller_order_history')
            .upsert({
              reseller_id: catalogData.reseller_id,
              order_id: order.id,
              order_date: order.created_at,
              customer_name: order.customer_name,
              customer_phone: order.customer_phone,
              total_amount: order.total_amount,
              commission_earned: totalCommission,
              points_earned: totalPoints,
              order_status: order.status,
              order_items: orderItems
            }, { 
              onConflict: 'reseller_id,order_id',
              ignoreDuplicates: false 
            });

          if (historyError) {
            console.error('Error upserting history record:', historyError);
          } else {
            console.log(`✓ Synced order ${order.id} to history`);
          }
        }
      }

      console.log('✓ Manual sync completed');
    } catch (error) {
      console.error('Error in manual sync:', error);
    }
  };
};
