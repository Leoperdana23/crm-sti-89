
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useCreateReseller, useUpdateReseller, useDeleteReseller } from '@/hooks/useResellers';
import { useBranches } from '@/hooks/useBranches';
import { Reseller } from '@/types/reseller';
import { Trash2, Loader2 } from 'lucide-react';

const resellerSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  phone: z.string().min(1, 'Nomor HP harus diisi'),
  address: z.string().min(1, 'Alamat harus diisi'),
  birth_date: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  id_number: z.string().optional(),
  notes: z.string().optional(),
  branch_id: z.string().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  is_active: z.boolean().optional(),
  password: z.string().optional(),
});

type ResellerFormData = z.infer<typeof resellerSchema>;

interface ResellerFormProps {
  isOpen: boolean;
  onClose: () => void;
  reseller?: Reseller;
}

const ResellerForm = ({ isOpen, onClose, reseller }: ResellerFormProps) => {
  const { branches } = useBranches();
  const createResellerMutation = useCreateReseller();
  const updateResellerMutation = useUpdateReseller();
  const deleteResellerMutation = useDeleteReseller();

  const form = useForm<ResellerFormData>({
    resolver: zodResolver(resellerSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      birth_date: '',
      email: '',
      id_number: '',
      notes: '',
      branch_id: '',
      commission_rate: 10,
      is_active: true,
      password: '',
    },
  });

  React.useEffect(() => {
    if (reseller) {
      form.reset({
        name: reseller.name,
        phone: reseller.phone,
        address: reseller.address,
        birth_date: reseller.birth_date || '',
        email: reseller.email || '',
        id_number: reseller.id_number || '',
        notes: reseller.notes || '',
        branch_id: reseller.branch_id || '',
        commission_rate: reseller.commission_rate || 10,
        is_active: reseller.is_active,
        password: '',
      });
    } else {
      form.reset({
        name: '',
        phone: '',
        address: '',
        birth_date: '',
        email: '',
        id_number: '',
        notes: '',
        branch_id: '',
        commission_rate: 10,
        is_active: true,
        password: '',
      });
    }
  }, [reseller, form]);

  const onSubmit = async (data: ResellerFormData) => {
    try {
      console.log('Form data before submission:', data);
      
      // Ensure required fields are present and properly typed
      const processedData = {
        name: data.name, // Required field
        phone: data.phone, // Required field  
        address: data.address, // Required field
        birth_date: data.birth_date || undefined,
        email: data.email || undefined,
        id_number: data.id_number || undefined,
        notes: data.notes || undefined,
        branch_id: data.branch_id === 'no-branch' ? undefined : data.branch_id || undefined,
        commission_rate: data.commission_rate,
        is_active: data.is_active,
        password: data.password || undefined,
      };
      
      console.log('Processed form data:', processedData);

      if (reseller) {
        await updateResellerMutation.mutateAsync({
          id: reseller.id,
          ...processedData,
        });
      } else {
        await createResellerMutation.mutateAsync(processedData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving reseller:', error);
    }
  };

  const handleDelete = async () => {
    if (!reseller) return;
    
    try {
      await deleteResellerMutation.mutateAsync(reseller.id);
      onClose();
    } catch (error) {
      console.error('Error deleting reseller:', error);
    }
  };

  const isLoading = createResellerMutation.isPending || updateResellerMutation.isPending || deleteResellerMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{reseller ? 'Edit Reseller' : 'Tambah Reseller Baru'}</span>
            {reseller && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Reseller</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus reseller "{reseller.name}"? 
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
            {reseller ? 'Perbarui informasi reseller' : 'Isi form di bawah untuk menambahkan reseller baru'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <FormLabel>Nomor Telepon *</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nomor telepon" {...field} />
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
                      <Input type="email" placeholder="Masukkan email" {...field} />
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
                    <FormLabel>Nomor KTP</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nomor KTP" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value || "no-branch"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih cabang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-branch">Tanpa Cabang</SelectItem>
                        {branches?.map((branch) => (
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
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Komisi (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
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
                      {reseller ? 'Password Baru (kosongkan jika tidak ingin mengubah)' : 'Password'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={reseller ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
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
                  <FormItem className="md:col-span-2">
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Masukkan catatan tambahan (opsional)" {...field} />
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
                    {reseller ? 'Mengupdate...' : 'Menyimpan...'}
                  </>
                ) : (
                  reseller ? 'Update' : 'Simpan'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResellerForm;
