
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, UserCheck, MessageSquare, BarChart3, Building, FileText, LogOut, UserCog, Settings, Shield, Wrench, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getRoleLabel } from '@/utils/permissionLabels';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { hasPermission, userRole, loading } = useUserPermissions();

  // Get current user info for display
  const getCurrentUserInfo = () => {
    const appUser = localStorage.getItem('appUser');
    if (appUser) {
      try {
        const parsedAppUser = JSON.parse(appUser);
        return {
          name: parsedAppUser.user_metadata?.full_name || parsedAppUser.full_name || 'App User',
          email: parsedAppUser.user_metadata?.email || parsedAppUser.email || '',
          role: parsedAppUser.user_metadata?.role || parsedAppUser.role || 'staff'
        };
      } catch (error) {
        // Fallback
      }
    }
    
    const salesUser = localStorage.getItem('salesUser');
    if (salesUser) {
      try {
        const parsedSalesUser = JSON.parse(salesUser);
        return {
          name: parsedSalesUser.user_metadata?.full_name || 'Sales User',
          email: parsedSalesUser.user_metadata?.email || parsedSalesUser.email || '',
          role: 'staff'
        };
      } catch (error) {
        // Fallback
      }
    }

    return {
      name: user?.user_metadata?.full_name || user?.email || 'User',
      email: user?.email || '',
      role: userRole || 'staff'
    };
  };

  const userInfo = getCurrentUserInfo();

  // Define all navigation items with their permission mappings
  const allNavigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3, permission: 'dashboard' },
    { name: 'Pelanggan', href: '/customers', icon: Users, permission: 'customers' },
    { name: 'Follow-Up', href: '/follow-up', icon: UserCheck, permission: 'follow_up' },
    { name: 'Proses Pekerjaan', href: '/work-process', icon: Wrench, permission: 'work_process' },
    { name: 'Survei', href: '/survey', icon: MessageSquare, permission: 'survey' },
    { name: 'Karyawan', href: '/sales', icon: UserCog, permission: 'sales' },
    { name: 'Cabang', href: '/branches', icon: Building, permission: 'branches' },
    { name: 'Reseller', href: '/resellers', icon: Store, permission: 'resellers' },
    { name: 'Laporan', href: '/reports', icon: FileText, permission: 'reports' },
    { name: 'Master User', href: '/users', icon: Settings, permission: 'users' },
    { name: 'Hak Akses Role', href: '/role-permissions', icon: Shield, permission: 'role_permissions' },
  ];

  // Filter navigation based on user permissions
  const navigation = allNavigation.filter(item => {
    const hasAccess = hasPermission(item.permission, 'view');
    console.log(`Menu ${item.name} (${item.permission}): ${hasAccess ? 'ALLOWED' : 'DENIED'} for role ${userRole}`);
    return hasAccess;
  });

  console.log('Current user role:', userRole);
  console.log('User info:', userInfo);
  console.log('Filtered navigation items:', navigation.map(n => n.name));

  const handleLogout = async () => {
    try {
      await signOut();
      // Force page refresh after logout
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      // Force refresh even if there's an error
      window.location.href = '/auth';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span>Memuat hak akses...</span>
        </div>
      </div>
    );
  }

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
                    {userInfo.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userInfo.email}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {getRoleLabel(userInfo.role)}
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
