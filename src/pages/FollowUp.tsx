
import React, { useState } from 'react';
import { MessageSquare, Calendar } from 'lucide-react';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const prospekCustomers = getCustomersByStatus('Prospek');
  const followUpCustomers = getCustomersByStatus('Follow-up');

  // Filter function
  const filterCustomers = (customerList: any[]) => {
    return customerList.filter(customer => {
      // Filter by branch
      if (selectedBranch && selectedBranch !== 'all' && customer.branch_id !== selectedBranch) {
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
    
    updateCustomer({ id: customerId, ...updates });
    toast({
      title: "Berhasil",
      description: `Status pelanggan berhasil diubah menjadi ${newStatus}`,
    });
  };

  const handleMoveToFollowUp = (customerId: string) => {
    updateCustomer({ id: customerId, status: 'Follow-up' });
    toast({
      title: "Berhasil",
      description: "Prospek dipindahkan ke follow-up",
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
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Follow-Up Pelanggan</h1>
        <p className="text-gray-600 mt-1">Kelola prospek dan jadwal follow-up</p>
      </div>

      <FilterSection
        branches={branches}
        selectedBranch={selectedBranch}
        startDate={startDate}
        endDate={endDate}
        onBranchChange={setSelectedBranch}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearFilters={clearFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CustomerSection
          title="Prospek Baru"
          icon={<MessageSquare className="h-5 w-5 mr-2 text-yellow-600" />}
          customers={filteredProspekCustomers}
          type="prospect"
          emptyMessage={
            selectedBranch !== 'all' || startDate || endDate 
              ? "Tidak ada prospek baru sesuai filter" 
              : "Tidak ada prospek baru"
          }
          onWhatsApp={handleWhatsApp}
          onMoveToFollowUp={handleMoveToFollowUp}
        />

        <CustomerSection
          title="Follow-up Aktif"
          icon={<Calendar className="h-5 w-5 mr-2 text-blue-600" />}
          customers={filteredFollowUpCustomers}
          type="followup"
          emptyMessage={
            selectedBranch !== 'all' || startDate || endDate 
              ? "Tidak ada follow-up aktif sesuai filter" 
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
        />
      </div>
    </div>
  );
};

export default FollowUp;
