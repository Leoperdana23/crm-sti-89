
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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
  Star
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useRewardRedemptions } from '@/hooks/useRewards';

const Reports = () => {
  const { data: resellers } = useResellers();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: redemptions } = useRewardRedemptions();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Calculate key metrics
  const totalResellers = resellers?.length || 0;
  const activeResellers = resellers?.filter(r => r.is_active).length || 0;
  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter(o => o.status === 'selesai' || o.status === 'completed').length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  // Calculate commission and points data
  const totalCommissionPaid = orders?.reduce((sum, order) => {
    return sum + (order.commission_amount || 0);
  }, 0) || 0;

  const totalPointsEarned = orders?.reduce((sum, order) => {
    return sum + (order.order_items?.reduce((itemSum, item) => {
      return itemSum + ((item.products?.points_value || 0) * item.quantity);
    }, 0) || 0);
  }, 0) || 0;

  // Reseller performance data
  const resellerPerformance = resellers?.map(reseller => {
    const resellerOrders = orders?.filter(o => o.reseller_id === reseller.id) || [];
    const resellerRevenue = resellerOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const resellerCommission = resellerOrders.reduce((sum, order) => sum + (order.commission_amount || 0), 0);
    
    return {
      name: reseller.name,
      orders: resellerOrders.length,
      revenue: resellerRevenue,
      commission: resellerCommission,
      performance: resellerOrders.length > 0 ? 'Good' : 'Inactive'
    };
  }).sort((a, b) => b.orders - a.orders).slice(0, 10) || [];

  // Order trend data (last 6 months)
  const orderTrendData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthOrders = orders?.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === date.getMonth() && 
             orderDate.getFullYear() === date.getFullYear();
    }) || [];

    return {
      month: date.toLocaleDateString('id-ID', { month: 'short' }),
      orders: monthOrders.length,
      revenue: monthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
      commission: monthOrders.reduce((sum, order) => sum + (order.commission_amount || 0), 0)
    };
  });

  // Order status distribution
  const orderStatusData = [
    { name: 'Selesai', value: completedOrders, color: '#10B981' },
    { name: 'Pending', value: pendingOrders, color: '#F59E0B' },
    { name: 'Proses', value: orders?.filter(o => o.status === 'proses').length || 0, color: '#3B82F6' },
    { name: 'Dibatalkan', value: orders?.filter(o => o.status === 'dibatalkan').length || 0, color: '#EF4444' },
  ];

  // Top products by sales
  const productSales = products?.map(product => {
    const productOrders = orders?.reduce((sum, order) => {
      const productItems = order.order_items?.filter(item => item.product_id === product.id) || [];
      return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0) || 0;

    return {
      name: product.name,
      sales: productOrders,
      revenue: productOrders * (product.price || 0)
    };
  }).sort((a, b) => b.sales - a.sales).slice(0, 10) || [];

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
      ['Total Reseller', totalResellers.toString()],
      ['Reseller Aktif', activeResellers.toString()],
      ['Total Pesanan', totalOrders.toString()],
      ['Pesanan Selesai', completedOrders.toString()],
      ['Total Revenue', formatCurrency(totalRevenue)],
      ['Total Komisi', formatCurrency(totalCommissionPaid)],
      ['Total Poin', totalPointsEarned.toString()]
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan-sedekat-app.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan SEDEKAT APP</h1>
          <p className="text-gray-600 mt-1">Analisis lengkap performa aplikasi reseller</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="quarter">Kuartal Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reseller</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResellers}</div>
            <p className="text-xs text-muted-foreground">
              {activeResellers} aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {completedOrders} selesai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Semua periode
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommissionPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {totalPointsEarned} poin diberikan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="orders">Analisa Pesanan</TabsTrigger>
          <TabsTrigger value="resellers">Performa Reseller</TabsTrigger>
          <TabsTrigger value="commission">Komisi & Poin</TabsTrigger>
          <TabsTrigger value="products">Produk Terlaris</TabsTrigger>
          <TabsTrigger value="trends">Tren & Analitik</TabsTrigger>
          <TabsTrigger value="complete">Laporan Lengkap</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Distribusi Status Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tren Pesanan 6 Bulan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={orderTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Pesanan']} />
                    <Legend />
                    <Line type="monotone" dataKey="orders" stroke="#3B82F6" name="Pesanan" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resellers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top 10 Performa Reseller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resellerPerformance.map((reseller, index) => (
                  <div key={reseller.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{reseller.name}</p>
                        <p className="text-sm text-gray-600">{reseller.orders} pesanan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(reseller.revenue)}</p>
                      <p className="text-sm text-blue-600">{formatCurrency(reseller.commission)} komisi</p>
                      <Badge variant={reseller.performance === 'Good' ? 'default' : 'secondary'}>
                        {reseller.performance}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commission Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tren Komisi & Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orderTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                    <Bar dataKey="commission" fill="#3B82F6" name="Komisi" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Commission Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Komisi & Poin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium">Total Komisi Dibayar</span>
                    <span className="font-bold text-green-600">{formatCurrency(totalCommissionPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium">Total Poin Diberikan</span>
                    <span className="font-bold text-blue-600">{totalPointsEarned} poin</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="text-sm font-medium">Total Penukaran Hadiah</span>
                    <span className="font-bold text-purple-600">{redemptions?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span className="text-sm font-medium">Rata-rata Komisi per Order</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(completedOrders > 0 ? totalCommissionPaid / completedOrders : 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top 10 Produk Terlaris
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productSales.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} terjual</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-gray-600">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analisis Tren Komprehensif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={orderTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#3B82F6" name="Pesanan" />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue (dalam ribuan)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Laporan Lengkap SEDEKAT APP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Reseller</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Reseller:</span>
                      <span className="font-medium">{totalResellers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reseller Aktif:</span>
                      <span className="font-medium">{activeResellers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tingkat Aktivitas:</span>
                      <span className="font-medium">{((activeResellers / totalResellers) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Pesanan</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Pesanan:</span>
                      <span className="font-medium">{totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pesanan Selesai:</span>
                      <span className="font-medium">{completedOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tingkat Penyelesaian:</span>
                      <span className="font-medium">{((completedOrders / totalOrders) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Finansial</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Komisi:</span>
                      <span className="font-medium">{formatCurrency(totalCommissionPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Persentase Komisi:</span>
                      <span className="font-medium">{((totalCommissionPaid / totalRevenue) * 100).toFixed(1)}%</span>
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

export default Reports;
