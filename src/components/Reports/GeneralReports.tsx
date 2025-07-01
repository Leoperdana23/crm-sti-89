
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import { useSurveys } from '@/hooks/useSurveys';
import { Users, ShoppingCart, DollarSign, TrendingUp, Star, Calendar, Package, Award, MessageCircle, User, Phone, MapPin } from 'lucide-react';
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
  const { customers } = useCustomers();
  const { data: orders } = useOrders();
  const { surveys, getAverageRatings } = useSurveys();
  const surveyAverages = getAverageRatings();

  const { startDate, endDate } = getDateRange(selectedPeriod, customStartDate, customEndDate);

  // Filter data berdasarkan periode
  const filteredCustomers = filterDataByDateRange(customers || [], 'created_at', startDate, endDate);
  const filteredOrders = filterDataByDateRange(orders || [], 'created_at', startDate, endDate);
  const filteredSurveys = filterDataByDateRange(surveys || [], 'created_at', startDate, endDate);

  // Statistik dasar
  const totalCustomers = filteredCustomers.length;
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Statistik tambahan
  const completedOrders = filteredOrders.filter(order => order.status === 'selesai').length;
  const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
  const processingOrders = filteredOrders.filter(order => order.status === 'diproses').length;

  // Survey statistics untuk periode yang dipilih
  const totalSurveysInPeriod = filteredSurveys.length;
  const surveysWithTestimonials = filteredSurveys.filter(s => s.testimonial && s.testimonial.trim()).length;
  const surveysWithSuggestions = filteredSurveys.filter(s => s.suggestions && s.suggestions.trim()).length;
  const recommendationsInPeriod = filteredSurveys.filter(s => s.price_approval).length;
  const recommendationRateInPeriod = totalSurveysInPeriod > 0 ? (recommendationsInPeriod / totalSurveysInPeriod) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get detailed customer survey data
  const getCustomerSurveyDetails = () => {
    return filteredSurveys.map(survey => {
      const customer = customers?.find(c => c.id === survey.customer_id);
      return {
        ...survey,
        customer_name: customer?.name || 'Tidak Diketahui',
        customer_phone: customer?.phone || '-',
        customer_address: customer?.address || '-',
        average_rating: (survey.service_technician + survey.service_sales + survey.product_quality + survey.usage_clarity) / 4
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const customerSurveyDetails = getCustomerSurveyDetails();

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

      {/* Survey Analytics Section - Periode Spesifik */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Analitik Survei Kepuasan - Periode Dipilih
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalSurveysInPeriod}</p>
              <p className="text-sm text-gray-600">Total Survei</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{surveysWithTestimonials}</p>
              <p className="text-sm text-gray-600">Testimoni</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{surveysWithSuggestions}</p>
              <p className="text-sm text-gray-600">Saran & Kritik</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{recommendationRateInPeriod.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Tingkat Rekomendasi</p>
            </div>
          </div>

          {totalSurveysInPeriod > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {filteredSurveys.length > 0 ? (filteredSurveys.reduce((sum, s) => sum + s.service_technician, 0) / filteredSurveys.length).toFixed(1) : '0.0'}
                </p>
                <p className="text-sm text-gray-600">Pelayanan Teknisi</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {filteredSurveys.length > 0 ? (filteredSurveys.reduce((sum, s) => sum + s.service_sales, 0) / filteredSurveys.length).toFixed(1) : '0.0'}
                </p>
                <p className="text-sm text-gray-600">Pelayanan Sales/CS</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {filteredSurveys.length > 0 ? (filteredSurveys.reduce((sum, s) => sum + s.product_quality, 0) / filteredSurveys.length).toFixed(1) : '0.0'}
                </p>
                <p className="text-sm text-gray-600">Kualitas Produk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {filteredSurveys.length > 0 ? (filteredSurveys.reduce((sum, s) => sum + s.usage_clarity, 0) / filteredSurveys.length).toFixed(1) : '0.0'}
                </p>
                <p className="text-sm text-gray-600">Kejelasan Penggunaan</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Survey Analytics Section - Keseluruhan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Analitik Survei Kepuasan - Keseluruhan
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
            <p className="text-sm text-gray-500">Berdasarkan {surveys?.length || 0} survei yang telah selesai</p>
          </div>
        </CardContent>
      </Card>

      {/* Detail Hasil Survei Per Pelanggan */}
      {customerSurveyDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detail Hasil Survei Per Pelanggan - Periode Dipilih
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {customerSurveyDetails.map((survey) => (
                <div key={survey.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  {/* Customer Info Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-900">{survey.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{survey.customer_phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(survey.created_at).toLocaleDateString('id-ID')}
                      </Badge>
                      <Badge 
                        variant={survey.price_approval ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {survey.price_approval ? "Merekomendasikan" : "Tidak Merekomendasikan"}
                      </Badge>
                    </div>
                  </div>

                  {/* Customer Address */}
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{survey.customer_address}</span>
                  </div>

                  {/* Rating Details */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                    <div className="text-center bg-blue-50 p-2 rounded">
                      <div className="text-lg font-semibold text-blue-600">{survey.service_technician}</div>
                      <div className="text-xs text-gray-600">Teknisi</div>
                    </div>
                    <div className="text-center bg-green-50 p-2 rounded">
                      <div className="text-lg font-semibold text-green-600">{survey.service_sales}</div>
                      <div className="text-xs text-gray-600">Sales/CS</div>
                    </div>
                    <div className="text-center bg-purple-50 p-2 rounded">
                      <div className="text-lg font-semibold text-purple-600">{survey.product_quality}</div>
                      <div className="text-xs text-gray-600">Produk</div>
                    </div>
                    <div className="text-center bg-orange-50 p-2 rounded">
                      <div className="text-lg font-semibold text-orange-600">{survey.usage_clarity}</div>
                      <div className="text-xs text-gray-600">Penggunaan</div>
                    </div>
                    <div className="text-center bg-yellow-50 p-2 rounded">
                      <div className="text-lg font-semibold text-yellow-600">{survey.average_rating.toFixed(1)}</div>
                      <div className="text-xs text-gray-600">Rata-rata</div>
                    </div>
                  </div>

                  {/* Testimonial */}
                  {survey.testimonial && survey.testimonial.trim() && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Testimoni:</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                        <p className="text-sm text-gray-700 italic">"{survey.testimonial}"</p>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {survey.suggestions && survey.suggestions.trim() && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">Saran & Kritik:</span>
                      </div>
                      <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                        <p className="text-sm text-gray-700">{survey.suggestions}</p>
                      </div>
                    </div>
                  )}

                  {/* Deal Date */}
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Tanggal Deal: {new Date(survey.deal_date).toLocaleDateString('id-ID')}</span>
                      <span>ID Survei: {survey.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {customerSurveyDetails.length > 10 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Menampilkan semua {customerSurveyDetails.length} hasil survei untuk periode ini
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimoni & Saran Terbaru dari Periode */}
      {filteredSurveys.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Testimoni */}
          {filteredSurveys.filter(s => s.testimonial && s.testimonial.trim()).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Testimoni Periode Ini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredSurveys
                    .filter(s => s.testimonial && s.testimonial.trim())
                    .slice(0, 3)
                    .map((survey) => (
                      <div key={survey.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50 rounded-r">
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(survey.created_at).toLocaleDateString('id-ID')}
                        </div>
                        <p className="text-sm italic">"{survey.testimonial}"</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saran & Kritik */}
          {filteredSurveys.filter(s => s.suggestions && s.suggestions.trim()).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Saran & Kritik Periode Ini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredSurveys
                    .filter(s => s.suggestions && s.suggestions.trim())
                    .slice(0, 3)
                    .map((survey) => (
                      <div key={survey.id} className="border-l-4 border-orange-500 pl-3 py-2 bg-orange-50 rounded-r">
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(survey.created_at).toLocaleDateString('id-ID')}
                        </div>
                        <p className="text-sm">{survey.suggestions}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
            <div className="flex justify-between items-center">
              <span>Survey Response Rate:</span>
              <span className="font-medium">
                {totalCustomers > 0 ? ((totalSurveysInPeriod / totalCustomers) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralReports;
