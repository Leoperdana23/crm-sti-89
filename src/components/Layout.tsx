
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { getRoleLabel } from '@/utils/permissionLabels';
import SidebarMenu from '@/components/SidebarMenu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { userRole, loading } = useUserPermissions();

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600" />
          <span className="text-sm sm:text-base lg:text-lg">Memuat hak akses...</span>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex w-full">
        <Sidebar className="border-r border-gray-200 hidden lg:flex">
          <SidebarHeader className="border-b border-gray-200 p-4 lg:p-6">
            <h1 className="text-sm lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              CRM PT SLASH TEKNOLOGI INDONESIA
            </h1>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-gray-200 p-3 lg:p-4 space-y-3">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Users className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm lg:text-base font-medium text-gray-900 truncate">
                  {userInfo.name}
                </p>
                <p className="text-xs lg:text-sm text-gray-500 truncate">
                  {userInfo.email}
                </p>
                <p className="text-xs lg:text-sm text-blue-600 font-medium">
                  {getRoleLabel(userInfo.role)}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 w-full">
          <header className="flex h-14 sm:h-16 lg:h-20 shrink-0 items-center gap-2 border-b border-gray-200 px-3 sm:px-4 lg:px-6 bg-white/80 backdrop-blur-sm shadow-sm">
            <SidebarTrigger className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200" />
            
            {/* Mobile User Info */}
            <div className="flex items-center space-x-2 ml-auto lg:hidden">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                  {userInfo.name}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  {getRoleLabel(userInfo.role)}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto">
            <div className="p-2 sm:p-4 lg:p-6 xl:p-8">
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
