
import React from 'react';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import RecentOrders from '@/components/Dashboard/RecentOrders';
import TopProducts from '@/components/Dashboard/TopProducts';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Get user name from user_metadata
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Selamat datang {userName} di Sistem Manajemen Pelanggan PT SLASH TEKNOLOGI INDONESIA - GRUP, Jadikan pelanggan sebagai mitra terbaik dalam mencapai cita-cita.
        </p>
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
