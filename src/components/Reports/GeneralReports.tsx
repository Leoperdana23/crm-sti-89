
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders } from '@/hooks/useOrders';
import { useSurveys } from '@/hooks/useSurveys';
import { useBranches } from '@/hooks/useBranches';
import { Users, ShoppingCart, DollarSign, TrendingUp, Star, Calendar, Package, Award, MessageCircle, User, Phone, MapPin, Cake, Building, Clock, CheckCircle } from 'lucide-react';
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
  const { branches } = useBranches();
  const surveyAverages = getAverageRatings();

  const { startDate, endDate } = getDateRange(selectedPeriod, customStartDate, customEndDate);

  // Filter data berdasarkan periode
  const filteredCustomers = filterDataByDateRange(customers || [], 'created_at', startDate, endDate);
  const filteredOrders = filterDataByDateRange(orders || [], 'created_at', startDate, endDate);
  const filteredSurveys = filterDataByDateRange(surveys || [], 'created_at', startDate, endDate);

  // Statistik Pelanggan
  const totalCustomers = customers?.length || 0;
  const totalCustomersFiltered = filteredCustomers.length;
  
  // Status Follow-up
  const followUpStats = {
    prospek: customers?.filter(c => c.status === 'Prospek').length || 0,
    followUp: customers?.filter(c => c.status === 'Follow-up').length || 0,
    cold: customers?.filter(c => c.status === 'Cold').length || 0,
    warm: customers?.filter(c => c.status === 'Warm').length || 0,
    hot: customers?.filter(c => c.status === 'Hot').length || 0,
    deal: customers?.filter(c => c.status === 'Deal').length || 0,
    tidakJadi: customers?.filter(c => c.status === 'Tidak Jadi').length || 0,
  };

  // Statistik Pekerjaan
  const workStats = {
    notStarted: customers?.filter(c => c.work_status === 'not_started').length || 0,
    inProgress: customers?.filter(c => c.work_status === 'in_progress').length || 0,
    completed: customers?.filter(c => c.work_status === 'completed').length || 0,
    cancelled: customers?.filter(c => c.work_status === 'cancelled').length || 0,
  };

  // Ulang Tahun (dalam 30 hari ke depan)
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  const upcomingBirthdays = customers?.filter(customer => {
    if (!customer.birth_date) return false;
    const birthDate = new Date(customer.birth_date);
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    return thisYearBirthday >= today && thisYearBirthday <= thirtyDaysFromNow;
  }) || [];

  // Statistik Survei
  const totalSurveys = surveys?.length || 0;
  const surveysCompleted = customers?.filter(c => c.survey_status === 'sudah_disurvei').length || 0;
  const surveyCompletionRate = totalCustomers > 0 ? (surveysCompleted / totalCustomers) * 100 : 0;

  // Performa Sales Deal
  const salesWithBranches = customers?.map(customer => {
    const branch = branches?.find(b => b.id === customer.branch_id);
    return {
      ...customer,
      branch_name: branch?.name || 'Tidak Diketahui'
    };
  }) || [];

  const salesPerformance = branches?.map(branch => {
    const branchCustomers = salesWithBranches.filter(c => c.branch_id === branch.id);
    const totalProspects = branchCustomers.length;
    const dealCount = branchCustomers.filter(c => c.status === 'Deal').length;
    const conversionRate = totalProspects > 0 ? (dealCount / totalProspects) * 100 : 0;
    
    return {
      branchName: branch.name,
      totalProspects,
      dealCount,
      conversionRate: conversionRate.toFixed(1)
    };
  }) || [];

  // Calculate average work duration for completed work
  const completedWork = customers?.filter(c => 
    c.work_status === 'completed' && 
    c.work_start_date && 
    c.work_completed_date
  ) || [];

  const averageWorkDuration = completedWork.length > 0 
    ? completedWork.reduce((acc, customer) => {
        const startDate = new Date(customer.work_start_date!);
        const endDate = new Date(customer.work_completed_date!);
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return acc + duration;
      }, 0) / completedWork.length
    : 0;

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

      {/* Statistik Pelanggan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Statistik Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{totalCustomers}</p>
              <p className="text-sm text-gray-600">Total Pelanggan</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{totalCustomersFiltered}</p>
              <p className="text-sm text-gray-600">Periode Dipilih</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Follow-up */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Status Follow-up Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{followUpStats.prospek}</p>
              <p className="text-xs text-gray-500">Prospek</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{followUpStats.followUp}</p>
              <p className="text-xs text-gray-500">Follow-up</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{followUpStats.cold}</p>
              <p className="text-xs text-gray-500">Cold</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{followUpStats.warm}</p>
              <p className="text-xs text-gray-500">Warm</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{followUpStats.hot}</p>
              <p className="text-xs text-gray-500">Hot</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{followUpStats.deal}</p>
              <p className="text-xs text-gray-500">Deal</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-500">{followUpStats.tidakJadi}</p>
              <p className="text-xs text-gray-500">Tidak Jadi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Pekerjaan & Waktu Pengerjaan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Status Pekerjaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{workStats.notStarted}</p>
                <p className="text-sm text-gray-600">Belum Mulai</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{workStats.inProgress}</p>
                <p className="text-sm text-gray-600">Dalam Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{workStats.completed}</p>
                <p className="text-sm text-gray-600">Selesai</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{workStats.cancelled}</p>
                <p className="text-sm text-gray-600">Dibatalkan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Waktu Pengerjaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{averageWorkDuration.toFixed(1)}</p>
                <p className="text-sm text-gray-600">Rata-rata Hari Pengerjaan</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedWork.length}</p>
                <p className="text-sm text-gray-600">Pekerjaan Selesai</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ulang Tahun */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5" />
            Ulang Tahun (30 Hari Mendatang)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-2xl font-bold text-purple-600 text-center">{upcomingBirthdays.length}</p>
            <p className="text-sm text-gray-600 text-center">Pelanggan Berulang Tahun</p>
          </div>
          {upcomingBirthdays.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {upcomingBirthdays.slice(0, 5).map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <Badge variant="outline">
                    {new Date(customer.birth_date!).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </Badge>
                </div>
              ))}
              {upcomingBirthdays.length > 5 && (
                <p className="text-center text-sm text-gray-500">
                  +{upcomingBirthdays.length - 5} lainnya
                </p>
              )}
            </div>
          )}
          {upcomingBirthdays.length === 0 && (
            <p className="text-center text-gray-500">Tidak ada ulang tahun dalam 30 hari ke depan</p>
          )}
        </CardContent>
      </Card>

      {/* Statistik Survei */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Status Survei Kepuasan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalSurveys}</p>
              <p className="text-sm text-gray-600">Total Survei Selesai</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{surveysCompleted}</p>
              <p className="text-sm text-gray-600">Pelanggan Sudah Disurvei</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{surveyCompletionRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Tingkat Partisipasi</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold">Rating Keseluruhan: {surveyAverages.overall.toFixed(1)}/10</p>
            <p className="text-sm text-gray-500">Tingkat Rekomendasi: {surveyAverages.recommendationRate.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Performa Sales Deal per Cabang */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Performa Sales Deal per Cabang
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesPerformance.map((branch) => (
              <div key={branch.branchName} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{branch.branchName}</h4>
                  <Badge variant={parseFloat(branch.conversionRate) >= 50 ? "default" : "secondary"}>
                    {branch.conversionRate}% Konversi
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{branch.totalProspects}</p>
                    <p className="text-xs text-gray-600">Total Prospek</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{branch.dealCount}</p>
                    <p className="text-xs text-gray-600">Deal Tercapai</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">{branch.conversionRate}%</p>
                    <p className="text-xs text-gray-600">Tingkat Konversi</p>
                  </div>
                </div>
              </div>
            ))}
            {salesPerformance.length === 0 && (
              <p className="text-center text-gray-500">Tidak ada data cabang</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ringkasan Periode */}
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
              <span>Periode Laporan:</span>
              <span className="font-medium">
                {selectedPeriod === 'custom' 
                  ? `${customStartDate} - ${customEndDate}`
                  : selectedPeriod.replace('_', ' ').toUpperCase()
                }
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Data Pelanggan:</span>
              <span className="font-medium">{totalCustomers} Pelanggan</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Conversion Rate ke Deal:</span>
              <span className="font-medium">
                {totalCustomers > 0 ? ((followUpStats.deal / totalCustomers) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Completion Rate Pekerjaan:</span>
              <span className="font-medium">
                {(workStats.notStarted + workStats.inProgress + workStats.completed + workStats.cancelled) > 0 
                  ? ((workStats.completed / (workStats.notStarted + workStats.inProgress + workStats.completed + workStats.cancelled)) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralReports;
