
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
  product_commission_snapshot?: number;
  product_points_snapshot?: number;
  products?: {
    commission_value?: number;
    points_value?: number;
  };
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
      console.log('=== FETCHING ORDERS WITH ENHANCED DEBUGGING ===');
      
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
            points_earned,
            product_commission_snapshot,
            product_points_snapshot,
            products (
              commission_value,
              points_value
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log(`Raw orders fetched: ${data?.length}`);

      // Enhanced reseller mapping with better debugging
      const ordersWithResellers = await Promise.all(
        (data || []).map(async (order) => {
          if (order.catalog_token) {
            try {
              console.log(`Processing order ${order.id} with catalog_token: ${order.catalog_token}`);
              
              const { data: catalogData, error: catalogError } = await supabase
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

              if (catalogError) {
                console.error(`Error fetching catalog for token ${order.catalog_token}:`, catalogError);
                return order;
              }

              if (catalogData?.resellers) {
                const orderWithReseller = {
                  ...order,
                  reseller: {
                    id: catalogData.resellers.id,
                    name: catalogData.resellers.name,
                    phone: catalogData.resellers.phone,
                    branch_id: catalogData.resellers.branch_id
                  }
                };
                
                console.log(`✓ Order ${order.id} linked to reseller: ${catalogData.resellers.name} (${catalogData.resellers.id})`);
                console.log(`  Status: ${order.status}`);
                console.log(`  Items count: ${order.order_items?.length || 0}`);
                
                // Enhanced item debugging
                order.order_items?.forEach((item: any, index: number) => {
                  console.log(`  Item ${index + 1}: ${item.product_name}`);
                  console.log(`    Qty: ${item.quantity}`);
                  console.log(`    Commission snapshot: ${item.product_commission_snapshot}`);
                  console.log(`    Points snapshot: ${item.product_points_snapshot}`);
                  console.log(`    Current commission: ${item.products?.commission_value}`);
                  console.log(`    Current points: ${item.products?.points_value}`);
                  console.log(`    Points earned: ${item.points_earned}`);
                });
                
                return orderWithReseller;
              } else {
                console.warn(`No reseller found for catalog token: ${order.catalog_token}`);
              }
            } catch (err) {
              console.error(`Error processing catalog token for order ${order.id}:`, err);
            }
          } else {
            console.log(`Order ${order.id} has no catalog_token - likely manual order`);
          }
          return order;
        })
      );

      const finalOrders = ordersWithResellers as Order[];
      
      // Enhanced debugging summary
      console.log('=== ORDERS PROCESSING SUMMARY ===');
      console.log(`Total orders processed: ${finalOrders.length}`);
      console.log(`Orders with reseller info: ${finalOrders.filter(o => o.reseller).length}`);
      console.log(`Orders without reseller: ${finalOrders.filter(o => !o.reseller).length}`);
      
      const statusCounts = finalOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Order status distribution:', statusCounts);
      
      const completedOrdersWithReseller = finalOrders.filter(o => 
        o.reseller && (o.status === 'completed' || o.status === 'selesai')
      );
      console.log(`Completed orders with reseller: ${completedOrdersWithReseller.length}`);
      
      // Debug each completed order's commission/points
      completedOrdersWithReseller.forEach(order => {
        console.log(`Completed order ${order.id} for reseller ${order.reseller?.name}:`);
        const totalCommission = order.order_items?.reduce((sum, item) => {
          const commission = item.product_commission_snapshot || item.products?.commission_value || 0;
          return sum + (commission * item.quantity);
        }, 0) || 0;
        const totalPoints = order.order_items?.reduce((sum, item) => {
          const points = item.product_points_snapshot || item.products?.points_value || 0;
          return sum + (points * item.quantity);
        }, 0) || 0;
        console.log(`  Commission: ${totalCommission}, Points: ${totalPoints}`);
      });
      
      return finalOrders;
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

      // If status is completed/selesai, update reseller points and commission
      if (status === 'selesai' || status === 'completed') {
        console.log('Order completed, updating reseller points and commission...');
        
        // Get order details with reseller info
        const { data: orderData } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product_commission_snapshot,
              product_points_snapshot
            )
          `)
          .eq('id', orderId)
          .single();

        if (orderData?.catalog_token) {
          // Get reseller from catalog token
          const { data: catalogData } = await supabase
            .from('catalog_tokens')
            .select('reseller_id')
            .eq('token', orderData.catalog_token)
            .single();

          if (catalogData?.reseller_id) {
            // Calculate total points from snapshot values
            const totalPoints = orderData.order_items?.reduce((sum: number, item: any) => {
              return sum + ((item.product_points_snapshot || 0) * item.quantity);
            }, 0) || 0;

            // Update reseller total points
            if (totalPoints > 0) {
              const { data: currentReseller } = await supabase
                .from('resellers')
                .select('total_points')
                .eq('id', catalogData.reseller_id)
                .single();

              const newTotalPoints = (currentReseller?.total_points || 0) + totalPoints;

              await supabase
                .from('resellers')
                .update({ total_points: newTotalPoints })
                .eq('id', catalogData.reseller_id);

              console.log('Updated reseller points:', totalPoints, 'New total:', newTotalPoints);
            }
          }
        }
      }

      console.log('Order status updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['reseller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] });
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
      queryClient.invalidateQueries({ queryKey: ['reseller-orders'] });
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
        product_commission_snapshot?: number;
        product_points_snapshot?: number;
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

      console.log('Order created:', order);

      // Create order items with snapshot values
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          orderData.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_price: item.product_price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            product_commission_snapshot: item.product_commission_snapshot || 0,
            product_points_snapshot: item.product_points_snapshot || 0,
            points_earned: (item.product_points_snapshot || 0) * item.quantity
          }))
        );

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully');

      // Create reseller order record if catalog_token exists
      if (orderData.catalog_token) {
        console.log('Creating reseller order for catalog token:', orderData.catalog_token);
        
        // Get reseller info from catalog token
        const { data: catalogData, error: catalogError } = await supabase
          .from('catalog_tokens')
          .select(`
            reseller_id,
            resellers (
              id,
              commission_rate
            )
          `)
          .eq('token', orderData.catalog_token)
          .single();

        if (catalogError) {
          console.error('Error fetching catalog token:', catalogError);
        } else if (catalogData?.resellers) {
          // Calculate total commission from snapshot values
          const totalCommission = orderData.items.reduce((sum, item) => {
            const commission = (item.product_commission_snapshot || 0) * item.quantity;
            return sum + commission;
          }, 0);

          console.log('Creating reseller order with commission:', totalCommission);

          const { error: resellerOrderError } = await supabase
            .from('reseller_orders')
            .insert({
              reseller_id: catalogData.resellers.id,
              order_id: order.id,
              commission_rate: catalogData.resellers.commission_rate || 10.0,
              commission_amount: totalCommission,
              status: 'pending'
            });

          if (resellerOrderError) {
            console.error('Error creating reseller order:', resellerOrderError);
          } else {
            console.log('Reseller order created successfully');
          }
        }
      }

      console.log('Order creation completed successfully');
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['reseller-orders'] });
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
