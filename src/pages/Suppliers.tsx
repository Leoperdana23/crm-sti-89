
import React, { useState } from 'react';
import { Plus, Building, Edit, Trash2, Phone, Mail } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSuppliers, useDeleteSupplier } from '@/hooks/useSuppliers';
import { Supplier } from '@/types/product';
import SupplierForm from '@/components/SupplierForm';

const Suppliers = () => {
  const { data: suppliers, isLoading } = useSuppliers();
  const deleteSupplierMutation = useDeleteSupplier();
  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierFormOpen(true);
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      await deleteSupplierMutation.mutateAsync(supplierId);
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const handleCloseSupplierForm = () => {
    setSupplierFormOpen(false);
    setEditingSupplier(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data supplier...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier</h1>
          <p className="text-gray-600 mt-1">
            Kelola data supplier untuk pembelian produk
          </p>
        </div>
        
        <Button onClick={() => setSupplierFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Supplier
        </Button>
      </div>

      {/* Supplier List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers?.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span className="truncate">{supplier.name}</span>
                </div>
                <Badge variant="secondary">
                  Aktif
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supplier.contact_person && (
                  <div className="text-sm">
                    <span className="font-medium">Kontak: </span>
                    {supplier.contact_person}
                  </div>
                )}
                
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {supplier.phone}
                  </div>
                )}
                
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {supplier.email}
                  </div>
                )}
                
                {supplier.address && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {supplier.address}
                  </p>
                )}
                
                <div className="text-xs text-gray-500">
                  Termin: {supplier.payment_terms} hari
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="text-xs text-gray-500">
                  Dibuat: {new Date(supplier.created_at).toLocaleDateString('id-ID')}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSupplier(supplier)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Supplier</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus supplier "{supplier.name}"? 
                          Supplier ini akan dinonaktifkan dan tidak dapat digunakan untuk produk baru.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSupplier(supplier.id)}>
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {suppliers?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada supplier
            </h3>
            <p className="text-gray-600 mb-4">
              Tambahkan supplier untuk mengelola pembelian produk
            </p>
            <Button onClick={() => setSupplierFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Supplier Pertama
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Supplier Form Modal */}
      <SupplierForm 
        isOpen={supplierFormOpen}
        onClose={handleCloseSupplierForm}
        supplier={editingSupplier}
      />
    </div>
  );
};

export default Suppliers;
