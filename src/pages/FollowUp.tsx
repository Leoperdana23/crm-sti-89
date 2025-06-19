
import React, { useState } from 'react';
import { MessageSquare, Calendar, Thermometer, TrendingUp, Target } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useToast } from '@/hooks/use-toast';
import FilterSection from '@/components/FollowUp/FilterSection';
import FollowUpTable from '@/components/FollowUp/FollowUpTable';

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

  // Get all customers for different statuses
  const prospekCustomers = getCustomersByStatus('Prospek');
  const followUpCustomers = getCustomersByStatus('Follow-up');
  const coldCustomers = getCustomersByStatus('Cold');
  const warmCustomers = getCustomersByStatus('Warm');
  const hotCustomers = getCustomersByStatus('Hot');

  // Apply filters to all customer lists
  const allCustomers = [...prospekCustomers, ...followUpCustomers, ...coldCustomers, ...warmCustomers, ...hotCustomers];
  const filteredCustomers = filterCustomers(allCustomers);

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

      <FollowUpTable
        customers={filteredCustomers}
        branches={branches}
        selectedCustomer={selectedCustomer}
        notes={notes}
        followUpDate={followUpDate}
        onWhatsApp={handleWhatsApp}
        onStatusUpdate={handleStatusUpdate}
        onMoveToStatus={handleMoveToStatus}
        onSelectCustomer={setSelectedCustomer}
        onNotesChange={setNotes}
        onFollowUpDateChange={setFollowUpDate}
        onAddNote={addFollowUpNote}
        filterMessage={filterMessage}
      />
    </div>
  );
};

export default FollowUp;
