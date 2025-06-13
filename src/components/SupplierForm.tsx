
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';
import { Supplier } from '@/types/product';

const formSchema = z.object({
  name: z.string().min(1, 'Nama supplier wajib diisi').max(255, 'Nama supplier terlalu panjang'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
  payment_terms: z.number().min(0, 'Termin pembayaran harus 0 atau lebih').optional(),
  tax_number: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier;
}

const SupplierForm = ({ isOpen, onClose, supplier }: SupplierFormProps) => {
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: supplier?.name || '',
      contact_person: supplier?.contact_person || '',
      phone: supplier?.phone || '',
      email: supplier?.email || '',
      address: supplier?.address || '',
      payment_terms: supplier?.payment_terms || 30,
      tax_number: supplier?.tax_number || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Form data submitted:', data);
      
      const submitData = {
        name: data.name,
        contact_person: data.contact_person || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        payment_terms: data.payment_terms || 30,
        tax_number: data.tax_number || null,
      };

      if (supplier?.id) {
        await updateSupplierMutation.mutateAsync({
          id: supplier.id,
          ...submitData
        });
      } else {
        await createSupplierMutation.mutateAsync(submitData);
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const isLoading = createSupplierMutation.isPending || updateSupplierMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Edit Supplier' : 'Tambah Supplier'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Supplier *</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama supplier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kontak Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama kontak person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan no. telepon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Termin Pembayaran (hari)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="30"
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
                name="tax_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NPWP</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan NPWP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Masukkan alamat lengkap" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : supplier ? 'Update Supplier' : 'Simpan Supplier'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierForm;
