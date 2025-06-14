
import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ResellerCard from '@/components/ResellerCard';
import ResellerForm from '@/components/ResellerForm';
import { useResellers, useDeleteReseller } from '@/hooks/useResellers';
import { useBranches } from '@/hooks/useBranches';
import { Reseller } from '@/types/reseller';

const Resellers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);
  const [deleteResellerId, setDeleteResellerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: resellers = [], isLoading } = useResellers();
  const { branches, loading: branchesLoading } = useBranches();
  const deleteMutation = useDeleteReseller();

  const filteredResellers = resellers.filter(reseller => {
    const matchesSearch = reseller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reseller.phone.includes(searchTerm) ||
                         (reseller.email && reseller.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesBranch = filterBranch === 'all' || reseller.branch_id === filterBranch;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && reseller.is_active) ||
                         (filterStatus === 'inactive' && !reseller.is_active);
    
    return matchesSearch && matchesBranch && matchesStatus;
  });

  const handleEdit = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setDeleteResellerId(null);
    } catch (error) {
      console.error('Error deleting reseller:', error);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingReseller(null);
  };

  if (isLoading || branchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Data Reseller
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola data pelanggan mitra reseller
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Reseller
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari reseller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterBranch} onValueChange={setFilterBranch}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Semua Cabang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Cabang</SelectItem>
            {branches && branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold">Total Reseller</h3>
          <p className="text-3xl font-bold mt-2">{resellers.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold">Reseller Aktif</h3>
          <p className="text-3xl font-bold mt-2">
            {resellers.filter(r => r.is_active).length}
          </p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold">Reseller Tidak Aktif</h3>
          <p className="text-3xl font-bold mt-2">
            {resellers.filter(r => !r.is_active).length}
          </p>
        </div>
      </div>

      {/* Reseller Grid */}
      {filteredResellers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm || filterBranch !== 'all' || filterStatus !== 'all'
              ? 'Tidak ada reseller yang sesuai dengan filter'
              : 'Belum ada data reseller'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResellers.map((reseller) => (
            <ResellerCard
              key={reseller.id}
              reseller={reseller}
              onEdit={handleEdit}
              onDelete={setDeleteResellerId}
            />
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <ResellerForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        reseller={editingReseller}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteResellerId} onOpenChange={() => setDeleteResellerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Reseller</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus reseller ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteResellerId && handleDelete(deleteResellerId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Resellers;
