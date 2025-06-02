
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, UserCheck, MessageSquare, BarChart3, Building, FileText, LogOut, UserCog, Settings, Shield, Wrench, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getRoleLabel } from '@/utils/permissionLabels';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

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
    return hasAccess;
  });

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-sm md:text-base">Memuat hak akses...</span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex w-full">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-4 md:p-6">
            <h1 className="text-sm md:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              CRM PT SLASH TEKNOLOGI INDONESIA
            </h1>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 md:space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          className={cn(
                            "flex items-center px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 w-full",
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          )}
                        >
                          <Link to={item.href} className="flex items-center w-full">
                            <Icon className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-gray-200 p-3 md:p-4 space-y-3">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                  {userInfo.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
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
              className="w-full justify-start text-xs md:text-sm"
            >
              <LogOut className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Keluar
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-12 md:h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-4 bg-white/80 backdrop-blur-sm">
            <SidebarTrigger className="text-gray-600 hover:text-gray-900" />
          </header>
          <div className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 lg:p-8">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
