
import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  UserCheck, 
  ShoppingCart,
  Phone, 
  Calendar, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Building, 
  BarChart3, 
  Shield,
  Settings,
  ChevronDown,
  ChevronRight,
  UserCog,
  Store,
  MessageSquare,
  Cog
} from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import MenuItem from './MenuItem';

interface SidebarMenuProps {
  onItemClick?: () => void;
}

const SidebarMenu = ({ onItemClick }: SidebarMenuProps) => {
  const { hasPermission } = useUserPermissions();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [processOpen, setProcessOpen] = useState(false);

  const menuItems = [
    {
      to: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      permission: 'dashboard'
    },
    {
      to: '/orders',
      icon: ShoppingCart,
      label: 'Daftar Pesanan',
      permission: 'orders'
    },
    {
      to: '/deal-history',
      icon: TrendingUp,
      label: 'Histori Deal',
      permission: 'deal_history'
    },
    {
      to: '/birthday',
      icon: Calendar,
      label: 'Ulang Tahun',
      permission: 'birthday'
    },
    {
      to: '/reports',
      icon: BarChart3,
      label: 'Laporan',
      permission: 'reports'
    }
  ];

  const customerMenuItems = [
    {
      to: '/customers',
      icon: Users,
      label: 'Pelanggan',
      permission: 'customers'
    },
    {
      to: '/resellers',
      icon: Store,
      label: 'Reseller',
      permission: 'resellers'
    }
  ];

  const processMenuItems = [
    {
      to: '/follow-up',
      icon: Phone,
      label: 'Follow Up',
      permission: 'follow_up'
    },
    {
      to: '/work-process',
      icon: Briefcase,
      label: 'Proses Pekerjaan',
      permission: 'work_process'
    },
    {
      to: '/survey',
      icon: MessageSquare,
      label: 'Survei',
      permission: 'survey'
    }
  ];

  const settingsMenuItems = [
    {
      to: '/role-permissions',
      icon: Shield,
      label: 'Hak Akses Role',
      permission: 'role_permissions'
    },
    {
      to: '/users',
      icon: UserCog,
      label: 'Master User',
      permission: 'users'
    },
    {
      to: '/sales',
      icon: TrendingUp,
      label: 'Sales',
      permission: 'sales'
    },
    {
      to: '/branches',
      icon: Building,
      label: 'Cabang',
      permission: 'branches'
    }
  ];

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        // Show item if user has permission to view it
        if (!hasPermission(item.permission, 'view')) {
          return null;
        }

        return (
          <MenuItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            onClick={onItemClick}
          >
            {item.label}
          </MenuItem>
        );
      })}

      {/* Customer Menu with Submenu */}
      <div className="space-y-1">
        <button
          onClick={() => setCustomerOpen(!customerOpen)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5" />
            <span>Pelanggan</span>
          </div>
          {customerOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {customerOpen && (
          <div className="ml-6 space-y-1">
            {customerMenuItems.map((item) => {
              // Show item if user has permission to view it
              if (!hasPermission(item.permission, 'view')) {
                return null;
              }

              return (
                <MenuItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  onClick={onItemClick}
                >
                  {item.label}
                </MenuItem>
              );
            })}
          </div>
        )}
      </div>

      {/* Process Menu with Submenu */}
      <div className="space-y-1">
        <button
          onClick={() => setProcessOpen(!processOpen)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Cog className="h-5 w-5" />
            <span>Proses Pelanggan</span>
          </div>
          {processOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {processOpen && (
          <div className="ml-6 space-y-1">
            {processMenuItems.map((item) => {
              // Show item if user has permission to view it
              if (!hasPermission(item.permission, 'view')) {
                return null;
              }

              return (
                <MenuItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  onClick={onItemClick}
                >
                  {item.label}
                </MenuItem>
              );
            })}
          </div>
        )}
      </div>

      {/* Settings Menu with Submenu */}
      <div className="space-y-1">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5" />
            <span>Pengaturan</span>
          </div>
          {settingsOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {settingsOpen && (
          <div className="ml-6 space-y-1">
            {settingsMenuItems.map((item) => {
              // Show item if user has permission to view it
              if (!hasPermission(item.permission, 'view')) {
                return null;
              }

              return (
                <MenuItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  onClick={onItemClick}
                >
                  {item.label}
                </MenuItem>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default SidebarMenu;
