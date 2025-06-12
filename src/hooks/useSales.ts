
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sales } from '@/types/sales';
import { useToast } from '@/hooks/use-toast';

export const useSales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      try {
        console.log('Fetching sales from database...');
        
        const { data, error } = await supabase
          .from('sales')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching sales:', error);
          throw error;
        }

        console.log('Sales fetched successfully:', data?.length || 0, 'records');
        return data as Sales[] || [];
      } catch (error) {
        console.error('Error fetching sales:', error);
        throw error;
      }
    },
  });

  return {
    sales: query.data || [],
    loading: query.isLoading,
    error: query.error,
    ...query
  };
};

export const useCreateSales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (salesData: Omit<Sales, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sales')
        .insert(salesData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: 'Sukses',
        description: 'Sales berhasil ditambahkan',
      });
    },
    onError: (error) => {
      console.error('Error adding sales:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan sales',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateSales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Sales>) => {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: 'Sukses',
        description: 'Sales berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error updating sales:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui sales',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteSales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: 'Sukses',
        description: 'Sales berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error deleting sales:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus sales',
        variant: 'destructive',
      });
    },
  });
};
