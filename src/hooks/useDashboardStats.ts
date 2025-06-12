
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

export const useDashboardStats = () => {
  const query = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        console.log('Fetching dashboard stats from database...');

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

        // Handle errors but still provide basic stats
        if (customersError) {
          console.error('Error fetching customers for stats:', customersError);
        }
        if (ordersError) {
          console.error('Error fetching orders for stats:', ordersError);
        }
        if (interactionsError) {
          console.error('Error fetching interactions for stats:', interactionsError);
        }

        // Calculate stats from available data
        const customers = customersData || [];
        const orders = ordersData || [];
        const interactions = interactionsData || [];

        const customersByStatus = customers.reduce((acc, customer) => {
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

        const completedOrders = orders.filter(order => order.status === 'completed');
        const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const conversionRate = customers.length > 0 ? (customersByStatus.deal / customers.length) * 100 : 0;

        // Format recent activities
        const recentActivities = interactions.map(interaction => ({
          id: interaction.id,
          type: 'interaction' as const,
          message: `${interaction.type} - ${interaction.notes}`,
          timestamp: interaction.date,
          customer: interaction.customers?.name || 'Unknown'
        }));

        console.log('Dashboard stats calculated successfully');
        
        return {
          totalCustomers: customers.length,
          totalProspects: customersByStatus.prospek,
          totalDeals: customersByStatus.deal,
          totalOrders: completedOrders.length,
          totalRevenue,
          conversionRate,
          monthlyGrowth: 0, // This would need historical data for proper calculation
          customersByStatus,
          recentActivities
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        
        // Return empty stats in case of error
        return {
          totalCustomers: 0,
          totalProspects: 0,
          totalDeals: 0,
          totalOrders: 0,
          totalRevenue: 0,
          conversionRate: 0,
          monthlyGrowth: 0,
          customersByStatus: {
            prospek: 0,
            followUp: 0,
            deal: 0,
            tidakJadi: 0
          },
          recentActivities: []
        };
      }
    },
  });

  return {
    stats: query.data || {
      totalCustomers: 0,
      totalProspects: 0,
      totalDeals: 0,
      totalOrders: 0,
      totalRevenue: 0,
      conversionRate: 0,
      monthlyGrowth: 0,
      customersByStatus: {
        prospek: 0,
        followUp: 0,
        deal: 0,
        tidakJadi: 0
      },
      recentActivities: []
    },
    loading: query.isLoading,
    error: query.error,
    ...query
  };
};
