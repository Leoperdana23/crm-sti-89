import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Handshake, 
  Phone, 
  TrendingUp, 
  Building,
  UserCheck,
  MessageSquare,
  Star,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
  ThumbsUp,
  BarChart3
} from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';
import { useSurveys } from '@/hooks/useSurveys';
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
  const { customers, loading: customersLoading, error: customersError } = useCustomers();
  const { branches, loading: branchesLoading, error: branchesError } = useBranches();
  const { sales, loading: salesLoading, error: salesError } = useSales();
  const { surveys, loading: surveysLoading, error: surveysError } = useSurveys();

  const { startDate, endDate } = getDateRange(selectedPeriod, customStartDate, customEndDate);

  console.log('GeneralReports - Data status:', {
    customers: customers?.length || 0,
    branches: branches?.length || 0,
    sales: sales?.length || 0,
    surveys: surveys?.length || 0,
    selectedPeriod,
    dateRange: { startDate, endDate }
  });

  // Handle loading state
  if (customersLoading || branchesLoading || salesLoading || surveysLoading) {
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
  if (customersError || branchesError || salesError || surveysError) {
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
              <span>Error memuat data laporan. Silakan refresh halaman.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter data berdasarkan periode dengan proper typing
  const filteredCustomers = customers ? filterDataByDateRange(customers, 'created_at', startDate, endDate) : [];
  const filteredSurveys = surveys ? filterDataByDateRange(surveys, 'created_at', startDate, endDate) : [];

  // Statistik utama
  const totalCustomers = filteredCustomers.length;
  const totalDeals = filteredCustomers.filter(c => c.status === 'Deal').length;
  const totalFollowUps = filteredCustomers.filter(c => c.status === 'Follow-up').length;
  const conversionRate = totalCustomers > 0 ? (totalDeals / totalCustomers) * 100 : 0;

  // Survey analytics
  const totalSurveys = filteredSurveys.length;
  const averageRatings = filteredSurveys.length > 0 ? {
    product_quality: filteredSurveys.reduce((sum, s) => sum + s.product_quality, 0) / filteredSurveys.length,
    service_technician: filteredSurveys.reduce((sum, s) => sum + s.service_technician, 0) / filteredSurveys.length,
    service_sales: filteredSurveys.reduce((sum, s) => sum + s.service_sales, 0) / filteredSurveys.length,
    usage_clarity: filteredSurveys.reduce((sum, s) => sum + s.usage_clarity, 0) / filteredSurveys.length,
  } : { product_quality: 0, service_technician: 0, service_sales: 0, usage_clarity: 0 };

  const overallRating = Object.values(averageRatings).reduce((sum, rating) => sum + rating, 0) / 4;
  const priceApprovalRate = filteredSurveys.length > 0 ? 
    (filteredSurveys.filter(s => s.price_approval).length / filteredSurveys.length) * 100 : 0;

  // Tren conversion rate
  const conversionTrends = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substring(0, 7);
    
    const monthCustomers = filteredCustomers.filter(customer => 
      customer.created_at.startsWith(monthKey)
    );
    const monthDeals = monthCustomers.filter(c => c.status === 'Deal');
    const rate = monthCustomers.length > 0 ? (monthDeals.length / monthCustomers.length) * 100 : 0;
    
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      customers: monthCustomers.length,
      deals: monthDeals.length,
      rate
    };
  }).reverse();

  // Tren bulanan pelanggan & deal
  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substring(0, 7);
    
    const monthCustomers = filteredCustomers.filter(customer => 
      customer.created_at.startsWith(monthKey)
    );
    const monthDeals = monthCustomers.filter(c => c.status === 'Deal');
    
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      customers: monthCustomers.length,
      deals: monthDeals.length
    };
  }).reverse();

  // Status pelanggan
  const customerStatusCounts = {
    prospect: filteredCustomers.filter(c => c.status === 'Prospek').length,
    follow_up: filteredCustomers.filter(c => c.status === 'Follow-up').length,
    deal: filteredCustomers.filter(c => c.status === 'Deal').length,
    cancelled: filteredCustomers.filter(c => c.status === 'Tidak Jadi').length
  };

  // Performance cabang
  const branchPerformance = (branches || []).map(branch => {
    const branchCustomers = filteredCustomers.filter(c => c.branch_id === branch.id);
    const branchDeals = branchCustomers.filter(c => c.status === 'Deal');
    const branchRate = branchCustomers.length > 0 ? (branchDeals.length / branchCustomers.length) * 100 : 0;
    
    return {
      ...branch,
      customers: branchCustomers.length,
      deals: branchDeals.length,
      conversionRate: branchRate
    };
  }).sort((a, b) => b.deals - a.deals);

  // Performance sales
  const salesPerformance = (sales || []).map(sale => {
    const saleCustomers = filteredCustomers.filter(c => c.sales_id === sale.id);
    const saleDeals = saleCustomers.filter(c => c.status === 'Deal');
    const saleRate = saleCustomers.length > 0 ? (saleDeals.length / saleCustomers.length) * 100 : 0;
    
    return {
      ...sale,
      customers: saleCustomers.length,
      deals: saleDeals.length,
      conversionRate: saleRate
    };
  }).sort((a, b) => b.deals - a.deals);

  // Detail hasil survei
  const surveyDetails = filteredSurveys.map(survey => {
    const customer = customers?.find(c => c.id === survey.customer_id);
    const avgRating = (survey.product_quality + survey.service_technician + survey.service_sales + survey.usage_clarity) / 4;
    
    return {
      ...survey,
      customer,
      avgRating
    };
  });

  // Survey analytics by rating levels
  const ratingDistribution = {
    excellent: filteredSurveys.filter(s => {
      const avg = (s.product_quality + s.service_technician + s.service_sales + s.usage_clarity) / 4;
      return avg >= 4.5;
    }).length,
    good: filteredSurveys.filter(s => {
      const avg = (s.product_quality + s.service_technician + s.service_sales + s.usage_clarity) / 4;
      return avg >= 3.5 && avg < 4.5;
    }).length,
    average: filteredSurveys.filter(s => {
      const avg = (s.product_quality + s.service_technician + s.service_sales + s.usage_clarity) / 4;
      return avg >= 2.5 && avg < 3.5;
    }).length,
    poor: filteredSurveys.filter(s => {
      const avg = (s.product_quality + s.service_technician + s.service_sales + s.usage_clarity) / 4;
      return avg < 2.5;
    }).length
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      prospect: { label: 'Prospek', variant: 'secondary' as const },
      follow_up: { label: 'Follow Up', variant: 'default' as const },
      deal: { label: 'Deal', variant: 'default' as const },
      cancelled: { label: 'Batal', variant: 'destructive' as const }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
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
            <p className="text-xs text-muted-foreground">Pelanggan terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deal</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeals}</div>
            <p className="text-xs text-muted-foreground">Deal berhasil</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Follow-up</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFollowUps}</div>
            <p className="text-xs text-muted-foreground">Sedang follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Tingkat konversi</p>
          </CardContent>
        </Card>
      </div>

      {/* Survey Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Survei</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSurveys}</div>
            <p className="text-xs text-muted-foreground">Survei selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Rata-rata</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Dari 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Persetujuan Harga</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{priceApprovalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Menyetujui harga</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kepuasan Tinggi</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ratingDistribution.excellent}</div>
            <p className="text-xs text-muted-foreground">Rating ≥ 4.5</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="trends">Tren</TabsTrigger>
          <TabsTrigger value="conversion">Konversi</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="branches">Cabang</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="surveys">Survei</TabsTrigger>
          <TabsTrigger value="analytics">Analitik Survei</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tren Bulanan Pelanggan & Deal</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrends.length > 0 ? (
                <div className="space-y-4">
                  {monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{trend.month}</p>
                        <p className="text-sm text-gray-500">{trend.customers} pelanggan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{trend.deals} deal</p>
                        <p className="text-sm text-gray-500">
                          {trend.customers > 0 ? ((trend.deals / trend.customers) * 100).toFixed(1) : 0}% konversi
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada data untuk periode yang dipilih</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Tren Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {conversionTrends.length > 0 ? (
                <div className="space-y-4">
                  {conversionTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{trend.month}</p>
                        <p className="text-sm text-gray-500">{trend.customers} pelanggan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{trend.rate.toFixed(1)}%</p>
                        <p className="text-sm text-gray-500">{trend.deals} deal</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada data konversi untuk periode yang dipilih</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Status Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(customerStatusCounts).map(([status, count]) => {
                  const statusInfo = getStatusBadge(status);
                  return (
                    <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <div className="text-2xl font-bold">{count}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches">
          <Card>
            <CardHeader>
              <CardTitle>Performance Cabang</CardTitle>
            </CardHeader>
            <CardContent>
              {branchPerformance.length > 0 ? (
                <div className="space-y-3">
                  {branchPerformance.map((branch) => (
                    <div key={branch.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-gray-500">{branch.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{branch.deals} deal</p>
                        <p className="text-sm text-gray-500">{branch.conversionRate.toFixed(1)}% konversi</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada data cabang tersedia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Performance Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {salesPerformance.length > 0 ? (
                <div className="space-y-3">
                  {salesPerformance.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{sale.name}</p>
                          <p className="text-sm text-gray-500">{sale.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{sale.deals} deal</p>
                        <p className="text-sm text-gray-500">{sale.conversionRate.toFixed(1)}% konversi</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada data sales tersedia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys">
          <Card>
            <CardHeader>
              <CardTitle>Detail Hasil Survei Per Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              {surveyDetails.length > 0 ? (
                <div className="space-y-4">
                  {surveyDetails.map((survey) => (
                    <div key={survey.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{survey.customer?.name || 'Pelanggan tidak ditemukan'}</p>
                          <p className="text-sm text-gray-500">{survey.customer?.phone || '-'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{survey.avgRating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Kualitas Produk</p>
                          <p className="font-medium">{survey.product_quality}/5</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Teknisi</p>
                          <p className="font-medium">{survey.service_technician}/5</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sales</p>
                          <p className="font-medium">{survey.service_sales}/5</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Kejelasan</p>
                          <p className="font-medium">{survey.usage_clarity}/5</p>
                        </div>
                      </div>

                      {survey.testimonial && (
                        <div>
                          <p className="text-gray-500 text-sm">Testimoni:</p>
                          <p className="text-sm italic">"{survey.testimonial}"</p>
                        </div>
                      )}

                      {survey.suggestions && (
                        <div>
                          <p className="text-gray-500 text-sm">Saran:</p>
                          <p className="text-sm">{survey.suggestions}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Persetujuan Harga: {survey.price_approval ? 'Ya' : 'Tidak'}
                        </span>
                        <span className="text-gray-500">
                          {new Date(survey.deal_date).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada data survei untuk periode yang dipilih</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Rating Kepuasan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center space-x-3">
                      <ThumbsUp className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Sangat Puas (4.5-5.0)</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">{ratingDistribution.excellent}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Puas (3.5-4.4)</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600">{ratingDistribution.good}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Cukup (2.5-3.4)</span>
                    </div>
                    <div className="text-xl font-bold text-yellow-600">{ratingDistribution.average}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Kurang (<2.5)</span>
                    </div>
                    <div className="text-xl font-bold text-red-600">{ratingDistribution.poor}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Rata-rata per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Kualitas Produk</span>
                      <span className="font-bold">{averageRatings.product_quality.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(averageRatings.product_quality / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Layanan Teknisi</span>
                      <span className="font-bold">{averageRatings.service_technician.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(averageRatings.service_technician / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Layanan Sales</span>
                      <span className="font-bold">{averageRatings.service_sales.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${(averageRatings.service_sales / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Kejelasan Penggunaan</span>
                      <span className="font-bold">{averageRatings.usage_clarity.toFixed(1)}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(averageRatings.usage_clarity / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-lg">Rating Keseluruhan</span>
                      <span className="font-bold text-xl">{overallRating.toFixed(1)}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneralReports;
