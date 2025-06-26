import React, { useState } from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useResellerStats } from '@/hooks/useResellerApp';
import { useResellerOrders } from '@/hooks/useResellerOrders';
import { useRewardRedemptions } from '@/hooks/useRewards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, Award, Package, Gift, Target, BarChart3, PieChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface ResellerReportsProps {
  reseller: ResellerSession;
}

const ResellerReports: React.FC<ResellerReportsProps> = ({ reseller }) => {
  const { data: stats, isLoading: statsLoading } = useResellerStats(reseller.id);
  const { data: orders, isLoading: ordersLoading } = useResellerOrders(reseller.id);
  const { data: allRedemptions } = useRewardRedemptions();
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Only count completed orders for all calculations
  const completedOrders = (orders || []).filter(order => 
    order.status === 'selesai' || order.status === 'completed'
  );

  // Calculate total commission from completed orders using product commission values
  const totalCommissionEarned = completedOrders.reduce((total, order) => {
    return total + (order.order_items || []).reduce((orderTotal, item) => {
      const productCommission = item.products?.commission_value || 0;
      return orderTotal + (productCommission * item.quantity);
    }, 0);
  }, 0);

  // Calculate total points from completed orders using product points values
  const totalPointsEarned = completedOrders.reduce((total, order) => {
    return total + (order.order_items || []).reduce((orderTotal, item) => {
      const productPoints = item.products?.points_value || 0;
      return orderTotal + (productPoints * item.quantity);
    }, 0);
  }, 0);

  // Calculate total order value from completed orders
  const totalOrderValue = completedOrders.reduce((total, order) => {
    return total + (order.total_amount || 0);
  }, 0);

  // Get redemption data for this reseller
  const resellerRedemptions = allRedemptions?.filter(
    (redemption: any) => redemption.reseller_id === reseller.id && redemption.status === 'approved'
  ) || [];

  // Calculate exchanged amounts from approved redemptions
  const exchangedCommission = resellerRedemptions
    .filter((r: any) => r.reward_type === 'commission')
    .reduce((sum: number, r: any) => sum + r.amount_redeemed, 0);

  const exchangedPoints = resellerRedemptions
    .filter((r: any) => r.reward_type === 'points')
    .reduce((sum: number, r: any) => sum + r.amount_redeemed, 0);

  // Calculate remaining balances
  const remainingCommission = totalCommissionEarned - exchangedCommission;
  const remainingPoints = totalPointsEarned - exchangedPoints;

  // Get orders from the last year for completed orders
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const completedOrdersLastYear = completedOrders.filter(order => 
    new Date(order.created_at) >= oneYearAgo
  );

  // Filter orders by period
  const getFilteredOrders = () => {
    if (selectedPeriod === 'all') return completedOrders;
    
    const now = new Date();
    return completedOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      
      switch (selectedPeriod) {
        case 'this_month':
          return orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear();
        case 'last_month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          return orderDate.getMonth() === lastMonth.getMonth() && 
                 orderDate.getFullYear() === lastMonth.getFullYear();
        case 'this_year':
          return orderDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();
  const filteredCommission = filteredOrders.reduce((total, order) => {
    return total + (order.order_items || []).reduce((orderTotal, item) => {
      const productCommission = item.products?.commission_value || 0;
      return orderTotal + (productCommission * item.quantity);
    }, 0);
  }, 0);

  const filteredPoints = filteredOrders.reduce((total, order) => {
    return total + (order.order_items || []).reduce((orderTotal, item) => {
      const productPoints = item.products?.points_value || 0;
      return orderTotal + (productPoints * item.quantity);
    }, 0);
  }, 0);

  const filteredOrderValue = filteredOrders.reduce((total, order) => {
    return total + (order.total_amount || 0);
  }, 0);

  // Prepare monthly achievement data (last 6 months)
  const getMonthlyData = () => {
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      
      const monthOrders = completedOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === month.getMonth() && 
               orderDate.getFullYear() === month.getFullYear();
      });
      
      const monthCommission = monthOrders.reduce((total, order) => {
        return total + (order.order_items || []).reduce((orderTotal, item) => {
          const productCommission = item.products?.commission_value || 0;
          return orderTotal + (productCommission * item.quantity);
        }, 0);
      }, 0);
      
      const monthPoints = monthOrders.reduce((total, order) => {
        return total + (order.order_items || []).reduce((orderTotal, item) => {
          const productPoints = item.products?.points_value || 0;
          return orderTotal + (productPoints * item.quantity);
        }, 0);
      }, 0);
      
      monthlyData.push({
        month: monthName,
        commission: monthCommission,
        points: monthPoints,
        orders: monthOrders.length
      });
    }
    
    return monthlyData;
  };

  // Prepare top products data
  const getTopProducts = () => {
    const productMap = new Map();
    
    completedOrders.forEach(order => {
      order.order_items?.forEach(item => {
        const productName = item.product_name;
        if (productMap.has(productName)) {
          const existing = productMap.get(productName);
          productMap.set(productName, {
            ...existing,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + item.subtotal
          });
        } else {
          productMap.set(productName, {
            name: productName,
            quantity: item.quantity,
            revenue: item.subtotal
          });
        }
      });
    });
    
    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const monthlyData = getMonthlyData();
  const topProducts = getTopProducts();

  // Chart colors
  const COLORS = ['#16a34a', '#059669', '#0d9488', '#0891b2', '#3b82f6'];

  const chartConfig = {
    commission: {
      label: "Komisi",
      color: "#16a34a",
    },
    points: {
      label: "Poin",
      color: "#3b82f6",
    },
    orders: {
      label: "Pesanan",
      color: "#f59e0b",
    },
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Laporan Pencapaian</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              Sisa Komisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(remainingCommission)}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Tersisa setelah ditukar hadiah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Award className="h-4 w-4 mr-2 text-purple-500" />
              Sisa Poin
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">
                {remainingPoints}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Tersisa setelah ditukar hadiah
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Achievement Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
            Pencapaian Bulanan (6 Bulan Terakhir)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="commission" 
                  fill="#16a34a" 
                  name="Komisi (Rp)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Commission vs Points Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Tren Komisi dan Poin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="commission" 
                  stroke="#16a34a" 
                  strokeWidth={3}
                  name="Komisi (Rp)"
                  dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Poin"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Products Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-orange-500" />
            Produk Terlaris
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[250px]">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={topProducts}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="quantity"
                    >
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-600 mb-3">Top 5 Produk:</h4>
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {product.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{product.quantity} unit</div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Gift className="h-5 w-5 mr-2 text-pink-500" />
            Informasi Penukaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Komisi Diperoleh:</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalCommissionEarned)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Poin Diperoleh:</p>
              <p className="text-lg font-bold text-blue-600">{totalPointsEarned} poin</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Komisi Ditukar:</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(exchangedCommission)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Poin Ditukar:</p>
              <p className="text-lg font-bold text-red-600">{exchangedPoints} poin</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breakdown Pencapaian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Periode</SelectItem>
                  <SelectItem value="this_month">Bulan Ini</SelectItem>
                  <SelectItem value="last_month">Bulan Lalu</SelectItem>
                  <SelectItem value="this_year">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Komisi Periode Ini:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(filteredCommission)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Poin Periode Ini:</span>
                <span className="font-semibold text-blue-600">{filteredPoints} poin</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Nilai Order Periode Ini:</span>
                <span className="font-semibold text-orange-600">{formatCurrency(filteredOrderValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Selesai Periode Ini:</span>
                <span className="font-semibold">{filteredOrders.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Commission Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Terbaru (Selesai)</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.slice(0, 5).map((order) => {
                const commission = (order.order_items || []).reduce((total, item) => {
                  const productCommission = item.products?.commission_value || 0;
                  return total + (productCommission * item.quantity);
                }, 0);
                const points = (order.order_items || []).reduce((total, item) => {
                  const productPoints = item.products?.points_value || 0;
                  return total + (productPoints * item.quantity);
                }, 0);
                
                return (
                  <div key={order.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-sm">
                        {formatCurrency(commission)}
                      </p>
                      <p className="text-xs text-blue-600">
                        {points} poin
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(order.total_amount || 0)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redemption History */}
      {resellerRedemptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Penukaran Hadiah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resellerRedemptions.map((redemption: any) => (
                <div key={redemption.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{redemption.reward_description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(redemption.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600 text-sm">
                      -{redemption.reward_type === 'points' 
                        ? `${redemption.amount_redeemed} Poin`
                        : formatCurrency(redemption.amount_redeemed)
                      }
                    </p>
                    <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Disetujui
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Belum ada order selesai untuk periode ini</p>
        </div>
      )}
    </div>
  );
};

export default ResellerReports;
