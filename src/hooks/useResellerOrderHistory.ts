
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
    queryKey: ['reseller-order-history'],
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

      console.log(`Fetched ${data?.length} reseller order history records`);
      return data as (ResellerOrderHistory & { resellers: any })[];
    },
  });
};

// Hook untuk mengambil histori order specific reseller (untuk app reseller)
export const useResellerOrderHistory = (resellerId: string | null) => {
  return useQuery({
    queryKey: ['reseller-order-history', resellerId],
    queryFn: async () => {
      if (!resellerId) return [];
      
      console.log('Fetching reseller order history for reseller ID:', resellerId);
      
      const { data, error } = await supabase
        .from('reseller_order_history')
        .select('*')
        .eq('reseller_id', resellerId)
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error fetching reseller order history:', error);
        throw error;
      }

      console.log('Reseller order history fetched successfully:', data);
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
            completedOrders: 0
          });
        }

        const stats = statsMap.get(resellerId);
        stats.totalCommission += record.commission_earned || 0;
        stats.totalPoints += record.points_earned || 0;
        stats.totalOrders += 1;

        // Consider completed/selesai orders as paid
        if (record.order_status === 'completed' || record.order_status === 'selesai') {
          stats.paidCommission += record.commission_earned || 0;
          stats.paidPoints += record.points_earned || 0;
          stats.completedOrders += 1;
        } else {
          stats.unpaidCommission += record.commission_earned || 0;
          stats.unpaidPoints += record.points_earned || 0;
        }
      });

      const result = Array.from(statsMap.values());
      console.log('Commission stats calculated:', result);
      return result;
    },
  });
};
