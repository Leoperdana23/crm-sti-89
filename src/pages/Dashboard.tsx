import React from 'react';
import { Users, Building, TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/StatsCard';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { useSales } from '@/hooks/useSales';
import { useSurveys } from '@/hooks/useSurveys';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { customers } = useCustomers();
  const { branches } = useBranches();
  const { sales } = useSales();
  const { surveys } = useSurveys();

  // Calculate statistics directly
  const totalCustomers = customers.length;
  const totalDeals = customers.filter(c => c.status === 'Deal').length;
  const conversionRate = totalCustomers > 0 ? Math.round((totalDeals / totalCustomers) * 100) : 0;
  const monthlyGrowth = 5.2; // Mock data for now

  // Data untuk chart
  const statusData = [
    { name: 'Prospek', value: customers.filter(c => c.status === 'Prospek').length, color: '#3B82F6' },
    { name: 'Follow-up', value: customers.filter(c => c.status === 'Follow-up').length, color: '#F59E0B' },
    { name: 'Deal', value: customers.filter(c => c.status === 'Deal').length, color: '#10B981' },
    { name: 'Tidak Jadi', value: customers.filter(c => c.status === 'Tidak Jadi').length, color: '#EF4444' },
  ];

  // Performance data per cabang
  const branchPerformance = branches.map(branch => {
    const branchCustomers = customers.filter(c => c.branch_id === branch.id);
    const deals = branchCustomers.filter(c => c.status === 'Deal').length;
    
    return {
      name: branch.code,
      total: branchCustomers.length,
      deals: deals,
      prospek: branchCustomers.filter(c => c.status === 'Prospek').length,
      followUp: branchCustomers.filter(c => c.status === 'Follow-up').length,
      conversionRate: branchCustomers.length > 0 ? Math.round((deals / branchCustomers.length) * 100) : 0
    };
  });

  // Data pelanggan terbaru
  const recentCustomers = customers
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Work Status Analytics
  const workStatusData = {
    notStarted: customers.filter(c => c.status === 'Deal' && (!c.work_status || c.work_status === 'not_started')).length,
    inProgress: customers.filter(c => c.status === 'Deal' && c.work_status === 'in_progress').length,
    completed: customers.filter(c => c.status === 'Deal' && c.work_status === 'completed').length,
  };

  // Survey completion data
  const surveyData = {
    completed: surveys.filter(s => s.is_completed).length,
    pending: customers.filter(c => c.status === 'Deal' && c.work_status === 'completed').length - surveys.filter(s => s.is_completed).length
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Ringkasan kinerja dan analitik bisnis</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Pelanggan"
          value={totalCustomers}
          icon={Users}
          trend={{
            value: monthlyGrowth,
            isPositive: true
          }}
          color="blue"
        />
        <StatsCard
          title="Total Deal"
          value={totalDeals}
          icon={CheckCircle}
          trend={{
            value: conversionRate,
            isPositive: conversionRate > 0
          }}
          color="green"
        />
        <StatsCard
          title="Total Cabang"
          value={branches.length}
          icon={Building}
          color="purple"
        />
        <StatsCard
          title="Total Sales"
          value={sales.length}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Work Process Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Belum Mulai</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{workStatusData.notStarted}</div>
            <p className="text-sm text-gray-600 mt-2">Deal belum mulai dikerjakan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span>Sedang Dikerjakan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{workStatusData.inProgress}</div>
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
            <div className="text-3xl font-bold text-green-600">{workStatusData.completed}</div>
            <p className="text-sm text-gray-600 mt-2">Siap untuk survei</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
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
            <CardTitle>Performance per Cabang</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="prospek" stackId="a" fill="#3B82F6" name="Prospek" />
                <Bar dataKey="followUp" stackId="a" fill="#F59E0B" name="Follow-up" />
                <Bar dataKey="deals" stackId="a" fill="#10B981" name="Deal" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Survey Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pelanggan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{customer.name}</h4>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      customer.status === 'Deal' ? 'default' :
                      customer.status === 'Follow-up' ? 'secondary' :
                      customer.status === 'Prospek' ? 'outline' : 'destructive'
                    }>
                      {customer.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(customer.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada pelanggan terdaftar
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Survei</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Survei Selesai</span>
                <span className="font-bold text-green-600">{surveyData.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Survei Tertunda</span>
                <span className="font-bold text-orange-600">{surveyData.pending}</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress Survei</span>
                  <span>{surveyData.completed + surveyData.pending > 0 ? Math.round((surveyData.completed / (surveyData.completed + surveyData.pending)) * 100) : 0}%</span>
                </div>
                <Progress 
                  value={surveyData.completed + surveyData.pending > 0 ? (surveyData.completed / (surveyData.completed + surveyData.pending)) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Performance Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cabang</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-right p-2">Prospek</th>
                  <th className="text-right p-2">Follow-up</th>
                  <th className="text-right p-2">Deal</th>
                  <th className="text-right p-2">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {branchPerformance.map((branch) => (
                  <tr key={branch.name} className="border-b">
                    <td className="p-2 font-medium">{branch.name}</td>
                    <td className="p-2 text-right">{branch.total}</td>
                    <td className="p-2 text-right">{branch.prospek}</td>
                    <td className="p-2 text-right">{branch.followUp}</td>
                    <td className="p-2 text-right">{branch.deals}</td>
                    <td className="p-2 text-right">
                      <Badge variant={branch.conversionRate >= 50 ? 'default' : branch.conversionRate >= 25 ? 'secondary' : 'outline'}>
                        {branch.conversionRate}%
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

export default Dashboard;
