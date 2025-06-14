
import React, { useState } from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useResellerStats } from '@/hooks/useResellerApp';
import { useResellerOrders } from '@/hooks/useResellerOrders';
import { useRewardRedemptions } from '@/hooks/useRewards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, Award, Package, Gift, Target } from 'lucide-react';

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

  // Average order value calculation (only completed orders)
  const averageOrderValue = completedOrders.length > 0 
    ? completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / completedOrders.length
    : 0;

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
              <Package className="h-4 w-4 mr-2 text-blue-500" />
              Order Selesai (1 Tahun)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {completedOrdersLastYear.length}
              </div>
            )}
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 mr-2 text-orange-500" />
              Total Nilai Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(totalOrderValue)}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Total nilai order selesai
            </p>
          </CardContent>
        </Card>
      </div>

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
