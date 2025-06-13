
import React, { useState, useEffect } from 'react';
import { useResellerApp } from '@/hooks/useResellerApp';
import ResellerLogin from '@/components/ResellerApp/ResellerLogin';
import ResellerDashboard from '@/components/ResellerApp/ResellerDashboard';
import ResellerCatalog from '@/components/ResellerApp/ResellerCatalog';
import ResellerOrders from '@/components/ResellerApp/ResellerOrders';
import ResellerReports from '@/components/ResellerApp/ResellerReports';
import ResellerProfile from '@/components/ResellerApp/ResellerProfile';
import ResellerHelp from '@/components/ResellerApp/ResellerHelp';
import ResellerNavigation from '@/components/ResellerApp/ResellerNavigation';

type TabType = 'dashboard' | 'catalog' | 'orders' | 'reports' | 'profile' | 'help';

const ResellerApp = () => {
  const { session } = useResellerApp();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  if (!session) {
    return <ResellerLogin />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ResellerDashboard reseller={session} />;
      case 'catalog':
        return <ResellerCatalog reseller={session} />;
      case 'orders':
        return <ResellerOrders reseller={session} />;
      case 'reports':
        return <ResellerReports reseller={session} />;
      case 'profile':
        return <ResellerProfile reseller={session} />;
      case 'help':
        return <ResellerHelp reseller={session} />;
      default:
        return <ResellerDashboard reseller={session} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Reseller App</h1>
            <div className="text-sm text-gray-600">
              {session.name}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <ResellerNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ResellerApp;
