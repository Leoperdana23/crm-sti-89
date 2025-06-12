import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, CreateOrderData, CreateOrderItemData } from '@/types/order';
import { useToast } from '@/hooks/use-toast';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        console.log('Fetching orders...');
        
        // Check database connection first
        const { data: connectionTest, error: connectionError } = await supabase
          .from('orders')
          .select('count')
          .limit(1);

        if (connectionError) {
          console.error('Database connection error for orders:', connectionError);
          console.log('Orders connection error details:', {
            code: connectionError.code,
            message: connectionError.message,
            details: connectionError.details,
            hint: connectionError.hint
          });
        }

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          console.log('Orders error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        console.log('Orders fetched successfully:', data);
        console.log('Number of orders returned:', data?.length || 0);

        // If we have orders, fetch reseller data separately for each unique catalog_token
        if (data && data.length > 0) {
          console.log('Fetching reseller data for orders...');
          const uniqueTokens = [...new Set(data.map(order => order.catalog_token))];
          console.log('Unique catalog tokens:', uniqueTokens);
          
          const { data: catalogTokens, error: tokenError } = await supabase
            .from('catalog_tokens')
            .select(`
              token,
              reseller_id,
              resellers!inner (
                id,
                name,
                branch_id,
                branches (
                  id,
                  name
                )
              )
            `)
            .in('token', uniqueTokens);

          if (tokenError) {
            console.error('Error fetching catalog tokens:', tokenError);
            // Don't throw error, just continue without reseller data
          } else {
            console.log('Catalog tokens fetched:', catalogTokens);
          }

          // Map reseller data to orders
          const ordersWithResellers = data.map(order => {
            const tokenData = catalogTokens?.find(token => token.token === order.catalog_token);
            return {
              ...order,
              reseller: tokenData?.resellers || null
            };
          });

          console.log('Orders with reseller data:', ordersWithResellers);
          return ordersWithResellers as (Order & { order_items: OrderItem[] })[];
        }

        console.log('No orders found or empty result');
        return data as (Order & { order_items: OrderItem[] })[];
      } catch (error) {
        console.error('Network error fetching orders:', error);
        console.log('Network error details:', error);
        throw error;
      }
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderData, orderItems }: { 
      orderData: CreateOrderData; 
      orderItems: CreateOrderItemData[] 
    }) => {
      console.log('Creating order:', orderData, orderItems);

      // Create the order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', order);

      // Create order items
      const orderItemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: order.id
      }));

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsWithOrderId)
        .select();

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully:', items);
      return { order, items };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Sukses',
        description: 'Pesanan berhasil dibuat',
      });
    },
    onError: (error) => {
      console.error('Error in useCreateOrder:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat pesanan',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      console.log('Updating order status for ID:', orderId, 'to status:', status);

      // First check if order exists
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('id', orderId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking order existence:', checkError);
        throw checkError;
      }

      if (!existingOrder) {
        console.error('Order not found with ID:', orderId);
        throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan`);
      }

      console.log('Order found, current status:', existingOrder.status);

      // Update the order status
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      console.log('Order status updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Sukses',
        description: 'Status pesanan berhasil diperbarui',
      });
      console.log('Order status update completed successfully');
    },
    onError: (error) => {
      console.error('Error in useUpdateOrderStatus:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memperbarui status pesanan',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderId: string) => {
      console.log('Deleting order with ID:', orderId);

      // First check if order exists
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking order existence:', checkError);
        throw checkError;
      }

      if (!existingOrder) {
        console.error('Order not found with ID:', orderId);
        throw new Error(`Pesanan dengan ID ${orderId} tidak ditemukan`);
      }

      console.log('Order found, proceeding with deletion');

      // Delete order items first (although CASCADE should handle this)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        // Don't throw error here, continue with order deletion
      }

      // Delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) {
        console.error('Error deleting order:', orderError);
        throw orderError;
      }

      console.log('Order deleted successfully');
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Sukses',
        description: 'Pesanan berhasil dihapus',
      });
      console.log('Delete operation completed successfully');
    },
    onError: (error) => {
      console.error('Error in useDeleteOrder:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menghapus pesanan',
        variant: 'destructive',
      });
    },
  });
};
