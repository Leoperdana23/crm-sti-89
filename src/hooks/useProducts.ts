import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, CreateProductData, UpdateProductData } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { withAuth } from '@/utils/supabaseAuth';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products...');
      return withAuth(async () => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_categories (
              name
            )
          `)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }

        console.log('Products fetched successfully:', data);
        return data as Product[];
      });
    },
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      console.log('Fetching product categories...');
      return withAuth(async () => {
        const { data, error } = await supabase
          .from('product_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching product categories:', error);
          throw error;
        }

        console.log('Product categories fetched successfully:', data);
        return data;
      });
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productData: CreateProductData) => {
      console.log('Creating product:', productData);
      
      return withAuth(async () => {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) {
          console.error('Error creating product:', error);
          throw error;
        }

        console.log('Product created successfully:', data);
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Produk berhasil ditambahkan',
      });
    },
    onError: (error) => {
      console.error('Error in useCreateProduct:', error);
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
    mutationFn: async ({ id, ...updates }: UpdateProductData) => {
      console.log('Updating product with ID:', id);
      console.log('Update data:', updates);
      
      return withAuth(async () => {
        // First verify the product exists
        const { data: existingProduct, error: fetchError } = await supabase
          .from('products')
          .select('id')
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle();

        if (fetchError) {
          console.error('Error checking product existence:', fetchError);
          throw fetchError;
        }

        if (!existingProduct) {
          console.error('Product not found with ID:', id);
          throw new Error('Produk tidak ditemukan');
        }

        // Remove undefined and empty string values, but keep null values
        const cleanUpdates = Object.fromEntries(
          Object.entries(updates).filter(([_, value]) => value !== undefined && value !== '')
        );
        
        console.log('Clean updates to apply:', cleanUpdates);
        
        const { data, error } = await supabase
          .from('products')
          .update(cleanUpdates)
          .eq('id', id)
          .eq('is_active', true)
          .select()
          .maybeSingle();

        if (error) {
          console.error('Error updating product:', error);
          throw error;
        }

        if (!data) {
          console.error('No product returned after update');
          throw new Error('Gagal memperbarui produk - tidak ada data yang dikembalikan');
        }

        console.log('Product updated successfully:', data);
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Produk berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error in useUpdateProduct:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal memperbarui produk',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting product:', id);
      
      return withAuth(async () => {
        const { error } = await supabase
          .from('products')
          .update({ is_active: false })
          .eq('id', id);

        if (error) {
          console.error('Error deleting product:', error);
          throw error;
        }

        console.log('Product deleted successfully');
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Produk berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error in useDeleteProduct:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus produk',
        variant: 'destructive',
      });
    },
  });
};
