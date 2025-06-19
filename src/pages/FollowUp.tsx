
import React, { useState } from 'react';
import { MessageSquare, Calendar, Thermometer, TrendingUp, Target } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useToast } from '@/hooks/use-toast';
import FilterSection from '@/components/FollowUp/FilterSection';
import CustomerSection from '@/components/FollowUp/CustomerSection';

const FollowUp = () => {
  const { customers, updateCustomer, getCustomersByStatus } = useCustomers();
  const { branches } = useBranches();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  
  // Filter states
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const prospekCustomers = getCustomersByStatus('Prospek');
  const followUpCustomers = getCustomersByStatus('Follow-up');
  const coldCustomers = getCustomersByStatus('Cold');
  const warmCustomers = getCustomersByStatus('Warm');
  const hotCustomers = getCustomersByStatus('Hot');

  // Filter function
  const filterCustomers = (customerList: any[]) => {
    return customerList.filter(customer => {
      // Filter by branch
      if (selectedBranch && selectedBranch !== 'all' && customer.branch_id !== selectedBranch) {
        return false;
      }

      // Filter by status
      if (selectedStatus && selectedStatus !== 'all' && customer.status !== selectedStatus) {
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
          end.setHours(23, 59, 59, 999);
          if (customerDate > end) return false;
        }
      }

      return true;
    });
  };

  // Apply filters to all customer lists
  const allCustomers = [...prospekCustomers, ...followUpCustomers, ...coldCustomers, ...warmCustomers, ...hotCustomers];
  const filteredAllCustomers = filterCustomers(allCustomers);

  // Get filtered customers by status from the filtered list
  const filteredProspekCustomers = selectedStatus === 'all' || selectedStatus === 'Prospek' 
    ? filterCustomers(prospekCustomers) 
    : [];
  const filteredFollowUpCustomers = selectedStatus === 'all' || selectedStatus === 'Follow-up' 
    ? filterCustomers(followUpCustomers) 
    : [];
  const filteredColdCustomers = selectedStatus === 'all' || selectedStatus === 'Cold' 
    ? filterCustomers(coldCustomers) 
    : [];
  const filteredWarmCustomers = selectedStatus === 'all' || selectedStatus === 'Warm' 
    ? filterCustomers(warmCustomers) 
    : [];
  const filteredHotCustomers = selectedStatus === 'all' || selectedStatus === 'Hot' 
    ? filterCustomers(hotCustomers) 
    : [];

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${whatsappPhone}`, '_blank');
  };

  const handleStatusUpdate = (customerId: string, newStatus: 'Cold' | 'Warm' | 'Hot' | 'Deal' | 'Tidak Jadi', dealDate?: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'Deal' && dealDate) {
      updates.deal_date = dealDate;
    }
    
    updateCustomer({ id: customerId, ...updates });
    toast({
      title: "Berhasil",
      description: `Status pelanggan berhasil diubah menjadi ${newStatus}`,
    });
  };

  const handleMoveToStatus = (customerId: string, status: 'Follow-up' | 'Cold' | 'Warm' | 'Hot') => {
    updateCustomer({ id: customerId, status: status });
    toast({
      title: "Berhasil",
      description: `Pelanggan berhasil dipindahkan ke ${status}`,
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

    toast({
      title: "Berhasil",
      description: "Catatan follow-up berhasil ditambahkan",
    });
    setNotes('');
    setFollowUpDate('');
    setSelectedCustomer(null);
  };

  const clearFilters = () => {
    setSelectedBranch('all');
    setSelectedStatus('all');
    setStartDate('');
    setEndDate('');
  };

  // Generate filter message based on active filters
  const getFilterMessage = () => {
    const filters = [];
    if (selectedBranch !== 'all') filters.push('cabang');
    if (selectedStatus !== 'all') filters.push('status');
    if (startDate || endDate) filters.push('tanggal');
    
    return filters.length > 0 
      ? `sesuai filter ${filters.join(', ')}` 
      : '';
  };

  const filterMessage = getFilterMessage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Follow-Up Pelanggan</h1>
        <p className="text-gray-600 mt-1">Kelola prospek dan jadwal follow-up berdasarkan status</p>
      </div>

      <FilterSection
        branches={branches}
        selectedBranch={selectedBranch}
        selectedStatus={selectedStatus}
        startDate={startDate}
        endDate={endDate}
        onBranchChange={setSelectedBranch}
        onStatusChange={setSelectedStatus}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearFilters={clearFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <CustomerSection
          title="Prospek Baru"
          icon={<MessageSquare className="h-5 w-5 mr-2 text-yellow-600" />}
          customers={filteredProspekCustomers}
          type="prospect"
          emptyMessage={
            filterMessage 
              ? `Tidak ada prospek baru ${filterMessage}` 
              : "Tidak ada prospek baru"
          }
          onWhatsApp={handleWhatsApp}
          onMoveToFollowUp={(customerId) => handleMoveToStatus(customerId, 'Follow-up')}
          onMoveToStatus={handleMoveToStatus}
        />

        <CustomerSection
          title="Follow-up Aktif"
          icon={<Calendar className="h-5 w-5 mr-2 text-blue-600" />}
          customers={filteredFollowUpCustomers}
          type="followup"
          emptyMessage={
            filterMessage 
              ? `Tidak ada follow-up aktif ${filterMessage}` 
              : "Tidak ada follow-up aktif"
          }
          selectedCustomer={selectedCustomer}
          notes={notes}
          followUpDate={followUpDate}
          onWhatsApp={handleWhatsApp}
          onStatusUpdate={handleStatusUpdate}
          onSelectCustomer={setSelectedCustomer}
          onNotesChange={setNotes}
          onFollowUpDateChange={setFollowUpDate}
          onAddNote={addFollowUpNote}
          onMoveToStatus={handleMoveToStatus}
        />

        <CustomerSection
          title="Cold Leads"
          icon={<Thermometer className="h-5 w-5 mr-2 text-gray-600" />}
          customers={filteredColdCustomers}
          type="status"
          emptyMessage={
            filterMessage 
              ? `Tidak ada cold leads ${filterMessage}` 
              : "Tidak ada cold leads"
          }
          selectedCustomer={selectedCustomer}
          notes={notes}
          followUpDate={followUpDate}
          onWhatsApp={handleWhatsApp}
          onStatusUpdate={handleStatusUpdate}
          onSelectCustomer={setSelectedCustomer}
          onNotesChange={setNotes}
          onFollowUpDateChange={setFollowUpDate}
          onAddNote={addFollowUpNote}
          onMoveToStatus={handleMoveToStatus}
        />

        <CustomerSection
          title="Warm Leads"
          icon={<TrendingUp className="h-5 w-5 mr-2 text-orange-600" />}
          customers={filteredWarmCustomers}
          type="status"
          emptyMessage={
            filterMessage 
              ? `Tidak ada warm leads ${filterMessage}` 
              : "Tidak ada warm leads"
          }
          selectedCustomer={selectedCustomer}
          notes={notes}
          followUpDate={followUpDate}
          onWhatsApp={handleWhatsApp}
          onStatusUpdate={handleStatusUpdate}
          onSelectCustomer={setSelectedCustomer}
          onNotesChange={setNotes}
          onFollowUpDateChange={setFollowUpDate}
          onAddNote={addFollowUpNote}
          onMoveToStatus={handleMoveToStatus}
        />

        <CustomerSection
          title="Hot Leads"
          icon={<Target className="h-5 w-5 mr-2 text-red-600" />}
          customers={filteredHotCustomers}
          type="status"
          emptyMessage={
            filterMessage 
              ? `Tidak ada hot leads ${filterMessage}` 
              : "Tidak ada hot leads"
          }
          selectedCustomer={selectedCustomer}
          notes={notes}
          followUpDate={followUpDate}
          onWhatsApp={handleWhatsApp}
          onStatusUpdate={handleStatusUpdate}
          onSelectCustomer={setSelectedCustomer}
          onNotesChange={setNotes}
          onFollowUpDateChange={setFollowUpDate}
          onAddNote={addFollowUpNote}
          onMoveToStatus={handleMoveToStatus}
        />
      </div>
    </div>
  );
};

export default FollowUp;
