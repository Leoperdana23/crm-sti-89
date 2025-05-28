import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, UserCheck, MessageSquare, BarChart3, Building, FileText, LogOut, UserCog, Settings, Shield, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';

const Layout = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { permissions, rolePermissions } = usePermissions();

  // Get current user role - simplified for sales users
  const getCurrentUserRole = () => {
    const salesUser = localStorage.getItem('salesUser');
    if (salesUser) {
      return 'staff'; // Sales users are treated as staff
    }
    
    // For regular auth users, you might want to implement role fetching
    // For now, defaulting to 'staff' for safety
    return 'staff';
  };

  const userRole = getCurrentUserRole();

  // Define all navigation items with their permission mappings
  const allNavigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3, permission: 'dashboard' },
    { name: 'Pelanggan', href: '/customers', icon: Users, permission: 'customers' },
    { name: 'Follow-Up', href: '/follow-up', icon: UserCheck, permission: 'follow_up' },
    { name: 'Proses Pekerjaan', href: '/work-process', icon: Wrench, permission: 'work_process' },
    { name: 'Survei', href: '/survey', icon: MessageSquare, permission: 'survey' },
    { name: 'Sales', href: '/sales', icon: UserCog, permission: 'sales' },
    { name: 'Cabang', href: '/branches', icon: Building, permission: 'branches' },
    { name: 'Laporan', href: '/reports', icon: FileText, permission: 'reports' },
    { name: 'Master User', href: '/users', icon: Settings, permission: 'users' },
    { name: 'Hak Akses Role', href: '/role-permissions', icon: Shield, permission: 'role_permissions' },
  ];

  // Show all navigation items regardless of permissions for now
  // You can implement permission filtering later if needed
  const navigation = allNavigation;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-xl border-r border-gray-200">
          <div className="flex flex-col h-screen">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CRM PT SLASH TEKNOLOGI INDONESIA
              </h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.full_name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email} ({userRole})
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
