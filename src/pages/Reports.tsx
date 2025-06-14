
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, TrendingUp, Users, Target, Award } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const Reports = () => {
  const { customers, getStatsByBranch } = useCustomers();
  const { branches } = useBranches();
  const { sales } = useSales();
  const { stats: dashboardStats } = useDashboardStats();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Calculate statistics
  const totalCustomers = customers.length;
  const dealCustomers = customers.filter(c => c.status === 'Deal').length;
  const prospekCustomers = customers.filter(c => c.status === 'Prospek').length;
  const followUpCustomers = customers.filter(c => c.status === 'Follow-up').length;
  const tidakJadiCustomers = customers.filter(c => c.status === 'Tidak Jadi').length;

  // Calculate conversion rate
  const conversionRate = totalCustomers > 0 ? ((dealCustomers / totalCustomers) * 100).toFixed(1) : '0';

  // Data for charts
  const statusData = [
    { name: 'Prospek', value: prospekCustomers, color: '#3B82F6' },
    { name: 'Follow-up', value: followUpCustomers, color: '#F59E0B' },
    { name: 'Deal', value: dealCustomers, color: '#10B981' },
    { name: 'Tidak Jadi', value: tidakJadiCustomers, color: '#EF4444' },
  ];

  // Monthly trend data (mock data for demonstration)
  const monthlyTrend = [
    { month: 'Jan', prospek: 12, deal: 8, followUp: 5 },
    { month: 'Feb', prospek: 15, deal: 10, followUp: 7 },
    { month: 'Mar', prospek: 18, deal: 12, followUp: 9 },
    { month: 'Apr', prospek: 22, deal: 15, followUp: 11 },
    { month: 'May', prospek: 25, deal: 18, followUp: 14 },
    { month: 'Jun', prospek: 28, deal: 20, followUp: 16 },
  ];

  // Branch performance data
  const branchStats = getStatsByBranch();
  const branchData = Object.entries(branchStats).map(([branchId, stats]: [string, any]) => {
    const branch = branches.find(b => b.id === branchId);
    return {
      name: branch?.name || 'Tidak Diketahui',
      total: stats.total || 0,
      deal: stats.deal || 0,
      prospek: stats.prospek || 0,
      followUp: stats.followup || 0,
      conversionRate: stats.total > 0 ? ((stats.deal / stats.total) * 100).toFixed(1) : '0'
    };
  });

  // Sales performance data
  const salesData = sales.map(salesPerson => {
    const salesCustomers = customers.filter(c => c.sales_id === salesPerson.id);
    const salesDeals = salesCustomers.filter(c => c.status === 'Deal');
    return {
      name: salesPerson.name,
      total: salesCustomers.length,
      deal: salesDeals.length,
      conversionRate: salesCustomers.length > 0 ? ((salesDeals.length / salesCustomers.length) * 100).toFixed(1) : '0'
    };
  });

  const exportData = () => {
    // Simple CSV export functionality
    const csvData = [
      ['Nama', 'Status', 'Tanggal Dibuat', 'Cabang', 'Sales'],
      ...customers.map(customer => [
        customer.name,
        customer.status,
        new Date(customer.created_at).toLocaleDateString('id-ID'),
        branches.find(b => b.id === customer.branch_id)?.name || '',
        sales.find(s => s.id === customer.sales_id)?.name || ''
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan-pelanggan.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan & Analitik</h1>
          <p className="text-gray-600 mt-1">Dashboard analisis performa bisnis</p>
        </div>
        <Button onClick={exportData} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </Button>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
                <SelectItem value="quarter">Kuartal Ini</SelectItem>
                <SelectItem value="year">Tahun Ini</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
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

            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+12% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dealCustomers}</div>
            <p className="text-xs text-muted-foreground">+8% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">+2.1% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-up Aktif</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{followUpCustomers}</div>
            <p className="text-xs text-muted-foreground">-3% dari bulan lalu</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
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
            <CardTitle>Tren Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="prospek" stroke="#3B82F6" name="Prospek" />
                <Line type="monotone" dataKey="deal" stroke="#10B981" name="Deal" />
                <Line type="monotone" dataKey="followUp" stroke="#F59E0B" name="Follow-up" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performa per Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={branchData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total" />
              <Bar dataKey="deal" fill="#10B981" name="Deal" />
              <Bar dataKey="prospek" fill="#3B82F6" name="Prospek" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sales Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performa Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Nama Sales</th>
                  <th className="text-left p-4">Total Prospek</th>
                  <th className="text-left p-4">Total Deal</th>
                  <th className="text-left p-4">Conversion Rate</th>
                  <th className="text-left p-4">Performance</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sales, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{sales.name}</td>
                    <td className="p-4">{sales.total}</td>
                    <td className="p-4 text-green-600 font-semibold">{sales.deal}</td>
                    <td className="p-4">{sales.conversionRate}%</td>
                    <td className="p-4">
                      <Badge 
                        variant={parseFloat(sales.conversionRate) >= 50 ? "default" : 
                                parseFloat(sales.conversionRate) >= 30 ? "secondary" : "destructive"}
                      >
                        {parseFloat(sales.conversionRate) >= 50 ? "Excellent" : 
                         parseFloat(sales.conversionRate) >= 30 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
