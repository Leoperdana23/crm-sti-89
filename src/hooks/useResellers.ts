
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reseller, CreateResellerData, UpdateResellerData } from '@/types/reseller';
import { useToast } from '@/hooks/use-toast';

export const useResellers = () => {
  return useQuery({
    queryKey: ['resellers'],
    queryFn: async () => {
      console.log('Fetching resellers...');
      const { data, error } = await supabase
        .from('resellers')
        .select(`
          *,
          branches (
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching resellers:', error);
        throw error;
      }

      console.log('Resellers fetched successfully:', data);
      return data as Reseller[];
    },
  });
};

export const useCreateReseller = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (resellerData: CreateResellerData) => {
      console.log('Creating reseller:', resellerData);
      const { data, error } = await supabase
        .from('resellers')
        .insert(resellerData)
        .select()
        .single();

      if (error) {
        console.error('Error creating reseller:', error);
        throw error;
      }

      console.log('Reseller created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      toast({
        title: 'Sukses',
        description: 'Reseller berhasil ditambahkan',
      });
    },
    onError: (error) => {
      console.error('Error in useCreateReseller:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan reseller',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateReseller = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateResellerData) => {
      console.log('Updating reseller:', id, updates);
      const { data, error } = await supabase
        .from('resellers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reseller:', error);
        throw error;
      }

      console.log('Reseller updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      toast({
        title: 'Sukses',
        description: 'Reseller berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error in useUpdateReseller:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui reseller',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteReseller = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting reseller:', id);
      const { error } = await supabase
        .from('resellers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reseller:', error);
        throw error;
      }

      console.log('Reseller deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      toast({
        title: 'Sukses',
        description: 'Reseller berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error in useDeleteReseller:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus reseller',
        variant: 'destructive',
      });
    },
  });
};
