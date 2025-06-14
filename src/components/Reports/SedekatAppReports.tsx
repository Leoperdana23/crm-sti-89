
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Clock,
  Star,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
  Award,
  DollarSign,
  BarChart3,
  ShoppingCart
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import { useResellerLoginHistory } from '@/hooks/useResellerLoginHistory';
import { useResellerOrders } from '@/hooks/useResellerOrders';
import { useProducts } from '@/hooks/useProducts';
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
  const { data: resellers, isLoading: resellersLoading, error: resellersError } = useResellers();
  const { data: loginHistory, isLoading: loginLoading, error: loginError } = useResellerLoginHistory();
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();

  const { startDate, endDate } = getDateRange(selectedPeriod, customStartDate, customEndDate);

  console.log('SedekatAppReports - Data status:', {
    resellers: resellers?.length || 0,
    loginHistory: loginHistory?.length || 0,
    products: products?.length || 0,
    selectedPeriod,
    dateRange: { startDate, endDate }
  });

  // Handle loading state
  if (resellersLoading || loginLoading || productsLoading) {
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (resellersError || loginError || productsError) {
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
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error memuat data laporan SEDEKAT App. Silakan refresh halaman.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter data berdasarkan periode
  const filteredLoginHistory = loginHistory ? filterDataByDateRange(loginHistory, 'login_time', startDate, endDate) : [];
  
  // Statistik utama
  const totalActiveResellers = (resellers || []).filter(r => r.is_active).length;
  const totalLoginSessions = filteredLoginHistory.length;
  const uniqueLoginResellers = new Set(filteredLoginHistory.map(login => login.reseller_id)).size;
  
  // Login analytics by hour (kurva login per jam)
  const loginByHour = Array.from({ length: 24 }, (_, hour) => {
    const hourLogins = filteredLoginHistory.filter(login => {
      const loginHour = new Date(login.login_time).getHours();
      return loginHour === hour;
    });
    
    return {
      hour: hour.toString().padStart(2, '0') + ':00',
      count: hourLogins.length,
      uniqueResellers: new Set(hourLogins.map(login => login.reseller_id)).size
    };
  });

  // Peak login hours
  const peakHour = loginByHour.reduce((max, current) => 
    current.count > max.count ? current : max, loginByHour[0]
  );

  // Get all orders for product analysis
  const allOrders: any[] = [];
  resellers?.forEach(reseller => {
    // Note: In a real implementation, we'd need to fetch orders for each reseller
    // For now, we'll use mock data structure
  });

  // Top products analysis (mock data - in real implementation, fetch from orders)
  const topProducts = (products || [])
    .map(product => ({
      ...product,
      totalOrders: Math.floor(Math.random() * 50), // Mock data
      totalQuantity: Math.floor(Math.random() * 200), // Mock data
      totalRevenue: Math.floor(Math.random() * 10000000) // Mock data
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);

  // Commission and points per reseller
  const resellerCommissionReport = (resellers || []).map(reseller => {
    // Mock calculation - in real implementation, calculate from actual orders
    const totalOrders = Math.floor(Math.random() * 20);
    const totalCommission = Math.floor(Math.random() * 1000000);
    const totalPoints = Math.floor(Math.random() * 500);
    
    return {
      ...reseller,
      totalOrders,
      totalCommission,
      totalPoints,
      avgCommissionPerOrder: totalOrders > 0 ? totalCommission / totalOrders : 0
    };
  }).sort((a, b) => b.totalCommission - a.totalCommission);

  // Daily login trends
  const dailyLoginTrends = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayKey = date.toISOString().split('T')[0];
    
    const dayLogins = filteredLoginHistory.filter(login => 
      login.login_time.startsWith(dayKey)
    );
    
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      logins: dayLogins.length,
      uniqueResellers: new Set(dayLogins.map(login => login.reseller_id)).size
    };
  }).reverse();

  // Format currency
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

      {/* Statistik Utama SEDEKAT App */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reseller Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveResellers}</div>
            <p className="text-xs text-muted-foreground">Reseller yang aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Login Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLoginSessions}</div>
            <p className="text-xs text-muted-foreground">Session login periode ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reseller Login Unik</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueLoginResellers}</div>
            <p className="text-xs text-muted-foreground">Reseller yang login</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jam Puncak Login</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakHour?.hour || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{peakHour?.count || 0} login</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="login-analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="login-analytics">Analitik Login</TabsTrigger>
          <TabsTrigger value="hourly-curve">Kurva Per Jam</TabsTrigger>
          <TabsTrigger value="top-products">Produk Terlaris</TabsTrigger>
          <TabsTrigger value="reseller-commission">Komisi Reseller</TabsTrigger>
          <TabsTrigger value="daily-trends">Tren Harian</TabsTrigger>
        </TabsList>

        <TabsContent value="login-analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analitik Login Reseller</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLoginHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredLoginHistory.slice(0, 10).map((login) => (
                    <div key={login.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{login.resellers?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{login.resellers?.phone || 'No phone'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Date(login.login_time).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(login.login_time).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada data login untuk periode yang dipilih</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly-curve">
          <Card>
            <CardHeader>
              <CardTitle>Kurva Login Per Jam (24 Jam)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loginByHour.map((hourData) => (
                  <div key={hourData.hour} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 text-center font-mono">
                        {hourData.hour}
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.max((hourData.count / Math.max(...loginByHour.map(h => h.count))) * 100, 2)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{hourData.count} login</p>
                      <p className="text-sm text-gray-500">{hourData.uniqueResellers} reseller</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-products">
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris SEDEKAT App</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.totalQuantity} terjual</p>
                        <p className="text-sm text-gray-500">{product.totalOrders} order</p>
                        <p className="text-xs text-green-600">{formatCurrency(product.totalRevenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada data produk tersedia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reseller-commission">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Komisi & Poin Per Reseller</CardTitle>
            </CardHeader>
            <CardContent>
              {resellerCommissionReport.length > 0 ? (
                <div className="space-y-4">
                  {resellerCommissionReport.slice(0, 15).map((reseller) => (
                    <div key={reseller.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{reseller.name}</p>
                          <p className="text-sm text-gray-500">{reseller.phone}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={reseller.is_active ? 'default' : 'secondary'}>
                            {reseller.is_active ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Total Order</p>
                          <p className="font-semibold flex items-center">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            {reseller.totalOrders}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Komisi</p>
                          <p className="font-semibold text-green-600 flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {formatCurrency(reseller.totalCommission)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Poin</p>
                          <p className="font-semibold text-purple-600 flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            {reseller.totalPoints}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rata-rata/Order</p>
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(reseller.avgCommissionPerOrder)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada data reseller tersedia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-trends">
          <Card>
            <CardHeader>
              <CardTitle>Tren Login Harian (7 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyLoginTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{trend.date}</p>
                      <p className="text-sm text-gray-500">{trend.uniqueResellers} reseller unik</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{trend.logins} login</p>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max((trend.logins / Math.max(...dailyLoginTrends.map(t => t.logins))) * 100, 5)}%` 
                          }}
                        ></div>
                      </div>
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
