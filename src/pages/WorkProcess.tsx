
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Users, Clock, CheckCircle, XCircle, Search, Filter, Play, Pause, X } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { Customer } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';
import WorkAssignmentDialog from '@/components/WorkAssignmentDialog';

const WorkProcess = () => {
  const { customers, loading, updateCustomer, cancelWorkProcess } = useCustomers();
  const { branches } = useBranches();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [workNotes, setWorkNotes] = useState('');
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  // Filter customers to show only Deal customers
  const dealCustomers = customers.filter(customer => customer.status === 'Deal');

  const filteredCustomers = dealCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || customer.work_status === statusFilter;
    const matchesBranch = branchFilter === 'all' || customer.branch_id === branchFilter;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'not_started': return 'Belum Dimulai';
      case 'in_progress': return 'Sedang Dikerjakan';
      case 'completed': return 'Selesai';
      default: return 'Belum Dimulai';
    }
  };

  const handleStartWork = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsAssignmentDialogOpen(true);
  };

  const handleCompleteWork = (customer: Customer) => {
    setSelectedCustomer(customer);
    setWorkNotes(customer.work_notes || '');
    setIsNotesDialogOpen(true);
  };

  const handleCancelWork = async (customer: Customer) => {
    if (confirm('Yakin ingin membatalkan proses pekerjaan ini?')) {
      try {
        await cancelWorkProcess(customer.id);
        toast({
          title: "Berhasil",
          description: "Proses pekerjaan berhasil dibatalkan",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat membatalkan proses pekerjaan.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAssignmentComplete = async (assignmentData: any) => {
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, {
          work_status: 'in_progress',
          work_start_date: new Date().toISOString(),
          estimated_days: assignmentData.estimatedDays,
          assigned_employees: assignmentData.assignedEmployees,
          work_notes: assignmentData.notes
        });
        
        toast({
          title: "Berhasil",
          description: "Pekerjaan berhasil dimulai",
        });
      }
      setIsAssignmentDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memulai pekerjaan.",
        variant: "destructive"
      });
    }
  };

  const handleWorkComplete = async () => {
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, {
          work_status: 'completed',
          work_completed_date: new Date().toISOString(),
          work_notes: workNotes
        });
        
        toast({
          title: "Berhasil",
          description: "Pekerjaan berhasil diselesaikan",
        });
      }
      setIsNotesDialogOpen(false);
      setSelectedCustomer(null);
      setWorkNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyelesaikan pekerjaan.",
        variant: "destructive"
      });
    }
  };

  const stats = {
    notStarted: filteredCustomers.filter(c => !c.work_status || c.work_status === 'not_started').length,
    inProgress: filteredCustomers.filter(c => c.work_status === 'in_progress').length,
    completed: filteredCustomers.filter(c => c.work_status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 animate-spin" />
          <span>Memuat data proses pekerjaan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proses Pekerjaan</h1>
          <p className="text-gray-600 mt-1">Kelola proses pekerjaan untuk pelanggan deal</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Dimulai</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Dikerjakan</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter & Pencarian</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama atau telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status Pekerjaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="not_started">Belum Dimulai</SelectItem>
                <SelectItem value="in_progress">Sedang Dikerjakan</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
              </SelectContent>
            </Select>

            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger>
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

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setBranchFilter('all');
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Process List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{customer.name}</h3>
                    <Badge className={getStatusColor(customer.work_status)}>
                      {getStatusText(customer.work_status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Telepon:</strong> {customer.phone}
                    </div>
                    <div>
                      <strong>Alamat:</strong> {customer.address}
                    </div>
                    {customer.deal_date && (
                      <div>
                        <strong>Tanggal Deal:</strong> {new Date(customer.deal_date).toLocaleDateString('id-ID')}
                      </div>
                    )}
                    {customer.estimated_days && (
                      <div>
                        <strong>Estimasi:</strong> {customer.estimated_days} hari
                      </div>
                    )}
                  </div>

                  {customer.work_start_date && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Dimulai:</strong> {new Date(customer.work_start_date).toLocaleDateString('id-ID')}
                    </div>
                  )}

                  {customer.work_completed_date && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Selesai:</strong> {new Date(customer.work_completed_date).toLocaleDateString('id-ID')}
                    </div>
                  )}

                  {customer.assigned_employees && customer.assigned_employees.length > 0 && (
                    <div className="mt-2">
                      <strong className="text-sm text-gray-600">Karyawan:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {customer.assigned_employees.map((employeeId, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {employeeId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {customer.work_notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <strong>Catatan:</strong> {customer.work_notes}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {(!customer.work_status || customer.work_status === 'not_started') && (
                    <Button
                      onClick={() => handleStartWork(customer)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Mulai
                    </Button>
                  )}
                  
                  {customer.work_status === 'in_progress' && (
                    <>
                      <Button
                        onClick={() => handleCompleteWork(customer)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Selesai
                      </Button>
                      <Button
                        onClick={() => handleCancelWork(customer)}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Batal
                      </Button>
                    </>
                  )}

                  {customer.work_status === 'completed' && (
                    <Button
                      onClick={() => handleCancelWork(customer)}
                      variant="outline"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada proses pekerjaan
            </h3>
            <p className="text-gray-600">
              Belum ada pelanggan deal yang memerlukan proses pekerjaan
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assignment Dialog */}
      <WorkAssignmentDialog
        isOpen={isAssignmentDialogOpen}
        onClose={() => {
          setIsAssignmentDialogOpen(false);
          setSelectedCustomer(null);
        }}
        onAssign={handleAssignmentComplete}
        customer={selectedCustomer}
      />

      {/* Complete Work Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan Pekerjaan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Catatan Penyelesaian</label>
              <Textarea
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
                placeholder="Tambahkan catatan tentang penyelesaian pekerjaan..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleWorkComplete}>
                Selesai
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkProcess;
