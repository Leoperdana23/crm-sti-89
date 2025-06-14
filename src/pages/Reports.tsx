
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DateRangeFilter from '@/components/Reports/DateRangeFilter';
import { getDateRange, filterDataByDateRange } from '@/utils/dateFilters';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Award,
  Download,
  Store,
  Gift,
  Target,
  Calendar,
  Phone,
  CheckCircle,
  FileText,
  Building,
  UserCheck,
  Trophy
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import { useOrders } from '@/hooks/useOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { useSurveys } from '@/hooks/useSurveys';
import { useRewards } from '@/hooks/useRewards';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Data hooks
  const { data: resellers } = useResellers();
  const { data: orders } = useOrders();
  const { data: customers } = useCustomers();
  const { data: surveys } = useSurveys();
  const { data: redemptions } = useRewards();
  const { data: branches } = useBranches();
  const { data: sales } = useSales();

  // Get date range for filtering
  const { startDate, endDate } = getDateRange(selectedPeriod, customStartDate, customEndDate);

  // Filter data by date range
  const filteredOrders = filterDataByDateRange(orders || [], 'created_at', startDate, endDate);
  const filteredCustomers = filterDataByDateRange(customers || [], 'created_at', startDate, endDate);
  const filteredSurveys = filterDataByDateRange(surveys || [], 'created_at', startDate, endDate);
  const filteredRedemptions = filterDataByDateRange(redemptions || [], 'created_at', startDate, endDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // SEDEKAT App Analytics
  const activeResellers = resellers?.filter(r => r.is_active).length || 0;
  const totalResellerOrders = filteredOrders.filter(o => o.catalog_token).length;
  
  // Calculate total commission from orders with resellers
  const totalCommission = filteredOrders
    .filter(o => o.catalog_token && (o.status === 'completed' || o.status === 'selesai'))
    .reduce((total, order) => {
      const orderCommission = (order.order_items || []).reduce((sum, item) => {
        return sum + ((item.product_commission_snapshot || 0) * item.quantity);
      }, 0);
      return total + orderCommission;
    }, 0);

  // Calculate total points from orders with resellers
  const totalPoints = filteredOrders
    .filter(o => o.catalog_token && (o.status === 'completed' || o.status === 'selesai'))
    .reduce((total, order) => {
      const orderPoints = (order.order_items || []).reduce((sum, item) => {
        return sum + ((item.product_points_snapshot || 0) * item.quantity);
      }, 0);
      return total + orderPoints;
    }, 0);

  // Get reseller performance data
  const resellerPerformance = resellers?.map(reseller => {
    const resellerOrders = filteredOrders.filter(o => {
      // Find catalog token for this reseller
      return o.catalog_token && o.status === 'completed';
    });
    
    const totalSales = resellerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalCommission = resellerOrders.reduce((total, order) => {
      return total + (order.order_items || []).reduce((sum, item) => {
        return sum + ((item.product_commission_snapshot || 0) * item.quantity);
      }, 0);
    }, 0);
    const totalPoints = resellerOrders.reduce((total, order) => {
      return total + (order.order_items || []).reduce((sum, item) => {
        return sum + ((item.product_points_snapshot || 0) * item.quantity);
      }, 0);
    }, 0);

    return {
      id: reseller.id,
      name: reseller.name,
      phone: reseller.phone,
      branch: reseller.branches?.name || 'Tidak ada cabang',
      orderCount: resellerOrders.length,
      totalSales,
      totalCommission,
      totalPoints,
      isActive: reseller.is_active
    };
  }).sort((a, b) => b.totalSales - a.totalSales) || [];

  // General Analytics
  const totalCustomers = customers?.length || 0;
  const newCustomers = filteredCustomers.length;
  const totalDeals = customers?.filter(c => c.status === 'Deal').length || 0;
  const totalFollowUps = customers?.filter(c => c.status === 'Follow-up').length || 0;
  const conversionRate = totalCustomers > 0 ? ((totalDeals / totalCustomers) * 100) : 0;

  // Branch performance
  const branchPerformance = branches?.map(branch => {
    const branchCustomers = customers?.filter(c => c.branch_id === branch.id) || [];
    const branchDeals = branchCustomers.filter(c => c.status === 'Deal').length;
    const branchSurveys = surveys?.filter(s => {
      const customer = customers?.find(c => c.id === s.customer_id);
      return customer?.branch_id === branch.id;
    }).length || 0;

    return {
      name: branch.name,
      code: branch.code,
      totalCustomers: branchCustomers.length,
      totalDeals: branchDeals,
      conversionRate: branchCustomers.length > 0 ? ((branchDeals / branchCustomers.length) * 100) : 0,
      totalSurveys: branchSurveys
    };
  }) || [];

  // Sales performance
  const salesPerformance = sales?.map(salesPerson => {
    const salesCustomers = customers?.filter(c => c.sales_id === salesPerson.id) || [];
    const salesDeals = salesCustomers.filter(c => c.status === 'Deal').length;

    return {
      name: salesPerson.name,
      code: salesPerson.code,
      branch: salesPerson.branch_id ? branches?.find(b => b.id === salesPerson.branch_id)?.name : 'Tidak ada cabang',
      totalCustomers: salesCustomers.length,
      totalDeals: salesDeals,
      conversionRate: salesCustomers.length > 0 ? ((salesDeals / salesCustomers.length) * 100) : 0
    };
  }).sort((a, b) => b.totalDeals - a.totalDeals) || [];

  // Chart data
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
    
    const monthCustomers = customers?.filter(c => {
      const customerDate = new Date(c.created_at);
      return customerDate.getMonth() === date.getMonth() && 
             customerDate.getFullYear() === date.getFullYear();
    }).length || 0;

    const monthDeals = customers?.filter(c => {
      const dealDate = c.deal_date ? new Date(c.deal_date) : null;
      return dealDate && 
             dealDate.getMonth() === date.getMonth() && 
             dealDate.getFullYear() === date.getFullYear();
    }).length || 0;

    return {
      month: monthName,
      customers: monthCustomers,
      deals: monthDeals
    };
  });

  const customerStatusData = [
    { name: 'Prospek', value: customers?.filter(c => c.status === 'Prospek').length || 0, color: '#fbbf24' },
    { name: 'Follow-up', value: customers?.filter(c => c.status === 'Follow-up').length || 0, color: '#3b82f6' },
    { name: 'Deal', value: customers?.filter(c => c.status === 'Deal').length || 0, color: '#10b981' },
    { name: 'Tidak Jadi', value: customers?.filter(c => c.status === 'Tidak Jadi').length || 0, color: '#ef4444' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan & Analitik</h1>
        <p className="text-gray-600">Dashboard analitik dan laporan bisnis</p>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartDateChange={setCustomStartDate}
        onCustomEndDateChange={setCustomEndDate}
      />

      <Tabs defaultValue="sedekat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sedekat" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Laporan SEDEKAT
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Laporan Umum
          </TabsTrigger>
        </TabsList>

        {/* SEDEKAT App Reports */}
        <TabsContent value="sedekat" className="space-y-6">
          {/* SEDEKAT Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Reseller</p>
                    <p className="text-2xl font-bold">{resellers?.length || 0}</p>
                    <p className="text-xs text-green-600">{activeResellers} aktif</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Order via App</p>
                    <p className="text-2xl font-bold">{totalResellerOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Komisi</p>
                    <p className="text-xl font-bold">{formatCurrency(totalCommission)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Award className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Poin</p>
                    <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SEDEKAT Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Reseller (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resellerPerformance.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="totalSales" fill="#3b82f6" name="Total Omset" />
                    <Bar dataKey="totalCommission" fill="#10b981" name="Total Komisi" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Poin Reseller</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={resellerPerformance.slice(0, 5).map(r => ({
                        name: r.name,
                        value: r.totalPoints
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {resellerPerformance.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed SEDEKAT Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commission Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Detail Komisi per Reseller
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {resellerPerformance.map((reseller) => (
                    <div key={reseller.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{reseller.name}</p>
                        <p className="text-sm text-gray-500">{reseller.phone}</p>
                        <p className="text-xs text-gray-400">{reseller.orderCount} order</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(reseller.totalCommission)}
                        </p>
                        <p className="text-sm text-blue-600">{reseller.totalPoints} poin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reseller Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Ranking Reseller (Berdasarkan Omset)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {resellerPerformance.map((reseller, index) => (
                    <div key={reseller.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge variant={index < 3 ? 'default' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">{reseller.name}</p>
                        <p className="text-sm text-gray-500">{reseller.branch}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(reseller.totalSales)}</p>
                        <p className="text-sm text-gray-500">{reseller.orderCount} order</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* General Reports */}
        <TabsContent value="general" className="space-y-6">
          {/* General Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Pelanggan</p>
                    <p className="text-2xl font-bold">{totalCustomers}</p>
                    <p className="text-xs text-green-600">+{newCustomers} periode ini</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Deal</p>
                    <p className="text-2xl font-bold">{totalDeals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Follow-up</p>
                    <p className="text-2xl font-bold">{totalFollowUps}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* General Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tren Bulanan Pelanggan & Deal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="customers" stroke="#3b82f6" name="Pelanggan Baru" />
                    <Line type="monotone" dataKey="deals" stroke="#10b981" name="Deal" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Pelanggan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branch Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Performance Cabang
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {branchPerformance.map((branch) => (
                    <div key={branch.code} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        <p className="text-sm text-gray-500">Kode: {branch.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{branch.totalDeals} deal</p>
                        <p className="text-sm text-green-600">{branch.conversionRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">{branch.totalCustomers} pelanggan</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Performance Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {salesPerformance.map((sales) => (
                    <div key={sales.code} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{sales.name}</p>
                        <p className="text-sm text-gray-500">{sales.branch || 'Tidak ada cabang'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{sales.totalDeals} deal</p>
                        <p className="text-sm text-green-600">{sales.conversionRate.toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">{sales.totalCustomers} pelanggan</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Survey Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detail Hasil Survei Per Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredSurveys.map((survey) => {
                  const customer = customers?.find(c => c.id === survey.customer_id);
                  return (
                    <div key={survey.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{customer?.name || 'Pelanggan tidak ditemukan'}</p>
                          <p className="text-sm text-gray-500">{customer?.phone}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(survey.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <Badge variant={survey.is_completed ? 'default' : 'secondary'}>
                          {survey.is_completed ? 'Selesai' : 'Pending'}
                        </Badge>
                      </div>
                      {survey.is_completed && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Kualitas Produk</p>
                            <p className="font-semibold">{survey.product_quality}/5</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Service Sales</p>
                            <p className="font-semibold">{survey.service_sales}/5</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Service Teknisi</p>
                            <p className="font-semibold">{survey.service_technician}/5</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Kejelasan Penggunaan</p>
                            <p className="font-semibold">{survey.usage_clarity}/5</p>
                          </div>
                        </div>
                      )}
                      {survey.testimonial && (
                        <div className="mt-3 p-3 bg-white rounded border-l-4 border-blue-500">
                          <p className="text-sm italic">"{survey.testimonial}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <div className="flex justify-end">
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Laporan
        </Button>
      </div>
    </div>
  );
};

export default Reports;
