import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  ShoppingCart,
  Gift,
  Coins,
  ChevronDown,
  ChevronRight,
  User
} from 'lucide-react';
import { useResellers } from '@/hooks/useResellers';
import { useResellerLoginHistory } from '@/hooks/useResellerLoginHistory';
import { useResellerOrders } from '@/hooks/useResellerOrders';
import { useProducts } from '@/hooks/useProducts';
import { useRewardRedemptions } from '@/hooks/useRewards';
import { useOrders } from '@/hooks/useOrders';
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
  const { data: rewardRedemptions, isLoading: redemptionsLoading } = useRewardRedemptions();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  const { startDate, endDate } = getDateRange(selectedPeriod, customStartDate, customEndDate);

  console.log('SedekatAppReports - Data status:', {
    resellers: resellers?.length || 0,
    loginHistory: loginHistory?.length || 0,
    products: products?.length || 0,
    rewardRedemptions: rewardRedemptions?.length || 0,
    orders: orders?.length || 0,
    selectedPeriod,
    dateRange: { startDate, endDate }
  });

  // Handle loading state
  if (resellersLoading || loginLoading || productsLoading || redemptionsLoading || ordersLoading) {
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
  const filteredRedemptions = rewardRedemptions ? filterDataByDateRange(rewardRedemptions, 'created_at', startDate, endDate) : [];
  const filteredOrders = orders ? filterDataByDateRange(orders, 'created_at', startDate, endDate) : [];
  
  // Statistik utama
  const totalActiveResellers = (resellers || []).filter(r => r.is_active).length;
  const totalLoginSessions = filteredLoginHistory.length;
  const uniqueLoginResellers = new Set(filteredLoginHistory.map(login => login.reseller_id)).size;
  
  // Reward redemptions statistics
  const totalCommissionRedeemed = filteredRedemptions
    .filter(r => r.reward_type === 'commission' && r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.amount_redeemed), 0);
  
  const totalPointsRedeemed = filteredRedemptions
    .filter(r => r.reward_type === 'points' && r.status === 'approved')
    .reduce((sum, r) => sum + Number(r.amount_redeemed), 0);

  // Login analytics by hour dengan detailed reseller list
  const loginByHour = Array.from({ length: 24 }, (_, hour) => {
    const hourLogins = filteredLoginHistory.filter(login => {
      const loginHour = new Date(login.login_time).getHours();
      return loginHour === hour;
    });
    
    return {
      hour: hour.toString().padStart(2, '0') + ':00',
      count: hourLogins.length,
      uniqueResellers: new Set(hourLogins.map(login => login.reseller_id)).size,
      logins: hourLogins.map(login => ({
        id: login.id,
        reseller_id: login.reseller_id,
        reseller_name: login.resellers?.name || 'Unknown',
        reseller_phone: login.resellers?.phone || 'N/A',
        login_time: login.login_time,
        login_method: login.login_method
      })).sort((a, b) => new Date(b.login_time).getTime() - new Date(a.login_time).getTime())
    };
  });

  const maxHourlyLogins = Math.max(...loginByHour.map(h => h.count));
  const peakHour = loginByHour.reduce((max, current) => 
    current.count > max.count ? current : max, loginByHour[0]
  );

  // Top products analysis dengan data real dari orders
  const topProducts = (products || [])
    .map(product => {
      // Hitung data real dari orders yang sudah selesai
      const completedOrders = filteredOrders.filter(order => 
        order.status === 'selesai' || order.status === 'completed'
      );
      
      let totalOrders = 0;
      let totalQuantity = 0;
      let totalRevenue = 0;
      
      completedOrders.forEach(order => {
        const orderItems = order.order_items || [];
        orderItems.forEach(item => {
          if (item.product_id === product.id) {
            totalOrders += 1;
            totalQuantity += item.quantity;
            totalRevenue += item.subtotal;
          }
        });
      });
      
      return {
        ...product,
        totalOrders,
        totalQuantity,
        totalRevenue
      };
    })
    .filter(product => product.totalQuantity > 0) // Only products with sales
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);

  // Commission and points per reseller dengan data real
  const resellerCommissionReport = (resellers || []).map(reseller => {
    console.log(`Processing reseller: ${reseller.name} (${reseller.id})`);
    
    // Get ALL orders linked to this reseller through catalog tokens
    const resellerOrders = (orders || []).filter(order => {
      // Check if order has catalog_token and matches this reseller
      if (!order.catalog_token || !order.reseller) return false;
      
      const isResellerOrder = order.reseller.id === reseller.id;
      const isCompleted = order.status === 'selesai' || order.status === 'completed';
      
      // Filter by date range
      const orderDate = new Date(order.created_at);
      const isInDateRange = orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      
      console.log(`Order ${order.id}: reseller_match=${isResellerOrder}, completed=${isCompleted}, in_date_range=${isInDateRange}`);
      
      return isResellerOrder && isCompleted && isInDateRange;
    });
    
    console.log(`Reseller ${reseller.name} has ${resellerOrders.length} completed orders in date range`);
    
    // Calculate real commission and points from order items
    let totalCommission = 0;
    let totalPoints = 0;
    
    resellerOrders.forEach(order => {
      const orderItems = order.order_items || [];
      console.log(`Order ${order.id} has ${orderItems.length} items`);
      
      orderItems.forEach(item => {
        // Use snapshot values first, then fall back to current product values
        const commissionPerUnit = item.product_commission_snapshot || 
                                 item.products?.commission_value || 0;
        const pointsPerUnit = item.product_points_snapshot || 
                             item.products?.points_value || 0;
        
        const itemCommission = commissionPerUnit * item.quantity;
        const itemPoints = pointsPerUnit * item.quantity;
        
        totalCommission += itemCommission;
        totalPoints += itemPoints;
        
        console.log(`Item ${item.product_name}: commission=${itemCommission}, points=${itemPoints}`);
      });
    });
    
    console.log(`Reseller ${reseller.name} totals: commission=${totalCommission}, points=${totalPoints}`);
    
    // Calculate redemptions for this reseller in the date range
    const resellerRedemptions = (rewardRedemptions || []).filter(r => {
      const redemptionDate = new Date(r.created_at);
      const isInDateRange = redemptionDate >= new Date(startDate) && redemptionDate <= new Date(endDate);
      return r.reseller_id === reseller.id && r.status === 'approved' && isInDateRange;
    });
    
    const commissionRedeemed = resellerRedemptions
      .filter(r => r.reward_type === 'commission')
      .reduce((sum, r) => sum + Number(r.amount_redeemed), 0);
    const pointsRedeemed = resellerRedemptions
      .filter(r => r.reward_type === 'points')
      .reduce((sum, r) => sum + Number(r.amount_redeemed), 0);
    
    const availableCommission = Math.max(0, totalCommission - commissionRedeemed);
    const availablePoints = Math.max(0, totalPoints - pointsRedeemed);
    const avgCommissionPerOrder = resellerOrders.length > 0 ? totalCommission / resellerOrders.length : 0;
    
    console.log(`Reseller ${reseller.name} final: available_commission=${availableCommission}, available_points=${availablePoints}`);
    
    return {
      ...reseller,
      totalOrders: resellerOrders.length,
      totalCommission,
      totalPoints,
      commissionRedeemed,
      pointsRedeemed,
      availableCommission,
      availablePoints,
      avgCommissionPerOrder
    };
  }).filter(reseller => reseller.totalOrders > 0) // Only show resellers with orders
    .sort((a, b) => b.totalCommission - a.totalCommission);

  console.log('Final reseller commission report:', resellerCommissionReport);

  // Daily login trends untuk 7 hari terakhir
  const dailyLoginTrends = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayKey = date.toISOString().split('T')[0];
    
    const dayLogins = filteredLoginHistory.filter(login => 
      login.login_time.startsWith(dayKey)
    );
    
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      fullDate: dayKey,
      logins: dayLogins.length,
      uniqueResellers: new Set(dayLogins.map(login => login.reseller_id)).size
    };
  }).reverse();

  const maxDailyLogins = Math.max(...dailyLoginTrends.map(d => d.logins));

  // Reward redemptions analysis
  const redemptionsByType = {
    commission: filteredRedemptions.filter(r => r.reward_type === 'commission'),
    points: filteredRedemptions.filter(r => r.reward_type === 'points')
  };

  const redemptionsByStatus = {
    pending: filteredRedemptions.filter(r => r.status === 'pending').length,
    approved: filteredRedemptions.filter(r => r.status === 'approved').length,
    rejected: filteredRedemptions.filter(r => r.status === 'rejected').length
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <CardTitle className="text-sm font-medium">Jam Puncak Login</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peakHour?.hour || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{peakHour?.count || 0} login</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komisi Ditukar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommissionRedeemed)}</div>
            <p className="text-xs text-muted-foreground">Total ditukar hadiah</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poin Ditukar</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPointsRedeemed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total poin ditukar</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hourly-curve" className="space-y-4">
        <TabsList className="grid grid-cols-4 gap-2 h-auto p-2">
          <TabsTrigger value="hourly-curve" className="text-xs">Kurva Per Jam</TabsTrigger>
          <TabsTrigger value="top-products" className="text-xs">Produk Terlaris</TabsTrigger>
          <TabsTrigger value="reseller-commission" className="text-xs">Komisi & Poin</TabsTrigger>
          <TabsTrigger value="login-analytics" className="text-xs">Analitik Login</TabsTrigger>
          <TabsTrigger value="daily-trends" className="text-xs">Tren Harian</TabsTrigger>
          <TabsTrigger value="commission-rewards" className="text-xs">Komisi Hadiah</TabsTrigger>
          <TabsTrigger value="points-rewards" className="text-xs">Poin Hadiah</TabsTrigger>
          <TabsTrigger value="reward-summary" className="text-xs">Ringkasan Hadiah</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly-curve">
          <Card>
            <CardHeader>
              <CardTitle>Kurva Login Per Jam (24 Jam) - Bar Chart dengan Detail Reseller</CardTitle>
              <p className="text-sm text-muted-foreground">
                Distribusi login reseller sepanjang 24 jam dengan daftar lengkap nama dan waktu login
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loginByHour.map((hourData) => (
                  <Collapsible key={hourData.hour} className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 text-center font-mono text-sm">
                            {hourData.hour}
                          </div>
                          <div className="text-sm text-gray-600">
                            {hourData.count} login • {hourData.uniqueResellers} reseller
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">
                            {hourData.count}
                          </div>
                          {hourData.count > 0 && (
                            <CollapsibleTrigger className="p-1 hover:bg-gray-100 rounded">
                              <ChevronDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                          )}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-6">
                          <div 
                            className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-300" 
                            style={{ 
                              width: `${Math.max((hourData.count / maxHourlyLogins) * 100, 2)}%` 
                            }}
                          >
                            {hourData.count > 0 && (
                              <span>{hourData.count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {hourData.count > 0 && (
                      <CollapsibleContent className="mt-3">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Daftar Reseller Login pada {hourData.hour}:
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {hourData.logins.map((login, index) => (
                              <div key={login.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                                    {index + 1}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <p className="text-sm font-medium">{login.reseller_name}</p>
                                      <p className="text-xs text-gray-500">{login.reseller_phone}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    {new Date(login.login_time).toLocaleTimeString('id-ID', { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      second: '2-digit'
                                    })}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {login.login_method || 'password'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-products">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Produk Terlaris SEDEKAT App</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ranking produk berdasarkan data real dari order yang selesai
              </p>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="font-bold text-white">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-lg">{product.name}</p>
                          <p className="text-sm text-gray-500">Harga: {formatCurrency(product.price)}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {product.totalOrders} Order
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {product.totalQuantity} Terjual
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-green-600">{formatCurrency(product.totalRevenue)}</p>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada data produk terjual untuk periode yang dipilih</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reseller-commission">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Komisi & Poin Per Reseller (Data Real)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detail komisi, poin dari order selesai dan yang sudah ditukar hadiah untuk periode {selectedPeriod}
              </p>
            </CardHeader>
            <CardContent>
              {resellerCommissionReport.length > 0 ? (
                <div className="space-y-4">
                  {resellerCommissionReport.slice(0, 15).map((reseller) => (
                    <div key={reseller.id} className="p-4 border rounded-lg space-y-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-lg">{reseller.name}</p>
                          <p className="text-sm text-gray-500">{reseller.phone}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={reseller.is_active ? 'default' : 'secondary'}>
                            {reseller.is_active ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-gray-600">Total Order</p>
                          <p className="font-semibold text-blue-700 flex items-center">
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            {reseller.totalOrders}
                          </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-gray-600">Total Komisi</p>
                          <p className="font-semibold text-green-700">
                            {formatCurrency(reseller.totalCommission)}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="text-gray-600">Total Poin</p>
                          <p className="font-semibold text-purple-700 flex items-center">
                            <Award className="h-3 w-3 mr-1" />
                            {reseller.totalPoints.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-red-50 p-3 rounded">
                          <p className="text-gray-600">Komisi Ditukar</p>
                          <p className="font-semibold text-red-700">
                            {formatCurrency(reseller.commissionRedeemed)}
                          </p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded">
                          <p className="text-gray-600">Poin Ditukar</p>
                          <p className="font-semibold text-orange-700">
                            {reseller.pointsRedeemed.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-gray-600">Tersedia</p>
                          <p className="font-semibold text-gray-700 text-xs">
                            {formatCurrency(reseller.availableCommission)}
                            <br />
                            {reseller.availablePoints.toLocaleString()} poin
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada data reseller dengan order selesai untuk periode yang dipilih</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login-analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analitik Login Reseller Terbaru</CardTitle>
              <p className="text-sm text-muted-foreground">
                Data login terbaru dengan timestamp dan informasi reseller
              </p>
            </CardHeader>
            <CardContent>
              {filteredLoginHistory.length > 0 ? (
                <div className="space-y-4">
                  {filteredLoginHistory.slice(0, 15).map((login) => (
                    <div key={login.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{login.resellers?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{login.resellers?.phone || 'No phone'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Date(login.login_time).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(login.login_time).toLocaleDateString('id-ID')}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {login.login_method || 'password'}
                        </Badge>
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

        <TabsContent value="daily-trends">
          <Card>
            <CardHeader>
              <CardTitle>Tren Login Harian (7 Hari Terakhir)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pola login dalam 7 hari terakhir dengan visualisasi bar chart
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyLoginTrends.map((trend, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{trend.date}</p>
                        <p className="text-sm text-gray-500">{trend.uniqueResellers} reseller unik</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{trend.logins} login</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-300" 
                          style={{ 
                            width: `${Math.max((trend.logins / maxDailyLogins) * 100, 5)}%` 
                          }}
                        >
                          {trend.logins > 0 && maxDailyLogins > 10 && (
                            <span>{trend.logins}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission-rewards">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Komisi yang Sudah Ditukar Hadiah</CardTitle>
            </CardHeader>
            <CardContent>
              {redemptionsByType.commission.length > 0 ? (
                <div className="space-y-4">
                  {redemptionsByType.commission.map((redemption) => (
                    <div key={redemption.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{redemption.resellers?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{redemption.resellers?.phone}</p>
                        </div>
                        <Badge variant={
                          redemption.status === 'approved' ? 'default' : 
                          redemption.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {redemption.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Jumlah Ditukar</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(Number(redemption.amount_redeemed))}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Hadiah</p>
                          <p className="font-medium">{redemption.reward_description}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tanggal</p>
                          <p className="font-medium">
                            {new Date(redemption.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada penukaran komisi untuk periode yang dipilih</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points-rewards">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Poin yang Sudah Ditukar Hadiah</CardTitle>
            </CardHeader>
            <CardContent>
              {redemptionsByType.points.length > 0 ? (
                <div className="space-y-4">
                  {redemptionsByType.points.map((redemption) => (
                    <div key={redemption.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{redemption.resellers?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{redemption.resellers?.phone}</p>
                        </div>
                        <Badge variant={
                          redemption.status === 'approved' ? 'default' : 
                          redemption.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {redemption.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Poin Ditukar</p>
                          <p className="font-semibold text-purple-600">
                            {Number(redemption.amount_redeemed).toLocaleString()} poin
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Hadiah</p>
                          <p className="font-medium">{redemption.reward_description}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tanggal</p>
                          <p className="font-medium">
                            {new Date(redemption.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada penukaran poin untuk periode yang dipilih</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reward-summary">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Laporan Komisi dan Poin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Status Penukaran Hadiah</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>Pending</span>
                      </div>
                      <span className="font-semibold">{redemptionsByStatus.pending}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Disetujui</span>
                      </div>
                      <span className="font-semibold">{redemptionsByStatus.approved}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span>Ditolak</span>
                      </div>
                      <span className="font-semibold">{redemptionsByStatus.rejected}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Total Penukaran Periode Ini</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Komisi Ditukar</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatCurrency(totalCommissionRedeemed)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Poin Ditukar</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {totalPointsRedeemed.toLocaleString()} poin
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Transaksi Penukaran</p>
                      <p className="text-2xl font-bold text-gray-700">
                        {filteredRedemptions.length}
                      </p>
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

export default SedekatAppReports;
