
import React, { useState } from 'react';
import { Plus, Search, Filter, Users as UsersIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import UserCard from '@/components/UserCard';
import UserForm from '@/components/UserForm';
import { useUsers } from '@/hooks/useUsers';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { AppUser } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

const Users = () => {
  const { users, loading, addUser, updateUser, deleteUser } = useUsers();
  const { hasPermission } = useUserPermissions();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Check permissions
  const canCreate = hasPermission('users', 'create');
  const canView = hasPermission('users', 'view');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSubmit = async (data: any) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        toast({
          title: "Berhasil",
          description: "Data user berhasil diperbarui",
        });
      } else {
        await addUser(data);
        toast({
          title: "Berhasil",
          description: "User baru berhasil ditambahkan",
        });
      }
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user: AppUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus user ini?')) {
      try {
        await deleteUser(id);
        toast({
          title: "Berhasil",
          description: "User berhasil dihapus",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat menghapus user.",
          variant: "destructive"
        });
      }
    }
  };

  // Show access denied if user doesn't have view permission
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <UsersIcon className="h-16 w-16 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900">Akses Ditolak</h3>
        <p className="text-gray-600 text-center max-w-md">
          Anda tidak memiliki hak akses untuk melihat halaman Master User. 
          Silakan hubungi administrator untuk mendapatkan akses.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data user...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Master User</h1>
          <p className="text-gray-600 mt-1">Kelola data pengguna sistem</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4 flex-1">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari nama, username, atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-48">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {canCreate && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                onClick={() => setEditingUser(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Edit User' : 'Tambah User Baru'}
                </DialogTitle>
              </DialogHeader>
              <UserForm
                user={editingUser}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingUser(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada user</h3>
          <p className="text-gray-600">
            {searchTerm || roleFilter !== 'all' 
              ? 'Tidak ada user yang sesuai dengan filter' 
              : 'Mulai dengan menambahkan user pertama'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;
