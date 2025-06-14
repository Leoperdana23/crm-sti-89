
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  active_resellers: number;
  total_products: number;
  pending_orders: number;
  completed_orders: number;
  monthly_revenue: number;
  monthly_orders: number;
  top_products: Array<{
    id: string;
    name: string;
    sales_count: number;
    revenue: number;
  }>;
  recent_orders: Array<{
    id: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  // Additional computed properties for compatibility
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  customersByStatus: {
    prospek: number;
    followUp: number;
    deal: number;
    tidakJadi: number;
  };
  recentActivities: Array<{
    id: string;
    message: string;
    customer: string;
    timestamp: string;
  }>;
}

export const useDashboardStats = () => {
  const query = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      console.log('Fetching real-time dashboard stats...');

      // Use Promise.all for parallel queries to improve performance
      const [
        customersResult,
        ordersResult,
        revenueResult,
        resellersResult,
        productsResult,
        pendingOrdersResult,
        completedOrdersResult,
        monthlyRevenueResult,
        monthlyOrdersResult
      ] = await Promise.all([
        // Get total customers
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        
        // Get total orders
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        
        // Get total revenue from completed orders
        supabase.from('orders')
          .select('total_amount')
          .in('status', ['completed', 'selesai']),
        
        // Get active resellers
        supabase.from('resellers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        
        // Get total active products
        supabase.from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        
        // Get pending orders
        supabase.from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        
        // Get completed orders
        supabase.from('orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['completed', 'selesai']),
        
        // Get monthly revenue (current month)
        (() => {
          const currentMonth = new Date();
          const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          
          return supabase.from('orders')
            .select('total_amount')
            .in('status', ['completed', 'selesai'])
            .gte('created_at', firstDay.toISOString())
            .lte('created_at', lastDay.toISOString());
        })(),
        
        // Get monthly orders count
        (() => {
          const currentMonth = new Date();
          const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          
          return supabase.from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', firstDay.toISOString())
            .lte('created_at', lastDay.toISOString());
        })()
      ]);

      const total_customers = customersResult.count || 0;
      const total_orders = ordersResult.count || 0;
      const total_revenue = revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const active_resellers = resellersResult.count || 0;
      const total_products = productsResult.count || 0;
      const pending_orders = pendingOrdersResult.count || 0;
      const completed_orders = completedOrdersResult.count || 0;
      const monthly_revenue = monthlyRevenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const monthly_orders = monthlyOrdersResult.count || 0;

      // Get top products with real sales data
      const { data: orderItemsData } = await supabase
        .from('order_items')
        .select(`
          product_id,
          product_name,
          quantity,
          subtotal,
          orders!inner(status)
        `)
        .in('orders.status', ['completed', 'selesai']);

      const productStats = orderItemsData?.reduce((acc: any, item) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            id: productId,
            name: item.product_name,
            sales_count: 0,
            revenue: 0
          };
        }
        acc[productId].sales_count += item.quantity;
        acc[productId].revenue += item.subtotal || 0;
        return acc;
      }, {}) || {};

      const top_products = Object.values(productStats)
        .sort((a: any, b: any) => b.sales_count - a.sales_count)
        .slice(0, 5) as any[];

      // Get recent orders with accurate data
      const { data: recent_orders } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get customer stats by status with real-time data
      const { data: customerData } = await supabase
        .from('customers')
        .select('status');

      const customersByStatus = customerData?.reduce((acc: any, customer) => {
        const status = customer.status?.toLowerCase() || 'prospek';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {
        prospek: 0,
        followUp: 0,
        deal: 0,
        tidakJadi: 0
      }) || { prospek: 0, followUp: 0, deal: 0, tidakJadi: 0 };

      // Get real recent activities from interactions and orders
      const { data: recentInteractions } = await supabase
        .from('interactions')
        .select(`
          id,
          type,
          notes,
          date,
          customers!inner(name)
        `)
        .order('date', { ascending: false })
        .limit(5);

      const recentActivities = recentInteractions?.map(interaction => ({
        id: interaction.id,
        message: `${interaction.type}: ${interaction.notes}`,
        customer: (interaction.customers as any)?.name || 'Unknown',
        timestamp: interaction.date
      })) || [];

      // Calculate conversion rate
      const totalCustomersCount = total_customers || 0;
      const dealsCount = customersByStatus.deal || 0;
      const conversionRate = totalCustomersCount > 0 ? (dealsCount / totalCustomersCount) * 100 : 0;

      console.log('Real-time dashboard stats fetched successfully', {
        total_customers,
        total_orders,
        total_revenue,
        active_resellers,
        monthly_revenue
      });

      return {
        total_customers,
        total_orders,
        total_revenue,
        active_resellers,
        total_products,
        pending_orders,
        completed_orders,
        monthly_revenue,
        monthly_orders,
        top_products,
        recent_orders: recent_orders || [],
        // Computed properties for compatibility
        totalCustomers: total_customers,
        totalOrders: total_orders,
        totalRevenue: total_revenue,
        conversionRate,
        customersByStatus,
        recentActivities
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  return {
    stats: query.data,
    loading: query.isLoading,
    error: query.error,
    ...query
  };
};
