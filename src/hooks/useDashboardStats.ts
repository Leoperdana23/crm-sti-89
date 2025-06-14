
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
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      console.log('Fetching dashboard stats...');

      // Get total customers
      const { count: total_customers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Get total orders
      const { count: total_orders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');

      const total_revenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Get active resellers
      const { count: active_resellers } = await supabase
        .from('resellers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total products
      const { count: total_products } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get pending orders
      const { count: pending_orders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get completed orders
      const { count: completed_orders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Get monthly revenue (current month)
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: monthlyRevenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', firstDay.toISOString())
        .lte('created_at', lastDay.toISOString());

      const monthly_revenue = monthlyRevenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Get monthly orders count
      const { count: monthly_orders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDay.toISOString())
        .lte('created_at', lastDay.toISOString());

      // Get top products (most ordered)
      const { data: orderItemsData } = await supabase
        .from('order_items')
        .select(`
          product_id,
          product_name,
          quantity,
          subtotal,
          orders!inner(status)
        `)
        .eq('orders.status', 'completed');

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

      // Get recent orders
      const { data: recent_orders } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('Dashboard stats fetched successfully');

      return {
        total_customers: total_customers || 0,
        total_orders: total_orders || 0,
        total_revenue,
        active_resellers: active_resellers || 0,
        total_products: total_products || 0,
        pending_orders: pending_orders || 0,
        completed_orders: completed_orders || 0,
        monthly_revenue,
        monthly_orders: monthly_orders || 0,
        top_products,
        recent_orders: recent_orders || []
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
