
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCategory, CreateProductCategoryData, UpdateProductCategoryData } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { withAuth } from '@/utils/supabaseAuth';

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
        return data as ProductCategory[];
      });
    },
  });
};

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoryData: CreateProductCategoryData) => {
      console.log('Creating product category:', categoryData);
      
      return withAuth(async () => {
        const { data, error } = await supabase
          .from('product_categories')
          .insert(categoryData)
          .select()
          .single();

        if (error) {
          console.error('Error creating product category:', error);
          throw error;
        }

        console.log('Product category created successfully:', data);
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast({
        title: 'Sukses',
        description: 'Kategori produk berhasil ditambahkan',
      });
    },
    onError: (error) => {
      console.error('Error in useCreateProductCategory:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan kategori produk',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateProductCategoryData) => {
      console.log('Updating product category:', id, updates);
      
      return withAuth(async () => {
        const { data, error } = await supabase
          .from('product_categories')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating product category:', error);
          throw error;
        }

        console.log('Product category updated successfully:', data);
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Kategori produk berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error in useUpdateProductCategory:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui kategori produk',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting product category:', id);
      
      return withAuth(async () => {
        const { error } = await supabase
          .from('product_categories')
          .update({ is_active: false })
          .eq('id', id);

        if (error) {
          console.error('Error deleting product category:', error);
          throw error;
        }

        console.log('Product category deleted successfully');
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Kategori produk berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error in useDeleteProductCategory:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus kategori produk',
        variant: 'destructive',
      });
    },
  });
};
