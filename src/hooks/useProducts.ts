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

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productData: CreateProductData) => {
      console.log('Creating product with data:', productData);
      
      // Build the insert data object
      const insertData = {
        name: productData.name,
        description: productData.description || null,
        category_id: productData.category_id || null,
        price: productData.price,
        reseller_price: productData.reseller_price || null,
        points_value: productData.points_value || 0,
        commission_value: productData.commission_value || 0,
        unit: productData.unit,
        image_url: productData.image_url || null,
        stock_quantity: productData.stock_quantity || 0,
        min_stock_level: productData.min_stock_level || 0,
        tags: productData.tags || null,
        featured: productData.featured || false,
        sort_order: productData.sort_order || 0,
        is_active: true
      };

      console.log('Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      console.log('Product created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Produk berhasil ditambahkan',
      });
    },
    onError: (error: any) => {
      console.error('Error in useCreateProduct:', error);
      let errorMessage = 'Gagal menambahkan produk';
      
      if (error?.code === '42501') {
        errorMessage = 'Anda tidak memiliki izin untuk menambahkan produk';
      } else if (error?.code === '23505') {
        errorMessage = 'Produk dengan nama ini sudah ada';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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
      
      // Clean updates - remove undefined values but keep null values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );
      
      console.log('Clean updates to apply:', cleanUpdates);
      
      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
        .select(`
          *,
          product_categories (
            name
          )
        `)
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      console.log('Product updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Produk berhasil diperbarui',
      });
    },
    onError: (error: any) => {
      console.error('Error in useUpdateProduct:', error);
      let errorMessage = 'Gagal memperbarui produk';
      
      if (error?.code === '42501') {
        errorMessage = 'Anda tidak memiliki izin untuk memperbarui produk';
      } else if (error?.code === '23505') {
        errorMessage = 'Produk dengan nama ini sudah ada';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
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
      
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      console.log('Product deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Produk berhasil dihapus',
      });
    },
    onError: (error: any) => {
      console.error('Error in useDeleteProduct:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Gagal menghapus produk',
        variant: 'destructive',
      });
    },
  });
};
