import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import { useSurveys } from '@/hooks/useSurveys';
import { Users, ShoppingCart, DollarSign, TrendingUp, Star, Calendar, Package, Award } from 'lucide-react';
import DateRangeFilter from './DateRangeFilter';
import { getDateRange, filterDataByDateRange } from '@/utils/dateFilters';

interface GeneralReportsProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartDateChange: (date: string) => void;
  onCustomEndDateChange: (date: string) => void;
}

const GeneralReports: React.FC<GeneralReportsProps> = ({
  selectedPeriod,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomStartDateChange,
  onCustomEndDateChange
}) => {
  const { data: customers } = useCustomers();
  const { data: orders } = useOrders();
  const { surveys, getAverageRatings } = useSurveys();
  const surveyAverages = getAverageRatings();

  const { startDate, endDate } = getDateRange(selectedPeriod, customStartDate, customEndDate);

  // Filter data berdasarkan periode
  const filteredCustomers = filterDataByDateRange(customers || [], 'created_at', startDate, endDate);
  const filteredOrders = filterDataByDateRange(orders || [], 'created_at', startDate, endDate);

  // Statistik dasar
  const totalCustomers = filteredCustomers.length;
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Statistik tambahan
  const completedOrders = filteredOrders.filter(order => order.status === 'selesai').length;
  const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
  const processingOrders = filteredOrders.filter(order => order.status === 'diproses').length;

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
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Pelanggan baru periode ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Order</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Order periode ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Revenue periode ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">Nilai rata-rata per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Order */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Status Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
              <p className="text-sm text-gray-600">Selesai</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{processingOrders}</p>
              <p className="text-sm text-gray-600">Diproses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{pendingOrders}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Survey Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Analitik Survei Kepuasan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{surveyAverages.service_technician.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Pelayanan Teknisi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{surveyAverages.service_sales.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Pelayanan Sales/CS</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{surveyAverages.product_quality.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Kualitas Produk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{surveyAverages.usage_clarity.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Kejelasan Penggunaan</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{surveyAverages.recommendationRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Tingkat Rekomendasi</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold">Rating Keseluruhan: {surveyAverages.overall.toFixed(1)}/10</p>
            <p className="text-sm text-gray-500">Berdasarkan {surveys.length} survei yang telah selesai</p>
          </div>
        </CardContent>
      </Card>

      {/* Tren Bulanan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ringkasan Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Periode:</span>
              <span className="font-medium">
                {selectedPeriod === 'custom' 
                  ? `${customStartDate} - ${customEndDate}`
                  : selectedPeriod.replace('_', ' ').toUpperCase()
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Conversion Rate:</span>
              <span className="font-medium">
                {totalCustomers > 0 ? ((totalOrders / totalCustomers) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Completion Rate:</span>
              <span className="font-medium">
                {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralReports;
