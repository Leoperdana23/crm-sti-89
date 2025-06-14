
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Settings, 
  User,
  ChevronRight,
  Package,
  Store,
  ShoppingCart,
  BarChart3,
  Settings as SettingsIcon,
  HelpCircle
} from 'lucide-react';
import { menuItems, settingsMenuItems } from '@/constants/menuItems';

interface ModernLayoutProps {
  children: React.ReactNode;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { hasPermission } = useUserPermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const [sedekatAppExpanded, setSedekatAppExpanded] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  const sedekatAppMenuItems = [
    {
      label: 'Manajemen Produk',
      path: '/sedekat-app/products',
      icon: Package,
      permission: 'products'
    },
    {
      label: 'Katalog',
      path: '/sedekat-app/catalog',
      icon: Store,
      permission: 'catalog'
    },
    {
      label: 'Daftar Reseller',
      path: '/sedekat-app/resellers',
      icon: Store,
      permission: 'resellers'
    },
    {
      label: 'Manajemen Pesanan',
      path: '/sedekat-app/orders',
      icon: ShoppingCart,
      permission: 'orders'
    },
    {
      label: 'Komisi & Hadiah',
      path: '/sedekat-app/commission',
      icon: BarChart3,
      permission: 'commission'
    },
    {
      label: 'Pengaturan App',
      path: '/sedekat-app/settings',
      icon: SettingsIcon,
      permission: 'app_settings'
    },
    {
      label: 'Kontak & Bantuan',
      path: '/sedekat-app/contact-help',
      icon: HelpCircle,
      permission: 'contact_help'
    }
  ];

  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    const permission = item.path.replace('/', '').replace('-', '_');
    return hasPermission(permission, 'view');
  });

  const filteredSettingsMenuItems = settingsMenuItems.filter(item => {
    const permission = item.path.replace('/', '').replace('-', '_');
    return hasPermission(permission, 'view');
  });

  const filteredSedekatAppMenuItems = sedekatAppMenuItems.filter(item => {
    return hasPermission(item.permission, 'view');
  });

  const isSedekatAppRoute = location.pathname.startsWith('/sedekat-app');

  // Get user name from user_metadata
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const isAdmin = user?.user_metadata?.role === 'super_admin';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">STI</span>
              </div>
              <div>
                <h2 className="font-semibold text-sm">Sistem Management</h2>
                <p className="text-xs text-gray-500">PT STI</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="p-2 space-y-2">
                {/* Main Menu */}
                <div className="space-y-1">
                  <SidebarMenu>
                    {filteredMenuItems.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton 
                            asChild
                            className={cn(
                              "w-full justify-start",
                              isActive && "bg-blue-100 text-blue-700 border-r-2 border-blue-600"
                            )}
                          >
                            <a href={item.path} className="flex items-center space-x-3 px-3 py-2">
                              <IconComponent className="h-4 w-4" />
                              <span className="text-sm">{item.label}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>

                <Separator />

                {/* SEDEKAT App Section */}
                {filteredSedekatAppMenuItems.length > 0 && (
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-sm font-medium text-gray-700 h-8"
                      onClick={() => setSedekatAppExpanded(!sedekatAppExpanded)}
                    >
                      <span className="flex items-center space-x-2">
                        <Store className="h-4 w-4" />
                        <span>SEDEKAT App</span>
                      </span>
                      <ChevronRight className={cn("h-4 w-4 transition-transform", sedekatAppExpanded && "rotate-90")} />
                    </Button>
                    
                    {(sedekatAppExpanded || isSedekatAppRoute) && (
                      <SidebarMenu className="ml-4">
                        {filteredSedekatAppMenuItems.map((item) => {
                          const IconComponent = item.icon;
                          const isActive = location.pathname === item.path;
                          
                          return (
                            <SidebarMenuItem key={item.path}>
                              <SidebarMenuButton 
                                asChild
                                className={cn(
                                  "w-full justify-start text-sm",
                                  isActive && "bg-blue-100 text-blue-700 border-r-2 border-blue-600"
                                )}
                              >
                                <a href={item.path} className="flex items-center space-x-3 px-3 py-2">
                                  <IconComponent className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    )}
                  </div>
                )}

                <Separator />

                {/* Settings Menu */}
                {filteredSettingsMenuItems.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Pengaturan
                      </h3>
                    </div>
                    <SidebarMenu>
                      {filteredSettingsMenuItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton 
                              asChild
                              className={cn(
                                "w-full justify-start",
                                isActive && "bg-blue-100 text-blue-700 border-r-2 border-blue-600"
                              )}
                            >
                              <a href={item.path} className="flex items-center space-x-3 px-3 py-2">
                                <IconComponent className="h-4 w-4" />
                                <span className="text-sm">{item.label}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </div>
                )}
              </div>
            </ScrollArea>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start h-auto p-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{userName}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {isAdmin && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="border-b bg-white">
            <div className="flex h-16 items-center px-6">
              <SidebarTrigger className="mr-4" />
              <div className="flex-1" />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ModernLayout;
