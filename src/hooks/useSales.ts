
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Sales {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  branch_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSales = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      console.log('Fetching sales data...');
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching sales:', error);
        throw error;
      }

      console.log('Sales fetched successfully:', data?.length);
      return data as Sales[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  return {
    sales: data || [],
    loading: isLoading,
    error,
  };
};

export const useCreateSales = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (salesData: Omit<Sales, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sales')
        .insert([salesData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: "Berhasil",
        description: "Sales berhasil ditambahkan",
      });
    },
    onError: (error) => {
      console.error('Error creating sales:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan sales",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSales = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Sales> & { id: string }) => {
      const { data, error } = await supabase
        .from('sales')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: "Berhasil",
        description: "Sales berhasil diperbarui",
      });
    },
    onError: (error) => {
      console.error('Error updating sales:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui sales",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSales = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: "Berhasil",
        description: "Sales berhasil dihapus",
      });
    },
    onError: (error) => {
      console.error('Error deleting sales:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus sales",
        variant: "destructive",
      });
    },
  });
};
