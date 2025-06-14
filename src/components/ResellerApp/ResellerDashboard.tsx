
import React from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, Clock, Star, ExternalLink } from 'lucide-react';
import { useResellerOrders } from '@/hooks/useResellerOrders';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useResellerBalance } from '@/hooks/useResellerApp';

interface ResellerDashboardProps {
  reseller: ResellerSession;
  onTabChange: (tab: 'dashboard' | 'catalog' | 'orders' | 'reports' | 'profile' | 'help') => void;
}

const ResellerDashboard: React.FC<ResellerDashboardProps> = ({ reseller, onTabChange }) => {
  const { data: orders = [] } = useResellerOrders(reseller.id);
  const { data: appSettings } = useAppSettings();
  const { data: balance } = useResellerBalance(reseller.id);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  
  // Count completed orders by quantity of items, not just order count
  const completedOrdersQty = orders
    .filter(order => order.status === 'selesai')
    .reduce((sum, order) => {
      if (order.order_items) {
        return sum + order.order_items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }
      return sum;
    }, 0);
  
  // Use calculated commission from balance hook instead of order sum
  const totalCommission = balance?.remainingCommission || 0;
  const totalPoints = balance?.remainingPoints || 0;
  
  // Calculate total quantity and average order
  const totalQuantity = orders.reduce((sum, order) => {
    if (order.order_items) {
      return sum + order.order_items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }
    return sum;
  }, 0);
  
  const averageOrder = totalOrders > 0 ? Math.round((balance?.totalCommission || 0) / totalOrders) : 0;

  const siteName = appSettings?.catalog?.siteName || 'SEDEKAT App';
  const welcomeText = appSettings?.catalog?.welcomeText || 'Jadikan belanjamu banyak untung';
  const bannerUrl = appSettings?.catalog?.bannerUrl || '';
  const secondaryColor = appSettings?.catalog?.secondaryColor || '#059669';

  return (
    <div className="p-4 space-y-6">
      {/* Banner Section */}
      {bannerUrl ? (
        <div className="relative">
          <img 
            src={bannerUrl} 
            alt="Banner Promo" 
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
            <h2 className="text-white text-lg font-bold text-center px-4">
              Promo Spesial Hari Ini!
            </h2>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent 
            className="p-6 text-center rounded-lg" 
            style={{ backgroundColor: secondaryColor }}
          >
            <h2 className="text-xl font-bold text-white mb-2">{siteName}</h2>
            <p className="text-white opacity-90">{welcomeText}</p>
          </CardContent>
        </Card>
      )}

      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selamat Datang, {reseller.name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
              <div className="text-sm text-gray-600">Sisa Poin</div>
              {balance && balance.redeemedPoints > 0 && (
                <div className="text-xs text-gray-500">
                  Sudah ditukar: {balance.redeemedPoints}
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Rp {totalCommission.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Sisa Komisi</div>
              {balance && balance.redeemedCommission > 0 && (
                <div className="text-xs text-gray-500">
                  Sudah ditukar: Rp {balance.redeemedCommission.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Qty Pesanan</p>
                <p className="text-2xl font-bold">{totalQuantity}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Order</p>
                <p className="text-2xl font-bold">Rp {averageOrder.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-2xl font-bold">{completedOrdersQty}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full justify-start"
            onClick={() => onTabChange('catalog')}
          >
            <Package className="h-4 w-4 mr-2" />
            Lihat Katalog Produk
          </Button>
          
          <Button 
            variant="outline"
            className="w-full justify-start"
            onClick={() => onTabChange('orders')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Cek Status Pesanan
          </Button>

          <Button 
            variant="outline"
            className="w-full justify-start"
            onClick={() => onTabChange('reports')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Lihat Laporan
          </Button>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">Pesanan #{order.id.slice(-8)}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Rp {order.commission_amount.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'selesai' ? 'bg-green-100 text-green-800' :
                      order.status === 'proses' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResellerDashboard;
