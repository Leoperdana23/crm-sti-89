
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Phone, Calendar, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useToast } from '@/hooks/use-toast';

const FollowUp = () => {
  const { customers, updateCustomer, getCustomersByStatus } = useCustomers();
  const { branches } = useBranches();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  
  // Filter states
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const prospekCustomers = getCustomersByStatus('Prospek');
  const followUpCustomers = getCustomersByStatus('Follow-up');

  // Filter function
  const filterCustomers = (customerList: any[]) => {
    return customerList.filter(customer => {
      // Filter by branch
      if (selectedBranch && customer.branch_id !== selectedBranch) {
        return false;
      }

      // Filter by date range
      if (startDate || endDate) {
        const customerDate = new Date(customer.created_at);
        
        if (startDate) {
          const start = new Date(startDate);
          if (customerDate < start) return false;
        }
        
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Include the entire end date
          if (customerDate > end) return false;
        }
      }

      return true;
    });
  };

  const filteredProspekCustomers = filterCustomers(prospekCustomers);
  const filteredFollowUpCustomers = filterCustomers(followUpCustomers);

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${whatsappPhone}`, '_blank');
  };

  const handleStatusUpdate = (customerId: string, newStatus: 'Deal' | 'Tidak Jadi', dealDate?: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'Deal' && dealDate) {
      updates.deal_date = dealDate;
    }
    
    updateCustomer(customerId, updates);
    toast({
      title: "Berhasil",
      description: `Status pelanggan berhasil diubah menjadi ${newStatus}`,
    });
  };

  const addFollowUpNote = (customerId: string) => {
    if (!notes.trim()) {
      toast({
        title: "Error",
        description: "Catatan follow-up tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would add to interactions array
    toast({
      title: "Berhasil",
      description: "Catatan follow-up berhasil ditambahkan",
    });
    setNotes('');
    setFollowUpDate('');
    setSelectedCustomer(null);
  };

  const clearFilters = () => {
    setSelectedBranch('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Follow-Up Pelanggan</h1>
        <p className="text-gray-600 mt-1">Kelola prospek dan jadwal follow-up</p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cabang</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Cabang</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tanggal Akhir</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium invisible">Action</label>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full"
              >
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prospek Baru */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-yellow-600" />
              Prospek Baru ({filteredProspekCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredProspekCustomers.map((customer) => (
              <div key={customer.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-sm text-gray-600">{customer.needs}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(customer.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {customer.status}
                  </Badge>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWhatsApp(customer.phone)}
                    className="text-green-600 hover:bg-green-50"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateCustomer(customer.id, { status: 'Follow-up' })}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    Follow-up
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredProspekCustomers.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                {selectedBranch || startDate || endDate 
                  ? "Tidak ada prospek baru sesuai filter" 
                  : "Tidak ada prospek baru"
                }
              </p>
            )}
          </CardContent>
        </Card>

        {/* Follow-up Aktif */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Follow-up Aktif ({filteredFollowUpCustomers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredFollowUpCustomers.map((customer) => (
              <div key={customer.id} className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                    <p className="text-sm text-gray-600">{customer.needs}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(customer.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {customer.status}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWhatsApp(customer.phone)}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WA
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(customer.id, 'Deal', new Date().toISOString().split('T')[0])}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Deal
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(customer.id, 'Tidak Jadi')}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Tidak Jadi
                    </Button>
                  </div>
                  
                  {selectedCustomer === customer.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Catatan follow-up..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex space-x-2">
                        <Input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => addFollowUpNote(customer.id)}
                        >
                          Simpan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCustomer(null)}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedCustomer(customer.id)}
                      className="text-blue-600"
                    >
                      + Tambah Catatan
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {filteredFollowUpCustomers.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                {selectedBranch || startDate || endDate 
                  ? "Tidak ada follow-up aktif sesuai filter" 
                  : "Tidak ada follow-up aktif"
                }
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FollowUp;
