import React, { useState } from 'react';
import { FileText, TrendingUp, Building, Users, Target, Award, Download, Star, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCustomers } from '@/hooks/useCustomers';
import { useSurveys } from '@/hooks/useSurveys';
import { useBranches } from '@/hooks/useBranches';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const Reports = () => {
  const { customers, getStatsByBranch } = useCustomers();
  const { surveys, getAverageRatings } = useSurveys();
  const { branches } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const filteredCustomers = selectedBranch === 'all' 
    ? customers 
    : customers.filter(c => c.branchId === selectedBranch);

  const branchStats = getStatsByBranch(selectedBranch === 'all' ? undefined : selectedBranch);
  const averageRatings = getAverageRatings();

  // Data untuk chart konversi pelanggan
  const conversionData = branches.map(branch => {
    const branchCustomers = customers.filter(c => c.branchId === branch.id);
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
    { name: 'Prospek', value: branchStats.prospek, color: '#3B82F6' },
    { name: 'Follow-up', value: branchStats.followUp, color: '#F59E0B' },
    { name: 'Deal', value: branchStats.deal, color: '#10B981' },
    { name: 'Tidak Jadi', value: branchStats.tidakJadi, color: '#EF4444' },
  ];

  // Data untuk trend pelanggan bulanan
  const monthlyData = React.useMemo(() => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthCustomers = filteredCustomers.filter(customer => {
        const customerDate = new Date(customer.createdAt);
        return customerDate.toISOString().slice(0, 7) === monthKey;
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

  // Data untuk tabel detail survei per pelanggan
  const detailedSurveyData = React.useMemo(() => {
    const completedSurveys = surveys.filter(survey => survey.isCompleted);
    
    return completedSurveys.map(survey => {
      const customer = customers.find(c => c.id === survey.customerId);
      const branch = branches.find(b => b.id === customer?.branchId);
      
      return {
        ...survey,
        customerName: customer?.name || 'Unknown',
        customerPhone: customer?.phone || '-',
        branchName: branch?.name || 'Unknown',
        branchCode: branch?.code || '-',
        overallRating: ((survey.serviceTechnician + survey.serviceSales + survey.productQuality + survey.usageClarity) / 4).toFixed(1)
      };
    }).filter(survey => {
      if (selectedBranch === 'all') return true;
      const customer = customers.find(c => c.id === survey.customerId);
      return customer?.branchId === selectedBranch;
    });
  }, [surveys, customers, branches, selectedBranch]);

  const calculateConversionRate = (branch?: string) => {
    const customers = branch 
      ? filteredCustomers.filter(c => c.branchId === branch)
      : filteredCustomers;
    
    const total = customers.length;
    const deals = customers.filter(c => c.status === 'Deal').length;
    return total > 0 ? ((deals / total) * 100).toFixed(1) : '0';
  };

  const exportReport = () => {
    // Simple CSV export implementation
    const csvData = [
      ['Laporan CRM', ''],
      ['Tanggal Export', new Date().toLocaleDateString('id-ID')],
      ['Cabang', selectedBranch === 'all' ? 'Semua Cabang' : branches.find(b => b.id === selectedBranch)?.name],
      [''],
      ['STATISTIK PELANGGAN', ''],
      ['Total Pelanggan', branchStats.total],
      ['Prospek', branchStats.prospek],
      ['Follow-up', branchStats.followUp],
      ['Deal', branchStats.deal],
      ['Tidak Jadi', branchStats.tidakJadi],
      ['Conversion Rate', calculateConversionRate() + '%'],
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
    link.download = `laporan-crm-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan & Analitik</h1>
          <p className="text-gray-600 mt-1">Analisis komprehensif data pelanggan dan survei</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branchStats.total}</div>
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
              {branchStats.deal} dari {branchStats.total} pelanggan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Survei</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surveys.length}</div>
            <p className="text-xs text-muted-foreground">
              Survei terkumpul
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Rata-rata</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {averageRatings ? ((averageRatings.serviceTechnician + averageRatings.serviceSales + averageRatings.productQuality + averageRatings.usageClarity) / 4).toFixed(1) : '0'}/10
            </div>
            <p className="text-xs text-muted-foreground">
              Kepuasan keseluruhan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
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

        {/* Monthly Trend */}
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

      {/* Branch Comparison */}
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

      {/* Survey Analytics */}
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

      {/* Detail Survei Per Pelanggan */}
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
              Belum ada survei yang diselesaikan
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
                        {new Date(survey.dealDate).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{survey.overallRating}/10</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={survey.serviceTechnician >= 8 ? "default" : survey.serviceTechnician >= 6 ? "secondary" : "destructive"}
                        >
                          {survey.serviceTechnician}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={survey.serviceSales >= 8 ? "default" : survey.serviceSales >= 6 ? "secondary" : "destructive"}
                        >
                          {survey.serviceSales}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={survey.productQuality >= 8 ? "default" : survey.productQuality >= 6 ? "secondary" : "destructive"}
                        >
                          {survey.productQuality}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={survey.usageClarity >= 8 ? "default" : survey.usageClarity >= 6 ? "secondary" : "destructive"}
                        >
                          {survey.usageClarity}/10
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={survey.priceApproval ? "default" : "destructive"}>
                          {survey.priceApproval ? 'Ya' : 'Tidak'}
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
