import React, { useState, useMemo } from 'react';
import { FileText, TrendingUp, Building, Users, Target, Award, Download, Star, MessageSquare, Eye, Printer, Calendar, Clock, CheckCircle, Play, BarChart3, CalendarDays } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useCustomers } from '@/hooks/useCustomers';
import { useSurveys } from '@/hooks/useSurveys';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, isAfter, isBefore, startOfDay, endOfDay, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

const Reports = () => {
  const { customers, getStatsByBranch } = useCustomers();
  const { surveys, getAverageRatings } = useSurveys();
  const { branches } = useBranches();
  const { sales } = useSales();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('6months');
  
  // New date filtering states
  const [dateFilterType, setDateFilterType] = useState<string>('preset'); // 'preset', 'month', 'custom'
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Function to filter data based on date criteria
  const filterDataByDate = (items: any[]) => {
    if (dateFilterType === 'preset') {
      // Use existing time filter logic
      const now = new Date();
      let filterStartDate = new Date();
      
      switch (timeFilter) {
        case '1month':
          filterStartDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterStartDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          filterStartDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          filterStartDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'all':
        default:
          return items;
      }

      return items.filter(item => {
        const dateValue = item.created_at || item.deal_date;
        if (!dateValue) return false;
        
        const itemDate = new Date(dateValue);
        return isValid(itemDate) && itemDate >= filterStartDate;
      });
    } else if (dateFilterType === 'month') {
      // Filter by selected month
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      
      return items.filter(item => {
        const dateValue = item.created_at || item.deal_date;
        if (!dateValue) return false;
        
        const itemDate = new Date(dateValue);
        return isValid(itemDate) && itemDate >= monthStart && itemDate <= monthEnd;
      });
    } else if (dateFilterType === 'custom' && startDate && endDate) {
      // Filter by custom date range
      const rangeStart = startOfDay(startDate);
      const rangeEnd = endOfDay(endDate);
      
      return items.filter(item => {
        const dateValue = item.created_at || item.deal_date;
        if (!dateValue) return false;
        
        const itemDate = new Date(dateValue);
        return isValid(itemDate) && itemDate >= rangeStart && itemDate <= rangeEnd;
      });
    }
    
    return items;
  };

  // Apply date filtering to customers
  const filteredCustomers = useMemo(() => {
    let filtered = selectedBranch === 'all' 
      ? customers 
      : customers.filter(c => c.branch_id === selectedBranch);
    
    return filterDataByDate(filtered);
  }, [customers, selectedBranch, dateFilterType, timeFilter, selectedMonth, startDate, endDate]);

  // Apply date filtering to surveys
  const filteredSurveys = useMemo(() => {
    return filterDataByDate(surveys);
  }, [surveys, dateFilterType, timeFilter, selectedMonth, startDate, endDate]);

  const branchStats = getStatsByBranch(selectedBranch === 'all' ? undefined : selectedBranch);
  const averageRatings = getAverageRatings();

  // Work Process Analytics
  const getWorkProcessStats = () => {
    const dealCustomers = filteredCustomers.filter(c => c.status === 'Deal');
    const notStarted = dealCustomers.filter(c => !c.work_status || c.work_status === 'not_started').length;
    const inProgress = dealCustomers.filter(c => c.work_status === 'in_progress').length;
    const completed = dealCustomers.filter(c => c.work_status === 'completed').length;
    
    return {
      total: dealCustomers.length,
      notStarted,
      inProgress,
      completed,
      completionRate: dealCustomers.length > 0 ? ((completed / dealCustomers.length) * 100).toFixed(1) : '0'
    };
  };

  const workProcessStats = getWorkProcessStats();

  // Work Duration Analysis
  const getWorkDurationAnalysis = () => {
    const completedWork = filteredCustomers.filter(c => 
      c.status === 'Deal' && 
      c.work_status === 'completed' && 
      c.work_start_date && 
      c.work_completed_date
    );

    const durationData = completedWork.map(customer => {
      const startDate = new Date(customer.work_start_date!);
      const endDate = new Date(customer.work_completed_date!);
      const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        id: customer.id,
        name: customer.name,
        estimatedDays: customer.estimated_days || 0,
        actualDays: durationInDays,
        variance: durationInDays - (customer.estimated_days || 0),
        onTime: durationInDays <= (customer.estimated_days || 0),
        branchName: branches.find(b => b.id === customer.branch_id)?.name || 'Unknown'
      };
    });

    const avgDuration = durationData.length > 0 
      ? (durationData.reduce((sum, item) => sum + item.actualDays, 0) / durationData.length).toFixed(1)
      : '0';
    
    const onTimeCount = durationData.filter(item => item.onTime).length;
    const onTimeRate = durationData.length > 0 
      ? ((onTimeCount / durationData.length) * 100).toFixed(1)
      : '0';

    return {
      totalCompleted: durationData.length,
      avgDuration,
      onTimeRate,
      durationData
    };
  };

  const workDurationAnalysis = getWorkDurationAnalysis();

  // Survey Readiness Analysis
  const getSurveyReadinessStats = () => {
    const dealCustomers = filteredCustomers.filter(c => c.status === 'Deal');
    const readyForSurvey = dealCustomers.filter(c => c.work_status === 'completed');
    const completedSurveys = filteredSurveys.filter(s => s.is_completed);
    const pendingSurveys = readyForSurvey.filter(c => !completedSurveys.find(s => s.customer_id === c.id));

    return {
      totalDeal: dealCustomers.length,
      readyForSurvey: readyForSurvey.length,
      completedSurveys: completedSurveys.length,
      pendingSurveys: pendingSurveys.length,
      surveyCompletionRate: readyForSurvey.length > 0 
        ? ((completedSurveys.length / readyForSurvey.length) * 100).toFixed(1)
        : '0'
    };
  };

  const surveyReadinessStats = getSurveyReadinessStats();

  // Data untuk sales performance chart
  const getSalesPerformanceData = () => {
    const salesPerformance = sales.map(salesPerson => {
      let salesCustomers = filteredCustomers.filter(c => c.sales_id === salesPerson.id);

      const totalCustomers = salesCustomers.length;
      const prospek = salesCustomers.filter(c => c.status === 'Prospek').length;
      const followUp = salesCustomers.filter(c => c.status === 'Follow-up').length;
      const deal = salesCustomers.filter(c => c.status === 'Deal').length;
      const tidakJadi = salesCustomers.filter(c => c.status === 'Tidak Jadi').length;
      const conversionRate = totalCustomers > 0 ? ((deal / totalCustomers) * 100) : 0;

      return {
        name: salesPerson.name,
        code: salesPerson.code,
        totalCustomers,
        Prospek: prospek,
        'Follow-up': followUp,
        Deal: deal,
        'Tidak Jadi': tidakJadi,
        'Conversion Rate': conversionRate,
        branch: branches.find(b => b.id === salesPerson.branch_id)?.name || 'Tidak ada cabang'
      };
    }).filter(sales => sales.totalCustomers > 0);

    return salesPerformance;
  };

  const salesPerformanceData = getSalesPerformanceData();

  // Data untuk chart konversi pelanggan
  const conversionData = branches.map(branch => {
    const branchCustomers = filteredCustomers.filter(c => c.branch_id === branch.id);
    const total = branchCustomers.length;
    const prospek = branchCustomers.filter(c => c.status === 'Prospek').length;
    const followUp = branchCustomers.filter(c => c.status === 'Follow-up').length;
    const deal = branchCustomers.filter(c => c.status === 'Deal').length;
    const tidakJadi = branchCustomers.filter(c => c.status === 'Tidak Jadi').length;
    
    return {
      branch: branch.code,
      name: branch.name,
      Prospek: prospek,
      'Follow-up': followUp,
      Deal: deal,
      'Tidak Jadi': tidakJadi,
      'Conversion Rate': total > 0 ? ((deal / total) * 100).toFixed(1) : 0
    };
  });

  // Data untuk pie chart status pelanggan
  const statusData = [
    { name: 'Prospek', value: filteredCustomers.filter(c => c.status === 'Prospek').length, color: '#3B82F6' },
    { name: 'Follow-up', value: filteredCustomers.filter(c => c.status === 'Follow-up').length, color: '#F59E0B' },
    { name: 'Deal', value: filteredCustomers.filter(c => c.status === 'Deal').length, color: '#10B981' },
    { name: 'Tidak Jadi', value: filteredCustomers.filter(c => c.status === 'Tidak Jadi').length, color: '#EF4444' },
  ];

  // Data untuk trend pelanggan bulanan
  const monthlyData = React.useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthCustomers = filteredCustomers.filter(customer => {
        const dateValue = customer.created_at;
        if (!dateValue) return false;
        
        const customerDate = new Date(dateValue);
        return isValid(customerDate) && customerDate.toISOString().slice(0, 7) === monthKey;
      });

      last6Months.push({
        month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        total: monthCustomers.length,
        deal: monthCustomers.filter(c => c.status === 'Deal').length,
        prospek: monthCustomers.filter(c => c.status === 'Prospek').length,
        followUp: monthCustomers.filter(c => c.status === 'Follow-up').length,
      });
    }
    return last6Months;
  }, [filteredCustomers]);

  // Work Process Chart Data
  const workProcessData = branches.map(branch => {
    const branchCustomers = filteredCustomers.filter(c => c.branch_id === branch.id && c.status === 'Deal');
    const notStarted = branchCustomers.filter(c => !c.work_status || c.work_status === 'not_started').length;
    const inProgress = branchCustomers.filter(c => c.work_status === 'in_progress').length;
    const completed = branchCustomers.filter(c => c.work_status === 'completed').length;
    
    return {
      branch: branch.code,
      name: branch.name,
      'Belum Mulai': notStarted,
      'Sedang Dikerjakan': inProgress,
      'Selesai': completed
    };
  });

  // Data untuk tabel detail survei per pelanggan
  const detailedSurveyData = React.useMemo(() => {
    const completedSurveys = filteredSurveys.filter(survey => survey.is_completed);
    
    return completedSurveys.map(survey => {
      const customer = customers.find(c => c.id === survey.customer_id);
      const branch = branches.find(b => b.id === customer?.branch_id);
      
      return {
        ...survey,
        customerName: customer?.name || 'Unknown',
        customerPhone: customer?.phone || '-',
        customerAddress: customer?.address || '-',
        customerIdNumber: customer?.id_number || '-',
        branchName: branch?.name || 'Unknown',
        branchCode: branch?.code || '-',
        overallRating: ((survey.service_technician + survey.service_sales + survey.product_quality + survey.usage_clarity) / 4).toFixed(1)
      };
    }).filter(survey => {
      if (selectedBranch === 'all') return true;
      const customer = customers.find(c => c.id === survey.customer_id);
      return customer?.branch_id === selectedBranch;
    });
  }, [filteredSurveys, customers, branches, selectedBranch]);

  const calculateConversionRate = (branch?: string) => {
    const customers = branch 
      ? filteredCustomers.filter(c => c.branch_id === branch)
      : filteredCustomers;
    
    const total = customers.length;
    const deals = customers.filter(c => c.status === 'Deal').length;
    return total > 0 ? ((deals / total) * 100).toFixed(1) : '0';
  };

  const exportReport = () => {
    const csvData = [
      ['Laporan CRM Lengkap', ''],
      ['Tanggal Export', new Date().toLocaleDateString('id-ID')],
      ['Cabang', selectedBranch === 'all' ? 'Semua Cabang' : branches.find(b => b.id === selectedBranch)?.name],
      ['Filter Periode', getFilterDescription()],
      [''],
      ['STATISTIK PELANGGAN', ''],
      ['Total Pelanggan', filteredCustomers.length],
      ['Prospek', filteredCustomers.filter(c => c.status === 'Prospek').length],
      ['Follow-up', filteredCustomers.filter(c => c.status === 'Follow-up').length],
      ['Deal', filteredCustomers.filter(c => c.status === 'Deal').length],
      ['Tidak Jadi', filteredCustomers.filter(c => c.status === 'Tidak Jadi').length],
      ['Conversion Rate', calculateConversionRate() + '%'],
      [''],
      ['STATISTIK PROSES PEKERJAAN', ''],
      ['Total Deal', workProcessStats.total],
      ['Belum Mulai', workProcessStats.notStarted],
      ['Sedang Dikerjakan', workProcessStats.inProgress],
      ['Selesai', workProcessStats.completed],
      ['Tingkat Penyelesaian', workProcessStats.completionRate + '%'],
      [''],
      ['ANALISIS DURASI PEKERJAAN', ''],
      ['Total Pekerjaan Selesai', workDurationAnalysis.totalCompleted],
      ['Rata-rata Durasi (hari)', workDurationAnalysis.avgDuration],
      ['Tingkat Ketepatan Waktu', workDurationAnalysis.onTimeRate + '%'],
      [''],
      ['STATISTIK SURVEI', ''],
      ['Siap Survei', surveyReadinessStats.readyForSurvey],
      ['Survei Selesai', surveyReadinessStats.completedSurveys],
      ['Survei Tertunda', surveyReadinessStats.pendingSurveys],
      ['Tingkat Penyelesaian Survei', surveyReadinessStats.surveyCompletionRate + '%'],
      [''],
      ['RATA-RATA RATING SURVEI', ''],
      ...(averageRatings ? [
        ['Pelayanan Teknisi', averageRatings.serviceTechnician.toFixed(1)],
        ['Pelayanan Sales/CS', averageRatings.serviceSales.toFixed(1)],
        ['Kualitas Produk', averageRatings.productQuality.toFixed(1)],
        ['Kejelasan Penggunaan', averageRatings.usageClarity.toFixed(1)],
        ['Persetujuan Harga', averageRatings.priceApprovalRate.toFixed(1) + '%'],
      ] : [['Belum ada data survei', '']])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-crm-lengkap-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const getFilterDescription = () => {
    if (dateFilterType === 'preset') {
      const filterLabels = {
        '1month': '1 Bulan Terakhir',
        '3months': '3 Bulan Terakhir',
        '6months': '6 Bulan Terakhir',
        '1year': '1 Tahun Terakhir',
        'all': 'Semua Waktu'
      };
      return filterLabels[timeFilter as keyof typeof filterLabels] || 'Semua Waktu';
    } else if (dateFilterType === 'month') {
      return `Bulan ${format(selectedMonth, 'MMMM yyyy')}`;
    } else if (dateFilterType === 'custom' && startDate && endDate) {
      return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
    }
    return 'Semua Waktu';
  };

  const printSurveyDetail = (survey: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detail Survei - ${survey.customerName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .info-section { margin-bottom: 25px; }
            .info-title { font-weight: bold; color: #333; margin-bottom: 10px; font-size: 18px; }
            .info-row { display: flex; margin-bottom: 8px; }
            .info-label { font-weight: bold; width: 200px; }
            .rating-section { margin: 20px 0; }
            .rating-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
            .rating-item { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .rating-score { font-size: 24px; font-weight: bold; color: #2563eb; }
            .testimonial-section { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #2563eb; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DETAIL HASIL SURVEI KEPUASAN PELANGGAN</h1>
            <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
          </div>
          
          <div class="info-section">
            <div class="info-title">INFORMASI PELANGGAN</div>
            <div class="info-row">
              <span class="info-label">Nama:</span>
              <span>${survey.customerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">No. Telepon:</span>
              <span>${survey.customerPhone}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Alamat:</span>
              <span>${survey.customerAddress}</span>
            </div>
            <div class="info-row">
              <span class="info-label">No. KTP/Identitas:</span>
              <span>${survey.customerIdNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Cabang:</span>
              <span>${survey.branchName} (${survey.branchCode})</span>
            </div>
            <div class="info-row">
              <span class="info-label">Tanggal Deal:</span>
              <span>${new Date(survey.deal_date).toLocaleDateString('id-ID')}</span>
            </div>
          </div>

          <div class="rating-section">
            <div class="info-title">HASIL PENILAIAN</div>
            <div class="info-row">
              <span class="info-label">Rating Keseluruhan:</span>
              <span class="rating-score">${survey.overallRating}/10</span>
            </div>
            
            <div class="rating-grid">
              <div class="rating-item">
                <strong>Pelayanan Teknisi</strong><br>
                <span class="rating-score">${survey.service_technician}/10</span>
              </div>
              <div class="rating-item">
                <strong>Pelayanan Sales/CS</strong><br>
                <span class="rating-score">${survey.service_sales}/10</span>
              </div>
              <div class="rating-item">
                <strong>Kualitas Produk</strong><br>
                <span class="rating-score">${survey.product_quality}/10</span>
              </div>
              <div class="rating-item">
                <strong>Kejelasan Penggunaan</strong><br>
                <span class="rating-score">${survey.usage_clarity}/10</span>
              </div>
            </div>
            
            <div class="info-row">
              <span class="info-label">Persetujuan Harga:</span>
              <span style="font-weight: bold; color: ${survey.price_approval ? '#10b981' : '#ef4444'}">
                ${survey.price_approval ? 'Ya' : 'Tidak'}
              </span>
            </div>
          </div>

          ${survey.testimonial ? `
            <div class="testimonial-section">
              <div class="info-title">TESTIMONI</div>
              <p>${survey.testimonial}</p>
            </div>
          ` : ''}

          ${survey.suggestions ? `
            <div class="testimonial-section">
              <div class="info-title">SARAN & KRITIK</div>
              <p>${survey.suggestions}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const SurveyPreviewDialog = ({ survey }: { survey: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview Detail Survei - {survey.customerName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Informasi Pelanggan</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Nama:</strong> {survey.customerName}</div>
              <div><strong>No. Telepon:</strong> {survey.customerPhone}</div>
              <div><strong>Alamat:</strong> {survey.customerAddress}</div>
              <div><strong>No. KTP:</strong> {survey.customerIdNumber}</div>
              <div><strong>Cabang:</strong> {survey.branchName} ({survey.branchCode})</div>
              <div><strong>Tanggal Deal:</strong> {new Date(survey.deal_date).toLocaleDateString('id-ID')}</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Hasil Penilaian</h3>
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="font-semibold">Rating Keseluruhan: {survey.overallRating}/10</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded">
                <div className="font-medium">Pelayanan Teknisi</div>
                <div className="text-2xl font-bold text-blue-600">{survey.service_technician}/10</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Pelayanan Sales/CS</div>
                <div className="text-2xl font-bold text-green-600">{survey.service_sales}/10</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Kualitas Produk</div>
                <div className="text-2xl font-bold text-purple-600">{survey.product_quality}/10</div>
              </div>
              <div className="p-3 border rounded">
                <div className="font-medium">Kejelasan Penggunaan</div>
                <div className="text-2xl font-bold text-orange-600">{survey.usage_clarity}/10</div>
              </div>
            </div>
            
            <div className="mt-4">
              <strong>Persetujuan Harga: </strong>
              <Badge variant={survey.price_approval ? "default" : "destructive"}>
                {survey.price_approval ? 'Ya' : 'Tidak'}
              </Badge>
            </div>
          </div>

          {survey.testimonial && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Testimoni</h3>
              <div className="p-4 bg-gray-50 rounded border-l-4 border-blue-500">
                {survey.testimonial}
              </div>
            </div>
          )}

          {survey.suggestions && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Saran & Kritik</h3>
              <div className="p-4 bg-gray-50 rounded border-l-4 border-orange-500">
                {survey.suggestions}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan & Analitik Lengkap</h1>
          <p className="text-gray-600 mt-1">Analisis komprehensif semua data mulai dari pelanggan, pekerjaan, hingga survei</p>
        </div>
        <div className="flex space-x-4">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48">
              <Building className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Pilih Cabang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Cabang</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5" />
            <span>Filter Periode Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipe Filter</label>
              <Select value={dateFilterType} onValueChange={setDateFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tipe Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preset">Filter Preset</SelectItem>
                  <SelectItem value="month">Filter per Bulan</SelectItem>
                  <SelectItem value="custom">Periode Kustom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateFilterType === 'preset' && (
              <div>
                <label className="block text-sm font-medium mb-2">Periode Preset</label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter Waktu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">1 Bulan Terakhir</SelectItem>
                    <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                    <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
                    <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
                    <SelectItem value="all">Semua Waktu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {dateFilterType === 'month' && (
              <div>
                <label className="block text-sm font-medium mb-2">Pilih Bulan</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedMonth && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedMonth ? format(selectedMonth, "MMMM yyyy") : "Pilih bulan"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedMonth}
                      onSelect={(date) => date && setSelectedMonth(date)}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {dateFilterType === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Tanggal Mulai</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tanggal Selesai</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Pilih tanggal"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Filter aktif:</strong> {getFilterDescription()} | 
              <strong> Total data:</strong> {filteredCustomers.length} pelanggan, {filteredSurveys.filter(s => s.is_completed).length} survei
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCustomers.length}</div>
            <Badge variant="secondary" className="mt-2">
              {selectedBranch === 'all' ? 'Semua Cabang' : branches.find(b => b.id === selectedBranch)?.code}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{calculateConversionRate()}%</div>
            <p className="text-xs text-muted-foreground">
              {filteredCustomers.filter(c => c.status === 'Deal').length} dari {filteredCustomers.length} pelanggan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Penyelesaian</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{workProcessStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {workProcessStats.completed} dari {workProcessStats.total} deal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Durasi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{workDurationAnalysis.avgDuration}</div>
            <p className="text-xs text-muted-foreground">
              hari per pekerjaan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ketepatan Waktu</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{workDurationAnalysis.onTimeRate}%</div>
            <p className="text-xs text-muted-foreground">
              pekerjaan tepat waktu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Rata-rata</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {averageRatings ? ((averageRatings.serviceTechnician + averageRatings.serviceSales + averageRatings.productQuality + averageRatings.usageClarity) / 4).toFixed(1) : '0'}/10
            </div>
            <p className="text-xs text-muted-foreground">
              kepuasan pelanggan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Work Process Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-blue-600" />
              <span>Siap Mulai</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{workProcessStats.notStarted}</div>
            <p className="text-sm text-gray-600 mt-2">Deal belum mulai dikerjakan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Sedang Dikerjakan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{workProcessStats.inProgress}</div>
            <p className="text-sm text-gray-600 mt-2">Pekerjaan dalam progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Selesai</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{workProcessStats.completed}</div>
            <p className="text-sm text-gray-600 mt-2">Pekerjaan sudah selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* Work Process Analysis by Branch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Analisis Proses Pekerjaan per Cabang</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={workProcessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => {
                  const branch = workProcessData.find(b => b.branch === label);
                  return `${branch?.name} (${label})`;
                }}
              />
              <Legend />
              <Bar dataKey="Belum Mulai" stackId="a" fill="#3B82F6" />
              <Bar dataKey="Sedang Dikerjakan" stackId="a" fill="#F59E0B" />
              <Bar dataKey="Selesai" stackId="a" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Work Duration Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Analisis Durasi Pekerjaan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workDurationAnalysis.durationData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada pekerjaan yang selesai pada periode yang dipilih
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Cabang</TableHead>
                  <TableHead>Estimasi (hari)</TableHead>
                  <TableHead>Aktual (hari)</TableHead>
                  <TableHead>Selisih</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workDurationAnalysis.durationData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.branchName}</TableCell>
                    <TableCell>{item.estimatedDays || '-'}</TableCell>
                    <TableCell>{item.actualDays}</TableCell>
                    <TableCell>
                      <span className={item.variance <= 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.variance > 0 ? '+' : ''}{item.variance} hari
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.onTime ? "default" : "destructive"}>
                        {item.onTime ? 'Tepat Waktu' : 'Terlambat'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Survey Readiness Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Siap Survei</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{surveyReadinessStats.readyForSurvey}</div>
            <p className="text-sm text-gray-600">Pekerjaan selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Survei Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{surveyReadinessStats.completedSurveys}</div>
            <p className="text-sm text-gray-600">Sudah mengisi survei</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Survei Tertunda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{surveyReadinessStats.pendingSurveys}</div>
            <p className="text-sm text-gray-600">Belum mengisi survei</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tingkat Partisipasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{surveyReadinessStats.surveyCompletionRate}%</div>
            <p className="text-sm text-gray-600">Rate penyelesaian survei</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Performance Chart with Time Filter */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performa Sales</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {salesPerformanceData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data performa sales untuk periode yang dipilih
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={salesPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="code" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => {
                    const sales = salesPerformanceData.find(s => s.code === label);
                    return `${sales?.name} (${label}) - ${sales?.branch}`;
                  }}
                />
                <Legend />
                <Bar dataKey="Prospek" stackId="a" fill="#3B82F6" />
                <Bar dataKey="Follow-up" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Deal" stackId="a" fill="#10B981" />
                <Bar dataKey="Tidak Jadi" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend Pelanggan 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3B82F6" name="Total" />
                <Line type="monotone" dataKey="deal" stroke="#10B981" name="Deal" />
                <Line type="monotone" dataKey="prospek" stroke="#F59E0B" name="Prospek" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Performa Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Prospek" stackId="a" fill="#3B82F6" />
              <Bar dataKey="Follow-up" stackId="a" fill="#F59E0B" />
              <Bar dataKey="Deal" stackId="a" fill="#10B981" />
              <Bar dataKey="Tidak Jadi" stackId="a" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {averageRatings && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pelayanan Teknisi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {averageRatings.serviceTechnician.toFixed(1)}/10
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(averageRatings.serviceTechnician / 10) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pelayanan Sales/CS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {averageRatings.serviceSales.toFixed(1)}/10
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(averageRatings.serviceSales / 10) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kualitas Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {averageRatings.productQuality.toFixed(1)}/10
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(averageRatings.productQuality / 10) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Persetujuan Harga</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {averageRatings.priceApprovalRate.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${averageRatings.priceApprovalRate}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Detail Hasil Survei Per Pelanggan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detailedSurveyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada survei yang diselesaikan pada periode yang dipilih
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Tanggal Deal</TableHead>
                    <TableHead>Rating Keseluruhan</TableHead>
                    <TableHead>Teknisi</TableHead>
                    <TableHead>Sales/CS</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Penggunaan</TableHead>
                    <TableHead>Harga OK</TableHead>
                    <TableHead>Testimoni</TableHead>
                    <TableHead>Saran & Kritik</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailedSurveyData.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{survey.customerName}</div>
                          <div className="text-sm text-gray-500">{survey.customerPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{survey.branchCode}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(survey.deal_date).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{survey.overallRating}/10</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={survey.service_technician >= 8 ? "default" : survey.service_technician >= 6 ? "secondary" : "destructive"}
                        >
                          {survey.service_technician}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={survey.service_sales >= 8 ? "default" : survey.service_sales >= 6 ? "secondary" : "destructive"}
                        >
                          {survey.service_sales}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={survey.product_quality >= 8 ? "default" : survey.product_quality >= 6 ? "secondary" : "destructive"}
                        >
                          {survey.product_quality}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={survey.usage_clarity >= 8 ? "default" : survey.usage_clarity >= 6 ? "secondary" : "destructive"}
                        >
                          {survey.usage_clarity}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={survey.price_approval ? "default" : "destructive"}>
                          {survey.price_approval ? 'Ya' : 'Tidak'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">
                          {survey.testimonial ? (
                            <div className="truncate" title={survey.testimonial}>
                              {survey.testimonial}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Tidak ada testimoni</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">
                          {survey.suggestions ? (
                            <div className="truncate" title={survey.suggestions}>
                              {survey.suggestions}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Tidak ada saran</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <SurveyPreviewDialog survey={survey} />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => printSurveyDetail(survey)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
