
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sales } from '@/types/sales';
import { useBranches } from '@/hooks/useBranches';

const salesSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  code: z.string().min(1, 'Kode harus diisi'),
  phone: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  branchId: z.string().optional(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
});

type SalesFormData = z.infer<typeof salesSchema>;

interface SalesFormProps {
  sales?: Sales;
  onSubmit: (data: SalesFormData) => void;
  onCancel: () => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ sales, onSubmit, onCancel }) => {
  const { branches } = useBranches();
  
  const form = useForm<SalesFormData>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      name: sales?.name || '',
      code: sales?.code || '',
      phone: sales?.phone || '',
      email: sales?.email || '',
      branchId: sales?.branchId || 'no-branch',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Sales</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama sales" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Sales</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan kode sales" {...field} />
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
                <FormLabel>Nomor HP</FormLabel>
                <FormControl>
                  <Input placeholder="08xxxxxxxxxx" {...field} />
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
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="branchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cabang</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cabang" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-branch">Tidak ada cabang</SelectItem>
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {sales ? 'Password Baru (kosongkan jika tidak ingin mengubah)' : 'Password'}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={sales ? "Masukkan password baru" : "Masukkan password"}
                  {...field}
                />
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
            {sales ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SalesForm;
