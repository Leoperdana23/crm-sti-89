
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, CreateOrderData, CreateOrderItemData } from '@/types/order';
import { useToast } from '@/hooks/use-toast';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        console.log('Fetching orders from database...');
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          throw error;
        }

        console.log('Orders fetched successfully:', data?.length || 0, 'records');

        if (!data) {
          return [];
        }

        // If we have orders, fetch reseller data for orders that have catalog_tokens
        if (data.length > 0) {
          const uniqueTokens = [...new Set(data
            .map(order => order.catalog_token)
            .filter(token => token)
          )];
          
          if (uniqueTokens.length > 0) {
            const { data: catalogTokens } = await supabase
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

            // Map reseller data to orders
            const ordersWithResellers = data.map(order => {
              const tokenData = catalogTokens?.find(token => token.token === order.catalog_token);
              return {
                ...order,
                reseller: tokenData?.resellers || null
              };
            });

            return ordersWithResellers as (Order & { order_items: OrderItem[] })[];
          }
        }

        return data as (Order & { order_items: OrderItem[] })[];
      } catch (error) {
        console.error('Error fetching orders:', error);
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
      // Create the order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

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
        throw itemsError;
      }

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
      console.error('Error creating order:', error);
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
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Sukses',
        description: 'Status pesanan berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui status pesanan',
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
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Sukses',
        description: 'Pesanan berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error deleting order:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus pesanan',
        variant: 'destructive',
      });
    },
  });
};
