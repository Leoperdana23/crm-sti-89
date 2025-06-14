
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealTimeStats = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up real-time stats listeners...');

    // Listen for order changes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        console.log('Order change detected:', payload);
        // Invalidate dashboard stats to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    // Listen for customer changes
    const customersChannel = supabase
      .channel('customers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'customers'
      }, (payload) => {
        console.log('Customer change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    // Listen for reseller login history changes
    const resellerLoginChannel = supabase
      .channel('reseller-login-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reseller_login_history'
      }, (payload) => {
        console.log('Reseller login change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['reseller-login-history'] });
      })
      .subscribe();

    // Listen for product changes
    const productsChannel = supabase
      .channel('products-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products'
      }, (payload) => {
        console.log('Product change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    // Listen for reseller changes
    const resellersChannel = supabase
      .channel('resellers-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'resellers'
      }, (payload) => {
        console.log('Reseller change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time stats listeners...');
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(resellerLoginChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(resellersChannel);
    };
  }, [queryClient]);
};
