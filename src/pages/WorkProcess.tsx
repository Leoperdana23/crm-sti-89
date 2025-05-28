
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Users, Eye, Edit, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';
import { useToast } from '@/hooks/use-toast';
import WorkAssignmentDialog from '@/components/WorkAssignmentDialog';

const WorkProcess = () => {
  const { customers, updateCustomer } = useCustomers();
  const { branches } = useBranches();
  const { sales } = useSales();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Filter customers yang sudah deal
  const dealCustomers = customers.filter(c => c.status === 'Deal');

  // Apply filters
  const filteredCustomers = dealCustomers.filter(customer => {
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'not_started' && (!customer.work_status || customer.work_status === 'not_started')) ||
      (statusFilter === 'in_progress' && customer.work_status === 'in_progress') ||
      (statusFilter === 'completed' && customer.work_status === 'completed');
    
    const branchMatch = branchFilter === 'all' || customer.branch_id === branchFilter;
    
    return statusMatch && branchMatch;
  });

  // Statistics
  const stats = {
    total: dealCustomers.length,
    notStarted: dealCustomers.filter(c => !c.work_status || c.work_status === 'not_started').length,
    inProgress: dealCustomers.filter(c => c.work_status === 'in_progress').length,
    completed: dealCustomers.filter(c => c.work_status === 'completed').length,
  };

  const handleStartWork = async (customerId: string) => {
    try {
      await updateCustomer(customerId, {
        work_status: 'in_progress',
        work_start_date: new Date().toISOString()
      });
      toast({
        title: "Berhasil",
        description: "Pekerjaan telah dimulai",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memulai pekerjaan",
        variant: "destructive"
      });
    }
  };

  const handleCompleteWork = async (customerId: string) => {
    try {
      await updateCustomer(customerId, {
        work_status: 'completed',
        work_completed_date: new Date().toISOString()
      });
      toast({
        title: "Berhasil",
        description: "Pekerjaan telah diselesaikan",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyelesaikan pekerjaan",
        variant: "destructive"
      });
    }
  };

  const handleReopenWork = async (customerId: string) => {
    try {
      await updateCustomer(customerId, {
        work_status: 'in_progress',
        work_completed_date: null
      });
      toast({
        title: "Berhasil",
        description: "Pekerjaan telah dibuka kembali",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuka kembali pekerjaan",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-orange-100 text-orange-800">Sedang Dikerjakan</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
      default:
        return <Badge variant="outline">Belum Mulai</Badge>;
    }
  };

  const getStatusActions = (customer: any) => {
    const currentStatus = customer.work_status;
    
    if (!currentStatus || currentStatus === 'not_started') {
      return (
        <>
          <Button
            size="sm"
            onClick={() => handleStartWork(customer.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Clock className="h-4 w-4 mr-1" />
            Mulai
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCustomer(customer);
              setAssignmentDialogOpen(true);
            }}
          >
            <Users className="h-4 w-4 mr-1" />
            Assign
          </Button>
        </>
      );
    } else if (currentStatus === 'in_progress') {
      return (
        <>
          <Button
            size="sm"
            onClick={() => handleCompleteWork(customer.id)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Selesai
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCustomer(customer);
              setAssignmentDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </>
      );
    } else if (currentStatus === 'completed') {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleReopenWork(customer.id)}
          className="text-orange-600 hover:text-orange-700"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          Buka Ulang
        </Button>
      );
    }
  };

  const handleSaveAssignment = async (assignmentData: any) => {
    try {
      await updateCustomer(selectedCustomer.id, assignmentData);
      toast({
        title: "Berhasil",
        description: "Assignment berhasil disimpan",
      });
      setAssignmentDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan assignment",
        variant: "destructive"
      });
    }
  };

  const getWorkDuration = (customer: any) => {
    if (!customer.work_start_date) return '-';
    
    const startDate = new Date(customer.work_start_date);
    const endDate = customer.work_completed_date ? new Date(customer.work_completed_date) : new Date();
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} hari`;
  };

  const getAssignedEmployees = (customer: any) => {
    if (!customer.assigned_employees) return '-';
    
    try {
      const employees = JSON.parse(customer.assigned_employees);
      return employees.join(', ');
    } catch {
      return customer.assigned_employees;
    }
  };

  const handleAssignmentSubmit = (data: { employeeIds: string[]; workNotes: string; estimatedDays: string }) => {
    const assignmentData = {
      assigned_employees: data.employeeIds,
      work_notes: data.workNotes,
      estimated_days: data.estimatedDays ? parseInt(data.estimatedDays) : null
    };
    handleSaveAssignment(assignmentData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Proses Pekerjaan</h1>
        <p className="text-gray-600 mt-1">Kelola dan pantau progress pekerjaan untuk setiap deal</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deal</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Mulai</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.notStarted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Dikerjakan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status Pekerjaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="not_started">Belum Mulai</SelectItem>
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
                setStatusFilter('all');
                setBranchFilter('all');
              }}
            >
              Reset Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Process Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pekerjaan ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Deal</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead>Karyawan</TableHead>
                <TableHead>Estimasi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const branch = branches.find(b => b.id === customer.branch_id);
                const salesPerson = sales.find(s => s.id === customer.sales_id);
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{branch?.code || '-'}</TableCell>
                    <TableCell>{salesPerson?.name || '-'}</TableCell>
                    <TableCell>{getStatusBadge(customer.work_status)}</TableCell>
                    <TableCell>
                      {customer.deal_date ? new Date(customer.deal_date).toLocaleDateString('id-ID') : '-'}
                    </TableCell>
                    <TableCell>{getWorkDuration(customer)}</TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate" title={getAssignedEmployees(customer)}>
                        {getAssignedEmployees(customer)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.estimated_days ? `${customer.estimated_days} hari` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {getStatusActions(customer)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada pekerjaan yang sesuai dengan filter
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Assignment Dialog */}
      {selectedCustomer && (
        <WorkAssignmentDialog
          customerName={selectedCustomer.name}
          isOpen={assignmentDialogOpen}
          onClose={() => {
            setAssignmentDialogOpen(false);
            setSelectedCustomer(null);
          }}
          onAssign={handleAssignmentSubmit}
        />
      )}
    </div>
  );
};

export default WorkProcess;
