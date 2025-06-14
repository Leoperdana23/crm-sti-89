
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  points_earned: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  catalog_token: string;
  status: string;
  total_amount: number;
  notes?: string;
  delivery_method: string;
  expedisi?: string;
  shipping_address?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  reseller?: {
    id: string;
    name: string;
    phone: string;
    branch_id?: string;
  };
}

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      console.log('Fetching orders...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            order_id,
            product_id,
            product_name,
            product_price,
            quantity,
            subtotal,
            points_earned
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      // Get reseller info for orders with catalog tokens
      const ordersWithResellers = await Promise.all(
        (data || []).map(async (order) => {
          if (order.catalog_token) {
            try {
              const { data: catalogData } = await supabase
                .from('catalog_tokens')
                .select(`
                  reseller_id,
                  resellers (
                    id,
                    name,
                    phone,
                    branch_id
                  )
                `)
                .eq('token', order.catalog_token)
                .single();

              if (catalogData?.resellers) {
                return {
                  ...order,
                  reseller: {
                    id: catalogData.resellers.id,
                    name: catalogData.resellers.name,
                    phone: catalogData.resellers.phone,
                    branch_id: catalogData.resellers.branch_id
                  }
                };
              }
            } catch (err) {
              console.warn('Could not fetch reseller for order:', order.id, err);
            }
          }
          return order;
        })
      );

      console.log('Orders fetched successfully:', ordersWithResellers.length);
      return ordersWithResellers as Order[];
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      console.log('Updating order status:', orderId, status);
      
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

      console.log('Order status updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
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
      console.log('Deleting order:', orderId);
      
      // Delete order items first (cascade should handle this, but being explicit)
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        throw itemsError;
      }

      // Delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('Error deleting order:', error);
        throw error;
      }

      console.log('Order deleted successfully');
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
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

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderData: {
      customer_name: string;
      customer_phone: string;
      catalog_token: string;
      delivery_method: string;
      expedisi?: string;
      shipping_address?: string;
      notes?: string;
      items: Array<{
        product_id: string;
        product_name: string;
        product_price: number;
        quantity: number;
        subtotal: number;
      }>;
    }) => {
      console.log('Creating order:', orderData);

      const total_amount = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          catalog_token: orderData.catalog_token,
          delivery_method: orderData.delivery_method,
          expedisi: orderData.expedisi,
          shipping_address: orderData.shipping_address,
          notes: orderData.notes,
          total_amount,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      // Create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          orderData.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_price: item.product_price,
            quantity: item.quantity,
            subtotal: item.subtotal
          }))
        );

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }

      console.log('Order created successfully');
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
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
