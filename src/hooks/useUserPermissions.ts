
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPermissions {
  [key: string]: {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  };
}

export const useUserPermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = () => {
    // Check for app user first
    const appUser = localStorage.getItem('appUser');
    if (appUser) {
      try {
        const parsedAppUser = JSON.parse(appUser);
        return {
          email: parsedAppUser.user_metadata?.email || parsedAppUser.email,
          role: parsedAppUser.user_metadata?.role || parsedAppUser.role || 'super_admin',
          type: 'app'
        };
      } catch (error) {
        console.error('Error parsing app user:', error);
      }
    }

    // Check for sales user
    const salesUser = localStorage.getItem('salesUser');
    if (salesUser) {
      try {
        const parsedSalesUser = JSON.parse(salesUser);
        return {
          email: parsedSalesUser.user_metadata?.email || parsedSalesUser.email,
          role: 'staff',
          type: 'sales'
        };
      } catch (error) {
        console.error('Error parsing sales user:', error);
      }
    }

    // Regular auth user - give super_admin by default for testing
    if (user) {
      return {
        email: user.email,
        role: 'super_admin',
        type: 'auth'
      };
    }

    return {
      email: 'guest@example.com',
      role: 'super_admin',
      type: 'guest'
    };
  };

  const getDefaultPermissions = (role: string): UserPermissions => {
    // For debugging, give super_admin full permissions
    const superAdminPermissions = {
      'dashboard': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'customers': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'resellers': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'product_catalog': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'orders': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'follow_up': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'work_process': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'survey': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'deal_history': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'sales': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'branches': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'reports': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'users': { can_view: true, can_create: true, can_edit: true, can_delete: true },
      'role_permissions': { can_view: true, can_create: true, can_edit: true, can_delete: true }
    };

    // Staff permissions - sesuai dengan yang diminta: dashboard, orders, customers, resellers, follow-up, birthday, work_process, survey, product_catalog
    const staffPermissions = {
      'dashboard': { can_view: true, can_create: false, can_edit: false, can_delete: false },
      'orders': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'customers': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'resellers': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'follow_up': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'work_process': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'survey': { can_view: true, can_create: true, can_edit: true, can_delete: false },
      'product_catalog': { can_view: true, can_create: false, can_edit: false, can_delete: false },
      // Menu birthday tidak memerlukan permission khusus (null di SidebarMenu)
    };

    if (role === 'super_admin') {
      return superAdminPermissions;
    } else if (role === 'admin') {
      return {
        ...staffPermissions,
        'product_catalog': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'sales': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'branches': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'reports': { can_view: true, can_create: true, can_edit: true, can_delete: true },
        'users': { can_view: true, can_create: true, can_edit: true, can_delete: false }
      };
    } else if (role === 'manager') {
      return {
        ...staffPermissions,
        'product_catalog': { can_view: true, can_create: false, can_edit: false, can_delete: false },
        'branches': { can_view: true, can_create: true, can_edit: true, can_delete: false },
        'reports': { can_view: true, can_create: true, can_edit: true, can_delete: true }
      };
    }

    // Default for staff - sesuai menu yang diminta
    return staffPermissions;
  };

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      
      console.log('Current user detected:', currentUser);

      if (!currentUser) {
        console.log('No user found, setting guest permissions');
        setPermissions(getDefaultPermissions('super_admin'));
        setUserRole('super_admin');
        return;
      }

      // For now, just use the role from user data or default to super_admin
      let actualRole = currentUser.role || 'super_admin';
      
      console.log('Setting role:', actualRole);
      setUserRole(actualRole);

      // Get default permissions based on role
      const defaultPermissions = getDefaultPermissions(actualRole);
      console.log('Setting permissions for role:', actualRole, defaultPermissions);

      setPermissions(defaultPermissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      // Set basic permissions for super_admin as fallback
      const fallbackPermissions = getDefaultPermissions('super_admin');
      setPermissions(fallbackPermissions);
      setUserRole('super_admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [user]);

  const hasPermission = (permissionName: string, action: 'view' | 'create' | 'edit' | 'delete' = 'view') => {
    // For testing, always allow access
    console.log(`Permission check: ${permissionName} (${action})`);
    
    const currentUser = getCurrentUser();
    if (currentUser?.role === 'super_admin') {
      console.log('Super admin - access granted');
      return true;
    }

    const permission = permissions[permissionName];
    if (!permission) {
      console.log(`No permission found for: ${permissionName}, checking if staff role has access`);
      
      // Special handling for staff role - allow access to required menus
      if (currentUser?.role === 'staff') {
        const staffAllowedMenus = ['dashboard', 'orders', 'customers', 'resellers', 'follow_up', 'work_process', 'survey', 'product_catalog'];
        const hasAccess = staffAllowedMenus.includes(permissionName);
        console.log(`Staff access check for ${permissionName}: ${hasAccess}`);
        return hasAccess;
      }
      
      return false;
    }

    const hasAccess = (() => {
      switch (action) {
        case 'view': return permission.can_view;
        case 'create': return permission.can_create;
        case 'edit': return permission.can_edit;
        case 'delete': return permission.can_delete;
        default: return false;
      }
    })();

    console.log(`Permission result: ${permissionName} (${action}) = ${hasAccess}`);
    return hasAccess;
  };

  return {
    permissions,
    userRole,
    loading,
    hasPermission,
    refetch: fetchUserPermissions
  };
};
