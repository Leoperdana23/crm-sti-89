
import React, { useState } from 'react';
import { Plus, Building, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BranchForm from '@/components/BranchForm';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/hooks/useBranches';
import { Branch } from '@/types/branch';
import { useToast } from '@/hooks/use-toast';

const Branches = () => {
  const { branches, loading } = useBranches();
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();
  const deleteBranchMutation = useDeleteBranch();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      if (editingBranch) {
        await updateBranchMutation.mutateAsync({ id: editingBranch.id, ...data });
        toast({
          title: "Berhasil",
          description: "Data cabang berhasil diperbarui",
        });
      } else {
        await createBranchMutation.mutateAsync(data);
        toast({
          title: "Berhasil",
          description: "Cabang baru berhasil ditambahkan",
        });
      }
      setIsFormOpen(false);
      setEditingBranch(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus cabang ini?')) {
      try {
        await deleteBranchMutation.mutateAsync(id);
        toast({
          title: "Berhasil",
          description: "Cabang berhasil dihapus",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat menghapus cabang.",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data cabang...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master Data Cabang</h1>
          <p className="text-gray-600 mt-1">Kelola data cabang perusahaan</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              onClick={() => setEditingBranch(null)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Cabang
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? 'Edit Cabang' : 'Tambah Cabang Baru'}
              </DialogTitle>
            </DialogHeader>
            <BranchForm
              branch={editingBranch}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingBranch(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Cabang ({branches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Cabang</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.code}</TableCell>
                  <TableCell>{branch.address || '-'}</TableCell>
                  <TableCell>{branch.phone || '-'}</TableCell>
                  <TableCell>{branch.manager_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(branch)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(branch.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {branches.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada cabang</h3>
              <p className="text-gray-600">
                Mulai dengan menambahkan cabang pertama Anda
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Branches;
