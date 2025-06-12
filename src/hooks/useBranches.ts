
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';
import { useToast } from '@/hooks/use-toast';

export const useBranches = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      try {
        console.log('Fetching branches from database...');
        
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching branches:', error);
          throw error;
        }

        console.log('Branches fetched successfully:', data?.length || 0, 'records');
        return data as Branch[] || [];
      } catch (error) {
        console.error('Error fetching branches:', error);
        throw error;
      }
    },
  });

  return {
    branches: query.data || [],
    loading: query.isLoading,
    error: query.error,
    ...query
  };
};

export const useCreateBranch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('branches')
        .insert(branchData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Sukses',
        description: 'Cabang berhasil ditambahkan',
      });
    },
    onError: (error) => {
      console.error('Error adding branch:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan cabang',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBranch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Branch>) => {
      const { data, error } = await supabase
        .from('branches')
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
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Sukses',
        description: 'Cabang berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error updating branch:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui cabang',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteBranch = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Sukses',
        description: 'Cabang berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error deleting branch:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus cabang',
        variant: 'destructive',
      });
    },
  });
};
