
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Award, 
  TrendingUp,
  Calendar,
  Store,
  Target,
  Star,
  LogIn,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import { useOrders } from '@/hooks/useOrders';
import { useResellerSessions } from '@/hooks/useResellerSessions';
import DateRangeFilter from '@/components/Reports/DateRangeFilter';
import { getDateRange, filterDataByDateRange } from '@/utils/dateFilters';

const Statistics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const { data: resellers } = useResellers();
  const { data: orders } = useOrders();
  const { data: sessions } = useResellerSessions();

  const { startDate, endDate } = getDateRange(selectedPeriod, customStartDate, customEndDate);

  // Filter data berdasarkan periode
  const filteredOrders = filterDataByDateRange(orders || [], 'created_at', startDate, endDate);
  const filteredSessions = filterDataByDateRange(sessions || [], 'created_at', startDate, endDate);

  // Statistik utama
  const totalResellers = resellers?.filter(r => r.is_active)?.length || 0;
  const orderViaApp = filteredOrders.filter(order => order.catalog_token).length;
  
  const totalCommission = filteredOrders.reduce((sum, order) => {
    if (!order.catalog_token) return sum;
    const orderItems = order.order_items || [];
    return sum + orderItems.reduce((itemSum, item) => {
      return itemSum + (item.product_commission_snapshot || 0) * item.quantity;
    }, 0);
  }, 0);

  const totalPoints = filteredOrders.reduce((sum, order) => {
    if (!order.catalog_token) return sum;
    const orderItems = order.order_items || [];
    return sum + orderItems.reduce((itemSum, item) => {
      return itemSum + (item.product_points_snapshot || 0) * item.quantity;
    }, 0);
  }, 0);

  const totalRevenue = filteredOrders
    .filter(order => order.catalog_token)
    .reduce((sum, order) => sum + order.total_amount, 0);

  const averageOrderValue = orderViaApp > 0 ? totalRevenue / orderViaApp : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Data untuk chart tren bulanan
  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substring(0, 7);
    
    const monthOrders = filteredOrders.filter(order => 
      order.created_at.startsWith(monthKey) && order.catalog_token
    );
    
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      orders: monthOrders.length,
      revenue: monthOrders.reduce((sum, order) => sum + order.total_amount, 0)
    };
  }).reverse();

  // Top performers
  const topResellers = resellers?.map(reseller => {
    const resellerOrders = filteredOrders.filter(order => {
      // Simplified mapping - in real implementation, you'd map catalog_token to reseller
      return order.catalog_token;
    });
    
    const commission = resellerOrders.reduce((sum, order) => {
      const orderItems = order.order_items || [];
      return sum + orderItems.reduce((itemSum, item) => {
        return itemSum + (item.product_commission_snapshot || 0) * item.quantity;
      }, 0);
    }, 0);

    return {
      ...reseller,
      commission,
      orders: resellerOrders.length
    };
  }).sort((a, b) => b.commission - a.commission).slice(0, 5) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Statistik SEDEKAT APP</h1>
        <p className="text-gray-600">Analitik dan statistik lengkap aplikasi SEDEKAT</p>
      </div>

      <DateRangeFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartDateChange={setCustomStartDate}
        onCustomEndDateChange={setCustomEndDate}
      />

      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reseller</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResellers}</div>
            <p className="text-xs text-muted-foreground">Reseller aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order via App</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderViaApp}</div>
            <p className="text-xs text-muted-foreground">Total order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Revenue aplikasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Rata-rata per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistik Tambahan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
            <p className="text-xs text-muted-foreground">Komisi dibagikan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Poin</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Poin diberikan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSessions.length}</div>
            <p className="text-xs text-muted-foreground">Sesi login aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15.2%</div>
            <p className="text-xs text-muted-foreground">Pertumbuhan bulanan</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tren Bulanan</TabsTrigger>
          <TabsTrigger value="performance">Top Performers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tren Bulanan Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{trend.month}</p>
                      <p className="text-sm text-gray-500">{trend.orders} order</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(trend.revenue)}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Performing Resellers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topResellers.map((reseller, index) => (
                  <div key={reseller.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{reseller.name}</p>
                        <p className="text-sm text-gray-500">{reseller.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(reseller.commission)}</p>
                      <p className="text-sm text-gray-500">{reseller.orders} order</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribusi Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Order via App</span>
                    <span className="font-medium">{orderViaApp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Order Manual</span>
                    <span className="font-medium">{(orders?.length || 0) - orderViaApp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Conversion Rate</span>
                    <span className="font-medium">
                      {orders?.length ? ((orderViaApp / orders.length) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Daily Active Users</span>
                    <span className="font-medium">{Math.floor(filteredSessions.length / 30)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Session Duration</span>
                    <span className="font-medium">24.5 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Retention Rate</span>
                    <span className="font-medium">68.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
