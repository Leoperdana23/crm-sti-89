
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users,
  Key
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import ResellerForm from '@/components/ResellerForm';

const ResellerManagement = () => {
  const { data: resellers, isLoading } = useResellers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState(null);

  const filteredResellers = resellers?.filter(reseller => 
    reseller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reseller.phone.includes(searchTerm)
  );

  const handleEdit = (reseller: any) => {
    setEditingReseller(reseller);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingReseller(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReseller(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Daftar Reseller</h1>
          <p className="text-gray-600">Kelola reseller SEDEKAT App</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Reseller
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Reseller</p>
                <p className="text-2xl font-bold">{resellers?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Reseller Aktif</p>
                <p className="text-2xl font-bold">
                  {resellers?.filter(r => r.is_active).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari reseller berdasarkan nama atau telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Reseller</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Komisi Rate</TableHead>
                <TableHead>Total Poin</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResellers?.map((reseller) => (
                <TableRow key={reseller.id}>
                  <TableCell className="font-medium">{reseller.name}</TableCell>
                  <TableCell>{reseller.phone}</TableCell>
                  <TableCell>{reseller.email || '-'}</TableCell>
                  <TableCell>{reseller.branches?.name || '-'}</TableCell>
                  <TableCell>{reseller.commission_rate}%</TableCell>
                  <TableCell>{reseller.total_points || 0} poin</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {reseller.password_hash ? (
                        <Badge variant="default">Ada</Badge>
                      ) : (
                        <Badge variant="secondary">Belum diatur</Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Key className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={reseller.is_active ? 'default' : 'secondary'}>
                      {reseller.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(reseller)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <ResellerForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        reseller={editingReseller}
      />
    </div>
  );
};

export default ResellerManagement;
