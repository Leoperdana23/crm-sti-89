
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  FileText,
  Settings,
  BarChart3,
  UserCheck,
  Store,
  Calendar,
  MessageSquare,
  TrendingUp,
  Building2,
  UserCog,
  ClipboardList,
  Briefcase,
  Phone
} from 'lucide-react';

export const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Daftar Pesanan',
    path: '/orders',
    icon: ShoppingCart
  },
  {
    label: 'Histori Deal',
    path: '/deal-history',
    icon: FileText
  },
  {
    label: 'Ulang Tahun',
    path: '/birthday',
    icon: Calendar
  },
  {
    label: 'Laporan',
    path: '/reports',
    icon: BarChart3
  }
];

export const customerMenuItems = [
  {
    label: 'Pelanggan Umum',
    path: '/customers',
    icon: Users
  },
  {
    label: 'Reseller',
    path: '/resellers',
    icon: Store
  }
];

export const processMenuItems = [
  {
    label: 'Follow Up',
    path: '/follow-up',
    icon: Phone
  },
  {
    label: 'Proses Pekerjaan',
    path: '/work-process',
    icon: Briefcase
  },
  {
    label: 'Survei',
    path: '/survey',
    icon: MessageSquare
  }
];

export const settingsMenuItems = [
  {
    label: 'Hak Akses Role',
    path: '/role-permissions',
    icon: Settings
  },
  {
    label: 'Master User',
    path: '/users',
    icon: UserCog
  },
  {
    label: 'Sales',
    path: '/sales',
    icon: TrendingUp
  },
  {
    label: 'Cabang',
    path: '/branches',
    icon: Building2
  },
  {
    label: 'Kategori',
    path: '/categories',
    icon: ClipboardList
  }
];
