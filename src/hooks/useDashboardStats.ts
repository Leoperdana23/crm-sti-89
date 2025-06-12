
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalCustomers: number;
  totalProspects: number;
  totalDeals: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  monthlyGrowth: number;
  customersByStatus: {
    prospek: number;
    followUp: number;
    deal: number;
    tidakJadi: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'customer' | 'order' | 'interaction';
    message: string;
    timestamp: string;
    customer?: string;
  }>;
}

// Fallback sample data
const fallbackStats: DashboardStats = {
  totalCustomers: 150,
  totalProspects: 45,
  totalDeals: 25,
  totalOrders: 18,
  totalRevenue: 125000000,
  conversionRate: 18.5,
  monthlyGrowth: 12.3,
  customersByStatus: {
    prospek: 45,
    followUp: 38,
    deal: 25,
    tidakJadi: 42
  },
  recentActivities: [
    {
      id: '1',
      type: 'customer',
      message: 'Customer baru ditambahkan: Budi Santoso',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      customer: 'Budi Santoso'
    },
    {
      id: '2',
      type: 'order',
      message: 'Pesanan baru dari Siti Rahayu - Rp 2.500.000',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      customer: 'Siti Rahayu'
    },
    {
      id: '3',
      type: 'interaction',
      message: 'Follow-up call dengan Agus Wijaya',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      customer: 'Agus Wijaya'
    }
  ]
};

export const useDashboardStats = () => {
  const query = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        console.log('Fetching dashboard stats...');

        // Fetch customers data
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('status, created_at');

        // Fetch orders data
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('total_amount, created_at, status');

        // Fetch recent interactions
        const { data: interactionsData, error: interactionsError } = await supabase
          .from('interactions')
          .select(`
            id,
            type,
            notes,
            date,
            customers (name)
          `)
          .order('date', { ascending: false })
          .limit(5);

        // If any error occurs, use fallback data
        if (customersError || ordersError || interactionsError) {
          console.error('Error fetching dashboard data:', { customersError, ordersError, interactionsError });
          console.log('Using fallback dashboard stats');
          return fallbackStats;
        }

        // Calculate stats from real data if available
        if (customersData && ordersData) {
          const totalCustomers = customersData.length;
          const customersByStatus = customersData.reduce((acc, customer) => {
            switch (customer.status) {
              case 'Prospek':
                acc.prospek++;
                break;
              case 'Follow-up':
                acc.followUp++;
                break;
              case 'Deal':
                acc.deal++;
                break;
              case 'Tidak Jadi':
                acc.tidakJadi++;
                break;
            }
            return acc;
          }, { prospek: 0, followUp: 0, deal: 0, tidakJadi: 0 });

          const totalOrders = ordersData.filter(order => order.status === 'completed').length;
          const totalRevenue = ordersData
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + (order.total_amount || 0), 0);

          const conversionRate = totalCustomers > 0 ? (customersByStatus.deal / totalCustomers) * 100 : 0;

          // Format recent activities
          const recentActivities = (interactionsData || []).map(interaction => ({
            id: interaction.id,
            type: 'interaction' as const,
            message: `${interaction.type} - ${interaction.notes}`,
            timestamp: interaction.date,
            customer: interaction.customers?.name || 'Unknown'
          }));

          console.log('Dashboard stats calculated from real data');
          return {
            totalCustomers,
            totalProspects: customersByStatus.prospek,
            totalDeals: customersByStatus.deal,
            totalOrders,
            totalRevenue,
            conversionRate,
            monthlyGrowth: 12.3, // This would need more complex calculation
            customersByStatus,
            recentActivities
          };
        }

        console.log('Using fallback dashboard stats - no data available');
        return fallbackStats;
      } catch (error) {
        console.error('Network error fetching dashboard stats:', error);
        console.log('Using fallback dashboard stats due to network error');
        return fallbackStats;
      }
    },
  });

  return {
    stats: query.data || fallbackStats,
    loading: query.isLoading,
    error: query.error,
    ...query
  };
};
