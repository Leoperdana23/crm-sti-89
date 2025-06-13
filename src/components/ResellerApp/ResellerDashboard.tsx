
import React from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { useResellerStats } from '@/hooks/useResellerApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ShoppingBag, Award, DollarSign, Package, ShoppingCart } from 'lucide-react';

interface ResellerDashboardProps {
  reseller: ResellerSession;
  onTabChange: (tab: 'dashboard' | 'catalog' | 'orders' | 'reports' | 'profile' | 'help') => void;
}

const ResellerDashboard: React.FC<ResellerDashboardProps> = ({ reseller, onTabChange }) => {
  const { data: stats, isLoading: loading } = useResellerStats(reseller.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Selamat datang, {reseller.name}!</h2>
        <p className="text-green-100">
          Kelola bisnis reseller Anda dengan mudah
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2 text-blue-500" />
              Total Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {stats?.total_orders || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              Total Komisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(stats?.total_commission || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
              Order Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">
                {stats?.current_month_orders || 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Award className="h-4 w-4 mr-2 text-purple-500" />
              Total Poin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {reseller.total_points}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onTabChange('catalog')}
              className="p-4 bg-blue-50 rounded-lg text-center text-blue-700 hover:bg-blue-100"
            >
              <Package className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Lihat Katalog</div>
            </button>
            <button 
              onClick={() => onTabChange('orders')}
              className="p-4 bg-green-50 rounded-lg text-center text-green-700 hover:bg-green-100"
            >
              <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
              <div className="text-sm font-medium">Riwayat Order</div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">INFORMASI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Rate Komisi Anda:</span>
            <span className="text-xl font-bold text-green-600">
              {reseller.commission_rate}%
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Update di halaman backend secara manual informasi terintegrasi
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResellerDashboard;
