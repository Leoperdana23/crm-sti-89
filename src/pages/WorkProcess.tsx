
import React, { useState } from 'react';
import { Plus, Search, Filter, Clock, PlayCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import WorkAssignmentDialog from '@/components/WorkAssignmentDialog';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { Customer } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';

const WorkProcess = () => {
  const { customers, loading, updateCustomer } = useCustomers();
  const { branches } = useBranches();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  // Filter customers who have Deal status
  const dealCustomers = customers.filter(customer => customer.status === 'Deal');
  
  const filteredCustomers = dealCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    
    let matchesStatus = true;
    if (statusFilter === 'not_started') {
      matchesStatus = !customer.work_status || customer.work_status === 'not_started';
    } else if (statusFilter === 'in_progress') {
      matchesStatus = customer.work_status === 'in_progress';
    } else if (statusFilter === 'completed') {
      matchesStatus = customer.work_status === 'completed';
    }

    let matchesBranch = true;
    if (branchFilter !== 'all') {
      matchesBranch = customer.branch_id === branchFilter;
    }
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const getWorkStatusBadge = (status?: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800"><PlayCircle className="h-3 w-3 mr-1" />Sedang Dikerjakan</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Selesai</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Belum Dimulai</Badge>;
    }
  };

  const handleStartWork = async (customer: Customer) => {
    try {
      await updateCustomer(customer.id, {
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
        description: "Terjadi kesalahan saat memulai pekerjaan.",
        variant: "destructive"
      });
    }
  };

  const handleCompleteWork = async (customer: Customer) => {
    try {
      await updateCustomer(customer.id, {
        work_status: 'completed',
        work_completed_date: new Date().toISOString()
      });
      toast({
        title: "Berhasil",
        description: "Pekerjaan telah selesai",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyelesaikan pekerjaan.",
        variant: "destructive"
      });
    }
  };

  const handleAssignWork = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsAssignmentOpen(true);
  };

  const handleAssignmentSave = async (assignmentData: any) => {
    if (!selectedCustomer) return;
    
    try {
      const employeesList = Array.isArray(assignmentData.assigned_employees) 
        ? assignmentData.assigned_employees 
        : [];
      
      await updateCustomer(selectedCustomer.id, {
        assigned_employees: employeesList,
        estimated_days: assignmentData.estimated_days,
        work_notes: assignmentData.work_notes
      });
      
      toast({
        title: "Berhasil",
        description: "Pekerjaan berhasil ditugaskan",
      });
      setIsAssignmentOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menugaskan pekerjaan.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span>Memuat data proses kerja...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proses Kerja</h1>
          <p className="text-gray-600 mt-1">Kelola proses pekerjaan untuk pelanggan yang sudah deal</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari nama atau nomor HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="not_started">Belum Dimulai</SelectItem>
              <SelectItem value="in_progress">Sedang Dikerjakan</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter Cabang" />
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
        </div>
      </div>

      {/* Work Process Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pekerjaan ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>No. HP</TableHead>
                <TableHead>Cabang</TableHead>
                <TableHead>Status Pekerjaan</TableHead>
                <TableHead>Estimasi Hari</TableHead>
                <TableHead>Pekerja Ditugaskan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const branch = branches.find(b => b.id === customer.branch_id);
                const assignedCount = customer.assigned_employees ? customer.assigned_employees.length : 0;
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{branch?.name || '-'}</TableCell>
                    <TableCell>
                      {getWorkStatusBadge(customer.work_status)}
                    </TableCell>
                    <TableCell>
                      {customer.estimated_days ? `${customer.estimated_days} hari` : '-'}
                    </TableCell>
                    <TableCell>
                      {assignedCount > 0 ? `${assignedCount} orang` : 'Belum ditugaskan'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {(!customer.work_status || customer.work_status === 'not_started') && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAssignWork(customer)}
                              className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Tugaskan
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStartWork(customer)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Mulai
                            </Button>
                          </>
                        )}
                        {customer.work_status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteWork(customer)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Selesai
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pekerjaan</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || branchFilter !== 'all'
                  ? 'Tidak ada pekerjaan yang sesuai dengan filter' 
                  : 'Belum ada pelanggan dengan status Deal yang perlu dikerjakan'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Assignment Dialog */}
      <WorkAssignmentDialog
        customer={selectedCustomer}
        isOpen={isAssignmentOpen}
        onClose={() => {
          setIsAssignmentOpen(false);
          setSelectedCustomer(null);
        }}
        onSave={handleAssignmentSave}
      />
    </div>
  );
};

export default WorkProcess;
