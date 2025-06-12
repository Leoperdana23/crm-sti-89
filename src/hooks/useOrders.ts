
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, CreateOrderData, CreateOrderItemData } from '@/types/order';
import { useToast } from '@/hooks/use-toast';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      console.log('Fetching orders...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          resellers!catalog_tokens(
            id,
            name,
            branch_id,
            branches(
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log('Orders fetched successfully:', data);
      return data as (Order & { order_items: OrderItem[] })[];
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

      // Check if order exists
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

      // Delete the order (order_items will be deleted automatically due to CASCADE)
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Error deleting order:', error);
        throw error;
      }

      console.log('Order deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Sukses',
        description: 'Pesanan berhasil dihapus',
      });
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
