
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  manager_name?: string;
  created_at: string;
  updated_at: string;
}

export const useBranches = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      console.log('Fetching branches...');
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching branches:', error);
        throw error;
      }

      console.log('Branches fetched successfully:', data?.length);
      return data as Branch[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  return {
    branches: data || [],
    loading: isLoading,
    error,
  };
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('branches')
        .insert([branchData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: "Berhasil",
        description: "Cabang berhasil ditambahkan",
      });
    },
    onError: (error) => {
      console.error('Error creating branch:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan cabang",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Branch> & { id: string }) => {
      const { data, error } = await supabase
        .from('branches')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: "Berhasil",
        description: "Cabang berhasil diperbarui",
      });
    },
    onError: (error) => {
      console.error('Error updating branch:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui cabang",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: "Berhasil",
        description: "Cabang berhasil dihapus",
      });
    },
    onError: (error) => {
      console.error('Error deleting branch:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus cabang",
        variant: "destructive",
      });
    },
  });
};
