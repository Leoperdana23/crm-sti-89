
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  LogIn
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import { useOrders } from '@/hooks/useOrders';
import { useResellerSessions } from '@/hooks/useResellerSessions';
import DateRangeFilter from './DateRangeFilter';
import { getDateRange, filterDataByDateRange } from '@/utils/dateFilters';

interface SedekatAppReportsProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
}

const SedekatAppReports: React.FC<SedekatAppReportsProps> = ({
  selectedPeriod,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange
}) => {
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

  // Distribusi komisi per reseller
  const resellerCommissions = resellers?.map(reseller => {
    const resellerOrders = filteredOrders.filter(order => {
      // Assuming we can map catalog_token to reseller somehow
      return order.catalog_token; // Simplified for now
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
  }) || [];

  // Ranking reseller berdasarkan omset
  const resellerRanking = [...resellerCommissions]
    .sort((a, b) => b.commission - a.commission)
    .slice(0, 10);

  // Reseller paling aktif login
  const activeResellers = resellers?.map(reseller => {
    const loginCount = filteredSessions.filter(session => 
      session.reseller_id === reseller.id
    ).length;
    
    return {
      ...reseller,
      loginCount
    };
  }).sort((a, b) => b.loginCount - a.loginCount).slice(0, 10) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <DateRangeFilter
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onCustomStartDateChange={onCustomStartDateChange}
        onCustomEndDateChange={onCustomEndDateChange}
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
            <p className="text-xs text-muted-foreground">Order melalui aplikasi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
            <p className="text-xs text-muted-foreground">Komisi dibagikan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Poin</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Poin diberikan</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tren Bulanan</TabsTrigger>
          <TabsTrigger value="commission">Distribusi Komisi</TabsTrigger>
          <TabsTrigger value="performance">Performance Reseller</TabsTrigger>
          <TabsTrigger value="ranking">Ranking Reseller</TabsTrigger>
          <TabsTrigger value="active">Reseller Aktif</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tren Bulanan Aplikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
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

        <TabsContent value="commission">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Komisi Reseller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resellerCommissions.slice(0, 10).map((reseller, index) => (
                  <div key={reseller.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{reseller.name}</p>
                      <p className="text-sm text-gray-500">{reseller.phone}</p>
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

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reseller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resellerCommissions.slice(0, 10).map((reseller, index) => (
                  <div key={reseller.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Store className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{reseller.name}</p>
                        <p className="text-sm text-gray-500">{reseller.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{reseller.orders} order</p>
                        <p className="text-xs text-gray-500">Total order</p>
                      </div>
                      <Badge variant={reseller.commission > 1000000 ? "default" : "secondary"}>
                        {reseller.commission > 1000000 ? "Top Performer" : "Active"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Reseller (Berdasarkan Omset)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resellerRanking.map((reseller, index) => (
                  <div key={reseller.id} className="flex items-center justify-between p-3 border rounded-lg">
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

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Reseller Paling Aktif Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeResellers.map((reseller, index) => (
                  <div key={reseller.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <LogIn className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{reseller.name}</p>
                        <p className="text-sm text-gray-500">{reseller.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{reseller.loginCount} kali</p>
                      <p className="text-sm text-gray-500">Login aplikasi</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SedekatAppReports;
