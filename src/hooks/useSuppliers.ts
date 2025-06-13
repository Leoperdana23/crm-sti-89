
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Supplier, CreateSupplierData, UpdateSupplierData } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      console.log('Fetching suppliers...');
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }

      console.log('Suppliers fetched successfully:', data);
      return data as Supplier[];
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (supplierData: CreateSupplierData) => {
      console.log('Creating supplier with data:', supplierData);
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          ...supplierData,
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating supplier:', error);
        throw error;
      }

      console.log('Supplier created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Sukses',
        description: 'Supplier berhasil ditambahkan',
      });
    },
    onError: (error: any) => {
      console.error('Error in useCreateSupplier:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Gagal menambahkan supplier',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSupplierData) => {
      console.log('Updating supplier with ID:', id);
      console.log('Update data:', updates);
      
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating supplier:', error);
        throw error;
      }

      console.log('Supplier updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Sukses',
        description: 'Supplier berhasil diperbarui',
      });
    },
    onError: (error: any) => {
      console.error('Error in useUpdateSupplier:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Gagal memperbarui supplier',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting supplier:', id);
      
      const { error } = await supabase
        .from('suppliers')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting supplier:', error);
        throw error;
      }

      console.log('Supplier deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Sukses',
        description: 'Supplier berhasil dihapus',
      });
    },
    onError: (error: any) => {
      console.error('Error in useDeleteSupplier:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Gagal menghapus supplier',
        variant: 'destructive',
      });
    },
  });
};
