import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  Users, 
  Target, 
  Award,
  ShoppingCart,
  DollarSign,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  Star,
  Store,
  ArrowLeft,
  Building,
  MessageSquare,
  CheckCircle,
  Phone,
  Activity,
  Crown,
  Timer
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useRewardRedemptions } from '@/hooks/useRewards';
import { useCustomers } from '@/hooks/useCustomers';
import { useSurveys } from '@/hooks/useSurveys';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';
import DateRangeFilter from '@/components/Reports/DateRangeFilter';
import { getDateRange, filterDataByDateRange } from '@/utils/dateFilters';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<'main' | 'sedekat' | 'umum'>('main');
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Hook untuk data
  const { data: resellers } = useResellers();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: redemptions } = useRewardRedemptions();
  const { data: customers } = useCustomers();
  const { surveys, getAverageRatings } = useSurveys();
  const { data: branches } = useBranches();
  const { data: sales } = useSales();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exportData = () => {
    const csvData = [
      ['Metrik', 'Nilai'],
      ['Total Reseller', (resellers?.length || 0).toString()],
      ['Total Pelanggan', (customers?.length || 0).toString()],
      ['Total Pesanan', (orders?.length || 0).toString()],
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan-sistem-management.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get filtered data based on selected period
  const getFilteredData = (data: any[], dateField: string = 'created_at') => {
    const { startDate, endDate } = getDateRange(selectedPeriod, customStartDate, customEndDate);
    return filterDataByDateRange(data || [], dateField, startDate, endDate);
  };

  // Main Menu Component
  const MainReportsMenu = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistem Laporan</h1>
        <p className="text-gray-600">Pilih jenis laporan yang ingin Anda lihat</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Laporan SEDEKAT */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedReport('sedekat')}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Laporan SEDEKAT</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center mb-4">
              Analisis lengkap aplikasi reseller SEDEKAT
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Reseller:</span>
                <span className="font-medium">{resellers?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Pesanan:</span>
                <span className="font-medium">{orders?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Komisi:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(orders?.reduce((sum, order) => {
                    if (order.status !== 'selesai' && order.status !== 'completed') return sum;
                    return sum + (order.order_items || []).reduce((orderSum, item) => {
                      const commission = item.product_commission_snapshot || item.products?.commission_value || 0;
                      return orderSum + (commission * item.quantity);
                    }, 0);
                  }, 0) || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Laporan Umum */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedReport('umum')}>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Laporan Umum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center mb-4">
              Analisis komprehensif bisnis dan operasional
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Pelanggan:</span>
                <span className="font-medium">{customers?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Deal:</span>
                <span className="font-medium">{customers?.filter(c => c.deal_date).length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Survei Selesai:</span>
                <span className="font-medium text-blue-600">{surveys?.filter(s => s.is_completed).length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // SEDEKAT Reports Component
  const SedekatReports = () => {
    const filteredOrders = getFilteredData(orders);
    const filteredResellers = getFilteredData(resellers);
    
    // Calculate SEDEKAT metrics with filtered data
    const totalResellers = filteredResellers.length;
    const activeResellers = filteredResellers.filter(r => r.is_active).length;
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(o => o.status === 'selesai' || o.status === 'completed').length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    
    const totalCommissionPaid = filteredOrders.reduce((sum, order) => {
      if (order.status !== 'selesai' && order.status !== 'completed') return sum;
      return sum + (order.order_items || []).reduce((orderSum, item) => {
        const commission = item.product_commission_snapshot || item.products?.commission_value || 0;
        return orderSum + (commission * item.quantity);
      }, 0);
    }, 0);

    const totalPointsEarned = filteredOrders.reduce((sum, order) => {
      if (order.status !== 'selesai' && order.status !== 'completed') return sum;
      return sum + (order.order_items || []).reduce((orderSum, item) => {
        const points = item.product_points_snapshot || item.products?.points_value || 0;
        return orderSum + (points * item.quantity);
      }, 0);
    }, 0);

    // Reseller performance data
    const resellerPerformance = resellers?.map(reseller => {
      const resellerOrders = filteredOrders.filter(order => 
        order.catalog_token && orders?.find(o => o.id === order.id)?.catalog_token === reseller.id // This needs proper catalog token mapping
      ) || [];
      
      const resellerRevenue = resellerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const resellerCommission = resellerOrders.reduce((sum, order) => {
        if (order.status !== 'selesai' && order.status !== 'completed') return sum;
        return sum + (order.order_items || []).reduce((orderSum, item) => {
          const commission = item.product_commission_snapshot || item.products?.commission_value || 0;
          return orderSum + (commission * item.quantity);
        }, 0);
      }, 0);
      
      const resellerPoints = resellerOrders.reduce((sum, order) => {
        if (order.status !== 'selesai' && order.status !== 'completed') return sum;
        return sum + (order.order_items || []).reduce((orderSum, item) => {
          const points = item.product_points_snapshot || item.products?.points_value || 0;
          return orderSum + (points * item.quantity);
        }, 0);
      }, 0);

      return {
        id: reseller.id,
        name: reseller.name,
        phone: reseller.phone,
        orders: resellerOrders.length,
        revenue: resellerRevenue,
        commission: resellerCommission,
        points: resellerPoints,
        isActive: reseller.is_active
      };
    }).sort((a, b) => b.revenue - a.revenue) || [];

    // Chart data for trends
    const monthlyTrendData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });

      const monthCommission = monthOrders.reduce((sum, order) => {
        if (order.status !== 'selesai' && order.status !== 'completed') return sum;
        return sum + (order.order_items || []).reduce((orderSum, item) => {
          const commission = item.product_commission_snapshot || item.products?.commission_value || 0;
          return orderSum + (commission * item.quantity);
        }, 0);
      }, 0);

      return {
        month: date.toLocaleDateString('id-ID', { month: 'short' }),
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        commission: monthCommission
      };
    });

    // Commission distribution chart
    const commissionDistribution = [
      { name: 'Komisi Dibayar', value: totalCommissionPaid, color: '#10B981' },
      { name: 'Poin Diperoleh', value: totalPointsEarned, color: '#3B82F6' }
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => setSelectedReport('main')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Laporan SEDEKAT APP</h1>
              <p className="text-gray-600 mt-1">Analisis lengkap performa aplikasi reseller</p>
            </div>
          </div>
          <Button onClick={exportData} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>

        {/* Date Filter */}
        <DateRangeFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
        />

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reseller</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResellers}</div>
              <p className="text-xs text-muted-foreground">{activeResellers} aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">{completedOrders} selesai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Periode ini</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCommissionPaid)}</div>
              <p className="text-xs text-muted-foreground">{totalPointsEarned} poin diberikan</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tren Pesanan & Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" name="Revenue" />
                  <Area type="monotone" dataKey="commission" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Komisi" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Commission vs Points Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Distribusi Reward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={commissionDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => entry.name}
                  >
                    {commissionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports Tabs */}
        <Tabs defaultValue="commission" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="commission">Detail Komisi</TabsTrigger>
            <TabsTrigger value="performance">Pencapaian Reseller</TabsTrigger>
            <TabsTrigger value="ranking">Ranking Reseller</TabsTrigger>
            <TabsTrigger value="activity">Aktivitas Login</TabsTrigger>
          </TabsList>

          <TabsContent value="commission" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Laporan Detail Komisi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resellerPerformance.slice(0, 10).map((reseller, index) => (
                    <div key={reseller.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{reseller.name}</p>
                          <p className="text-sm text-gray-600">{reseller.phone}</p>
                          <p className="text-xs text-gray-500">{reseller.orders} pesanan</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(reseller.commission)}</p>
                        <p className="text-sm text-blue-600">{reseller.points} poin</p>
                        <p className="text-xs text-gray-500">Revenue: {formatCurrency(reseller.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Pencapaian Reseller Detail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resellerPerformance.map((reseller) => (
                    <Card key={reseller.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{reseller.name}</h4>
                          <Badge variant={reseller.isActive ? "default" : "secondary"}>
                            {reseller.isActive ? "Aktif" : "Tidak Aktif"}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Pesanan:</span>
                            <span className="font-medium">{reseller.orders}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium text-green-600">{formatCurrency(reseller.revenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Komisi:</span>
                            <span className="font-medium text-blue-600">{formatCurrency(reseller.commission)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Poin:</span>
                            <span className="font-medium text-purple-600">{reseller.points}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ranking" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top by Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Top Omset
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resellerPerformance.slice(0, 5).map((reseller, index) => (
                      <div key={reseller.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-yellow-600">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{reseller.name}</p>
                            <p className="text-xs text-gray-500">{reseller.orders} order</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-green-600">{formatCurrency(reseller.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top by Commission */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-500" />
                    Top Komisi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resellerPerformance.sort((a, b) => b.commission - a.commission).slice(0, 5).map((reseller, index) => (
                      <div key={reseller.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{reseller.name}</p>
                            <p className="text-xs text-gray-500">{reseller.orders} order</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-green-600">{formatCurrency(reseller.commission)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top by Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-500" />
                    Top Poin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resellerPerformance.sort((a, b) => b.points - a.points).slice(0, 5).map((reseller, index) => (
                      <div key={reseller.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{reseller.name}</p>
                            <p className="text-xs text-gray-500">{reseller.orders} order</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-purple-600">{reseller.points} poin</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Reseller Paling Aktif Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-gray-500 py-8">
                    <Timer className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Data aktivitas login sedang dikembangkan</p>
                    <p className="text-sm">Fitur ini akan segera tersedia untuk melacak aktivitas login reseller</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // General Reports Component - keeping existing implementation but adding date filtering
  const GeneralReports = () => {
    const filteredCustomers = getFilteredData(customers);
    const filteredSurveys = getFilteredData(surveys);
    
    // Calculate general metrics with filtered data
    const totalCustomers = filteredCustomers.length;
    const totalDeals = filteredCustomers.filter(c => c.deal_date).length;
    const totalFollowUps = filteredCustomers.filter(c => c.status === 'Follow-up').length;
    const conversionRate = totalCustomers > 0 ? ((totalDeals / totalCustomers) * 100).toFixed(1) : '0';
    
    // Monthly trend data with filtered data
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthCustomers = filteredCustomers.filter(customer => {
        const customerDate = new Date(customer.created_at);
        return customerDate.getMonth() === date.getMonth() && 
               customerDate.getFullYear() === date.getFullYear();
      });

      const monthDeals = filteredCustomers.filter(customer => {
        if (!customer.deal_date) return false;
        const dealDate = new Date(customer.deal_date);
        return dealDate.getMonth() === date.getMonth() && 
               dealDate.getFullYear() === date.getFullYear();
      });

      return {
        month: date.toLocaleDateString('id-ID', { month: 'short' }),
        customers: monthCustomers.length,
        deals: monthDeals.length,
        conversionRate: monthCustomers.length > 0 ? ((monthDeals.length / monthCustomers.length) * 100) : 0
      };
    });

    // Branch performance
    const branchPerformance = branches?.map(branch => {
      const branchCustomers = filteredCustomers.filter(c => c.branch_id === branch.id);
      const branchDeals = branchCustomers.filter(c => c.deal_date);
      return {
        name: branch.name,
        customers: branchCustomers.length,
        deals: branchDeals.length,
        conversionRate: branchCustomers.length > 0 ? ((branchDeals.length / branchCustomers.length) * 100).toFixed(1) : '0'
      };
    }).sort((a, b) => b.deals - a.deals) || [];

    // Sales performance
    const salesPerformance = sales?.map(sale => {
      const saleCustomers = filteredCustomers.filter(c => c.sales_id === sale.id);
      const saleDeals = saleCustomers.filter(c => c.deal_date);
      return {
        name: sale.name,
        customers: saleCustomers.length,
        deals: saleDeals.length,
        conversionRate: saleCustomers.length > 0 ? ((saleDeals.length / saleCustomers.length) * 100).toFixed(1) : '0'
      };
    }).sort((a, b) => b.deals - a.deals) || [];

    // Survey results
    const completedSurveys = filteredSurveys.filter(s => s.is_completed) || [];
    const averageRatings = getAverageRatings();

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => setSelectedReport('main')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Laporan Umum</h1>
              <p className="text-gray-600 mt-1">Analisis komprehensif bisnis dan operasional</p>
            </div>
          </div>
          <Button onClick={exportData} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>

        {/* Date Filter */}
        <DateRangeFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
        />

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Periode ini</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deal</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeals}</div>
              <p className="text-xs text-muted-foreground">Deal berhasil</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Lead to Deal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Follow-Up</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFollowUps}</div>
              <p className="text-xs text-muted-foreground">Aktif follow-up</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tren Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="customers" stroke="#3B82F6" name="Pelanggan Baru" />
                  <Line type="monotone" dataKey="deals" stroke="#10B981" name="Deal Berhasil" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Conversion Rate Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="conversionRate" fill="#F59E0B" name="Conversion Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports Tabs */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">Tren Bulanan</TabsTrigger>
            <TabsTrigger value="performance">Performa Branch & Sales</TabsTrigger>
            <TabsTrigger value="surveys">Hasil Survei</TabsTrigger>
            <TabsTrigger value="summary">Ringkasan Lengkap</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tren Pelanggan & Deal (6 Bulan Terakhir)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="customers" stroke="#3B82F6" name="Pelanggan Baru" />
                    <Line type="monotone" dataKey="deals" stroke="#10B981" name="Deal Berhasil" />
                    <Line type="monotone" dataKey="conversionRate" stroke="#F59E0B" name="Conversion Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branch Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Performa Cabang
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {branchPerformance.map((branch, index) => (
                      <div key={branch.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{branch.name}</p>
                            <p className="text-sm text-gray-600">{branch.customers} pelanggan</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{branch.deals} deal</p>
                          <p className="text-sm text-blue-600">{branch.conversionRate}% conversion</p>
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
                    <Star className="h-5 w-5" />
                    Performa Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesPerformance.slice(0, 10).map((sale, index) => (
                      <div key={sale.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{sale.name}</p>
                            <p className="text-sm text-gray-600">{sale.customers} pelanggan</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{sale.deals} deal</p>
                          <p className="text-sm text-blue-600">{sale.conversionRate}% conversion</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="surveys" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Survey Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Ringkasan Survei
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="text-sm font-medium">Total Survei</span>
                      <span className="font-bold text-blue-600">{filteredSurveys.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm font-medium">Survei Selesai</span>
                      <span className="font-bold text-green-600">{completedSurveys.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                      <span className="text-sm font-medium">Tingkat Kepuasan</span>
                      <span className="font-bold text-purple-600">{averageRatings.product_quality}/5</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                      <span className="text-sm font-medium">Approval Rate</span>
                      <span className="font-bold text-orange-600">{averageRatings.priceApprovalRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Survey Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Detail Hasil Survei Per Pelanggan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {completedSurveys.map((survey) => (
                      <div key={survey.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{survey.customers?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{survey.customers?.phone || 'N/A'}</p>
                          </div>
                          <Badge variant="outline">
                            {survey.product_quality}/5
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Kualitas: {survey.product_quality}/5</div>
                          <div>Service: {survey.service_sales}/5</div>
                          <div>Teknisi: {survey.service_technician}/5</div>
                          <div>Kejelasan: {survey.usage_clarity}/5</div>
                        </div>
                        {survey.testimonial && (
                          <p className="text-xs text-gray-600 mt-2 italic">
                            "{survey.testimonial.substring(0, 100)}..."
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Ringkasan Laporan Lengkap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Pelanggan</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Pelanggan:</span>
                        <span className="font-medium">{totalCustomers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deal Berhasil:</span>
                        <span className="font-medium">{totalDeals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversion Rate:</span>
                        <span className="font-medium">{conversionRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Operasional</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Follow-Up:</span>
                        <span className="font-medium">{totalFollowUps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jumlah Cabang:</span>
                        <span className="font-medium">{branches?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jumlah Sales:</span>
                        <span className="font-medium">{sales?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Survei</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Survei:</span>
                        <span className="font-medium">{filteredSurveys.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Survei Selesai:</span>
                        <span className="font-medium">{completedSurveys.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rata-rata Rating:</span>
                        <span className="font-medium">{averageRatings.product_quality}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // Render based on selected report
  if (selectedReport === 'sedekat') {
    return <SedekatReports />;
  }

  if (selectedReport === 'umum') {
    return <GeneralReports />;
  }

  return (
    <div className="p-6">
      <MainReportsMenu />
    </div>
  );
};

export default Reports;
