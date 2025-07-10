
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  UserPlus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Download,
  Phone,
  MapPin,
  Building,
  Hash,
  History
} from 'lucide-react';
import { useResellers, useDeleteReseller } from '@/hooks/useResellers';
import { useBranches } from '@/hooks/useBranches';
import ResellerForm from '@/components/ResellerForm';
import ResellerLoginHistory from '@/components/ResellerLoginHistory';

const ResellerManagement = () => {
  const { data: resellers, isLoading } = useResellers();
  const { data: branches } = useBranches();
  const deleteReseller = useDeleteReseller();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedReseller, setSelectedReseller] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (reseller: any) => {
    setSelectedReseller(reseller);
    setIsFormOpen(true);
  };

  const handleDelete = async (resellerId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus reseller ini?')) {
      await deleteReseller.mutateAsync(resellerId);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedReseller(null);
  };

  const filteredResellers = resellers?.filter(reseller => {
    const matchesSearch = 
      reseller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reseller.phone.includes(searchTerm) ||
      reseller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reseller.id.toLowerCase().includes(searchTerm.toLowerCase()); // Use reseller.id instead of reseller_id
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && reseller.is_active) ||
      (statusFilter === 'inactive' && !reseller.is_active);
    
    const matchesBranch = branchFilter === 'all' || reseller.branch_id === branchFilter;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const stats = {
    total: resellers?.length || 0,
    active: resellers?.filter(r => r.is_active).length || 0,
    inactive: resellers?.filter(r => !r.is_active).length || 0,
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
          <h1 className="text-2xl font-bold">Manajemen Reseller</h1>
          <p className="text-gray-600">Kelola data reseller dan distributor</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedReseller(null)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Reseller
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedReseller ? 'Edit Reseller' : 'Tambah Reseller Baru'}
                </DialogTitle>
                <DialogDescription>
                  {selectedReseller 
                    ? 'Perbarui informasi reseller' 
                    : 'Masukkan informasi reseller baru'
                  }
                </DialogDescription>
              </DialogHeader>
              <ResellerForm 
                isOpen={isFormOpen}
                reseller={selectedReseller} 
                onClose={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Reseller</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Reseller Nonaktif</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Resellers and Login History */}
      <Tabs defaultValue="resellers" className="w-full">
        <TabsList>
          <TabsTrigger value="resellers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Data Reseller
          </TabsTrigger>
          <TabsTrigger value="login-history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Riwayat Login
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resellers" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari berdasarkan nama, telepon, email, atau ID reseller..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Semua Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Cabang</SelectItem>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <TableHead>ID Reseller</TableHead>
                    <TableHead>Reseller</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResellers?.map((reseller) => (
                    <TableRow key={reseller.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Hash className="h-3 w-3" />
                          {reseller.id.slice(-8)} {/* Use reseller.id instead of reseller_id */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reseller.name}</div>
                          {reseller.email && (
                            <div className="text-sm text-gray-500">{reseller.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {reseller.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Building className="h-3 w-3" />
                          {reseller.branches?.name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm max-w-xs truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          {reseller.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={reseller.is_active ? 'default' : 'secondary'}>
                          {reseller.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(reseller.created_at).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(reseller)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(reseller.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login-history">
          <ResellerLoginHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResellerManagement;
