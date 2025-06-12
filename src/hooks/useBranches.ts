import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';
import { useToast } from '@/hooks/use-toast';

// Define the missing type
export interface CreateBranchData {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  manager_name?: string;
}

// Fallback sample data
const fallbackBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'Jakarta Pusat',
    code: 'JKT',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    phone: '021-12345678',
    manager_name: 'Andi Kurniawan',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'branch-2',
    name: 'Surabaya',
    code: 'SBY',
    address: 'Jl. Pemuda No. 456, Surabaya',
    phone: '031-87654321',
    manager_name: 'Sari Dewi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'branch-3',
    name: 'Bandung',
    code: 'BDG',
    address: 'Jl. Asia Afrika No. 789, Bandung',
    phone: '022-11223344',
    manager_name: 'Rizki Pratama',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useBranches = () => {
  const query = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      try {
        console.log('Fetching branches...');
        
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching branches:', error);
          console.log('Using fallback branch data');
          return fallbackBranches;
        }

        if (data && data.length > 0) {
          console.log('Branches fetched successfully:', data);
          return data as Branch[];
        } else {
          console.log('No branches found, using fallback data');
          return fallbackBranches;
        }
      } catch (error) {
        console.error('Network error fetching branches:', error);
        console.log('Using fallback branch data due to network error');
        return fallbackBranches;
      }
    },
  });

  return {
    branches: query.data || fallbackBranches,
    loading: query.isLoading,
    error: query.error,
    ...query
  };
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (branchData: CreateBranchData) => {
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

      console.log('Branch created successfully:', data);
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
      console.error('Error in useCreateBranch:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan cabang',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CreateBranchData>) => {
      console.log('Updating branch:', id, updates);

      const { data, error } = await supabase
        .from('branches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating branch:', error);
        throw error;
      }

      console.log('Branch updated successfully:', data);
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
      console.error('Error in useUpdateBranch:', error);
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
    mutationFn: async (id: string) => {
      console.log('Deleting branch:', id);

      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting branch:', error);
        throw error;
      }

      console.log('Branch deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Sukses',
        description: 'Cabang berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error in useDeleteBranch:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus cabang',
        variant: 'destructive',
      });
    },
  });
};
