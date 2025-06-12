
import React from 'react';
import { 
  Home, 
  Users, 
  UserCheck, 
  Package, 
  ShoppingCart,
  Phone, 
  Calendar, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Building, 
  BarChart3, 
  Shield 
} from 'lucide-react';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import MenuItem from './MenuItem';

interface SidebarMenuProps {
  onItemClick?: () => void;
}

const SidebarMenu = ({ onItemClick }: SidebarMenuProps) => {
  const { hasPermission } = useUserPermissions();

  const menuItems = [
    {
      to: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      permission: null // Dashboard always visible
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
      icon: UserCheck,
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
      to: '/birthday',
      icon: Calendar,
      label: 'Ulang Tahun',
      permission: null // Always visible for all roles
    },
    {
      to: '/work-process',
      icon: Briefcase,
      label: 'Proses Pekerjaan',
      permission: 'work_process'
    },
    {
      to: '/survey',
      icon: FileText,
      label: 'Survei',
      permission: 'survey'
    },
    {
      to: '/catalog',
      icon: Package,
      label: 'Katalog Produk',
      permission: 'product_catalog'
    },
    {
      to: '/deal-history',
      icon: TrendingUp,
      label: 'Riwayat Deal',
      permission: 'deal_history'
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
    },
    {
      to: '/reports',
      icon: BarChart3,
      label: 'Laporan',
      permission: 'reports'
    },
    {
      to: '/users',
      icon: Users,
      label: 'Master User',
      permission: 'users'
    },
    {
      to: '/role-permissions',
      icon: Shield,
      label: 'Hak Akses Role',
      permission: 'role_permissions'
    }
  ];

  return (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        // Show item if no permission required or user has permission
        if (item.permission && !hasPermission(item.permission)) {
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
    </nav>
  );
};

export default SidebarMenu;
