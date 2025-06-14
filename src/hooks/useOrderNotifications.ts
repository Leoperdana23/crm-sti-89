
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOrderNotifications = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBDWS2O/LdSEEKILH8N+OQQ0PUqzl7qNLEAhMpd/wxmQdAzaQ1u7LdSEAA==');
    audioRef.current.volume = 0.5;

    console.log('Setting up order notifications listener...');

    const channel = supabase
      .channel('new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('New order detected:', payload);
          
          const newOrder = payload.new as any;
          
          // Check if this order is from a reseller (has catalog_token)
          if (newOrder.catalog_token) {
            try {
              // Get reseller info from catalog token
              const { data: catalogData } = await supabase
                .from('catalog_tokens')
                .select(`
                  resellers (
                    name,
                    phone
                  )
                `)
                .eq('token', newOrder.catalog_token)
                .single();

              if (catalogData?.resellers) {
                // Play notification sound
                if (audioRef.current) {
                  audioRef.current.play().catch(e => console.log('Audio play failed:', e));
                }

                // Show toast notification
                toast({
                  title: "🔔 Pesanan Baru dari Reseller!",
                  description: `${catalogData.resellers.name} telah membuat pesanan baru senilai ${formatCurrency(newOrder.total_amount)}`,
                  duration: 10000, // Show for 10 seconds
                });

                console.log(`New reseller order from: ${catalogData.resellers.name}`);
              }
            } catch (error) {
              console.error('Error processing new order notification:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up order notifications listener...');
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
};
