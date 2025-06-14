
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UsageTip {
  id: string;
  title: string;
  description: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useUsageTips = () => {
  return useQuery({
    queryKey: ['usage-tips'],
    queryFn: async () => {
      console.log('Fetching usage tips...');
      
      const { data, error } = await supabase
        .from('usage_tips')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching usage tips:', error);
        throw error;
      }

      console.log('Usage tips fetched:', data?.length);
      return data as UsageTip[];
    },
  });
};

export const useCreateUsageTip = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tipData: Omit<UsageTip, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating usage tip:', tipData);
      
      const { data, error } = await supabase
        .from('usage_tips')
        .insert(tipData)
        .select()
        .single();

      if (error) {
        console.error('Error creating usage tip:', error);
        throw error;
      }

      console.log('Usage tip created successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage-tips'] });
      toast({
        title: 'Sukses',
        description: 'Tips penggunaan berhasil dibuat',
      });
    },
    onError: (error) => {
      console.error('Error creating usage tip:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat tips penggunaan',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateUsageTip = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...tipData }: Partial<UsageTip> & { id: string }) => {
      console.log('Updating usage tip:', id, tipData);
      
      const { data, error } = await supabase
        .from('usage_tips')
        .update(tipData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating usage tip:', error);
        throw error;
      }

      console.log('Usage tip updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage-tips'] });
      toast({
        title: 'Sukses',
        description: 'Tips penggunaan berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error updating usage tip:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui tips penggunaan',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteUsageTip = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting usage tip:', id);
      
      const { error } = await supabase
        .from('usage_tips')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting usage tip:', error);
        throw error;
      }

      console.log('Usage tip deleted successfully');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage-tips'] });
      toast({
        title: 'Sukses',
        description: 'Tips penggunaan berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error deleting usage tip:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus tips penggunaan',
        variant: 'destructive',
      });
    },
  });
};
