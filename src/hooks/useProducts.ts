
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  price: number;
  reseller_price?: number;
  commission_value: number;
  points_value: number;
  unit: string;
  is_active: boolean;
  image_url?: string;
  stock_quantity: number;
  min_stock_level: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Products fetched successfully:', data?.length);
      return data?.map(product => ({
        ...product,
        category: product.product_categories
      })) as Product[];
    },
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      console.log('Fetching product categories...');
      
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      console.log('Categories fetched successfully:', data?.length);
      return data as ProductCategory[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
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
        description: 'Produk berhasil dibuat',
      });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat produk',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product> & { id: string }) => {
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
      console.log('Deleting product (soft delete):', productId);
      
      const { data, error } = await supabase
        .from('products')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      console.log('Product deleted successfully');
      return data;
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

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoryData: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating category:', categoryData);
      
      const { data, error } = await supabase
        .from('product_categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }

      console.log('Category created successfully');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-categories'] });
      toast({
        title: 'Sukses',
        description: 'Kategori berhasil dibuat',
      });
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat kategori',
        variant: 'destructive',
      });
    },
  });
};
