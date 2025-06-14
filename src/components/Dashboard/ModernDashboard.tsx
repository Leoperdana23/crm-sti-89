
import React from 'react';
import { useRealTimeStats } from '@/hooks/useRealTimeStats';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import DashboardStats from './DashboardStats';
import RecentOrders from './RecentOrders';
import TopProducts from './TopProducts';

const ModernDashboard = () => {
  // Enable real-time stats updates
  useRealTimeStats();
  
  // Enable order notifications
  useOrderNotifications();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Selamat datang di panel administrasi SEDEKAT</p>
        </div>

        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders />
          <TopProducts />
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;
