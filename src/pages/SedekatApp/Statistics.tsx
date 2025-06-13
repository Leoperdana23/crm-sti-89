
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package,
  Award,
  Calendar
} from 'lucide-react';

const Statistics = () => {
  // Mock data - replace with real data
  const orderData = [
    { name: 'Jan', orders: 65, revenue: 15000000 },
    { name: 'Feb', orders: 85, revenue: 20000000 },
    { name: 'Mar', orders: 105, revenue: 25000000 },
    { name: 'Apr', orders: 95, revenue: 22000000 },
    { name: 'May', orders: 125, revenue: 30000000 },
    { name: 'Jun', orders: 145, revenue: 35000000 },
  ];

  const productData = [
    { name: 'Produk A', value: 30, sales: 150 },
    { name: 'Produk B', value: 25, sales: 120 },
    { name: 'Produk C', value: 20, sales: 95 },
    { name: 'Produk D', value: 15, sales: 70 },
    { name: 'Lainnya', value: 10, sales: 45 },
  ];

  const resellerData = [
    { name: 'Ahmad Reseller', orders: 45, commission: 2500000 },
    { name: 'Siti Store', orders: 38, commission: 2100000 },
    { name: 'Budi Shop', orders: 32, commission: 1800000 },
    { name: 'Rina Market', orders: 28, commission: 1500000 },
    { name: 'Dodi Store', orders: 25, commission: 1300000 },
  ];

  const COLORS = ['#16a34a', '#059669', '#047857', '#065f46', '#064e3b'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Statistik</h1>
        <p className="text-gray-600">Analitik dan laporan SEDEKAT App</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Reseller Aktif</p>
                <p className="text-2xl font-bold">125</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Order Hari Ini</p>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Order Bulan Ini</p>
                <p className="text-2xl font-bold">145</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Produk Terlaris</p>
                <p className="text-lg font-bold">Produk A</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-pink-500" />
              <div>
                <p className="text-sm text-gray-600">Reseller Terbaik</p>
                <p className="text-sm font-bold">Ahmad Reseller</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-lg font-bold">{formatCurrency(35000000)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Pesanan & Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'orders' ? 'Pesanan' : 'Revenue'
                  ]}
                />
                <Bar dataKey="orders" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Resellers */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Reseller Terbaik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resellerData.map((reseller, index) => (
              <div key={reseller.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{reseller.name}</p>
                    <p className="text-sm text-gray-600">{reseller.orders} pesanan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(reseller.commission)}</p>
                  <p className="text-sm text-gray-600">komisi</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
