
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useProductCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { Product, CreateProductData } from '@/types/product';
import { Trash2, Loader2 } from 'lucide-react';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

const ProductForm = ({ isOpen, onClose, product }: ProductFormProps) => {
  const { data: categories } = useProductCategories();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const form = useForm<CreateProductData>({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category_id: product?.category_id || 'no-category',
      price: product?.price || 0,
      reseller_price: product?.reseller_price || 0,
      unit: product?.unit || 'unit',
      image_url: product?.image_url || '',
      stock_quantity: product?.stock_quantity || 0,
      min_stock_level: product?.min_stock_level || 0,
    },
  });

  React.useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        category_id: product.category_id || 'no-category',
        price: product.price,
        reseller_price: product.reseller_price || 0,
        unit: product.unit,
        image_url: product.image_url || '',
        stock_quantity: product.stock_quantity || 0,
        min_stock_level: product.min_stock_level || 0,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        category_id: 'no-category',
        price: 0,
        reseller_price: 0,
        unit: 'unit',
        image_url: '',
        stock_quantity: 0,
        min_stock_level: 0,
      });
    }
  }, [product, form]);

  const onSubmit = async (data: CreateProductData) => {
    try {
      console.log('Form data before submission:', data);
      
      // Convert special values back to proper database format
      const processedData = {
        ...data,
        // Convert 'no-category' back to null for database
        category_id: data.category_id === 'no-category' ? null : data.category_id,
        // Convert values to proper numbers
        price: Number(data.price) || 0,
        reseller_price: data.reseller_price ? Number(data.reseller_price) : 0,
        stock_quantity: Number(data.stock_quantity) || 0,
        min_stock_level: Number(data.min_stock_level) || 0,
      };
      
      console.log('Processed form data:', processedData);

      if (product) {
        await updateProductMutation.mutateAsync({
          id: product.id,
          ...processedData,
        });
      } else {
        await createProductMutation.mutateAsync(processedData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    try {
      await deleteProductMutation.mutateAsync(product.id);
      onClose();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending || deleteProductMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{product ? 'Edit Produk' : 'Tambah Produk Baru'}</span>
            {product && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus produk "{product.name}"? 
                      Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Perbarui informasi produk' : 'Isi form di bawah untuk menambahkan produk baru ke katalog'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
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
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
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
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "no-category"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-category">Tanpa Kategori</SelectItem>
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <FormControl>
                      <Input placeholder="unit, kg, meter, dll" {...field} />
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
                    <FormLabel>Harga Normal *</FormLabel>
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
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
                    <FormLabel>Stok Tersedia</FormLabel>
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
                name="min_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Stok</FormLabel>
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
                name="image_url"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>URL Gambar</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {product ? 'Mengupdate...' : 'Menyimpan...'}
                  </>
                ) : (
                  product ? 'Update' : 'Simpan'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
