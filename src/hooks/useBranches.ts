
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Branch {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  manager_name?: string;
  created_at: string;
  updated_at: string;
}

export const useBranches = () => {
  const query = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      console.log('Fetching branches...');
      
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching branches:', error);
        throw error;
      }

      console.log('Branches fetched successfully:', data?.length);
      return data as Branch[];
    },
  });

  return {
    branches: query.data || [], // Provide empty array as default
    loading: query.isLoading,
    error: query.error,
    ...query
  };
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating branch:', branchData);
      
      const { data, error } = await supabase
        .from('branches')
        .insert(branchData)
        .select()
        .single();

      if (error) {
        console.error('Error creating branch:', error);
        throw error;
      }

      console.log('Branch created successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Sukses',
        description: 'Cabang berhasil dibuat',
      });
    },
    onError: (error) => {
      console.error('Error creating branch:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat cabang',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...branchData }: Partial<Branch> & { id: string }) => {
      console.log('Updating branch:', id, branchData);
      
      const { data, error } = await supabase
        .from('branches')
        .update({
          ...branchData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating branch:', error);
        throw error;
      }

      console.log('Branch updated successfully');
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (branchId: string) => {
      console.log('Deleting branch:', branchId);
      
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchId);

      if (error) {
        console.error('Error deleting branch:', error);
        throw error;
      }

      console.log('Branch deleted successfully');
      return branchId;
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
