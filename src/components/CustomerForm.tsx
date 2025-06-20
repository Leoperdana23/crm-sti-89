
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Customer } from '@/types/customer';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';

const customerSchema = z.object({
  name: z.string().min(1, 'Nama lengkap harus diisi'),
  phone: z.string().min(1, 'Nomor HP/WA harus diisi'),
  address: z.string().min(1, 'Alamat harus diisi'),
  birth_date: z.string().optional(),
  id_number: z.string().optional(),
  email: z.string().optional(),
  needs: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['Prospek', 'Follow-up', 'Cold', 'Warm', 'Hot', 'Deal', 'Tidak Jadi']),
  branch_id: z.string().min(1, 'Cabang harus dipilih'),
  sales_id: z.string().min(1, 'Sales harus dipilih'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  const { branches } = useBranches();
  const { sales } = useSales();
  
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      birth_date: customer?.birth_date || '',
      id_number: customer?.id_number || '',
      email: '',
      needs: customer?.needs || '',
      notes: customer?.notes || '',
      status: customer?.status || 'Prospek',
      branch_id: customer?.branch_id || '',
      sales_id: customer?.sales_id || '',
    },
  });

  console.log('Form errors:', form.formState.errors);
  console.log('Form values:', form.getValues());

  const handleSubmit = (data: CustomerFormData) => {
    console.log('Submitting customer data:', data);
    
    // Clean up empty strings and convert to proper format
    const cleanedData = {
      ...data,
      birth_date: data.birth_date?.trim() || undefined,
      id_number: data.id_number?.trim() || undefined,
      email: data.email?.trim() || undefined,
      needs: data.needs?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
    };
    
    onSubmit(cleanedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap *</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama lengkap" {...field} />
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
                <FormLabel>Nomor HP/WA *</FormLabel>
                <FormControl>
                  <Input placeholder="08xxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Lahir</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Identitas</FormLabel>
                <FormControl>
                  <Input placeholder="KTP/SIM/Passport" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat *</FormLabel>
              <FormControl>
                <Textarea placeholder="Masukkan alamat lengkap" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="branch_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cabang *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih cabang" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Prospek">Prospek</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Cold">Cold</SelectItem>
                    <SelectItem value="Warm">Warm</SelectItem>
                    <SelectItem value="Hot">Hot</SelectItem>
                    <SelectItem value="Deal">Deal</SelectItem>
                    <SelectItem value="Tidak Jadi">Tidak Jadi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sales_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sales *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih sales" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sales.map((salesPerson) => (
                      <SelectItem key={salesPerson.id} value={salesPerson.id}>
                        {salesPerson.name} ({salesPerson.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="needs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kebutuhan</FormLabel>
              <FormControl>
                <Textarea placeholder="Deskripsi singkat kebutuhan pelanggan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan</FormLabel>
              <FormControl>
                <Textarea placeholder="Catatan tambahan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            {customer ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomerForm;
