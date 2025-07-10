
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

export interface CreateSalesData {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  branch_id?: string;
  password?: string;
  is_active?: boolean;
}

export interface UpdateSalesData extends Partial<CreateSalesData> {
  id: string;
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
    mutationFn: async (salesData: CreateSalesData) => {
      console.log('Creating sales:', salesData);
      
      // Clean the data before sending
      const cleanData = {
        name: salesData.name,
        code: salesData.code,
        email: salesData.email || null,
        phone: salesData.phone || null,
        branch_id: salesData.branch_id === 'no-branch' ? null : salesData.branch_id || null,
        is_active: salesData.is_active ?? true,
        password_hash: salesData.password || null,
      };

      const { data, error } = await supabase
        .from('sales')
        .insert([cleanData])
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
    mutationFn: async ({ id, ...updateData }: UpdateSalesData) => {
      console.log('Updating sales:', id, updateData);
      
      // Clean the data before sending
      const cleanData = {
        name: updateData.name,
        code: updateData.code,
        email: updateData.email || null,
        phone: updateData.phone || null,
        branch_id: updateData.branch_id === 'no-branch' ? null : updateData.branch_id || null,
        is_active: updateData.is_active,
        ...(updateData.password && { password_hash: updateData.password }),
      };

      const { data, error } = await supabase
        .from('sales')
        .update(cleanData)
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
