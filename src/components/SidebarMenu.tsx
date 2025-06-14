
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
  Package,
  Gift,
  Bell,
  PieChart,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import MenuItem from './MenuItem';

interface SidebarMenuProps {
  onItemClick?: () => void;
}

const SidebarMenu = ({ onItemClick }: SidebarMenuProps) => {
  const { hasPermission, loading } = useUserPermissions();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sedekatAppOpen, setSedekatAppOpen] = useState(false);

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
    },
    {
      to: '/follow-up',
      icon: Phone,
      label: 'Follow-Up',
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

  const sedekatAppMenuItems = [
    {
      to: '/sedekat-app/products',
      icon: Package,
      label: 'Manajemen Produk',
      permission: 'products'
    },
    {
      to: '/sedekat-app/catalog-management',
      icon: FolderOpen,
      label: 'Manajemen Katalog',
      permission: 'catalog'
    },
    {
      to: '/sedekat-app/reseller-management',
      icon: Store,
      label: 'Daftar Reseller',
      permission: 'resellers'
    },
    {
      to: '/sedekat-app/order-management',
      icon: ShoppingCart,
      label: 'Manajemen Order',
      permission: 'orders'
    },
    {
      to: '/sedekat-app/commission',
      icon: Gift,
      label: 'Komisi & Poin',
      permission: 'commission'
    },
    {
      to: '/sedekat-app/app-settings',
      icon: Settings,
      label: 'Pengaturan Aplikasi',
      permission: 'app_settings'
    },
    {
      to: '/sedekat-app/contact-help',
      icon: HelpCircle,
      label: 'Kontak & Bantuan',
      permission: 'contact_help'
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

  // Show loading state while permissions are being loaded
  if (loading) {
    return (
      <nav className="space-y-1">
        <div className="animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg mb-2"></div>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        // Show all items for super_admin, or check permission for others
        const shouldShow = hasPermission(item.permission, 'view');
        
        console.log(`Menu item ${item.label}: permission=${item.permission}, shouldShow=${shouldShow}`);
        
        if (!shouldShow) {
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

      {/* SEDEKAT APP Menu with Submenu */}
      <div className="space-y-1">
        <button
          onClick={() => setSedekatAppOpen(!sedekatAppOpen)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Store className="h-5 w-5" />
            <span>SEDEKAT APP</span>
          </div>
          {sedekatAppOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {sedekatAppOpen && (
          <div className="ml-6 space-y-1">
            {sedekatAppMenuItems.map((item) => {
              // Show item if user has permission to view it
              const shouldShow = hasPermission(item.permission, 'view');
              
              if (!shouldShow) {
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
              const shouldShow = hasPermission(item.permission, 'view');
              
              if (!shouldShow) {
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
