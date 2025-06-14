import React, { useState, useEffect } from 'react';
import { Plus, Users, Filter, Search, Calendar, Loader2, Trash } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import CustomerCard from '@/components/CustomerCard';
import CustomerForm from '@/components/CustomerForm';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateReseller } from '@/hooks/useResellers';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';
import { Customer } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';

const Customers = () => {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer, deleteCustomersByName } = useCustomers();
  const createResellerMutation = useCreateReseller();
  const { branches } = useBranches();
  const { sales } = useSales();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [salesFilter, setSalesFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Auto-delete test customers on component mount
  useEffect(() => {
    const deleteTestCustomers = async () => {
      try {
        await deleteCustomersByName('tes');
        console.log('Test customers deleted automatically');
      } catch (error) {
        console.error('Error deleting test customers:', error);
      }
    };
    
    if (customers.some(c => c.name.toLowerCase() === 'tes')) {
      deleteTestCustomers();
    }
  }, [customers, deleteCustomersByName]);

  const handleSubmit = async (data: any) => {
    try {
      console.log('Submitting customer data:', data);
      
      if (data.customer_type === 'reseller') {
        // Save as reseller
        const resellerData = {
          name: data.name,
          phone: data.phone,
          address: data.address,
          birth_date: data.birth_date || undefined,
          email: data.email || undefined,
          id_number: data.id_number || undefined,
          notes: data.notes || undefined,
          branch_id: data.branch_id,
          is_active: true
        };
        
        await createResellerMutation.mutateAsync(resellerData);
        toast({
          title: "Berhasil",
          description: "Reseller baru berhasil ditambahkan",
        });
      } else {
        // Save as customer (existing logic)
        if (editingCustomer) {
          await updateCustomer({ id: editingCustomer.id, ...data });
          toast({
            title: "Berhasil",
            description: "Data pelanggan berhasil diperbarui",
          });
        } else {
          await addCustomer(data);
          toast({
            title: "Berhasil",
            description: "Pelanggan baru berhasil ditambahkan",
          });
        }
      }
      
      setIsFormOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: `Terjadi kesalahan: ${error instanceof Error ? error.message : 'Silakan coba lagi.'}`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus pelanggan ini?')) {
      try {
        await deleteCustomer(id);
        toast({
          title: "Berhasil",
          description: "Pelanggan berhasil dihapus",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat menghapus pelanggan.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteTestCustomers = async () => {
    if (confirm('Yakin ingin menghapus semua pelanggan dengan nama "tes"?')) {
      try {
        await deleteCustomersByName('tes');
        toast({
          title: "Berhasil",
          description: "Semua pelanggan test berhasil dihapus",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat menghapus pelanggan test.",
          variant: "destructive"
        });
      }
    }
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${whatsappPhone}`, '_blank');
  };

  const handleStatusUpdate = async (customerId: string, status: Customer['status']) => {
    try {
      const updateData: any = { status };
      if (status === 'Deal') {
        updateData.deal_date = new Date().toISOString().split('T')[0];
        updateData.survey_status = 'belum_disurvei';
        updateData.work_status = 'not_started';
      }
      
      await updateCustomer({ id: customerId, ...updateData });
      toast({
        title: "Berhasil",
        description: "Status pelanggan berhasil diperbarui",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memperbarui status.",
        variant: "destructive"
      });
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         customer.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || customer.branch_id === branchFilter;
    const matchesSales = salesFilter === 'all' || customer.sales_id === salesFilter;
    
    return matchesSearch && matchesStatus && matchesBranch && matchesSales;
  });

  const stats = {
    total: customers.length,
    prospek: customers.filter(c => c.status === 'Prospek').length,
    followUp: customers.filter(c => c.status === 'Follow-up').length,
    deal: customers.filter(c => c.status === 'Deal').length,
    tidakJadi: customers.filter(c => c.status === 'Tidak Jadi').length,
  };

  const testCustomersCount = customers.filter(c => c.name.toLowerCase() === 'tes').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] md:min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
          <span className="text-sm md:text-base">Memuat data pelanggan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Data Pelanggan</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Kelola data pelanggan dan prospek bisnis</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          {testCustomersCount > 0 && (
            <Button 
              variant="destructive"
              onClick={handleDeleteTestCustomers}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Trash className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Hapus Data Test ({testCustomersCount})</span>
              <span className="sm:hidden">Hapus Test ({testCustomersCount})</span>
            </Button>
          )}
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 w-full sm:w-auto"
                onClick={() => setEditingCustomer(null)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Tambah Pelanggan</span>
                <span className="sm:hidden">Tambah</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">
                  {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan/Reseller Baru'}
                </DialogTitle>
              </DialogHeader>
              <CustomerForm
                customer={editingCustomer}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingCustomer(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Prospek</CardTitle>
            <div className="h-3 w-3 md:h-4 md:w-4 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-blue-600">{stats.prospek}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Follow-up</CardTitle>
            <div className="h-3 w-3 md:h-4 md:w-4 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-yellow-600">{stats.followUp}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Deal</CardTitle>
            <div className="h-3 w-3 md:h-4 md:w-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">{stats.deal}</div>
            {stats.deal > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Deal terbaru: {new Date(Math.max(...customers.filter(c => c.status === 'Deal' && c.deal_date).map(c => new Date(c.deal_date!).getTime()))).toLocaleDateString('id-ID')}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-3 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Tidak Jadi</CardTitle>
            <div className="h-3 w-3 md:h-4 md:w-4 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-red-600">{stats.tidakJadi}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            <span>Filter & Pencarian</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama, telepon, atau alamat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Prospek">Prospek</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Deal">Deal</SelectItem>
                <SelectItem value="Tidak Jadi">Tidak Jadi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Cabang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Cabang</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={salesFilter} onValueChange={setSalesFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Sales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Sales</SelectItem>
                {sales.map((salesPerson) => (
                  <SelectItem key={salesPerson.id} value={salesPerson.id}>
                    {salesPerson.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setBranchFilter('all');
                setSalesFilter('all');
              }}
              size="sm"
              className="w-full md:w-auto mb-4 md:mb-0"
            >
              Reset Filter
            </Button>
            
            <div className="flex flex-wrap gap-2 mt-2 md:mt-4">
              <Badge variant="secondary" className="text-xs">
                Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
              </Badge>
              {searchTerm && (
                <Badge variant="outline" className="text-xs">
                  Pencarian: "{searchTerm}"
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Status: {statusFilter}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredCustomers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onWhatsApp={handleWhatsApp}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 md:py-12">
            <Users className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || branchFilter !== 'all' 
                ? 'Tidak ada pelanggan yang sesuai filter' 
                : 'Belum ada pelanggan'}
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || branchFilter !== 'all'
                ? 'Coba ubah kriteria pencarian atau filter Anda'
                : 'Mulai dengan menambahkan pelanggan pertama Anda'}
            </p>
            {!(searchTerm || statusFilter !== 'all' || branchFilter !== 'all') && (
              <Button onClick={() => setIsFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pelanggan
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Customers;
