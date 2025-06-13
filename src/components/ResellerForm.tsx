
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Reseller } from '@/types/reseller';
import { useBranches } from '@/hooks/useBranches';

const resellerSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  phone: z.string().min(1, 'Nomor HP/WA harus diisi'),
  address: z.string().min(1, 'Alamat harus diisi'),
  birth_date: z.string().optional(),
  email: z.string().optional(),
  id_number: z.string().optional(),
  notes: z.string().optional(),
  branch_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

type ResellerFormData = z.infer<typeof resellerSchema>;

interface ResellerFormProps {
  reseller?: Reseller;
  onSubmit: (data: ResellerFormData) => void;
  onCancel: () => void;
}

const ResellerForm: React.FC<ResellerFormProps> = ({ reseller, onSubmit, onCancel }) => {
  const { branches } = useBranches();
  
  const form = useForm<ResellerFormData>({
    resolver: zodResolver(resellerSchema),
    defaultValues: {
      name: reseller?.name || '',
      phone: reseller?.phone || '',
      address: reseller?.address || '',
      birth_date: reseller?.birth_date || '',
      email: reseller?.email || '',
      id_number: reseller?.id_number || '',
      notes: reseller?.notes || '',
      branch_id: reseller?.branch_id || '',
      is_active: reseller?.is_active ?? true,
    },
  });

  const handleSubmit = (data: ResellerFormData) => {
    console.log('Submitting reseller data:', data);
    
    // Clean up empty strings
    const cleanedData = {
      ...data,
      birth_date: data.birth_date?.trim() || undefined,
      email: data.email?.trim() || undefined,
      id_number: data.id_number?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      branch_id: data.branch_id?.trim() || undefined,
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

          <FormField
            control={form.control}
            name="branch_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cabang</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
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
        </div>

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

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status Aktif</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Aktifkan atau nonaktifkan reseller ini
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

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            {reseller ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ResellerForm;
