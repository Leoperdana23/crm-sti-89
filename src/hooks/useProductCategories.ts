
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductCategoryData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateProductCategoryData extends Partial<CreateProductCategoryData> {
  id: string;
}

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      console.log('Fetching product categories...');
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching product categories:', error);
        throw error;
      }
      
      console.log('Product categories fetched:', data);
      return data as ProductCategory[];
    },
  });
};

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoryData: CreateProductCategoryData) => {
      console.log('Creating product category:', categoryData);

      const { data, error } = await supabase
        .from('product_categories')
        .insert({
          ...categoryData,
          is_active: categoryData.is_active ?? true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating product category:', error);
        throw error;
      }

      console.log('Product category created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast({
        title: 'Sukses',
        description: 'Kategori produk berhasil ditambahkan',
      });
    },
    onError: (error: any) => {
      console.error('Error creating product category:', error);
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

      // First check if the category exists
      const { data: existingCategory, error: checkError } = await supabase
        .from('product_categories')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingCategory) {
        console.error('Product category not found:', id);
        throw new Error('Kategori produk tidak ditemukan');
      }

      const { data, error } = await supabase
        .from('product_categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error updating product category:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Gagal memperbarui kategori produk - tidak ada data yang dikembalikan');
      }

      console.log('Product category updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Kategori produk berhasil diperbarui',
      });
    },
    onError: (error: any) => {
      console.error('Error updating product category:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal memperbarui kategori produk',
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
      console.log('Deleting product category (soft delete):', id);

      // First check if the category exists
      const { data: existingCategory, error: checkError } = await supabase
        .from('product_categories')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError || !existingCategory) {
        console.error('Product category not found:', id);
        throw new Error('Kategori produk tidak ditemukan');
      }

      // Check if category is being used by any products
      const { data: productsUsingCategory, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id)
        .eq('is_active', true)
        .limit(1);

      if (productsError) {
        console.error('Error checking products using category:', productsError);
        throw new Error('Gagal memeriksa penggunaan kategori');
      }

      if (productsUsingCategory && productsUsingCategory.length > 0) {
        throw new Error('Kategori ini masih digunakan oleh produk aktif. Hapus atau ubah kategori produk terlebih dahulu.');
      }

      const { error } = await supabase
        .from('product_categories')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting product category:', error);
        throw error;
      }

      console.log('Product category deleted (deactivated) successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Kategori produk berhasil dihapus',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting product category:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus kategori produk',
        variant: 'destructive',
      });
    },
  });
};
