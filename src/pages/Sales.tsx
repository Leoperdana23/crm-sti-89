
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users } from 'lucide-react';
import { useSales, useCreateSales, useUpdateSales, useDeleteSales } from '@/hooks/useSales';
import { Sales as SalesType } from '@/types/sales';
import SalesForm from '@/components/SalesForm';
import SalesCard from '@/components/SalesCard';
import { useToast } from '@/hooks/use-toast';

const Sales = () => {
  const { sales, loading } = useSales();
  const createSalesMutation = useCreateSales();
  const updateSalesMutation = useUpdateSales();
  const deleteSalesMutation = useDeleteSales();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSales, setEditingSales] = useState<SalesType | null>(null);
  const [deletingSales, setDeletingSales] = useState<SalesType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSales = sales.filter(sale =>
    sale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (data: any) => {
    try {
      if (editingSales) {
        await updateSalesMutation.mutateAsync({
          id: editingSales.id,
          ...data,
          is_active: true,
        });
        toast({
          title: "Berhasil",
          description: "Data sales berhasil diupdate",
        });
      } else {
        await createSalesMutation.mutateAsync({
          ...data,
          is_active: true,
        });
        toast({
          title: "Berhasil",
          description: "Sales baru berhasil ditambahkan",
        });
      }
      setIsFormOpen(false);
      setEditingSales(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan data sales",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (sales: SalesType) => {
    setEditingSales(sales);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingSales) return;

    try {
      await deleteSalesMutation.mutateAsync(deletingSales.id);
      toast({
        title: "Berhasil",
        description: "Sales berhasil dihapus",
      });
      setDeletingSales(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus sales",
        variant: "destructive",
      });
    }
  };

  const openAddForm = () => {
    setEditingSales(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSales(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Sales</h1>
          <p className="text-gray-600 mt-1">Kelola data sales dan tim penjualan</p>
        </div>
        <Button onClick={openAddForm} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Sales
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="mr-2 h-4 w-4" />
          {filteredSales.length} sales
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSales.map((sale) => (
          <SalesCard
            key={sale.id}
            sales={sale}
            onEdit={handleEdit}
            onDelete={setDeletingSales}
          />
        ))}
      </div>

      {filteredSales.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada sales</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tidak ditemukan sales yang sesuai dengan pencarian.' : 'Belum ada data sales. Tambah sales pertama Anda.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={openAddForm}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Sales
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={closeForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSales ? 'Edit Sales' : 'Tambah Sales Baru'}
            </DialogTitle>
          </DialogHeader>
          <SalesForm
            sales={editingSales || undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingSales} onOpenChange={() => setDeletingSales(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Sales</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus sales "{deletingSales?.name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Sales;
