
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Calendar
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
  const { data: customers } = useCustomers();
  const { data: branches } = useBranches();
  const { data: sales } = useSales();
  const { data: surveys } = useSurveys();

  const { startDate, endDate } = getDateRange(selectedPeriod, customStartDate, customEndDate);

  // Filter data berdasarkan periode
  const filteredCustomers = filterDataByDateRange(customers || [], 'created_at', startDate, endDate);
  const filteredSurveys = filterDataByDateRange(surveys || [], 'created_at', startDate, endDate);

  // Statistik utama
  const totalCustomers = filteredCustomers.length;
  const totalDeals = filteredCustomers.filter(c => c.status === 'deal').length;
  const totalFollowUps = filteredCustomers.filter(c => c.status === 'follow_up').length;
  const conversionRate = totalCustomers > 0 ? (totalDeals / totalCustomers) * 100 : 0;

  // Tren conversion rate
  const conversionTrends = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substring(0, 7);
    
    const monthCustomers = filteredCustomers.filter(customer => 
      customer.created_at.startsWith(monthKey)
    );
    const monthDeals = monthCustomers.filter(c => c.status === 'deal');
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
    const monthDeals = monthCustomers.filter(c => c.status === 'deal');
    
    return {
      month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      customers: monthCustomers.length,
      deals: monthDeals.length
    };
  }).reverse();

  // Status pelanggan
  const customerStatusCounts = {
    prospect: filteredCustomers.filter(c => c.status === 'prospect').length,
    follow_up: filteredCustomers.filter(c => c.status === 'follow_up').length,
    deal: filteredCustomers.filter(c => c.status === 'deal').length,
    cancelled: filteredCustomers.filter(c => c.status === 'cancelled').length
  };

  // Performance cabang
  const branchPerformance = branches?.map(branch => {
    const branchCustomers = filteredCustomers.filter(c => c.branch_id === branch.id);
    const branchDeals = branchCustomers.filter(c => c.status === 'deal');
    const branchRate = branchCustomers.length > 0 ? (branchDeals.length / branchCustomers.length) * 100 : 0;
    
    return {
      ...branch,
      customers: branchCustomers.length,
      deals: branchDeals.length,
      conversionRate: branchRate
    };
  }).sort((a, b) => b.deals - a.deals) || [];

  // Performance sales
  const salesPerformance = sales?.map(sale => {
    const saleCustomers = filteredCustomers.filter(c => c.sales_id === sale.id);
    const saleDeals = saleCustomers.filter(c => c.status === 'deal');
    const saleRate = saleCustomers.length > 0 ? (saleDeals.length / saleCustomers.length) * 100 : 0;
    
    return {
      ...sale,
      customers: saleCustomers.length,
      deals: saleDeals.length,
      conversionRate: saleRate
    };
  }).sort((a, b) => b.deals - a.deals) || [];

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

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="trends">Tren</TabsTrigger>
          <TabsTrigger value="conversion">Konversi</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="branches">Cabang</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="surveys">Survei</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tren Bulanan Pelanggan & Deal</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Tren Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
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
              <div className="space-y-3">
                {branchPerformance.map((branch, index) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Performance Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesPerformance.map((sale, index) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surveys">
          <Card>
            <CardHeader>
              <CardTitle>Detail Hasil Survei Per Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {surveyDetails.map((survey) => (
                  <div key={survey.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{survey.customer?.name}</p>
                        <p className="text-sm text-gray-500">{survey.customer?.phone}</p>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneralReports;
