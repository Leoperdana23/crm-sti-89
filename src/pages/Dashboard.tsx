
import React from 'react';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import RecentOrders from '@/components/Dashboard/RecentOrders';
import TopProducts from '@/components/Dashboard/TopProducts';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di PT SLASH Management System</p>
      </div>

      {/* Statistics Cards */}
      <DashboardStats />

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
};

export default Dashboard;
