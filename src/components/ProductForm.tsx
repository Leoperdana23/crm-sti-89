
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useProductCategories } from '@/hooks/useProductCategories';
import { Product } from '@/types/product';

const formSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  price: z.number().min(0, 'Harga harus lebih dari 0'),
  reseller_price: z.number().min(0, 'Harga reseller harus lebih dari 0').optional(),
  points_value: z.number().min(0, 'Nilai poin harus 0 atau lebih').optional(),
  commission_value: z.number().min(0, 'Nilai komisi harus 0 atau lebih').optional(),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  stock_quantity: z.number().min(0, 'Stok harus 0 atau lebih').optional(),
  min_stock_level: z.number().min(0, 'Minimal stok harus 0 atau lebih').optional(),
  featured: z.boolean().optional(),
  sort_order: z.number().min(0, 'Urutan harus 0 atau lebih').optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const { data: categories, isLoading: categoriesLoading } = useProductCategories();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category_id: product?.category_id || '',
      price: product?.price || 0,
      reseller_price: product?.reseller_price || 0,
      points_value: product?.points_value || 0,
      commission_value: product?.commission_value || 0,
      unit: product?.unit || 'unit',
      stock_quantity: product?.stock_quantity || 0,
      min_stock_level: product?.min_stock_level || 0,
      featured: product?.featured || false,
      sort_order: product?.sort_order || 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Form data submitted:', data);
      
      if (product?.id) {
        // For updates - only send changed fields
        const updateData = {
          id: product.id,
          ...data,
          category_id: data.category_id || null,
          description: data.description || null,
          reseller_price: data.reseller_price || null,
        };
        
        console.log('Sending update data:', updateData);
        await updateProductMutation.mutateAsync(updateData);
      } else {
        // For creates - ensure all required fields are present
        const createData = {
          name: data.name, // Required field
          price: data.price, // Required field
          unit: data.unit, // Required field
          description: data.description || null,
          category_id: data.category_id || null,
          reseller_price: data.reseller_price || null,
          points_value: data.points_value || 0,
          commission_value: data.commission_value || 0,
          stock_quantity: data.stock_quantity || 0,
          min_stock_level: data.min_stock_level || 0,
          featured: data.featured || false,
          sort_order: data.sort_order || 0,
        };
        
        console.log('Sending create data:', createData);
        await createProductMutation.mutateAsync(createData);
      }
      
      // Reset form and call success callback
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending || categoriesLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Produk</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama produk" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                  disabled={categoriesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Tanpa Kategori</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Normal</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reseller_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Reseller</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="points_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nilai Poin</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commission_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nilai Komisi (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Satuan</FormLabel>
                <FormControl>
                  <Input placeholder="unit, kg, liter, dll" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="min_stock_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimal Stok</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sort_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urutan</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Masukkan deskripsi produk" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Produk Unggulan</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Tampilkan produk ini sebagai unggulan
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : product ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
