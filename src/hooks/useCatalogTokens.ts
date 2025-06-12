
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CatalogToken {
  id: string;
  token: string;
  name: string;
  description: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCatalogTokenData {
  name: string;
  description?: string;
  expires_at?: string;
}

export const useCatalogTokens = () => {
  return useQuery({
    queryKey: ['catalog-tokens'],
    queryFn: async () => {
      console.log('Fetching catalog tokens...');
      const { data, error } = await supabase
        .from('catalog_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching catalog tokens:', error);
        throw error;
      }

      console.log('Catalog tokens fetched successfully:', data);
      return data as CatalogToken[];
    },
  });
};

export const useCreateCatalogToken = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tokenData: CreateCatalogTokenData) => {
      console.log('Creating catalog token:', tokenData);
      const { data, error } = await supabase
        .from('catalog_tokens')
        .insert(tokenData)
        .select()
        .single();

      if (error) {
        console.error('Error creating catalog token:', error);
        throw error;
      }

      console.log('Catalog token created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-tokens'] });
      toast({
        title: 'Sukses',
        description: 'Token katalog berhasil dibuat',
      });
    },
    onError: (error) => {
      console.error('Error in useCreateCatalogToken:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat token katalog',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCatalogToken = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tokenId: string) => {
      console.log('Deleting catalog token:', tokenId);
      const { error } = await supabase
        .from('catalog_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) {
        console.error('Error deleting catalog token:', error);
        throw error;
      }

      console.log('Catalog token deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-tokens'] });
      toast({
        title: 'Sukses',
        description: 'Token katalog berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error in useDeleteCatalogToken:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus token katalog',
        variant: 'destructive',
      });
    },
  });
};
