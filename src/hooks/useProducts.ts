
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, CreateProductData, UpdateProductData } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

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
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productData: CreateProductData) => {
      console.log('Creating product with data:', productData);
      
      // Build the insert data object with proper validation
      const insertData = {
        name: productData.name?.trim(),
        description: productData.description?.trim() || null,
        category_id: productData.category_id === 'no-category' ? null : productData.category_id || null,
        price: Number(productData.price) || 0,
        reseller_price: productData.reseller_price ? Number(productData.reseller_price) : null,
        points_value: Number(productData.points_value) || 0,
        commission_value: Number(productData.commission_value) || 0,
        unit: productData.unit?.trim() || 'unit',
        image_url: productData.image_url?.trim() || null,
        stock_quantity: Number(productData.stock_quantity) || 0,
        min_stock_level: Number(productData.min_stock_level) || 0,
        tags: productData.tags || null,
        featured: Boolean(productData.featured),
        sort_order: Number(productData.sort_order) || 0,
        is_active: true
      };

      console.log('Insert data:', insertData);
      
      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select(`
          *,
          product_categories (
            name
          )
        `)
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
      
      // Clean and validate updates
      const cleanUpdates: any = {};
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'category_id') {
            cleanUpdates[key] = value === 'no-category' ? null : value || null;
          } else if (key === 'description') {
            cleanUpdates[key] = value ? String(value).trim() : null;
          } else if (key === 'name' || key === 'unit') {
            cleanUpdates[key] = value ? String(value).trim() : value;
          } else if (['price', 'reseller_price', 'points_value', 'commission_value', 'stock_quantity', 'min_stock_level', 'sort_order'].includes(key)) {
            cleanUpdates[key] = value ? Number(value) : (key === 'price' ? 0 : value);
          } else if (key === 'featured') {
            cleanUpdates[key] = Boolean(value);
          } else {
            cleanUpdates[key] = value;
          }
        }
      });
      
      console.log('Clean updates to apply:', cleanUpdates);
      
      // First check if the product exists
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking product existence:', checkError);
        throw checkError;
      }

      if (!existingProduct) {
        console.error('Product not found with ID:', id);
        throw new Error('Produk tidak ditemukan atau sudah dihapus');
      }

      // Now perform the update
      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('is_active', true)
        .select(`
          *,
          product_categories (
            name
          )
        `)
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
      
      // First check if the product exists
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id, name')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking product existence:', checkError);
        throw checkError;
      }

      if (!existingProduct) {
        throw new Error('Produk tidak ditemukan atau sudah dihapus');
      }

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
