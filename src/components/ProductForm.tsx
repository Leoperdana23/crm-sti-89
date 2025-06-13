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
import { useSuppliers } from '@/hooks/useSuppliers';
import { Product, CreateProductData } from '@/types/product';

const formSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi').max(255, 'Nama produk terlalu panjang'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  supplier_id: z.string().optional(),
  price: z.number().min(0, 'Harga harus 0 atau lebih'),
  cost_price: z.number().min(0, 'Harga beli harus 0 atau lebih').optional(),
  reseller_price: z.number().min(0, 'Harga reseller harus 0 atau lebih').optional(),
  points_value: z.number().min(0, 'Nilai poin harus 0 atau lebih').optional(),
  commission_value: z.number().min(0, 'Nilai komisi harus 0 atau lebih').optional(),
  unit: z.string().min(1, 'Satuan wajib diisi').max(50, 'Satuan terlalu panjang'),
  stock_quantity: z.number().min(0, 'Stok harus 0 atau lebih').optional(),
  min_stock_level: z.number().min(0, 'Minimal stok harus 0 atau lebih').optional(),
  barcode: z.string().optional(),
  weight: z.number().min(0, 'Berat harus 0 atau lebih').optional(),
  dimensions: z.string().optional(),
  warranty_period: z.number().min(0, 'Periode garansi harus 0 atau lebih').optional(),
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
  const { data: categories = [], isLoading: categoriesLoading } = useProductCategories();
  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category_id: product?.category_id || '',
      supplier_id: product?.supplier_id || '',
      price: product?.price || 0,
      cost_price: product?.cost_price || undefined,
      reseller_price: product?.reseller_price || undefined,
      points_value: product?.points_value || 0,
      commission_value: product?.commission_value || 0,
      unit: product?.unit || 'unit',
      stock_quantity: product?.stock_quantity || 0,
      min_stock_level: product?.min_stock_level || 0,
      barcode: product?.barcode || '',
      weight: product?.weight || undefined,
      dimensions: product?.dimensions || '',
      warranty_period: product?.warranty_period || undefined,
      featured: product?.featured || false,
      sort_order: product?.sort_order || 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Form data submitted:', data);
      
      if (product?.id) {
        await updateProductMutation.mutateAsync({
          id: product.id,
          ...data
        });
      } else {
        // Ensure required fields are present for create operation
        const createData: CreateProductData = {
          name: data.name, // This is guaranteed to be present due to form validation
          unit: data.unit, // This is guaranteed to be present due to form validation
          price: data.price, // This is guaranteed to be present due to form validation
          description: data.description,
          category_id: data.category_id || undefined,
          supplier_id: data.supplier_id || undefined,
          cost_price: data.cost_price,
          reseller_price: data.reseller_price,
          points_value: data.points_value,
          commission_value: data.commission_value,
          stock_quantity: data.stock_quantity,
          min_stock_level: data.min_stock_level,
          barcode: data.barcode,
          weight: data.weight,
          dimensions: data.dimensions,
          warranty_period: data.warranty_period,
          featured: data.featured,
          sort_order: data.sort_order,
        };
        
        await createProductMutation.mutateAsync(createData);
      }
      
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending || categoriesLoading || suppliersLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Produk *</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama produk" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan barcode" {...field} />
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
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || ''}
                  disabled={suppliersLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih supplier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Tanpa Supplier</SelectItem>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
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
            name="cost_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Beli</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Jual *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
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
            name="reseller_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Reseller</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                    min="0"
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
                    min="0"
                    step="0.01"
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
                <FormLabel>Satuan *</FormLabel>
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
                    min="0"
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
                    min="0"
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
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Berat (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dimensions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dimensi</FormLabel>
                <FormControl>
                  <Input placeholder="P x L x T (cm)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warranty_period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Periode Garansi (bulan)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                    min="0"
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
                <Textarea 
                  placeholder="Masukkan deskripsi produk" 
                  className="min-h-[100px]"
                  {...field} 
                />
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
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Batal
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : product ? 'Update Produk' : 'Simpan Produk'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
