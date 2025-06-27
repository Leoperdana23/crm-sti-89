import React, { useEffect } from 'react';
import { ResellerSession } from '@/types/resellerApp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Package, Clock, Star, ExternalLink, MessageCircle, Gift, Zap, Target } from 'lucide-react';
import { useResellerOrders } from '@/hooks/useResellerOrders';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useContactSettings } from '@/hooks/useContactSettings';
import { usePromoBenefitSettings } from '@/hooks/usePromoBenefitSettings';
import { useQueryClient } from '@tanstack/react-query';
import { useRewardRedemptions } from '@/hooks/useRewards';
import RewardCatalogView from './RewardCatalogView';

interface ResellerDashboardProps {
  reseller: ResellerSession;
  onTabChange: (tab: 'dashboard' | 'catalog' | 'orders' | 'reports' | 'profile' | 'help') => void;
}

const ResellerDashboard: React.FC<ResellerDashboardProps> = ({ reseller, onTabChange }) => {
  const queryClient = useQueryClient();
  const { data: orders = [] } = useResellerOrders(reseller.id);
  const { data: appSettings } = useAppSettings();
  const { data: contactSettings } = useContactSettings();
  const { data: promoBenefitSettings } = usePromoBenefitSettings();
  const { data: allRedemptions } = useRewardRedemptions();

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['reseller-orders', reseller.id] });
      queryClient.invalidateQueries({ queryKey: ['reseller-balance', reseller.id] });
      queryClient.invalidateQueries({ queryKey: ['reward-catalog'] });
      queryClient.invalidateQueries({ queryKey: ['promo-benefit-settings'] });
    }, 5000);

    return () => clearInterval(interval);
  }, [queryClient, reseller.id]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  
  // Only count completed orders for all calculations
  const completedOrders = orders.filter(order => 
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

  // Calculate remaining balances (accurate calculation)
  const totalCommission = totalCommissionEarned - exchangedCommission;
  const totalPoints = totalPointsEarned - exchangedPoints;
  
  // Calculate total quantity and average order from completed orders only
  const totalQuantity = completedOrders.reduce((sum, order) => {
    if (order.order_items) {
      return sum + order.order_items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }
    return sum;
  }, 0);
  
  const averageOrder = completedOrders.length > 0 ? Math.round(totalCommissionEarned / completedOrders.length) : 0;

  const siteName = appSettings?.catalog?.siteName || 'SEDEKAT App';
  const welcomeText = promoBenefitSettings?.welcome_message || appSettings?.catalog?.welcomeText || 'Jadikan belanjamu banyak untung';
  const bannerUrl = appSettings?.catalog?.bannerUrl || '';
  const secondaryColor = appSettings?.catalog?.secondaryColor || '#059669';

  // Use promo benefit settings for display
  const promoTitle = promoBenefitSettings?.promo_title || 'Promo Khusus Bulan Ini';
  const promoDescription = promoBenefitSettings?.promo_description || '🎉 Target 10 Order = Bonus Komisi 50%\n🏆 Target 20 Order = Hadiah Spesial + Bonus Komisi 100%';
  const ctaButton1Text = promoBenefitSettings?.cta_button_1_text || 'Order Sekarang';
  const ctaButton2Text = promoBenefitSettings?.cta_button_2_text || 'Lihat Progress';
  const monthlyTarget10 = promoBenefitSettings?.monthly_target_10 || 50;
  const monthlyTarget20 = promoBenefitSettings?.monthly_target_20 || 100;
  const giftTarget10 = promoBenefitSettings?.gift_target_10 || 'Voucher Belanja Rp 100.000';
  const giftTarget20 = promoBenefitSettings?.gift_target_20 || 'Smartphone + Bonus Komisi 100%';

  const handleContactAdmin = () => {
    if (contactSettings?.whatsapp_number) {
      const message = encodeURIComponent('Halo admin, saya ingin menanyakan produk yang tidak ada di katalog.');
      const whatsappUrl = `https://wa.me/${contactSettings.whatsapp_number.replace(/\D/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto">
      {/* Banner Section - Responsive */}
      {bannerUrl ? (
        <div className="relative">
          <img 
            src={bannerUrl} 
            alt="Banner Promo" 
            className="w-full h-24 sm:h-32 lg:h-40 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
            <h2 className="text-white text-sm sm:text-lg lg:text-xl font-bold text-center px-4">
              Promo Spesial Hari Ini!
            </h2>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent 
            className="p-4 sm:p-6 text-center rounded-lg" 
            style={{ backgroundColor: secondaryColor }}
          >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2">{siteName}</h2>
            <p className="text-white opacity-90 text-sm sm:text-base">{welcomeText}</p>
          </CardContent>
        </Card>
      )}

      {/* Program Promo Section - Updated with gift information */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg flex items-center text-purple-800">
            <Gift className="h-5 w-5 mr-2" />
            Program Promo & Benefit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Bonus Komisi */}
            {promoBenefitSettings?.bonus_commission_enabled && (
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-purple-100">
                <div className="flex items-center mb-2">
                  <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                  <h4 className="font-semibold text-sm sm:text-base text-purple-800">Bonus Komisi</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Dapatkan komisi ekstra untuk setiap penjualan yang berhasil!
                </p>
                <div className="text-xs sm:text-sm font-medium text-purple-600">
                  Komisi Rate: {(reseller.commission_rate * 100).toFixed(1)}%
                </div>
              </div>
            )}

            {/* Sistem Poin */}
            {promoBenefitSettings?.points_system_enabled && (
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-purple-100">
                <div className="flex items-center mb-2">
                  <Target className="h-4 w-4 text-blue-500 mr-2" />
                  <h4 className="font-semibold text-sm sm:text-base text-purple-800">Sistem Poin</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  Kumpulkan poin dari setiap order dan tukar dengan hadiah menarik!
                </p>
                <div className="text-xs sm:text-sm font-medium text-blue-600">
                  Poin Anda: {totalPoints}
                </div>
              </div>
            )}
          </div>

          {/* Promo Khusus dengan Gift Information */}
          {promoBenefitSettings?.monthly_target_enabled && (
            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 sm:p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Gift className="h-4 w-4 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-sm sm:text-base text-orange-800">{promoTitle}</h4>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-lg sm:text-xl font-bold text-orange-600">
                    {completedOrders.length}/20
                  </div>
                  <div className="text-xs text-orange-600">Order Selesai</div>
                </div>
              </div>

              {/* Gift Targets */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🎉</span>
                    <span className="text-xs sm:text-sm font-medium text-orange-800">Target 10 Order:</span>
                  </div>
                  <span className="text-xs sm:text-sm text-orange-700 font-semibold">{giftTarget10}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">🏆</span>
                    <span className="text-xs sm:text-sm font-medium text-orange-800">Target 20 Order:</span>
                  </div>
                  <span className="text-xs sm:text-sm text-orange-700 font-semibold">{giftTarget20}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-orange-700 mb-1">
                  <span>Progress Target</span>
                  <span>{Math.min(100, (completedOrders.length / 20) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (completedOrders.length / 20) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={() => onTabChange('catalog')}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              <Package className="h-4 w-4 mr-2" />
              {ctaButton1Text}
            </Button>
            <Button
              onClick={() => onTabChange('reports')}
              variant="outline"
              className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
              size="sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {ctaButton2Text}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Section - Responsive grid */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg lg:text-xl">Selamat Datang, {reseller.name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{totalPoints}</div>
              <div className="text-xs sm:text-sm text-gray-600">Sisa Poin</div>
              {exchangedPoints > 0 && (
                <div className="text-[10px] sm:text-xs text-gray-500">
                  Sudah ditukar: {exchangedPoints}
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">Rp {totalCommission.toLocaleString()}</div>
              <div className="text-xs sm:text-sm text-gray-600">Sisa Komisi</div>
              {exchangedCommission > 0 && (
                <div className="text-[10px] sm:text-xs text-gray-500">
                  Sudah ditukar: Rp {exchangedCommission.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Admin Info */}
      {contactSettings?.whatsapp_number && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm sm:text-base text-blue-800 font-medium mb-1">
                  Produk tidak ditemukan?
                </p>
                <p className="text-xs sm:text-sm text-blue-600">
                  Jika produk yang Anda cari tidak ada, silakan menghubungi admin
                </p>
              </div>
              <Button
                onClick={handleContactAdmin}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reward Catalog View - Pass remaining balances */}
      <RewardCatalogView 
        reseller={reseller} 
        remainingCommission={totalCommission}
        remainingPoints={totalPoints}
      />

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-sm text-gray-600 truncate">Total Qty Pesanan</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{totalQuantity}</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-sm text-gray-600 truncate">Rata-rata Order</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold">Rp {averageOrder.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-sm text-gray-600 truncate">Menunggu</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{pendingOrders}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-gray-600 truncate">Selesai</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold">{completedOrders.length}</p>
              </div>
              <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Responsive buttons */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <Button 
            className="w-full justify-start text-sm sm:text-base h-10 sm:h-11"
            onClick={() => onTabChange('catalog')}
          >
            <Package className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Lihat Katalog Produk</span>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full justify-start text-sm sm:text-base h-10 sm:h-11"
            onClick={() => onTabChange('orders')}
          >
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Cek Status Pesanan</span>
          </Button>

          <Button 
            variant="outline"
            className="w-full justify-start text-sm sm:text-base h-10 sm:h-11"
            onClick={() => onTabChange('reports')}
          >
            <TrendingUp className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Lihat Laporan</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Orders - Responsive */}
      {orders.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">Pesanan #{order.id.slice(-8)}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm sm:text-base font-medium">Rp {order.commission_amount.toLocaleString()}</p>
                    <span className={`text-[10px] sm:text-xs px-2 py-1 rounded ${
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
