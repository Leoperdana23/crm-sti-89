
import React from 'react';
import { Users, UserCheck, TrendingUp, MessageSquare } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { useCustomers } from '@/hooks/useCustomers';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { customers, getStats } = useCustomers();
  const { monthlyData, loading: statsLoading } = useDashboardStats();
  const stats = getStats();

  const statusData = [
    { name: 'Prospek', value: stats.prospek, color: '#FbbF24' },
    { name: 'Follow-up', value: stats.followUp, color: '#3B82F6' },
    { name: 'Deal', value: stats.deal, color: '#10B981' },
    { name: 'Tidak Jadi', value: stats.tidakJadi, color: '#EF4444' },
  ];

  const recentCustomers = customers.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard CRM</h1>
        <p className="text-gray-600">Kelola dan pantau pelanggan Anda dengan mudah</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Pelanggan"
          value={stats.total}
          icon={Users}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Prospek"
          value={stats.prospek}
          icon={UserCheck}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Deal Closing"
          value={stats.deal}
          icon={TrendingUp}
          color="bg-gradient-to-r from-green-500 to-green-600"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Follow-up"
          value={stats.followUp}
          icon={MessageSquare}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tren Penjualan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-gray-500">Memuat data chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="prospek" fill="#3B82F6" name="Prospek" />
                  <Bar dataKey="deal" fill="#10B981" name="Deal" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
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
      </div>

      {/* Recent Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Pelanggan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCustomers.length > 0 ? (
              recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'Deal' ? 'bg-green-100 text-green-800' :
                      customer.status === 'Follow-up' ? 'bg-blue-100 text-blue-800' :
                      customer.status === 'Prospek' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {customer.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(customer.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Belum ada data pelanggan
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
