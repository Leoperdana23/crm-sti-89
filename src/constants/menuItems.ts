
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
  ClipboardList
} from 'lucide-react';

export const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    label: 'Customers',
    path: '/customers',
    icon: Users
  },
  {
    label: 'Follow Up',
    path: '/follow-up',
    icon: UserCheck
  },
  {
    label: 'Categories',
    path: '/categories',
    icon: ClipboardList
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: ShoppingCart
  },
  {
    label: 'Resellers',
    path: '/resellers',
    icon: Store
  },
  {
    label: 'Sales Team',
    path: '/sales',
    icon: TrendingUp
  },
  {
    label: 'Branches',
    path: '/branches',
    icon: Building2
  },
  {
    label: 'Users',
    path: '/users',
    icon: UserCog
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3
  },
  {
    label: 'Survey',
    path: '/survey',
    icon: MessageSquare
  },
  {
    label: 'Work Process',
    path: '/work-process',
    icon: Calendar
  },
  {
    label: 'Birthday',
    path: '/birthday',
    icon: Calendar
  },
  {
    label: 'Deal History',
    path: '/deal-history',
    icon: FileText
  },
  {
    label: 'Role Permissions',
    path: '/role-permissions',
    icon: Settings
  }
];
