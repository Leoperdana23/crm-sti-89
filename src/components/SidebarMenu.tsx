
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
      to: '/',
      icon: Home,
      label: 'Dashboard',
      permission: null
    },
    {
      to: '/orders',
      icon: ShoppingCart,
      label: 'Daftar Pesanan',
      permission: 'order_view'
    },
    {
      to: '/customers',
      icon: Users,
      label: 'Pelanggan',
      permission: 'customer_view'
    },
    {
      to: '/resellers',
      icon: UserCheck,
      label: 'Reseller',
      permission: 'reseller_view'
    },
    {
      to: '/follow-up',
      icon: Phone,
      label: 'Follow-Up',
      permission: 'followup_view'
    },
    {
      to: '/birthday',
      icon: Calendar,
      label: 'Ulang Tahun',
      permission: null
    },
    {
      to: '/work-process',
      icon: Briefcase,
      label: 'Proses Pekerjaan',
      permission: 'work_process_view'
    },
    {
      to: '/survey',
      icon: FileText,
      label: 'Survei',
      permission: 'survey_view'
    },
    {
      to: '/catalog',
      icon: Package,
      label: 'Katalog Produk',
      permission: 'product_management'
    },
    {
      to: '/deal-history',
      icon: TrendingUp,
      label: 'Riwayat Deal',
      permission: 'deal_history_view'
    },
    {
      to: '/sales',
      icon: TrendingUp,
      label: 'Sales',
      permission: 'sales_view'
    },
    {
      to: '/branches',
      icon: Building,
      label: 'Cabang',
      permission: 'branch_view'
    },
    {
      to: '/reports',
      icon: BarChart3,
      label: 'Laporan',
      permission: 'reports_view'
    },
    {
      to: '/users',
      icon: Users,
      label: 'Master User',
      permission: 'user_view'
    },
    {
      to: '/role-permissions',
      icon: Shield,
      label: 'Hak Akses Role',
      permission: 'role_permission_view'
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
