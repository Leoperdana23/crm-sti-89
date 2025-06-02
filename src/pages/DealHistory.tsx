
import React, { useState, useMemo } from 'react';
import { Calendar, MessageCircle, Users, Filter, Phone, MapPin, Clock, Building } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';
import { format, subMonths, subDays, isAfter, isBefore } from 'date-fns';
import { id } from 'date-fns/locale';

const DealHistory = () => {
  const { customers } = useCustomers();
  const { branches } = useBranches();
  const { sales } = useSales();
  const [periodFilter, setPeriodFilter] = useState('1month');
  const [branchFilter, setBranchFilter] = useState('all');

  // Filter pelanggan yang sudah deal berdasarkan periode
  const filteredDeals = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (periodFilter) {
      case '1month':
        startDate = subMonths(now, 1);
        break;
      case '3months':
        startDate = subMonths(now, 3);
        break;
      case '1year':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 1);
    }

    return customers.filter(customer => {
      if (customer.status !== 'Deal' || !customer.deal_date) return false;
      
      const dealDate = new Date(customer.deal_date);
      const isInPeriod = isAfter(dealDate, startDate) && isBefore(dealDate, now);
      const matchesBranch = branchFilter === 'all' || customer.branch_id === branchFilter;
      
      return isInPeriod && matchesBranch;
    });
  }, [customers, periodFilter, branchFilter]);

  // Statistik
  const stats = useMemo(() => {
    return {
      total: filteredDeals.length,
      completed: filteredDeals.filter(c => c.work_status === 'completed').length,
      inProgress: filteredDeals.filter(c => c.work_status === 'in_progress').length,
      notStarted: filteredDeals.filter(c => c.work_status === 'not_started' || !c.work_status).length,
    };
  }, [filteredDeals]);

  const handleWhatsApp = (phone: string, customerName: string, dealDate: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    
    const message = `Halo ${customerName}, terima kasih telah memilih layanan kami pada ${format(new Date(dealDate), 'dd MMMM yyyy', { locale: id })}. Bagaimana kabar projectnya? Apakah ada yang bisa kami bantu?`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappPhone}?text=${encodedMessage}`, '_blank');
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Unknown';
  };

  const getSalesName = (salesId: string) => {
    const salesPerson = sales.find(s => s.id === salesId);
    return salesPerson ? salesPerson.name : 'Unknown';
  };

  const getWorkStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Selesai</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Progress</Badge>;
      case 'not_started':
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Belum Mulai</Badge>;
    }
  };

  const getPeriodLabel = () => {
    switch (periodFilter) {
      case '1month': return '1 Bulan Terakhir';
      case '3months': return '3 Bulan Terakhir';
      case '1year': return '1 Tahun Terakhir';
      default: return '1 Bulan Terakhir';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">History Deal Pelanggan</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Data pelanggan yang sudah deal dan follow up WhatsApp
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
            <Filter className="h-4 w-4 md:h-5 md:w-5" />
            <span>Filter Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Periode Waktu</label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Bulan Terakhir</SelectItem>
                  <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cabang</label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang" />
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
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Deal</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-600">{getPeriodLabel()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Selesai</CardTitle>
            <div className="h-3 w-3 md:h-4 md:w-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Progress</CardTitle>
            <div className="h-3 w-3 md:h-4 md:w-4 bg-orange-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-orange-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Belum Mulai</CardTitle>
            <div className="h-3 w-3 md:h-4 md:w-4 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold text-blue-600">{stats.notStarted}</div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredDeals.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-base md:text-lg font-semibold text-gray-900">
                    {customer.name}
                  </CardTitle>
                  <div className="flex items-center space-x-1 mt-1">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                    <span className="text-xs md:text-sm text-gray-600">
                      Deal: {customer.deal_date ? format(new Date(customer.deal_date), 'dd MMM yyyy', { locale: id }) : '-'}
                    </span>
                  </div>
                </div>
                {getWorkStatusBadge(customer.work_status || 'not_started')}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs md:text-sm text-gray-700">{customer.phone}</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs md:text-sm text-gray-700 line-clamp-2">{customer.address}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Building className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs md:text-sm text-gray-700">
                    {getBranchName(customer.branch_id || '')} - {getSalesName(customer.sales_id || '')}
                  </span>
                </div>

                {customer.work_start_date && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs md:text-sm text-gray-700">
                      Mulai: {format(new Date(customer.work_start_date), 'dd MMM yyyy', { locale: id })}
                    </span>
                  </div>
                )}

                {customer.needs && (
                  <div className="text-xs md:text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Kebutuhan:</strong> {customer.needs}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <Button
                  onClick={() => handleWhatsApp(customer.phone, customer.name, customer.deal_date || '')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm"
                  size="sm"
                >
                  <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Follow Up WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 md:py-12">
            <Users className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
              Tidak ada data deal
            </h3>
            <p className="text-sm md:text-base text-gray-600">
              Tidak ada pelanggan yang deal dalam periode {getPeriodLabel().toLowerCase()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DealHistory;
