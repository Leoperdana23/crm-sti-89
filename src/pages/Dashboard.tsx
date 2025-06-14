
import React from 'react';
import DashboardStats from '@/components/Dashboard/DashboardStats';
import TopProducts from '@/components/Dashboard/TopProducts';
import RecentOrders from '@/components/Dashboard/RecentOrders';
import ModernDashboard from '@/components/Dashboard/ModernDashboard';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <ModernDashboard />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts />
        <RecentOrders />
      </div>
    </div>
  );
};

export default Dashboard;
