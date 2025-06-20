
import React, { useState } from 'react';
import { MessageSquare, Calendar, Thermometer, TrendingUp, Target, CheckCircle, XCircle } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  // Get customers by status and apply filters
  const prospekCustomers = filterCustomers(getCustomersByStatus('Prospek'));
  const coldCustomers = filterCustomers(getCustomersByStatus('Cold'));
  const warmCustomers = filterCustomers(getCustomersByStatus('Warm'));
  const hotCustomers = filterCustomers(getCustomersByStatus('Hot'));
  const dealCustomers = filterCustomers(getCustomersByStatus('Deal'));
  const tidakJadiCustomers = filterCustomers(getCustomersByStatus('Tidak Jadi'));

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
    setStartDate('');
    setEndDate('');
  };

  // Generate filter message based on active filters
  const getFilterMessage = () => {
    const filters = [];
    if (selectedBranch !== 'all') filters.push('cabang');
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
        selectedStatus="all"
        startDate={startDate}
        endDate={endDate}
        onBranchChange={setSelectedBranch}
        onStatusChange={() => {}}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearFilters={clearFilters}
      />

      <Tabs defaultValue="prospek" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="prospek" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Prospek ({prospekCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="cold" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Cold ({coldCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="warm" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Warm ({warmCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="hot" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Hot ({hotCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="deal" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Deal ({dealCustomers.length})
          </TabsTrigger>
          <TabsTrigger value="tidak-jadi" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Tidak Jadi ({tidakJadiCustomers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prospek">
          <FollowUpTable
            customers={prospekCustomers}
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
        </TabsContent>

        <TabsContent value="cold">
          <FollowUpTable
            customers={coldCustomers}
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
        </TabsContent>

        <TabsContent value="warm">
          <FollowUpTable
            customers={warmCustomers}
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
        </TabsContent>

        <TabsContent value="hot">
          <FollowUpTable
            customers={hotCustomers}
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
        </TabsContent>

        <TabsContent value="deal">
          <FollowUpTable
            customers={dealCustomers}
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
        </TabsContent>

        <TabsContent value="tidak-jadi">
          <FollowUpTable
            customers={tidakJadiCustomers}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowUp;
