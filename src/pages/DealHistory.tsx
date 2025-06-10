import React, { useState, useMemo } from 'react';
import { Calendar, MessageCircle, Users, Filter, Phone, MapPin, Clock, Building } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';
import { format, subMonths, isAfter, isBefore, differenceInMonths } from 'date-fns';
import { id } from 'date-fns/locale';

const DealHistory = () => {
  const { customers } = useCustomers();
  const { branches } = useBranches();
  const { sales } = useSales();
  const [branchFilter, setBranchFilter] = useState('all');

  // Kategorisasi pelanggan berdasarkan periode deal date
  const categorizedDeals = useMemo(() => {
    const now = new Date();
    const oneMonthAgo = subMonths(now, 1);
    const threeMonthsAgo = subMonths(now, 3);
    const twelveMonthsAgo = subMonths(now, 12);
    
    const dealsData = customers
      .filter(customer => customer.status === 'Deal' && customer.deal_date)
      .filter(customer => {
        const matchesBranch = branchFilter === 'all' || customer.branch_id === branchFilter;
        return matchesBranch;
      });

    return {
      // Deal dalam 1 bulan terakhir (deal_date >= 1 bulan yang lalu)
      oneMonth: dealsData.filter(customer => {
        const dealDate = new Date(customer.deal_date!);
        return isAfter(dealDate, oneMonthAgo);
      }),
      
      // Deal dalam 1-3 bulan (deal_date antara 1-3 bulan yang lalu)
      threeMonths: dealsData.filter(customer => {
        const dealDate = new Date(customer.deal_date!);
        return isBefore(dealDate, oneMonthAgo) && isAfter(dealDate, threeMonthsAgo);
      }),
      
      // Deal dalam 3-12 bulan (deal_date antara 3-12 bulan yang lalu)
      twelveMonths: dealsData.filter(customer => {
        const dealDate = new Date(customer.deal_date!);
        return isBefore(dealDate, threeMonthsAgo) && isAfter(dealDate, twelveMonthsAgo);
      })
    };
  }, [customers, branchFilter]);

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

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">History Deal Pelanggan</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Data pelanggan yang sudah deal berdasarkan periode tanggal deal
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
          <div className="w-full md:w-1/2">
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
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deal 1 Bulan Terakhir</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorizedDeals.oneMonth.length}</div>
            <p className="text-xs text-muted-foreground">Pelanggan yang deal dalam 1 bulan terakhir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deal 1-3 Bulan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorizedDeals.threeMonths.length}</div>
            <p className="text-xs text-muted-foreground">Pelanggan yang deal 1-3 bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deal 3-12 Bulan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorizedDeals.twelveMonths.length}</div>
            <p className="text-xs text-muted-foreground">Pelanggan yang deal 3-12 bulan lalu</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 1: Pelanggan Deal 1 Bulan Terakhir */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pelanggan Deal 1 Bulan Terakhir</CardTitle>
          <p className="text-sm text-gray-600">Deal dari {format(subMonths(new Date(), 1), 'dd MMM yyyy', { locale: id })} sampai sekarang</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Deal Date</TableHead>
                  <TableHead>Status Kerja</TableHead>
                  <TableHead>Cabang</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorizedDeals.oneMonth.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="max-w-xs truncate">{customer.address}</TableCell>
                    <TableCell>
                      {customer.deal_date ? format(new Date(customer.deal_date), 'dd MMM yyyy', { locale: id }) : '-'}
                    </TableCell>
                    <TableCell>{getWorkStatusBadge(customer.work_status || 'not_started')}</TableCell>
                    <TableCell>{getBranchName(customer.branch_id || '')}</TableCell>
                    <TableCell>{getSalesName(customer.sales_id || '')}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleWhatsApp(customer.phone, customer.name, customer.deal_date || '')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WA
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {categorizedDeals.oneMonth.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada pelanggan deal dalam 1 bulan terakhir</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Pelanggan Deal 1-3 Bulan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pelanggan Deal 1-3 Bulan</CardTitle>
          <p className="text-sm text-gray-600">Deal dari {format(subMonths(new Date(), 3), 'dd MMM yyyy', { locale: id })} sampai {format(subMonths(new Date(), 1), 'dd MMM yyyy', { locale: id })}</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Deal Date</TableHead>
                  <TableHead>Mulai Kerja</TableHead>
                  <TableHead>Status Kerja</TableHead>
                  <TableHead>Estimasi Hari</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorizedDeals.threeMonths.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      {customer.deal_date ? format(new Date(customer.deal_date), 'dd MMM yyyy', { locale: id }) : '-'}
                    </TableCell>
                    <TableCell>
                      {customer.work_start_date ? format(new Date(customer.work_start_date), 'dd MMM yyyy', { locale: id }) : '-'}
                    </TableCell>
                    <TableCell>{getWorkStatusBadge(customer.work_status || 'not_started')}</TableCell>
                    <TableCell>{customer.estimated_days || '-'} hari</TableCell>
                    <TableCell>{getSalesName(customer.sales_id || '')}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleWhatsApp(customer.phone, customer.name, customer.deal_date || '')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WA
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {categorizedDeals.threeMonths.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada pelanggan deal dalam periode 1-3 bulan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Pelanggan Deal 3-12 Bulan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pelanggan Deal 3-12 Bulan</CardTitle>
          <p className="text-sm text-gray-600">Deal dari {format(subMonths(new Date(), 12), 'dd MMM yyyy', { locale: id })} sampai {format(subMonths(new Date(), 3), 'dd MMM yyyy', { locale: id })}</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Deal Date</TableHead>
                  <TableHead>Selesai Kerja</TableHead>
                  <TableHead>Status Survei</TableHead>
                  <TableHead>Kebutuhan</TableHead>
                  <TableHead>Notes Kerja</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorizedDeals.twelveMonths.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      {customer.deal_date ? format(new Date(customer.deal_date), 'dd MMM yyyy', { locale: id }) : '-'}
                    </TableCell>
                    <TableCell>
                      {customer.work_completed_date ? format(new Date(customer.work_completed_date), 'dd MMM yyyy', { locale: id }) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.survey_status === 'sudah_disurvei' ? 'default' : 'secondary'}>
                        {customer.survey_status === 'sudah_disurvei' ? 'Sudah' : 'Belum'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{customer.needs || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{customer.work_notes || '-'}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleWhatsApp(customer.phone, customer.name, customer.deal_date || '')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WA
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {categorizedDeals.twelveMonths.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada pelanggan deal dalam periode 3-12 bulan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealHistory;
