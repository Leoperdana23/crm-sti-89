
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product, CreateProductData, UpdateProductData } from '@/types/product';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products...');
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Products fetched successfully:', data?.length);
      return data as Product[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productData: CreateProductData) => {
      console.log('Creating product:', productData);
      
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      console.log('Product created successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Sukses',
        description: 'Produk berhasil ditambahkan',
      });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan produk',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...productData }: UpdateProductData) => {
      console.log('Updating product:', id, productData);
      
      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      console.log('Product updated successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Sukses',
        description: 'Produk berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui produk',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productId: string) => {
      console.log('Deleting product:', productId);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      console.log('Product deleted successfully');
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: 'Sukses',
        description: 'Produk berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus produk',
        variant: 'destructive',
      });
    },
  });
};
