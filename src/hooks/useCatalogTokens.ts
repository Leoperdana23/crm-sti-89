
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CatalogToken {
  id: string;
  name: string;
  description: string | null;
  token: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface CreateCatalogTokenData {
  name: string;
  description?: string;
}

// Helper function to get current authenticated user
const getCurrentAuthenticatedUser = () => {
  // Check for app user in localStorage
  const appUser = localStorage.getItem('appUser');
  if (appUser) {
    try {
      return JSON.parse(appUser);
    } catch (error) {
      console.error('Invalid app user data:', error);
      localStorage.removeItem('appUser');
    }
  }

  // Check for sales user in localStorage
  const salesUser = localStorage.getItem('salesUser');
  if (salesUser) {
    try {
      return JSON.parse(salesUser);
    } catch (error) {
      console.error('Invalid sales user data:', error);
      localStorage.removeItem('salesUser');
    }
  }

  return null;
};

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
      
      // Check for authenticated user using our custom auth system
      const currentUser = getCurrentAuthenticatedUser();
      if (!currentUser) {
        console.error('User not authenticated via custom auth system');
        throw new Error('User tidak terautentikasi');
      }

      console.log('Current authenticated user:', currentUser);

      // Get the user ID from the appropriate field
      const userId = currentUser.id || currentUser.user_id || currentUser.app_user_id;
      
      const insertData = {
        ...tokenData,
        created_by: userId,
      };

      console.log('Inserting token data:', insertData);

      const { data, error } = await supabase
        .from('catalog_tokens')
        .insert(insertData)
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
        description: 'Token berhasil dibuat',
      });
    },
    onError: (error) => {
      console.error('Error in useCreateCatalogToken:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat token',
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
      
      // Check for authenticated user using our custom auth system
      const currentUser = getCurrentAuthenticatedUser();
      if (!currentUser) {
        console.error('User not authenticated via custom auth system');
        throw new Error('User tidak terautentikasi');
      }

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
        description: 'Token berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error in useDeleteCatalogToken:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus token',
        variant: 'destructive',
      });
    },
  });
};
