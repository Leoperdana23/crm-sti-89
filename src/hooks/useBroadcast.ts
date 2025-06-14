
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  target_audience: string[];
  channels: string[];
  status: string;
  sent_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useBroadcastMessages = () => {
  return useQuery({
    queryKey: ['broadcast-messages'],
    queryFn: async () => {
      console.log('Fetching broadcast messages...');
      
      const { data, error } = await supabase
        .from('broadcast_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching broadcast messages:', error);
        throw error;
      }

      console.log('Broadcast messages fetched:', data?.length);
      return data as BroadcastMessage[];
    },
  });
};

export const useCreateBroadcast = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (broadcastData: Omit<BroadcastMessage, 'id' | 'created_at' | 'updated_at' | 'sent_at'>) => {
      console.log('Creating broadcast message:', broadcastData);
      
      const { data, error } = await supabase
        .from('broadcast_messages')
        .insert({
          ...broadcastData,
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating broadcast message:', error);
        throw error;
      }

      console.log('Broadcast message created successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-messages'] });
      toast({
        title: 'Sukses',
        description: 'Broadcast berhasil dikirim',
      });
    },
    onError: (error) => {
      console.error('Error creating broadcast message:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengirim broadcast',
        variant: 'destructive',
      });
    },
  });
};
