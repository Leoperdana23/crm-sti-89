
import React from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useResellerStats } from '@/hooks/useResellerApp';
import { useResellerOrders } from '@/hooks/useResellerOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, DollarSign, Users, Package } from 'lucide-react';

interface ResellerReportsProps {
  reseller: ResellerSession;
}

const ResellerReports: React.FC<ResellerReportsProps> = ({ reseller }) => {
  const { data: stats, isLoading: statsLoading } = useResellerStats(reseller.id);
  const { data: orders, isLoading: ordersLoading } = useResellerOrders(reseller.id);

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

  // Calculate additional metrics using correct commission rate
  const completedOrders = (orders || []).filter(order => order.status === 'selesai');
  const totalCustomers = new Set((orders || []).map(order => order.customer_name)).size;
  const averageOrderValue = completedOrders.length > 0 
    ? completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / completedOrders.length
    : 0;

  // Calculate commission using reseller's commission rate
  const totalCommissionEarned = completedOrders.reduce((total, order) => {
    return total + ((order.total_amount || 0) * (reseller.commission_rate / 100));
  }, 0);

  const currentMonthOrders = (orders || []).filter(order => {
    const orderDate = new Date(order.created_at);
    const currentDate = new Date();
    return orderDate.getMonth() === currentDate.getMonth() && 
           orderDate.getFullYear() === currentDate.getFullYear();
  });

  const currentMonthCommission = currentMonthOrders
    .filter(order => order.status === 'selesai')
    .reduce((total, order) => {
      return total + ((order.total_amount || 0) * (reseller.commission_rate / 100));
    }, 0);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Laporan Komisi</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              Total Komisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(totalCommissionEarned)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Package className="h-4 w-4 mr-2 text-blue-500" />
              Order Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {completedOrders.length}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              Total Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">
                {totalCustomers}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
              Rata-rata Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(averageOrderValue)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breakdown Komisi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rate Komisi:</span>
              <span className="font-semibold">{reseller.commission_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Komisi Bulan Ini:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(currentMonthCommission)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order Bulan Ini:</span>
              <span className="font-semibold">{currentMonthOrders.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Poin:</span>
              <span className="font-semibold text-blue-600">{reseller.total_points || 0} poin</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Commission Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Terbaru</CardTitle>
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
              {(orders || []).slice(0, 5).map((order) => {
                const commission = (order.total_amount || 0) * (reseller.commission_rate / 100);
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

      {(orders || []).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Belum ada data komisi</p>
        </div>
      )}
    </div>
  );
};

export default ResellerReports;
