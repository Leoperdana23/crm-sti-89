
import React from 'react';
import { Home, Package, ShoppingCart, BarChart3, User, HelpCircle } from 'lucide-react';

type TabType = 'dashboard' | 'catalog' | 'orders' | 'reports' | 'profile' | 'help';

interface ResellerNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const ResellerNavigation: React.FC<ResellerNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Beranda', icon: Home },
    { id: 'catalog' as TabType, label: 'Katalog', icon: Package },
    { id: 'orders' as TabType, label: 'Order', icon: ShoppingCart },
    { id: 'reports' as TabType, label: 'Laporan', icon: BarChart3 },
    { id: 'profile' as TabType, label: 'Profil', icon: User },
    { id: 'help' as TabType, label: 'Bantuan', icon: HelpCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="grid grid-cols-6 h-16">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 text-xs transition-colors ${
                isActive 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ResellerNavigation;
