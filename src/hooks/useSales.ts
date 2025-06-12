import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sales } from '@/types/sales';
import { useToast } from '@/hooks/use-toast';

// Define the missing type
export interface CreateSalesData {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  password_hash?: string;
  branch_id: string;
  is_active?: boolean;
}

// Fallback sample data
const fallbackSales: Sales[] = [
  {
    id: 'sales-1',
    name: 'Ahmad Rizki',
    code: 'AR001',
    email: 'ahmad.rizki@company.com',
    phone: '081234567890',
    password_hash: null,
    branch_id: 'branch-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sales-2',
    name: 'Sari Indah',
    code: 'SI002',
    email: 'sari.indah@company.com',
    phone: '081987654321',
    password_hash: null,
    branch_id: 'branch-2',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sales-3',
    name: 'Dedi Kurnia',
    code: 'DK003',
    email: 'dedi.kurnia@company.com',
    phone: '081122334455',
    password_hash: null,
    branch_id: 'branch-3',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useSales = () => {
  const query = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      try {
        console.log('Fetching sales...');
        
        const { data, error } = await supabase
          .from('sales')
          .select(`
            *,
            branches (
              id,
              name,
              code
            )
          `)
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching sales:', error);
          console.log('Using fallback sales data');
          return fallbackSales;
        }

        if (data && data.length > 0) {
          console.log('Sales fetched successfully:', data);
          return data as Sales[];
        } else {
          console.log('No sales found, using fallback data');
          return fallbackSales;
        }
      } catch (error) {
        console.error('Network error fetching sales:', error);
        console.log('Using fallback sales data due to network error');
        return fallbackSales;
      }
    },
  });

  return {
    sales: query.data || fallbackSales,
    loading: query.isLoading,
    error: query.error,
    ...query
  };
};

export const useCreateSales = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (salesData: CreateSalesData) => {
      console.log('Creating sales:', salesData);

      const { data, error } = await supabase
        .from('sales')
        .insert(salesData)
        .select()
        .single();

      if (error) {
        console.error('Error creating sales:', error);
        throw error;
      }

      console.log('Sales created successfully:', data);
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
      console.error('Error in useCreateSales:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan sales',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateSales = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CreateSalesData>) => {
      console.log('Updating sales:', id, updates);

      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating sales:', error);
        throw error;
      }

      console.log('Sales updated successfully:', data);
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
      console.error('Error in useUpdateSales:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui sales',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteSales = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Soft deleting sales:', id);

      const { data, error } = await supabase
        .from('sales')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error soft deleting sales:', error);
        throw error;
      }

      console.log('Sales soft deleted successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: 'Sukses',
        description: 'Sales berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error in useDeleteSales:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus sales',
        variant: 'destructive',
      });
    },
  });
};

export const useSetSalesPassword = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      console.log('Setting password for sales:', id);

      const { data, error } = await supabase
        .from('sales')
        .update({ password_hash: password })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error setting sales password:', error);
        throw error;
      }

      console.log('Sales password set successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: 'Sukses',
        description: 'Password sales berhasil diatur',
      });
    },
    onError: (error) => {
      console.error('Error in useSetSalesPassword:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengatur password sales',
        variant: 'destructive',
      });
    },
  });
};
