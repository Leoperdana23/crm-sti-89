
import React from 'react';
import { useForm } from 'react-hook-form';
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

  const form = useForm({
    defaultValues: {
      name: reseller?.name || '',
      phone: reseller?.phone || '',
      address: reseller?.address || '',
      birth_date: reseller?.birth_date || '',
      email: reseller?.email || '',
      id_number: reseller?.id_number || '',
      notes: reseller?.notes || '',
      branch_id: reseller?.branch_id || '',
      commission_rate: reseller?.commission_rate || 10,
      is_active: reseller?.is_active ?? true,
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
      });
    }
  }, [reseller, form]);

  const onSubmit = async (data: any) => {
    try {
      console.log('Form data before submission:', data);
      
      const processedData = {
        ...data,
        birth_date: data.birth_date || null,
        email: data.email || null,
        id_number: data.id_number || null,
        notes: data.notes || null,
        branch_id: data.branch_id === 'no-branch' ? null : data.branch_id || null,
        commission_rate: Number(data.commission_rate) || 10,
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
                    <FormLabel>Persentase Komisi (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="10" 
                        min="0"
                        max="100"
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
