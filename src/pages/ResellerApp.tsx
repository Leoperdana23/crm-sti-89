
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
  const [isLoading, setIsLoading] = useState(true);

  // Check for session changes and handle loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [session]);

  // Show loading for a brief moment to handle session transitions
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <ResellerLogin />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ResellerDashboard reseller={session} onTabChange={setActiveTab} />;
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
        return <ResellerDashboard reseller={session} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header - Responsive */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
              SEDEKAT
            </h1>
            <div className="text-xs sm:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-none">
              {session.name}
            </div>
          </div>
        </div>
      </div>

      {/* Content - Responsive padding and spacing */}
      <div className="pb-16 sm:pb-20 w-full">
        <div className="w-full">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation - Always sticky on mobile */}
      <ResellerNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ResellerApp;
